'use strict';

const crypto = require('crypto');
const { BadRequestError } = require('../core/error.response');

/**
 * OAuth2 Utility Functions
 * Helper functions for OAuth2 authentication flow
 */

/**
 * Generate secure random state parameter
 * @param {number} length - Length of random string
 * @returns {string} Random string
 */
const generateSecureRandomString = (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Create PKCE (Proof Key for Code Exchange) parameters
 * Enhanced security for OAuth2 flows
 * @returns {object} PKCE parameters
 */
const generatePKCEParameters = () => {
    const codeVerifier = generateSecureRandomString(32);
    const codeChallenge = crypto
        .createHash('sha256')
        .update(codeVerifier)
        .digest('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');

    return {
        codeVerifier,
        codeChallenge,
        codeChallengeMethod: 'S256'
    };
};

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Sanitize user input for OAuth2 parameters
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeOAuth2Input = (input) => {
    if (!input || typeof input !== 'string') {
        return '';
    }

    // Remove potentially dangerous characters
    return input
        .replace(/[<>&"']/g, '') // Remove HTML/XML chars
        .replace(/[\r\n]/g, '') // Remove newlines
        .trim();
};

/**
 * Generate OAuth2 authorization URL
 * @param {object} params - OAuth2 parameters
 * @returns {string} Authorization URL
 */
const buildAuthorizationUrl = (params) => {
    const {
        authUrl,
        clientId,
        redirectUri,
        scope,
        state,
        responseType = 'code',
        additionalParams = {}
    } = params;

    if (!authUrl || !clientId || !redirectUri || !scope || !state) {
        throw new BadRequestError('Missing required OAuth2 parameters');
    }

    const url = new URL(authUrl);

    // Add standard OAuth2 parameters
    url.searchParams.append('client_id', clientId);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('scope', Array.isArray(scope) ? scope.join(' ') : scope);
    url.searchParams.append('response_type', responseType);
    url.searchParams.append('state', state);

    // Add additional provider-specific parameters
    Object.entries(additionalParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
            url.searchParams.append(key, value);
        }
    });

    return url.toString();
};

/**
 * Parse OAuth2 callback parameters
 * @param {object} query - Query parameters from callback
 * @returns {object} Parsed parameters
 */
const parseCallbackParameters = (query) => {
    const { code, state, error, error_description } = query;

    return {
        code: sanitizeOAuth2Input(code),
        state: sanitizeOAuth2Input(state),
        error: sanitizeOAuth2Input(error),
        errorDescription: sanitizeOAuth2Input(error_description)
    };
};

/**
 * Extract user info from OAuth2 provider response
 * @param {object} providerData - Data from OAuth2 provider
 * @param {string} provider - Provider name
 * @returns {object} Standardized user info
 */
const extractUserInfo = (providerData, provider) => {
    const normalizedProvider = provider.toLowerCase();

    switch (normalizedProvider) {
        case 'google':
            return {
                id: providerData.sub || providerData.id,
                email: providerData.email,
                name: providerData.name,
                firstName: providerData.given_name,
                lastName: providerData.family_name,
                avatar: providerData.picture,
                verified: providerData.email_verified,
                provider: 'google'
            };

        case 'facebook':
            return {
                id: providerData.id,
                email: providerData.email,
                name: providerData.name,
                firstName: providerData.first_name,
                lastName: providerData.last_name,
                avatar: providerData.picture?.data?.url || providerData.picture,
                verified: true, // Facebook emails are verified
                provider: 'facebook'
            };

        default:
            throw new BadRequestError(`Unsupported provider: ${provider}`);
    }
};

/**
 * Generate device fingerprint for OAuth2 security
 * @param {string} userAgent - User agent string
 * @param {string} ipAddress - IP address
 * @returns {string} Device fingerprint
 */
const generateDeviceFingerprint = (userAgent, ipAddress) => {
    const fingerprint = crypto
        .createHash('sha256')
        .update(`${userAgent}${ipAddress}`)
        .digest('hex')
        .substring(0, 16);

    return `oauth2_device_${fingerprint}`;
};

/**
 * Validate OAuth2 token response
 * @param {object} tokenResponse - Token response from provider
 * @returns {boolean} True if valid
 */
const validateTokenResponse = (tokenResponse) => {
    const errors = [];

    if (!tokenResponse.access_token) {
        errors.push('Missing access token');
    }

    if (!tokenResponse.token_type) {
        errors.push('Missing token type');
    }

    if (tokenResponse.expires_in && isNaN(tokenResponse.expires_in)) {
        errors.push('Invalid expires_in value');
    }

    if (errors.length > 0) {
        throw new BadRequestError(`Invalid token response: ${errors.join(', ')}`);
    }

    return true;
};

/**
 * Calculate token expiration time
 * @param {number} expiresIn - Expires in seconds
 * @returns {Date} Expiration date
 */
const calculateTokenExpiration = (expiresIn) => {
    if (!expiresIn || isNaN(expiresIn)) {
        // Default to 1 hour if not provided
        expiresIn = 3600;
    }

    return new Date(Date.now() + (expiresIn * 1000));
};

/**
 * Generate OAuth2 state with metadata
 * @param {object} metadata - State metadata
 * @returns {string} State string
 */
const generateStateWithMetadata = (metadata) => {
    const stateData = {
        timestamp: Date.now(),
        random: generateSecureRandomString(16),
        ...metadata
    };

    return Buffer.from(JSON.stringify(stateData)).toString('base64');
};

/**
 * Parse OAuth2 state metadata
 * @param {string} state - State string
 * @returns {object} Parsed metadata
 */
const parseStateMetadata = (state) => {
    try {
        const decoded = Buffer.from(state, 'base64').toString('utf8');
        return JSON.parse(decoded);
    } catch (error) {
        throw new BadRequestError('Invalid state parameter format');
    }
};

/**
 * Check if token is expired
 * @param {Date} expirationDate - Token expiration date
 * @param {number} buffer - Buffer time in milliseconds
 * @returns {boolean} True if expired
 */
const isTokenExpired = (expirationDate, buffer = 300000) => {
    if (!expirationDate) return false;

    const now = new Date();
    const expirationWithBuffer = new Date(expirationDate.getTime() - buffer);

    return now >= expirationWithBuffer;
};

/**
 * Mask sensitive data for logging
 * @param {object} data - Data to mask
 * @returns {object} Masked data
 */
const maskSensitiveData = (data) => {
    const sensitiveFields = ['access_token', 'refresh_token', 'client_secret', 'code'];
    const masked = { ...data };

    sensitiveFields.forEach(field => {
        if (masked[field]) {
            masked[field] = masked[field].substring(0, 4) + '****';
        }
    });

    return masked;
};

module.exports = {
    generateSecureRandomString,
    generatePKCEParameters,
    validateEmail,
    sanitizeOAuth2Input,
    buildAuthorizationUrl,
    parseCallbackParameters,
    extractUserInfo,
    generateDeviceFingerprint,
    validateTokenResponse,
    calculateTokenExpiration,
    generateStateWithMetadata,
    parseStateMetadata,
    isTokenExpired,
    maskSensitiveData
};
