'use strict';

const crypto = require('crypto');
const axios = require('axios');
const { OAUTH2_CONFIG, getProviderConfig } = require('../configs/oauth2.config');
const { BadRequestError, AuthFailureError, InternalServerError } = require('../core/error.response');
const { getIORedis } = require('../dbs/init.ioredis');
const redisClient = getIORedis().instanceConnect;

/**
 * OAuth2 Service Layer
 * Handles OAuth2 flow for Google and Facebook
 * Following Clean Architecture principles from instruction-senior.md
 */
class OAuth2Service {

    /**
     * Generate authorization URL for OAuth2 provider
     * @param {string} provider - 'google' or 'facebook'
     * @param {string} ipAddress - User's IP address for security
     * @returns {object} Authorization URL and state
     */
    static async generateAuthorizationUrl(provider, ipAddress) {
        try {
            const config = getProviderConfig(provider);

            // Generate secure state parameter for CSRF protection
            const state = await this.generateSecureState(provider, ipAddress);

            // Build authorization URL
            const authUrl = new URL(config.AUTH_URL);
            authUrl.searchParams.append('client_id', config.CLIENT_ID);
            authUrl.searchParams.append('redirect_uri', config.REDIRECT_URI);
            authUrl.searchParams.append('scope', config.SCOPE.join(' '));
            authUrl.searchParams.append('response_type', 'code');
            authUrl.searchParams.append('state', state);

            // Add provider-specific parameters
            if (provider.toLowerCase() === 'google') {
                authUrl.searchParams.append('access_type', 'offline');
                authUrl.searchParams.append('prompt', 'consent');
            }

            return {
                authorizationUrl: authUrl.toString(), // url to redirect user
                state,
                expiresAt: new Date(Date.now() + OAUTH2_CONFIG.SECURITY.STATE_EXPIRY)
            };

        } catch (error) {
            throw new InternalServerError(`Failed to generate authorization URL: ${error.message}`);
        }
    }

    /**
     * Exchange authorization code for access token
     * @param {string} provider - 'google' or 'facebook'
     * @param {string} code - Authorization code from OAuth2 provider
     * @param {string} state - State parameter for CSRF protection
     * @param {string} ipAddress - User's IP address
     * @returns {object} Access token and user info
     */
    static async exchangeCodeForToken(provider, code, state, ipAddress) {
        try {
            // Validate state parameter
            await this.validateState(state, provider, ipAddress);

            const config = getProviderConfig(provider);

            // Exchange code for token
            const tokenResponse = await this.requestAccessToken(config, code);

            // Get user information
            const userInfo = await this.getUserInfo(config, tokenResponse.access_token);

            // Clean up state from Redis
            await this.cleanupState(state);

            return {
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                expiresIn: tokenResponse.expires_in,
                userInfo: {
                    id: userInfo.id || userInfo.sub,
                    email: userInfo.email,
                    name: userInfo.name,
                    firstName: userInfo.given_name || userInfo.first_name,
                    lastName: userInfo.family_name || userInfo.last_name,
                    avatar: userInfo.picture,
                    provider: provider.toLowerCase(),
                    providerId: userInfo.id || userInfo.sub
                }
            };

        } catch (error) {
            throw new AuthFailureError(`OAuth2 authentication failed: ${error.message}`);
        }
    }

    /**
     * Generate secure state parameter
     * @param {string} provider - OAuth2 provider
     * @param {string} ipAddress - User's IP address
     * @returns {string} Secure state parameter
     */
    static async generateSecureState(provider, ipAddress) {
        try {
            const randomBytes = crypto.randomBytes(32).toString('hex');
            const timestamp = Date.now();
            const state = `${provider}_${timestamp}_${randomBytes}`;

            // Store state in Redis with expiry
            const stateKey = `oauth2_state:${state}`;
            const stateData = {
                provider,
                ipAddress,
                timestamp,
                expiresAt: timestamp + OAUTH2_CONFIG.SECURITY.STATE_EXPIRY
            };

            await redisClient.setex(
                stateKey,
                Math.floor(OAUTH2_CONFIG.SECURITY.STATE_EXPIRY / 1000),
                JSON.stringify(stateData)
            );

            return state;

        } catch (error) {
            throw new InternalServerError(`Failed to generate secure state: ${error.message}`);
        }
    }

