'use strict';

/**
 * Test suite for verification.service.js
 * This tests the new Verification model functionality
 */

const {
    createEmailVerification,
    verifyEmailToken,
    verifyEmailCode,
    isEmailVerified,
    getVerificationStatus,
    cleanupExpiredVerifications
} = require('../services/verification.service');
const Verification = require('../models/verification.model');

// Mock data
const testData = {
    email: 'test@example.com',
    userId: '507f1f77bcf86cd799439011',
    targetType: 'user'
};

/**
 * Test email verification creation
 */
const testCreateEmailVerification = async () => {
    try {
        console.log('Testing createEmailVerification...');

        const result = await createEmailVerification({
            email: testData.email,
            target_id: testData.userId,
            target_type: testData.targetType,
            expires_in_minutes: 5
        });

        console.log('✓ Create email verification result:', {
            verification_id: result.verification_id,
            email: result.email,
            expires_at: result.expires_at,
            has_token: !!result.verification_token,
            has_code: !!result.verification_code
        });

        return result;

    } catch (error) {
        console.error('❌ Create email verification failed:', error.message);
        throw error;
    }
};

/**
 * Test email token verification
 */
const testVerifyEmailToken = async (verificationToken) => {
    try {
        console.log('Testing verifyEmailToken...');

        const result = await verifyEmailToken({
            token: verificationToken
        });

        console.log('✓ Verify email token result:', {
            verification_id: result.verification_id,
            email: result.email,
            verified_at: result.verified_at,
            target_id: result.target_id
        });

        return result;

    } catch (error) {
        console.error('❌ Verify email token failed:', error.message);
        throw error;
    }
};

/**
 * Test email verification status check
 */
const testIsEmailVerified = async () => {
    try {
        console.log('Testing isEmailVerified...');

        const isVerified = await isEmailVerified({
            email: testData.email,
            target_id: testData.userId
        });

        console.log('✓ Is email verified result:', isVerified);

        return isVerified;

    } catch (error) {
        console.error('❌ Check email verified failed:', error.message);
        throw error;
    }
};

/**
 * Test get verification status
 */
const testGetVerificationStatus = async () => {
    try {
        console.log('Testing getVerificationStatus...');

        const status = await getVerificationStatus({
            target_id: testData.userId,
            target_type: testData.targetType,
            verification_type: 'email'
        });

        console.log('✓ Get verification status result:', status);

        return status;

    } catch (error) {
        console.error('❌ Get verification status failed:', error.message);
        throw error;
    }
};

/**
 * Test cleanup expired verifications
 */
const testCleanupExpiredVerifications = async () => {
    try {
        console.log('Testing cleanupExpiredVerifications...');

        const cleanedCount = await cleanupExpiredVerifications();

        console.log('✓ Cleanup expired verifications result:', cleanedCount);

        return cleanedCount;

    } catch (error) {
        console.error('❌ Cleanup expired verifications failed:', error.message);
        throw error;
    }
};

/**
 * Test edge cases
 */
const testEdgeCases = async () => {
    try {
        console.log('Testing edge cases...');

        // Test invalid token
        try {
            await verifyEmailToken({ token: 'invalid_token' });
            console.log('❌ Should have failed for invalid token');
        } catch (error) {
            console.log('✓ Correctly rejected invalid token');
        }

        // Test verification for non-existent user
        const isVerified = await isEmailVerified({
            email: 'nonexistent@example.com',
            target_id: '507f1f77bcf86cd799439999'
        });

        console.log('✓ Non-existent user verification check:', isVerified);

    } catch (error) {
        console.error('❌ Edge cases test failed:', error.message);
        throw error;
    }
};

/**
 * Cleanup test data
 */
const cleanupTestData = async () => {
    try {
        console.log('Cleaning up test data...');

        const result = await Verification.deleteMany({
            verification_value: testData.email
        });

        console.log('✓ Cleaned up test data:', result.deletedCount, 'records');

    } catch (error) {
        console.error('❌ Cleanup test data failed:', error.message);
    }
};

/**
 * Run all tests
 */
const runAllTests = async () => {
    try {
        console.log('=== Starting Verification Service Tests ===\n');

        // Cleanup any existing test data
        await cleanupTestData();

        // Test 1: Create email verification
        const verification = await testCreateEmailVerification();

        // Test 2: Verify email token
        const verificationResult = await testVerifyEmailToken(verification.verification_token);

        // Test 3: Check if email is verified
        const isVerified = await testIsEmailVerified();

        // Test 4: Get verification status
        const status = await testGetVerificationStatus();

        // Test 5: Cleanup expired verifications
        const cleanedCount = await testCleanupExpiredVerifications();

        // Test 6: Edge cases
        await testEdgeCases();

        console.log('\n=== All Tests Completed Successfully ===');

    } catch (error) {
        console.error('\n=== Test Suite Failed ===');
        console.error(error);
        throw error;
    } finally {
        // Cleanup test data
        await cleanupTestData();
    }
};

module.exports = {
    testCreateEmailVerification,
    testVerifyEmailToken,
    testIsEmailVerified,
    testGetVerificationStatus,
    testCleanupExpiredVerifications,
    testEdgeCases,
    runAllTests
};

// Run tests if this file is executed directly
if (require.main === module) {
    const mongoose = require('mongoose');
    require('../dbs/init.mongodb');

    const runTests = async () => {
        try {
            await runAllTests();
            console.log('✅ All tests passed!');
            process.exit(0);
        } catch (error) {
            console.error('❌ Tests failed:', error);
            process.exit(1);
        }
    };

    // Wait for database connection
    setTimeout(runTests, 2000);
}
