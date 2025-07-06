'use strict';

const JWT = require('jsonwebtoken');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler } = require('../helpers/asyncHandler');
const { AuthFailureError } = require('../core/error.response');
const { findUserById } = require('../models/repositories/user.repo');
const { getIORedis } = require('../dbs/init.ioredis');
const redisClient = getIORedis().instanceConnect; // Use ioredis instance

// Ensure redisClient is connected
if (!redisClient) {
    throw new Error('ioRedis Client is not connected');
}

// JWT Configuration
const JWT_CONFIG = {
    SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
    ACCESS_TOKEN_EXPIRE: process.env.JWT_ACCESS_TOKEN_EXPIRE || '15m',
    REFRESH_TOKEN_EXPIRE: process.env.JWT_REFRESH_TOKEN_EXPIRE || '7d',
    ISSUER: process.env.JWT_ISSUER || 'ecommerce-auth-server',
    AUDIENCE: process.env.JWT_AUDIENCE || 'ecommerce-app'
};

/**
 * Parse time string to seconds
 */
const parseTimeToSeconds = (timeStr) => {
    const unit = timeStr.slice(-1);
    const value = parseInt(timeStr.slice(0, -1));

    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 24 * 60 * 60;
        default: return value;
    }
};

/**
 * Generate device ID from user agent and IP
 */
const generateDeviceId = (userAgent, ipAddress) => {
    const deviceString = `${userAgent}-${ipAddress}`;
    return crypto.createHash('md5').update(deviceString).digest('hex');
};

/**
 * Create access token (JWT) - stateless
 */
const createAccessToken = (payload) => {
    const now = Math.floor(Date.now() / 1000);
    const accessTokenId = uuidv4();

    const accessTokenPayload = {
        ...payload,
        iat: now,
        exp: now + parseTimeToSeconds(JWT_CONFIG.ACCESS_TOKEN_EXPIRE),
        jti: accessTokenId, // JWT ID for blacklisting if needed
        aud: JWT_CONFIG.AUDIENCE,
        iss: JWT_CONFIG.ISSUER,
        type: 'access'
    };

    return {
        token: JWT.sign(accessTokenPayload, JWT_CONFIG.SECRET),
        jti: accessTokenId,
        expiresIn: parseTimeToSeconds(JWT_CONFIG.ACCESS_TOKEN_EXPIRE)
    };
};

/**
 * Create refresh token - random string
 */
const createRefreshToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

/**
 * Create token pair with device management
 */
const createTokenPair = async (payload, deviceInfo) => {
    const { userAgent, ipAddress } = deviceInfo;
    const deviceId = generateDeviceId(userAgent, ipAddress);

    // Add device info to payload
    const tokenPayload = {
        ...payload,
        deviceId
    };

    // Create access token
    const accessToken = createAccessToken(tokenPayload);

    // Create refresh token
    const refreshToken = createRefreshToken();

    // Store refresh token in Redis with device info
    const refreshTokenKey = `refresh:${payload.userId}:${deviceId}`;
    const refreshTokenData = {
        refreshToken,
        userId: payload.userId,
        deviceId,
        userAgent,
        ipAddress,
        issuedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + parseTimeToSeconds(JWT_CONFIG.REFRESH_TOKEN_EXPIRE) * 1000).toISOString()
    };

    await redisClient.setex(
        refreshTokenKey,
        parseTimeToSeconds(JWT_CONFIG.REFRESH_TOKEN_EXPIRE),
        JSON.stringify(refreshTokenData)
    );

    return {
        accessToken: accessToken.token,
        refreshToken,
        accessTokenExpiresIn: accessToken.expiresIn,
        deviceId
    };
};

/**
 * Verify access token
 */
const verifyAccessToken = async (token) => {
    try {
        const decoded = JWT.verify(token, JWT_CONFIG.SECRET, {
            issuer: JWT_CONFIG.ISSUER,
            audience: JWT_CONFIG.AUDIENCE
        });

        if (decoded.type !== 'access') {
            throw new AuthFailureError('Invalid token type');
        }

        // Check if token is blacklisted
        const isBlacklisted = await redisClient.get(`blacklist:${decoded.jti}`);
        if (isBlacklisted) {
            throw new AuthFailureError('Token has been revoked');
        }

        return decoded;
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            throw new AuthFailureError('Access token expired');
        } else if (error.name === 'JsonWebTokenError') {
            throw new AuthFailureError('Invalid access token');
        }
        throw error;
    }
};

/**
 * Verify refresh token
 */
const verifyRefreshToken = async (refreshToken, userId, deviceId) => {
    const refreshTokenKey = `refresh:${userId}:${deviceId}`;
    const storedData = await redisClient.get(refreshTokenKey);

    if (!storedData) {
        throw new AuthFailureError('Refresh token not found or expired');
    }

    const tokenData = JSON.parse(storedData);

    if (tokenData.refreshToken !== refreshToken) {
        throw new AuthFailureError('Invalid refresh token');
    }

    return tokenData;
};

/**
 * Revoke refresh token
 */
const revokeRefreshToken = async (userId, deviceId) => {
    const refreshTokenKey = `refresh:${userId}:${deviceId}`;
    await redisClient.del(refreshTokenKey);
};

/**
 * Revoke all refresh tokens for a user
 */
const revokeAllRefreshTokens = async (userId) => {
    const pattern = `refresh:${userId}:*`;
    const keys = await redisClient.keys(pattern);

    if (keys.length > 0) {
        await redisClient.del(keys);
    }
};

/**
 * Get all active sessions for a user
 */
const getUserSessions = async (userId) => {
    const pattern = `refresh:${userId}:*`;
    const keys = await redisClient.keys(pattern);

    const sessions = [];
    for (const key of keys) {
        const data = await redisClient.get(key);
        if (data) {
            const sessionData = JSON.parse(data);
            sessions.push({
                deviceId: sessionData.deviceId,
                userAgent: sessionData.userAgent,
                ipAddress: sessionData.ipAddress,
                issuedAt: sessionData.issuedAt,
                expiresAt: sessionData.expiresAt
            });
        }
    }

    return sessions;
};

/**
 * Blacklist access token
 */
const blacklistAccessToken = async (jti, expiresIn) => {
    await redisClient.setex(`blacklist:${jti}`, expiresIn, 'revoked');
};

/**
 * Authentication middleware
 */
const authentication = asyncHandler(async (req, res, next) => {
    try {
        // Extract access token from Authorization header
        const authHeader = req.headers.authorization || req.headers['Authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AuthFailureError('Missing or invalid authorization header');
        }

        const accessToken = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify access token
        const decoded = await verifyAccessToken(accessToken);

        // Check if user exists and is active
        const user = await findUserById(decoded.userId);
        if (!user || user.status !== 'active') {
            throw new AuthFailureError('User not found or inactive');
        }


        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            deviceId: decoded.deviceId,
            tokenId: decoded.jti
        };

        return next();
    } catch (error) {
        throw error;
    }
});

module.exports = {
    createTokenPair,
    verifyAccessToken,
    verifyRefreshToken,
    revokeRefreshToken,
    revokeAllRefreshTokens,
    getUserSessions,
    blacklistAccessToken,
    authentication,
    generateDeviceId,
    JWT_CONFIG
};