    /**
     * Validate state parameter
     * @param {string} state - State parameter to validate
     * @param {string} provider - Expected provider
     * @param {string} ipAddress - User's IP address
     * @returns {boolean} True if valid
     */
    static async validateState(state, provider, ipAddress) {
        try {
            const stateKey = `oauth2_state:${state}`;
            const stateDataStr = await redisClient.get(stateKey);

            if (!stateDataStr) {
                throw new BadRequestError('Invalid or expired state parameter');
            }

            const stateData = JSON.parse(stateDataStr);

            // Validate provider
            if (stateData.provider !== provider) {
                throw new BadRequestError('State parameter provider mismatch');
            }

            // Validate IP address (optional, for additional security)
            if (stateData.ipAddress !== ipAddress) {
                console.warn(`IP address mismatch for OAuth2 state: ${stateData.ipAddress} vs ${ipAddress}`);
            }

            // Validate expiry
            if (Date.now() > stateData.expiresAt) {
                throw new BadRequestError('State parameter has expired');
            }

            return true;

        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error;
            }
            throw new InternalServerError(`Failed to validate state: ${error.message}`);
        }
    }

    /**
     * Request access token from OAuth2 provider
     * @param {object} config - Provider configuration
     * @param {string} code - Authorization code
     * @returns {object} Token response
     */
    static async requestAccessToken(config, code) {
        try {
            const tokenData = {
                client_id: config.CLIENT_ID,
                client_secret: config.CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: config.REDIRECT_URI
            };

            const response = await axios.post(config.TOKEN_URL, tokenData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 seconds timeout
            });

            if (!response.data.access_token) {
                throw new AuthFailureError('No access token received from provider');
            }

            return response.data;

        } catch (error) {
            if (error.response) {
                throw new AuthFailureError(`Provider token request failed: ${error.response.data.error_description || error.response.data.error || 'Unknown error'}`);
            }
            throw new InternalServerError(`Token request failed: ${error.message}`);
        }
    }

    /**
     * Get user information from OAuth2 provider
     * @param {object} config - Provider configuration
     * @param {string} accessToken - Access token
     * @returns {object} User information
     */
    static async getUserInfo(config, accessToken) {
        try {
            let userInfoUrl = config.USER_INFO_URL;

            // Add fields parameter for Facebook
            if (config.USER_INFO_URL.includes('facebook.com')) {
                userInfoUrl += '?fields=id,name,email,first_name,last_name,picture';
            }

            const response = await axios.get(userInfoUrl, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Accept': 'application/json'
                },
                timeout: 10000 // 10 seconds timeout
            });

            return response.data;

        } catch (error) {
            if (error.response) {
                throw new AuthFailureError(`Failed to get user info: ${error.response.data.error_description || error.response.data.error || 'Unknown error'}`);
            }
            throw new InternalServerError(`User info request failed: ${error.message}`);
        }
    }

    /**
     * Clean up state from Redis
     * @param {string} state - State parameter to clean up
     */
    static async cleanupState(state) {
        try {
            const stateKey = `oauth2_state:${state}`;
            await redisClient.del(stateKey);
        } catch (error) {
            console.error('Failed to cleanup OAuth2 state:', error);
        }
    }

    /**
     * Check rate limiting for OAuth2 requests
     * @param {string} ipAddress - User's IP address
     * @returns {boolean} True if within rate limit
     */
    static async checkRateLimit(ipAddress) {
        try {
            const rateLimitKey = `oauth2_rate_limit:${ipAddress}`;
            const attempts = await redisClient.get(rateLimitKey);

            if (attempts && parseInt(attempts) >= OAUTH2_CONFIG.SECURITY.MAX_ATTEMPTS_PER_IP) {
                throw new BadRequestError('Too many OAuth2 requests. Please try again later.');
            }

            // Increment attempts
            await redisClient.incr(rateLimitKey);
            await redisClient.expire(rateLimitKey, Math.floor(OAUTH2_CONFIG.SECURITY.RATE_LIMIT_WINDOW / 1000));

            return true;

        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error;
            }
            throw new InternalServerError(`Rate limit check failed: ${error.message}`);
        }
    }
}

module.exports = OAuth2Service;
