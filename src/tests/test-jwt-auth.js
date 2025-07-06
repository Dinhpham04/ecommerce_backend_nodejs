// Test JWT Authentication System
// Run with: node test-jwt-auth.js

const axios = require('axios');

const BASE_URL = 'http://localhost:3052/v1/api/auth';

// Test data
const testUser = {
    email: 'test.jwt@example.com',
    password: 'password123',
    fullName: 'JWT Test User',
    phone: '+84123456789'
};

let accessToken = '';
let deviceId = '';

async function testJWTAuthSystem() {
    console.log('🚀 Testing JWT Authentication System...\n');

    try {
        // Step 1: User Registration
        console.log('📝 Step 1: User Registration');
        const signupResponse = await axios.post(`${BASE_URL}/signup`, testUser);
        console.log('✅ Registration successful:', signupResponse.data.message);
        console.log('📧 User status:', signupResponse.data.metadata.user.status);
        console.log('');


        // Step 2: Email Verification (simulate)
        console.log('📧 Step 2: Email Verification');
        console.log('⚠️  In real scenario, user clicks link in email');
        console.log('⚠️  For testing, you need to get the actual token from database');
        console.log('⚠️  Example: GET /v1/api/auth/verify-email?token=verification_token');
        console.log('');

        // Step 2.1: Resend Verification Email
        console.log('📧 Step 2.1: Resend Verification Email');
        try {
            const resendResponse = await axios.post(`${BASE_URL}/resend-verification`, {
                email: testUser.email
            });
            console.log('✅ Resend verification email:', resendResponse.data.message);
        } catch (resendError) {
            console.log('❌ Resend verification failed:', resendError.response?.data?.message);
        }
        console.log('');

        // Step 3: User Login
        console.log('🔐 Step 3: User Login');
        try {
            const loginResponse = await axios.post(`${BASE_URL}/login`, {
                email: testUser.email,
                password: testUser.password
            });

            accessToken = loginResponse.data.metadata.accessToken;
            deviceId = loginResponse.data.metadata.deviceId;

            console.log('✅ Login successful:', loginResponse.data.message);
            console.log('🔑 Access token received (first 50 chars):', accessToken.substring(0, 50) + '...');
            console.log('📱 Device ID:', deviceId);
        } catch (loginError) {
            console.log('❌ Login failed (expected if email not verified):', loginError.response?.data?.message);
            console.log('⚠️  Continuing with mock tokens for testing other endpoints...');
            accessToken = 'mock-token-for-testing';
            deviceId = 'mock-device-id';
        }
        console.log('');

        // Step 4: Test protected route (Get user sessions)
        console.log('🔒 Step 4: Test Protected Route - Get User Sessions');
        try {
            const sessionsResponse = await axios.get(`${BASE_URL}/sessions`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ Sessions retrieved:', sessionsResponse.data.message);
            console.log('📊 Active sessions:', sessionsResponse.data.metadata.total);
        } catch (sessionError) {
            console.log('❌ Sessions request failed (expected with mock token):', sessionError.response?.data?.message);
        }
        console.log('');

        // Step 5: Test refresh token
        console.log('🔄 Step 5: Test Refresh Token');
        try {
            const refreshResponse = await axios.post(`${BASE_URL}/refresh-token`, {
                refreshToken: 'mock-refresh-token',
                userId: 'mock-user-id',
                deviceId: deviceId
            });
            console.log('✅ Token refreshed:', refreshResponse.data.message);
        } catch (refreshError) {
            console.log('❌ Refresh failed (expected with mock data):', refreshError.response?.data?.message);
        }
        console.log('');

        // Step 6: Test logout
        console.log('🚪 Step 6: Test Logout');
        try {
            const logoutResponse = await axios.post(`${BASE_URL}/logout`, {}, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            console.log('✅ Logout successful:', logoutResponse.data.message);
        } catch (logoutError) {
            console.log('❌ Logout failed (expected with mock token):', logoutError.response?.data?.message);
        }
        console.log('');

        console.log('🎉 JWT Authentication System Test Completed!');
        console.log('');
        console.log('💡 Next steps for full testing:');
        console.log('   1. Set up Redis server');
        console.log('   2. Configure JWT_SECRET in environment variables');
        console.log('   3. Complete email verification flow');
        console.log('   4. Test with real tokens');
        console.log('');

        console.log('📋 Available endpoints:');
        console.log('   • POST /v1/api/auth/signup - User registration');
        console.log('   • GET /v1/api/auth/verify-email - Email verification');
        console.log('   • POST /v1/api/auth/resend-verification - Resend verification email');
        console.log('   • POST /v1/api/auth/login - User login');
        console.log('   • POST /v1/api/auth/refresh-token - Refresh access token');
        console.log('   • POST /v1/api/auth/logout - Logout current device');
        console.log('   • POST /v1/api/auth/logout-all - Logout all devices');
        console.log('   • GET /v1/api/auth/sessions - Get user sessions');
        console.log('   • DELETE /v1/api/auth/sessions/:deviceId - Revoke session');
        console.log('   • POST /v1/api/auth/change-password - Change password');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Helper function to test with real tokens (after manual verification)
async function testWithRealTokens(realAccessToken, realDeviceId) {
    console.log('\n🔧 Testing with real tokens...\n');

    try {
        // Test get sessions
        const sessionsResponse = await axios.get(`${BASE_URL}/sessions`, {
            headers: {
                'Authorization': `Bearer ${realAccessToken}`
            }
        });
        console.log('✅ Real sessions test:', sessionsResponse.data);

        // Test logout
        const logoutResponse = await axios.post(`${BASE_URL}/logout`, {}, {
            headers: {
                'Authorization': `Bearer ${realAccessToken}`
            }
        });
        console.log('✅ Real logout test:', logoutResponse.data);

    } catch (error) {
        console.error('❌ Real token test failed:', error.response?.data || error.message);
    }
}

// Run test
testJWTAuthSystem();

// Export for manual testing
module.exports = { testWithRealTokens };
