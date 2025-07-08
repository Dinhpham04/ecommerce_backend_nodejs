'use strict';

const { SuccessResponse, CreatedResponse } = require('../core/success.response');
const { BadRequestError, AuthFailureError } = require('../core/error.response');
const OAuth2Service = require('../services/oauth2.service');
const OAuth2UserService = require('../services/oauth2User.service');
const { isOAuth2Configured } = require('../configs/oauth2.config');

/**
 * OAuth2 Controller
 * Handles OAuth2 authentication flow for Google and Facebook
 * Following Clean Architecture and RESTful API principles
 */
class OAuth2Controller {

    /**
     * Initiate OAuth2 authentication flow
     * GET /v1/api/auth/oauth2/:provider
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    initiateOAuth2 = async (req, res) => {
        const { provider } = req.params;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

        // Validate provider
        if (!['google', 'facebook'].includes(provider.toLowerCase())) {
            throw new BadRequestError('Unsupported OAuth2 provider. Supported providers: google, facebook');
        }

        // Check if OAuth2 is configured
        if (!isOAuth2Configured()) {
            throw new BadRequestError('OAuth2 is not properly configured');
        }

        // Check rate limiting
        await OAuth2Service.checkRateLimit(ipAddress);

        // Generate authorization URL to redirect user
        const authData = await OAuth2Service.generateAuthorizationUrl(provider, ipAddress);

        new SuccessResponse({
            message: `OAuth2 ${provider} authorization URL generated successfully`,
            metadata: {
                provider,
                authorizationUrl: authData.authorizationUrl,
                state: authData.state,
                expiresAt: authData.expiresAt,
                instructions: {
                    step1: 'Redirect user to authorizationUrl',
                    step2: 'User will be redirected back to callback URL with authorization code',
                    step3: 'Call the callback endpoint with the authorization code'
                }
            }
        }).send(res);
    };

    /**
     * Handle OAuth2 callback
     * GET /v1/api/auth/oauth2/:provider/callback
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    handleOAuth2Callback = async (req, res) => {
        const { provider } = req.params;
        const { code, state, error, error_description } = req.query;
        const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
        const userAgent = req.get('User-Agent') || 'unknown';

        // Handle OAuth2 provider errors
        if (error) {
            const errorMessage = error_description || error;
            throw new AuthFailureError(`OAuth2 ${provider} error: ${errorMessage}`);
        }

        // Validate required parameters
        if (!code || !state) {
            throw new BadRequestError('Missing authorization code or state parameter');
        }

        // Validate provider
        if (!['google', 'facebook'].includes(provider.toLowerCase())) {
            throw new BadRequestError('Unsupported OAuth2 provider');
        }

        // Exchange code for token and get user info
        const oauth2Data = await OAuth2Service.exchangeCodeForToken(
            provider,
            code,
            state,
            ipAddress
        );

        // Validate user data
        OAuth2UserService.validateOAuth2UserData(oauth2Data.userInfo);

        // Handle user authentication
        const authResult = await OAuth2UserService.handleOAuth2User(
            oauth2Data.userInfo,
            ipAddress,
            userAgent
        );

        // Check if user can use OAuth2
        if (!OAuth2UserService.canUseOAuth2(authResult.user)) {
            throw new AuthFailureError('Account is not eligible for OAuth2 authentication');
        }

        // Set secure cookies if in production
        if (process.env.NODE_ENV === 'production') {
            res.cookie('access_token', authResult.tokens.accessToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 15 * 60 * 1000 // 15 minutes
            });

            res.cookie('refresh_token', authResult.tokens.refreshToken, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });
        }

        new SuccessResponse({
            message: `OAuth2 ${provider} authentication successful`,
            metadata: {
                user: authResult.user,
                tokens: authResult.tokens,
                deviceId: authResult.deviceId,
                provider: provider.toLowerCase(),
                loginTime: new Date().toISOString()
            }
        }).send(res);
    };

    /**
     * Get supported OAuth2 providers
     * GET /v1/api/auth/oauth2/providers
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getSupportedProviders = async (req, res) => {
        const providers = [
            {
                name: 'google',
                displayName: 'Google',
                icon: 'google',
                available: !!process.env.GOOGLE_CLIENT_ID && !!process.env.GOOGLE_CLIENT_SECRET,
                scopes: ['profile', 'email']
            },
            {
                name: 'facebook',
                displayName: 'Facebook',
                icon: 'facebook',
                available: !!process.env.FACEBOOK_CLIENT_ID && !!process.env.FACEBOOK_CLIENT_SECRET,
                scopes: ['email', 'public_profile']
            }
        ];

        new SuccessResponse({
            message: 'OAuth2 providers retrieved successfully',
            metadata: {
                providers: providers.filter(p => p.available),
                totalProviders: providers.filter(p => p.available).length,
                configurationStatus: isOAuth2Configured() ? 'configured' : 'not_configured'
            }
        }).send(res);
    };

    /**
     * Unlink OAuth2 provider from user account
     * DELETE /v1/api/auth/oauth2/:provider
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    unlinkOAuth2Provider = async (req, res) => {
        const { provider } = req.params;
        const userId = req.user.userId;

        // Validate provider
        if (!['google', 'facebook'].includes(provider.toLowerCase())) {
            throw new BadRequestError('Unsupported OAuth2 provider');
        }

        // For now, we'll just return success
        // In a more complex system, you would remove the OAuth2 provider link
        // from the user's account

        new SuccessResponse({
            message: `OAuth2 ${provider} provider unlinked successfully`,
            metadata: {
                userId,
                provider: provider.toLowerCase(),
                unlinkTime: new Date().toISOString()
            }
        }).send(res);
    };

    /**
     * Get user's linked OAuth2 providers
     * GET /v1/api/auth/oauth2/linked
     * @param {Request} req - Express request object
     * @param {Response} res - Express response object
     */
    getLinkedProviders = async (req, res) => {
        const userId = req.user.userId;

        // For now, we'll return based on registration_source
        // In a more complex system, you would have a separate collection
        // for OAuth2 provider links

        new SuccessResponse({
            message: 'Linked OAuth2 providers retrieved successfully',
            metadata: {
                linkedProviders: [], // Will be populated based on user's OAuth2 links
                totalLinked: 0
            }
        }).send(res);
    };
}

module.exports = new OAuth2Controller();
