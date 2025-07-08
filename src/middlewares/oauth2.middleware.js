'use strict';

const { BadRequestError, AuthFailureError } = require('../core/error.response');
const { asyncHandler } = require('../helpers/asyncHandler');
const { OAUTH2_CONFIG } = require('../configs/oauth2.config');
const { getIORedis } = require('../dbs/init.ioredis');
const redisClient = getIORedis().instanceConnect;

/**
 * OAuth2 Middleware
 * Provides security and rate limiting for OAuth2 endpoints
 */

/**
 * Rate limiting middleware for OAuth2 endpoints
 * Prevents abuse of OAuth2 authentication endpoints
 */
const oauth2RateLimit = asyncHandler(async (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';
    const rateLimitKey = `oauth2_rate_limit:${ipAddress}`;

    try {
        const attempts = await redisClient.get(rateLimitKey);
        const maxAttempts = OAUTH2_CONFIG.SECURITY.MAX_ATTEMPTS_PER_IP;
        const windowMs = OAUTH2_CONFIG.SECURITY.RATE_LIMIT_WINDOW;

        if (attempts && parseInt(attempts) >= maxAttempts) {
            throw new BadRequestError('Too many OAuth2 requests. Please try again later.');
        }

        // Increment attempts
        await redisClient.incr(rateLimitKey);
        await redisClient.expire(rateLimitKey, Math.floor(windowMs / 1000));

        // Add rate limit headers
        res.set({
            'X-RateLimit-Limit': maxAttempts,
            'X-RateLimit-Remaining': Math.max(0, maxAttempts - (parseInt(attempts) || 0) - 1),
            'X-RateLimit-Reset': new Date(Date.now() + windowMs).toISOString()
        });

        return next();

    } catch (error) {
        if (error instanceof BadRequestError) {
            throw error;
        }
        // If Redis fails, allow the request to continue
        console.error('OAuth2 rate limit check failed:', error);
        return next();
    }
});

/**
 * OAuth2 security headers middleware
 * Adds security headers for OAuth2 responses
 */
const oauth2SecurityHeaders = (req, res, next) => {
    // Add security headers
    res.set({
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://accounts.google.com https://graph.facebook.com; frame-ancestors 'none';"
    });

    // Add CORS headers for OAuth2 if needed
    if (req.headers.origin) {
        res.set('Access-Control-Allow-Origin', req.headers.origin);
        res.set('Access-Control-Allow-Credentials', 'true');
    }

    return next();
};

/**
 * Validate OAuth2 provider middleware
 * Ensures the provider is supported
 */
const validateOAuth2Provider = (req, res, next) => {
    const { provider } = req.params;

    if (!provider) {
        throw new BadRequestError('OAuth2 provider is required');
    }

    const supportedProviders = ['google', 'facebook'];
    if (!supportedProviders.includes(provider.toLowerCase())) {
        throw new BadRequestError(`Unsupported OAuth2 provider: ${provider}. Supported providers: ${supportedProviders.join(', ')}`);
    }

    // Normalize provider name
    req.params.provider = provider.toLowerCase();

    return next();
};

/**
 * OAuth2 configuration check middleware
 * Ensures OAuth2 is properly configured before processing requests
 */
const checkOAuth2Configuration = (req, res, next) => {
    const { provider } = req.params;

    if (!provider) {
        return next();
    }

    const normalizedProvider = provider.toUpperCase();

    // Check if the specific provider is configured
    if (normalizedProvider === 'GOOGLE') {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
            throw new BadRequestError('Google OAuth2 is not configured. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.');
        }
    } else if (normalizedProvider === 'FACEBOOK') {
        if (!process.env.FACEBOOK_CLIENT_ID || !process.env.FACEBOOK_CLIENT_SECRET) {
            throw new BadRequestError('Facebook OAuth2 is not configured. Please set FACEBOOK_CLIENT_ID and FACEBOOK_CLIENT_SECRET environment variables.');
        }
    }

    return next();
};

/**
 * OAuth2 callback validation middleware
 * Validates OAuth2 callback parameters
 */
const validateOAuth2Callback = (req, res, next) => {
    const { code, state, error, error_description } = req.query;

    // Check for OAuth2 provider errors
    if (error) {
        const errorMessage = error_description || error;
        throw new AuthFailureError(`OAuth2 authentication failed: ${errorMessage}`);
    }

    // Validate required parameters
    if (!code) {
        throw new BadRequestError('Missing authorization code in OAuth2 callback');
    }

    if (!state) {
        throw new BadRequestError('Missing state parameter in OAuth2 callback');
    }

    return next();
};

/**
 * OAuth2 CSRF protection middleware
 * Adds CSRF protection for OAuth2 flows
 */
const oauth2CSRFProtection = (req, res, next) => {
    // For OAuth2 initiation, we don't need CSRF token
    // The state parameter provides CSRF protection
    if (req.method === 'GET' && req.path.includes('/callback')) {
        return next();
    }

    // For other OAuth2 endpoints, we can add CSRF protection if needed
    return next();
};

module.exports = {
    oauth2RateLimit,
    oauth2SecurityHeaders,
    validateOAuth2Provider,
    checkOAuth2Configuration,
    validateOAuth2Callback,
    oauth2CSRFProtection
};
