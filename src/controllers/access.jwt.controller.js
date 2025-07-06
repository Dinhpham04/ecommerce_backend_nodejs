'use strict';

const AccessService = require('../services/access.jwt.service');
const { SuccessResponse, CreatedResponse } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

/**
 * Enhanced Access Controller with JWT and device management
 */
class AccessController {

    /**
     * User Sign Up
     */
    signUp = async (req, res, next) => {
        const { email, password, fullName, phone } = req.body;
        const userAgent = req.get('User-Agent') || 'Unknown';
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        // Basic validation
        if (!email || !password || !fullName) {
            throw new BadRequestError('Email, password, and full name are required');
        }

        const result = await AccessService.signUp({
            email,
            password,
            fullName,
            phone,
            userAgent,
            ipAddress
        });

        new CreatedResponse({
            message: result.message,
            metadata: result
        }).send(res);
    }

    /**
     * Verify Email
     */
    verifyEmail = async (req, res, next) => {
        const { token } = req.query;
        const userAgent = req.get('User-Agent') || 'Unknown';
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        if (!token) {
            throw new BadRequestError('Verification token is required');
        }

        const result = await AccessService.verifyEmail({
            token,
            userAgent,
            ipAddress
        });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        new SuccessResponse({
            message: result.message,
            metadata: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                expiresIn: result.tokens.accessTokenExpiresIn,
                deviceId: result.deviceId
            }
        }).send(res);
    }

    reSendVerifyEmail = async (req, res, next) => {
        const { email } = req.body;

        // 1. Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new BadRequestError('Invalid email format');
        }

        const result = await AccessService.reSendVerifyEmail({ email })

        new SuccessResponse({
            message: 'Verification email resent successfully',
            metadata: result
        }).send(res);
    }

    /**
     * User Login
     */
    login = async (req, res, next) => {
        const { email, password } = req.body;
        const userAgent = req.get('User-Agent') || 'Unknown';
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        if (!email || !password) {
            throw new BadRequestError('Email and password are required');
        }

        const result = await AccessService.login({
            email,
            password,
            userAgent,
            ipAddress
        });

        // Set refresh token in httpOnly cookie
        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        new SuccessResponse({
            message: result.message,
            metadata: {
                user: result.user,
                accessToken: result.tokens.accessToken,
                expiresIn: result.tokens.accessTokenExpiresIn,
                deviceId: result.deviceId
            }
        }).send(res);
    }

    /**
     * Refresh Token
     */
    refreshToken = async (req, res, next) => {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
        const userAgent = req.get('User-Agent') || 'Unknown';
        const ipAddress = req.ip || req.connection.remoteAddress || 'Unknown';

        if (!refreshToken) {
            throw new BadRequestError('Refresh token is required');
        }

        // Extract userId and deviceId from current user or request
        const userId = req.user?.userId || req.body.userId;
        const deviceId = req.user?.deviceId || req.body.deviceId;

        if (!userId || !deviceId) {
            throw new BadRequestError('User ID and Device ID are required');
        }

        const result = await AccessService.refreshToken({
            refreshToken,
            userId,
            deviceId,
            userAgent,
            ipAddress
        });

        // Set new refresh token in httpOnly cookie
        res.cookie('refreshToken', result.tokens.refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        new SuccessResponse({
            message: result.message,
            metadata: {
                accessToken: result.tokens.accessToken,
                expiresIn: result.tokens.accessTokenExpiresIn,
                deviceId: result.deviceId
            }
        }).send(res);
    }

    /**
     * Logout from current device
     */
    logout = async (req, res, next) => {
        const { userId, deviceId, tokenId } = req.user;
        if (!userId || !deviceId || !tokenId) {
            throw new BadRequestError('User ID, Device ID, and Token ID are required');
        }
        const result = await AccessService.logout({
            userId,
            deviceId,
            tokenId
        });

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        new SuccessResponse({
            message: result.message,
            metadata: result
        }).send(res);
    }

    /**
     * Logout from all devices
     */
    logoutAll = async (req, res, next) => {
        const { userId, tokenId } = req.user;

        if (!userId || !tokenId) {
            throw new BadRequestError('User ID and Token ID are required');
        }

        const result = await AccessService.logoutAll({
            userId,
            tokenId
        });

        // Clear refresh token cookie
        res.clearCookie('refreshToken');

        new SuccessResponse({
            message: result.message,
            metadata: result
        }).send(res);
    }

    /**
     * Get user sessions
     */
    getUserSessions = async (req, res, next) => {
        const { userId } = req.user;

        const result = await AccessService.getUserSessions({
            userId
        });

        new SuccessResponse({
            message: 'User sessions retrieved successfully',
            metadata: result
        }).send(res);
    }

    /**
     * Revoke specific session
     */
    revokeSession = async (req, res, next) => {
        const { userId } = req.user;
        const { deviceId } = req.params;

        if (!deviceId) {
            throw new BadRequestError('Device ID is required');
        }

        const result = await AccessService.revokeSession({
            userId,
            deviceId
        });

        new SuccessResponse({
            message: result.message,
            metadata: result
        }).send(res);
    }

    /**
     * Change password
     */
    changePassword = async (req, res, next) => {
        const { userId } = req.user;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            throw new BadRequestError('Current password and new password are required');
        }

        if (newPassword.length < 8) {
            throw new BadRequestError('New password must be at least 8 characters long');
        }

        const result = await AccessService.changePassword({
            userId,
            currentPassword,
            newPassword
        });

        // Clear refresh token cookie (user will need to login again)
        res.clearCookie('refreshToken');

        new SuccessResponse({
            message: result.message,
            metadata: result
        }).send(res);
    }
}

module.exports = new AccessController();
