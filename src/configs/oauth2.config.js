'use strict';

/**
 * OAuth2 Configuration for Google and Facebook
 * Following Security-First approach from instruction-senior.md
 */

const OAUTH2_CONFIG = {
    // Google OAuth2 Configuration
    GOOGLE: {
        CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
        CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
        REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3052/v1/api/auth/google/callback',
        SCOPE: ['profile', 'email'],
        AUTH_URL: 'https://accounts.google.com/o/oauth2/v2/auth',
        TOKEN_URL: 'https://oauth2.googleapis.com/token',
        USER_INFO_URL: 'https://www.googleapis.com/oauth2/v3/userinfo'
    },

    // Facebook OAuth2 Configuration
    FACEBOOK: {
        CLIENT_ID: process.env.FACEBOOK_CLIENT_ID || '',
        CLIENT_SECRET: process.env.FACEBOOK_CLIENT_SECRET || '',
        REDIRECT_URI: process.env.FACEBOOK_REDIRECT_URI || 'http://localhost:3052/v1/api/auth/facebook/callback',
        SCOPE: ['email', 'public_profile'],
        AUTH_URL: 'https://www.facebook.com/v18.0/dialog/oauth',
        TOKEN_URL: 'https://graph.facebook.com/v18.0/oauth/access_token',
        USER_INFO_URL: 'https://graph.facebook.com/v18.0/me'
    },

    // Security Settings
    SECURITY: {
        // State parameter for CSRF protection
        STATE_SECRET: process.env.OAUTH2_STATE_SECRET || 'your-super-secret-state-key-change-in-production',
        STATE_EXPIRY: 600000, // 10 minutes in milliseconds

        // Rate limiting
        MAX_ATTEMPTS_PER_IP: 100,
        RATE_LIMIT_WINDOW: 900000, // 15 minutes in milliseconds

        // Token validation
        TOKEN_EXPIRY_BUFFER: 300000, // 5 minutes buffer for token expiry
    },

    // Session Configuration
    SESSION: {
        COOKIE_NAME: 'oauth2_session',
        COOKIE_MAX_AGE: 600000, // 10 minutes
        COOKIE_SECURE: process.env.NODE_ENV === 'production',
        COOKIE_HTTP_ONLY: true,
        COOKIE_SAME_SITE: 'strict'
    }
};

/**
 * Validate OAuth2 configuration
 * Ensures all required environment variables are set
 */
const validateOAuth2Config = () => {
    const errors = [];

    // Validate Google configuration
    if (!OAUTH2_CONFIG.GOOGLE.CLIENT_ID) {
        errors.push('GOOGLE_CLIENT_ID is required');
    }
    if (!OAUTH2_CONFIG.GOOGLE.CLIENT_SECRET) {
        errors.push('GOOGLE_CLIENT_SECRET is required');
    }

    // Validate Facebook configuration
    if (!OAUTH2_CONFIG.FACEBOOK.CLIENT_ID) {
        errors.push('FACEBOOK_CLIENT_ID is required');
    }
    if (!OAUTH2_CONFIG.FACEBOOK.CLIENT_SECRET) {
        errors.push('FACEBOOK_CLIENT_SECRET is required');
    }

    // Validate security settings
    if (!OAUTH2_CONFIG.SECURITY.STATE_SECRET || OAUTH2_CONFIG.SECURITY.STATE_SECRET.length < 32) {
        errors.push('OAUTH2_STATE_SECRET must be at least 32 characters long');
    }

    if (errors.length > 0) {
        throw new Error(`OAuth2 Configuration Errors:\n${errors.join('\n')}`);
    }

    return true;
};

/**
 * Get OAuth2 configuration for a specific provider
 * @param {string} provider - 'google' or 'facebook'
 * @returns {object} Provider configuration
 */
const getProviderConfig = (provider) => {
    const normalizedProvider = provider.toUpperCase();

    if (!OAUTH2_CONFIG[normalizedProvider]) {
        throw new Error(`Unsupported OAuth2 provider: ${provider}`);
    }

    return OAUTH2_CONFIG[normalizedProvider];
};

/**
 * Check if OAuth2 is properly configured
 * @returns {boolean} True if configured
 */
const isOAuth2Configured = () => {
    try {
        validateOAuth2Config();
        return true;
    } catch (error) {
        console.error('OAuth2 Configuration Error:', error.message);
        return false;
    }
};

module.exports = {
    OAUTH2_CONFIG,
    validateOAuth2Config,
    getProviderConfig,
    isOAuth2Configured
};
