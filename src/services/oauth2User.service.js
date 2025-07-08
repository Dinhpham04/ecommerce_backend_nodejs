'use strict';

const {
    findUserByEmail,
    createNewUser,
    updateUserById
} = require('../models/repositories/user.repo');
const { createTokenPair } = require('../auth/jwt.auth');
const { ConflictRequestError, InternalServerError } = require('../core/error.response');
const { generateDeviceId } = require('../auth/jwt.auth');

/**
 * OAuth2 User Service
 * Handles user creation and authentication for OAuth2 flow
 * Following Clean Architecture and SOLID principles
 */
class OAuth2UserService {

    /**
     * Handle OAuth2 user authentication
     * Creates new user if doesn't exist, updates if exists
     * @param {object} userInfo - User information from OAuth2 provider
     * @param {string} ipAddress - User's IP address
     * @param {string} userAgent - User's browser agent
     * @returns {object} User and token information
     */
    static async handleOAuth2User(userInfo, ipAddress, userAgent) {
        try {
            // Check if user exists
            let user = await findUserByEmail({
                email: userInfo.email,
                select: 'full_name first_name last_name email avatar role status last_login'
            });

            if (user) {
                // Update existing user
                user = await this.updateExistingUser(user, userInfo);
            } else {
                // Create new user
                user = await this.createNewOAuth2User(userInfo);
            }

            // Generate device ID
            const deviceId = generateDeviceId(userAgent, ipAddress);

            // Create token pair
            const { accessToken, refreshToken } = await createTokenPair(
                {
                    userId: user._id,
                    email: user.email,
                    role: user.role
                },
                user._id.toString(),
                deviceId
            );

            // Return user and tokens (excluding sensitive data)
            return {
                user: {
                    id: user._id,
                    email: user.email,
                    fullName: user.full_name,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    avatar: user.avatar,
                    role: user.role,
                    status: user.status,
                    lastLogin: user.last_login,
                    isNewUser: !user.last_login
                },
                tokens: {
                    accessToken,
                    refreshToken
                },
                deviceId
            };

        } catch (error) {
            throw new InternalServerError(`OAuth2 user handling failed: ${error.message}`);
        }
    }

    /**
     * Create new user from OAuth2 information
     * @param {object} userInfo - User information from OAuth2 provider
     * @returns {object} Created user
     */
    static async createNewOAuth2User(userInfo) {
        try {
            const userData = {
                email: userInfo.email,
                full_name: userInfo.name || `${userInfo.firstName || ''} ${userInfo.lastName || ''}`.trim(),
                first_name: userInfo.firstName || '',
                last_name: userInfo.lastName || '',
                avatar: userInfo.avatar || '',
                role: 'customer',
                status: 'active', // OAuth2 users are auto-verified
                email_verified_at: new Date(),
                password: this.generateRandomPassword(), // Generate random password for OAuth2 users
                registration_source: `oauth2_${userInfo.provider}`,
                last_login: new Date()
            };

            const user = await createNewUser(userData);

            if (!user) {
                throw new ConflictRequestError('Failed to create OAuth2 user');
            }

            return user;

        } catch (error) {
            if (error instanceof ConflictRequestError) {
                throw error;
            }
            throw new InternalServerError(`Failed to create OAuth2 user: ${error.message}`);
        }
    }

    /**
     * Update existing user with OAuth2 information
     * @param {object} existingUser - Existing user from database
     * @param {object} userInfo - User information from OAuth2 provider
     * @returns {object} Updated user
     */
    static async updateExistingUser(existingUser, userInfo) {
        try {
            const updateData = {
                last_login: new Date(),
                // Update avatar if user doesn't have one
                ...((!existingUser.avatar && userInfo.avatar) && { avatar: userInfo.avatar }),
                // Update name if user doesn't have one
                ...((!existingUser.full_name && userInfo.name) && {
                    full_name: userInfo.name,
                    first_name: userInfo.firstName || '',
                    last_name: userInfo.lastName || ''
                }),
                // Mark email as verified if it wasn't
                ...(!existingUser.email_verified_at && { email_verified_at: new Date() }),
                // Update status to active if it was pending
                ...(existingUser.status === 'pending' && { status: 'active' })
            };

            const updatedUser = await updateUserById(existingUser._id, updateData);

            if (!updatedUser) {
                throw new InternalServerError('Failed to update user');
            }

            return updatedUser;

        } catch (error) {
            throw new InternalServerError(`Failed to update OAuth2 user: ${error.message}`);
        }
    }

    /**
     * Generate random password for OAuth2 users
     * OAuth2 users don't use password login, but we need a password field
     * @returns {string} Random password
     */
    static generateRandomPassword() {
        const crypto = require('crypto');
        return crypto.randomBytes(32).toString('hex');
    }

    /**
     * Link OAuth2 provider to existing user
     * @param {string} userId - User ID
     * @param {object} providerInfo - OAuth2 provider information
     * @returns {object} Updated user
     */
    static async linkOAuth2Provider(userId, providerInfo) {
        try {
            // In a more complex system, you might store OAuth2 provider links
            // in a separate collection. For now, we'll use the registration_source field
            const updateData = {
                registration_source: `oauth2_${providerInfo.provider}`,
                last_login: new Date()
            };

            const updatedUser = await updateUserById(userId, updateData);

            if (!updatedUser) {
                throw new InternalServerError('Failed to link OAuth2 provider');
            }

            return updatedUser;

        } catch (error) {
            throw new InternalServerError(`Failed to link OAuth2 provider: ${error.message}`);
        }
    }

    /**
     * Validate OAuth2 user data
     * @param {object} userInfo - User information from OAuth2 provider
     * @returns {boolean} True if valid
     */
    static validateOAuth2UserData(userInfo) {
        const errors = [];

        if (!userInfo.email) {
            errors.push('Email is required');
        }

        if (!userInfo.id) {
            errors.push('Provider ID is required');
        }

        if (!userInfo.provider) {
            errors.push('Provider is required');
        }

        // Email format validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (userInfo.email && !emailRegex.test(userInfo.email)) {
            errors.push('Invalid email format');
        }

        if (errors.length > 0) {
            throw new ConflictRequestError(`Invalid OAuth2 user data: ${errors.join(', ')}`);
        }

        return true;
    }

    /**
     * Check if user can use OAuth2 authentication
     * @param {object} user - User object
     * @returns {boolean} True if allowed
     */
    static canUseOAuth2(user) {
        if (!user) return false;

        // Check if user is not blocked or suspended
        if (['blocked', 'suspended'].includes(user.status)) {
            return false;
        }

        // Check if user is not locked
        if (user.locked_until && user.locked_until > new Date()) {
            return false;
        }

        return true;
    }
}

module.exports = OAuth2UserService;
