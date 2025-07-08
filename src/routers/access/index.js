'use strict';

const express = require('express');
const accessController = require('../../controllers/access.jwt.controller');
const { asyncHandler } = require('../../helpers/asyncHandler');
const { authentication } = require('../../auth/jwt.auth');
const router = express.Router();

// Public routes (no authentication required)

// User registration
router.post('/signup', asyncHandler(accessController.signUp));

// Email verification
router.get('/verify-email', asyncHandler(accessController.verifyEmail));

// Resend verification email
router.post('/resend-verification', asyncHandler(accessController.reSendVerifyEmail));

// User login
router.post('/login', asyncHandler(accessController.login));

router.use('/oauth2', require('../oauth2'));

// Protected routes (authentication required)
router.use(authentication);
// Refresh token (can be public or protected depending on implementation)
router.post('/refresh-token', asyncHandler(accessController.refreshToken));

// Logout from current device
router.post('/logout', asyncHandler(accessController.logout));

// Logout from all devices
router.post('/logout-all', asyncHandler(accessController.logoutAll));

// Get user sessions
router.get('/sessions', asyncHandler(accessController.getUserSessions));

// Revoke specific session
router.delete('/sessions/:deviceId', asyncHandler(accessController.revokeSession));

// Change password
router.post('/change-password', asyncHandler(accessController.changePassword));

module.exports = router;
