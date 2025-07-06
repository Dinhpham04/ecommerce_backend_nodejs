'use strict';

const crypto = require('crypto');
const Verification = require('../models/verification.model');
const { NotFoundError, BadRequestError } = require('../core/error.response');

/**
 * Generate random verification token
 */
const generateVerificationToken = () => {
    return crypto.randomInt(100000, 999999).toString(); // 6-digit code
}

/**
 * Generate secure verification token for email links
 */
const generateSecureToken = () => {
    return crypto.randomBytes(32).toString('hex'); // 64-character hex string
}

/**
 * Create new email verification for user registration
 */
const createEmailVerification = async ({ 
    email, 
    target_id = null, 
    target_type = 'user',
    expires_in_minutes = 5 
}) => {
    try {
        // Generate verification token
        const verification_token = generateSecureToken();
        const verification_code = generateVerificationToken();
        
        // Calculate expiry time
        const expires_at = new Date();
        expires_at.setMinutes(expires_at.getMinutes() + expires_in_minutes);

        // Delete any existing pending verification for this email
        await Verification.deleteMany({
            verification_value: email,
            verification_type: 'email',
            status: 'pending'
        });

        // Create new verification record
        const newVerification = await Verification.create({
            target_id,
            target_type,
            verification_type: 'email',
            verification_value: email,
            verification_token,
            verification_code,
            status: 'pending',
            expires_at,
            verification_method: 'automatic'
        });

        return {
            verification_id: newVerification._id,
            verification_token,
            verification_code,
            expires_at,
            email
        };
    } catch (error) {
        console.error('Error creating email verification:', error);
        throw new BadRequestError('Cannot create email verification');
    }
}

/**
 * Verify email token and return verification details
 */
const verifyEmailToken = async ({ token }) => {
    try {
        // Find verification by token
        const verification = await Verification.findOne({
            verification_token: token,
            verification_type: 'email',
            status: 'pending'
        });

        if (!verification) {
            throw new NotFoundError('Verification token not found or expired');
        }

        // Check if token has expired
        if (verification.expires_at && verification.expires_at < new Date()) {
            // Mark as expired
            await Verification.findByIdAndUpdate(verification._id, {
                status: 'expired'
            });
            throw new NotFoundError('Verification token has expired');
        }

        // Mark as verified
        await Verification.findByIdAndUpdate(verification._id, {
            status: 'verified',
            verified_at: new Date()
        });

        return {
            verification_id: verification._id,
            email: verification.verification_value,
            target_id: verification.target_id,
            target_type: verification.target_type,
            verified_at: new Date()
        };
    } catch (error) {
        if (error instanceof NotFoundError) {
            throw error;
        }
        console.error('Error verifying email token:', error);
        throw new BadRequestError('Cannot verify email token');
    }
}

/**
 * Verify email code (6-digit) and return verification details
 */
const verifyEmailCode = async ({ code, email }) => {
    try {
        // Find verification by code and email
        const verification = await Verification.findOne({
            verification_code: code,
            verification_value: email,
            verification_type: 'email',
            status: 'pending'
        });

        if (!verification) {
            // Increment attempts
            await Verification.updateOne(
                { 
                    verification_value: email,
                    verification_type: 'email',
                    status: 'pending'
                },
                { $inc: { attempts: 1 } }
            );
            
            throw new NotFoundError('Invalid verification code');
        }

        // Check if token has expired
        if (verification.expires_at && verification.expires_at < new Date()) {
            await Verification.findByIdAndUpdate(verification._id, {
                status: 'expired'
            });
            throw new NotFoundError('Verification code has expired');
        }

        // Check max attempts
        if (verification.attempts >= verification.max_attempts) {
            await Verification.findByIdAndUpdate(verification._id, {
                status: 'rejected',
                rejection_reason: 'Maximum attempts exceeded'
            });
            throw new BadRequestError('Maximum verification attempts exceeded');
        }

        // Mark as verified
        await Verification.findByIdAndUpdate(verification._id, {
            status: 'verified',
            verified_at: new Date()
        });

        return {
            verification_id: verification._id,
            email: verification.verification_value,
            target_id: verification.target_id,
            target_type: verification.target_type,
            verified_at: new Date()
        };
    } catch (error) {
        if (error instanceof NotFoundError || error instanceof BadRequestError) {
            throw error;
        }
        console.error('Error verifying email code:', error);
        throw new BadRequestError('Cannot verify email code');
    }
}

/**
 * Check if email is already verified
 */
const isEmailVerified = async ({ email, target_id = null }) => {
    const query = {
        verification_value: email,
        verification_type: 'email',
        status: 'verified'
    };

    if (target_id) {
        query.target_id = target_id;
    }

    const verification = await Verification.findOne(query);
    return !!verification;
}

/**
 * Get verification status for target
 */
const getVerificationStatus = async ({ target_id, target_type, verification_type = 'email' }) => {
    const verifications = await Verification.find({
        target_id,
        target_type,
        verification_type,
        status: 'verified'
    }).sort({ verified_at: -1 });

    return verifications.map(v => ({
        verification_type: v.verification_type,
        verification_value: v.verification_value,
        verified_at: v.verified_at,
        verified_by: v.verified_by
    }));
}

/**
 * Clean up expired verifications (can be run as a cron job)
 */
const cleanupExpiredVerifications = async () => {
    const result = await Verification.updateMany(
        {
            expires_at: { $lt: new Date() },
            status: 'pending'
        },
        {
            status: 'expired'
        }
    );

    return result.modifiedCount;
}

module.exports = {
    createEmailVerification,
    verifyEmailToken,
    verifyEmailCode,
    isEmailVerified,
    getVerificationStatus,
    cleanupExpiredVerifications,
    generateVerificationToken,
    generateSecureToken
}
