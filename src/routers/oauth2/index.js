'use strict';

const express = require('express');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/jwt.auth');
const oauth2Controller = require('../../controllers/oauth2.controller');
const {
    oauth2RateLimit,
    oauth2SecurityHeaders,
    validateOAuth2Provider,
    checkOAuth2Configuration,
    validateOAuth2Callback
} = require('../../middlewares/oauth2.middleware');
const router = express.Router();

/**
 * OAuth2 Routes
 * Following RESTful API design principles and security best practices
 */

// Apply security headers to all OAuth2 routes
router.use(oauth2SecurityHeaders);

// Public routes (no authentication required)

// Get supported OAuth2 providers
router.get('/providers', asyncHandler(oauth2Controller.getSupportedProviders));

// Initiate OAuth2 authentication flow
router.get('/:provider',
    oauth2RateLimit,
    validateOAuth2Provider,
    checkOAuth2Configuration,
    asyncHandler(oauth2Controller.initiateOAuth2)
);

// Handle OAuth2 callback
router.get('/:provider/callback',
    oauth2RateLimit,
    validateOAuth2Provider,
    validateOAuth2Callback,
    asyncHandler(oauth2Controller.handleOAuth2Callback)
);

// Protected routes (authentication required)
router.use(authentication);

// Get user's linked OAuth2 providers
router.get('/linked', asyncHandler(oauth2Controller.getLinkedProviders));

// Unlink OAuth2 provider
router.delete('/:provider', asyncHandler(oauth2Controller.unlinkOAuth2Provider));

module.exports = router;
