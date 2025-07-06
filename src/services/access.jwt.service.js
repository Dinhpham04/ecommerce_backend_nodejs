'use strict';

const bcrypt = require('bcrypt');
const { BadRequestError, AuthFailureError, ConflictRequestError } = require('../core/error.response');
const { findUserByEmail, createNewUser, findUserById, updateUserById, findUser } = require('../models/repositories/user.repo');
const { createTokenPair, verifyRefreshToken, revokeRefreshToken, revokeAllRefreshTokens, getUserSessions, blacklistAccessToken } = require('../auth/jwt.auth');
const { sendEmailToken } = require('./email.service');
const { verifyEmailToken } = require('./verification.service');
const { getInfoData } = require('../utils');

/**
 * Enhanced Access Service with JWT and device management
 */
class AccessService {

    /**
     * User Sign Up
     */
    static signUp = async ({ email, password, fullName, phone = '', userAgent, ipAddress }) => {
        try {
            // 1. Check if user already exists
            const existingUser = await findUserByEmail({ email });
            if (existingUser) {
                throw new ConflictRequestError('Email already registered');
            }

            // 2. Validate input
            if (!email || !password || !fullName) {
                throw new BadRequestError('Email, password, and full name are required');
            }

            // 3. Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                throw new BadRequestError('Invalid email format');
            }

            // 4. Validate password strength
            if (password.length < 8) {
                throw new BadRequestError('Password must be at least 8 characters long');
            }

            // 5. Hash password
            const saltRounds = 12;
            const passwordHash = await bcrypt.hash(password, saltRounds);

            // 6. Create new user
            const newUser = await createNewUser({
                email,
                password: passwordHash,
                full_name: fullName,
                phone,
                role: 'customer',
                status: 'pending' // Will be 'active' after email verification
            });

            if (!newUser) {
                throw new BadRequestError('Failed to create user');
            }

            // 7. Send verification email
            const verificationResult = await sendEmailToken({
                email,
                target_id: newUser._id,
                target_type: 'user'
            });

            return {
                message: 'Registration successful. Please check your email to verify your account',
                user: getInfoData({
                    fileds: ['_id', 'full_name', 'email', 'phone', 'status', 'role'],
                    object: newUser
                }),
                verification: {
                    verification_id: verificationResult.verification_id,
                    expires_at: verificationResult.expires_at
                }
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Verify Email
     */
    static verifyEmail = async ({ token, userAgent, ipAddress }) => {
        try {
            // 1. Verify token
            const verificationResult = await verifyEmailToken({ token });
            if (!verificationResult) {
                throw new BadRequestError('Invalid or expired verification token');
            }

            const { email } = verificationResult;

            // 2. Find user by email
            const user = await findUserByEmail({ email });
            if (!user) {
                throw new BadRequestError('User not found');
            }

            // 3. Check if user is already verified
            if (user.status === 'active') {
                throw new BadRequestError('User is already verified');
            }

            // 4. Update user status to active
            const updatedUser = await updateUserById(user._id, {
                status: 'active',
                email_verified_at: new Date()
            });

            if (!updatedUser) {
                throw new BadRequestError('Failed to update user status');
            }

            // 5. Create token pair with device info (auto login after verification)
            const tokens = await createTokenPair(
                {
                    userId: user._id.toString(),
                    email: user.email,
                    role: user.role
                },
                { userAgent, ipAddress }
            );

            return {
                message: 'Email verified successfully. You are now logged in.',
                user: getInfoData({
                    fileds: ['_id', 'full_name', 'email', 'phone', 'status', 'role'],
                    object: updatedUser
                }),
                tokens,
                deviceId: tokens.deviceId
            };
        } catch (error) {
            throw error;
        }
    }

    static reSendVerifyEmail = async ({ email }) => {
        try {
            // 1. Check if user exists
            const user = await findUserByEmail({ email });
            if (!user) {
                throw new NotFoundError('User not found');
            }

            // 2. Check if user is already verified
            if (user.status === 'active') {
                throw new BadRequestError('User is already verified');
            }

            // 3. Send verification email
            const result = await sendEmailToken({
                email,
                target_id: user._id,
                target_type: 'user'
            });

            return {
                message: 're send Verification email sent successfully',
                email: email,
                verification_id: result.verification_id,
                expires_at: result.expires_at
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * User Login
     */
    static login = async ({ email, password, userAgent, ipAddress }) => {
        try {
            // 1. Validate input
            if (!email || !password) {
                throw new BadRequestError('Email and password are required');
            }

            // 2. Find user by email
            const user = await findUserByEmail({
                email,
                select: { email: 1, password: 1, full_name: 1, status: 1, role: 1, _id: 1 }
            });

            if (!user) {
                throw new AuthFailureError('Invalid email or password');
            }

            // 3. Check user status
            if (user.status !== 'active') {
                throw new AuthFailureError('Account is not verified. Please check your email for verification link');
            }

            // 4. Verify password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                throw new AuthFailureError('Invalid email or password');
            }

            // 5. Create token pair with device info
            const tokens = await createTokenPair(
                {
                    userId: user._id.toString(),
                    email: user.email,
                    role: user.role
                },
                { userAgent, ipAddress }
            );

            // 6. Update last login
            await updateUserById(user._id, { last_login: new Date() });

            return {
                message: 'Login successful',
                user: getInfoData({
                    fileds: ['_id', 'full_name', 'email', 'status', 'role'],
                    object: user
                }),
                tokens,
                deviceId: tokens.deviceId
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Refresh Token
     */
    static refreshToken = async ({ refreshToken, userId, deviceId, userAgent, ipAddress }) => {
        try {
            // 1. Verify refresh token
            const tokenData = await verifyRefreshToken(refreshToken, userId, deviceId);

            // 2. Find user
            const user = await findUserById(userId);
            if (!user || user.status !== 'active') {
                throw new AuthFailureError('User not found or inactive');
            }

            // 3. Create new token pair
            const tokens = await createTokenPair(
                {
                    userId: user._id.toString(),
                    email: user.email,
                    role: user.role
                },
                { userAgent, ipAddress }
            );

            return {
                message: 'Token refreshed successfully',
                tokens,
                deviceId: tokens.deviceId
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Logout from current device
     */
    static logout = async ({ userId, deviceId, tokenId }) => {
        try {
            // 1. Revoke refresh token for this device
            await revokeRefreshToken(userId, deviceId);

            // 2. Blacklist current access token
            if (tokenId) {
                await blacklistAccessToken(tokenId, 900); // 15 minutes
            }

            return {
                message: 'Logout successful'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Logout from all devices
     */
    static logoutAll = async ({ userId, tokenId }) => {
        try {
            // 1. Revoke all refresh tokens
            await revokeAllRefreshTokens(userId);

            // 2. Blacklist current access token
            if (tokenId) {
                await blacklistAccessToken(tokenId, 900); // 15 minutes
            }

            return {
                message: 'Logged out from all devices successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Get user sessions
     */
    static getUserSessions = async ({ userId }) => {
        try {
            const sessions = await getUserSessions(userId);
            return {
                sessions,
                total: sessions.length
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Revoke specific session
     */
    static revokeSession = async ({ userId, deviceId }) => {
        try {
            await revokeRefreshToken(userId, deviceId);
            return {
                message: 'Session revoked successfully'
            };
        } catch (error) {
            throw error;
        }
    }

    /**
     * Change password (revoke all sessions)
     */
    static changePassword = async ({ userId, currentPassword, newPassword }) => {
        try {
            // 1. Find user
            const user = await findUser({
                _id: userId,
            }, { password: 1, _id: 1 });

            if (!user) {
                throw new AuthFailureError('User not found');
            }

            // 2. Verify current password
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) {
                throw new AuthFailureError('Current password is incorrect');
            }

            // 3. Hash new password
            const saltRounds = 12;
            const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

            // 4. Update password
            await updateUserById(user._id, { password: newPasswordHash });

            // 5. Revoke all refresh tokens (force re-login)
            await revokeAllRefreshTokens(user._id.toString());

            return {
                message: 'Password changed successfully. Please login again.'
            };
        } catch (error) {
            throw error;
        }
    }
}

module.exports = AccessService;
