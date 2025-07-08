'use strict';

const request = require('supertest');
const app = require('../../app');
const { getIORedis } = require('../../dbs/init.ioredis');

describe('OAuth2 Authentication', () => {
    let redisClient;

    beforeAll(async () => {
        redisClient = getIORedis().instanceConnect;
    });

    afterAll(async () => {
        // Clean up test data
        await redisClient.flushdb();
    });

    describe('GET /v1/api/auth/oauth2/providers', () => {
        it('should return supported OAuth2 providers', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/providers')
                .expect(200);

            expect(response.body.code).toBe(200);
            expect(response.body.metadata).toHaveProperty('providers');
            expect(response.body.metadata).toHaveProperty('totalProviders');
            expect(response.body.metadata).toHaveProperty('configurationStatus');
        });
    });

    describe('GET /v1/api/auth/oauth2/:provider', () => {
        it('should return authorization URL for Google', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/google')
                .expect(200);

            expect(response.body.code).toBe(200);
            expect(response.body.metadata).toHaveProperty('authorizationUrl');
            expect(response.body.metadata).toHaveProperty('state');
            expect(response.body.metadata).toHaveProperty('provider', 'google');
        });

        it('should return authorization URL for Facebook', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/facebook')
                .expect(200);

            expect(response.body.code).toBe(200);
            expect(response.body.metadata).toHaveProperty('authorizationUrl');
            expect(response.body.metadata).toHaveProperty('state');
            expect(response.body.metadata).toHaveProperty('provider', 'facebook');
        });

        it('should return 400 for unsupported provider', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/twitter')
                .expect(400);

            expect(response.body.code).toBe(400);
            expect(response.body.message).toContain('Unsupported OAuth2 provider');
        });

        it('should implement rate limiting', async () => {
            const requests = [];

            // Make multiple requests to trigger rate limiting
            for (let i = 0; i < 10; i++) {
                requests.push(
                    request(app)
                        .get('/v1/api/auth/oauth2/google')
                        .set('X-Forwarded-For', '192.168.1.100')
                );
            }

            const responses = await Promise.all(requests);

            // Should have at least one rate limited response
            const rateLimitedResponses = responses.filter(r => r.status === 400);
            expect(rateLimitedResponses.length).toBeGreaterThan(0);
        });
    });

    describe('GET /v1/api/auth/oauth2/:provider/callback', () => {
        it('should return 400 for missing code parameter', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/google/callback')
                .query({ state: 'test-state' })
                .expect(400);

            expect(response.body.code).toBe(400);
            expect(response.body.message).toContain('Missing authorization code');
        });

        it('should return 400 for missing state parameter', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/google/callback')
                .query({ code: 'test-code' })
                .expect(400);

            expect(response.body.code).toBe(400);
            expect(response.body.message).toContain('Missing authorization code or state parameter');
        });

        it('should handle OAuth2 provider errors', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/google/callback')
                .query({
                    error: 'access_denied',
                    error_description: 'User denied access'
                })
                .expect(401);

            expect(response.body.code).toBe(401);
            expect(response.body.message).toContain('OAuth2 google error');
        });

        it('should return 400 for unsupported provider in callback', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/twitter/callback')
                .query({
                    code: 'test-code',
                    state: 'test-state'
                })
                .expect(400);

            expect(response.body.code).toBe(400);
            expect(response.body.message).toContain('Unsupported OAuth2 provider');
        });
    });

    describe('Security Headers', () => {
        it('should include security headers in responses', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/providers')
                .expect(200);

            expect(response.headers).toHaveProperty('x-content-type-options', 'nosniff');
            expect(response.headers).toHaveProperty('x-frame-options', 'DENY');
            expect(response.headers).toHaveProperty('x-xss-protection', '1; mode=block');
            expect(response.headers).toHaveProperty('referrer-policy', 'strict-origin-when-cross-origin');
            expect(response.headers).toHaveProperty('content-security-policy');
        });
    });

    describe('Rate Limiting Headers', () => {
        it('should include rate limit headers', async () => {
            const response = await request(app)
                .get('/v1/api/auth/oauth2/google')
                .expect(200);

            expect(response.headers).toHaveProperty('x-ratelimit-limit');
            expect(response.headers).toHaveProperty('x-ratelimit-remaining');
            expect(response.headers).toHaveProperty('x-ratelimit-reset');
        });
    });

    describe('Protected Routes', () => {
        let accessToken;

        beforeAll(async () => {
            // Create a test user and get access token
            // This would be implemented based on your existing auth system
            accessToken = 'test-access-token';
        });

        describe('GET /v1/api/auth/oauth2/linked', () => {
            it('should require authentication', async () => {
                const response = await request(app)
                    .get('/v1/api/auth/oauth2/linked')
                    .expect(401);

                expect(response.body.code).toBe(401);
            });

            it('should return linked providers for authenticated user', async () => {
                const response = await request(app)
                    .get('/v1/api/auth/oauth2/linked')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(200);

                expect(response.body.code).toBe(200);
                expect(response.body.metadata).toHaveProperty('linkedProviders');
                expect(response.body.metadata).toHaveProperty('totalLinked');
            });
        });

        describe('DELETE /v1/api/auth/oauth2/:provider', () => {
            it('should require authentication', async () => {
                const response = await request(app)
                    .delete('/v1/api/auth/oauth2/google')
                    .expect(401);

                expect(response.body.code).toBe(401);
            });

            it('should unlink provider for authenticated user', async () => {
                const response = await request(app)
                    .delete('/v1/api/auth/oauth2/google')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(200);

                expect(response.body.code).toBe(200);
                expect(response.body.metadata).toHaveProperty('provider', 'google');
            });

            it('should return 400 for unsupported provider', async () => {
                const response = await request(app)
                    .delete('/v1/api/auth/oauth2/twitter')
                    .set('Authorization', `Bearer ${accessToken}`)
                    .expect(400);

                expect(response.body.code).toBe(400);
                expect(response.body.message).toContain('Unsupported OAuth2 provider');
            });
        });
    });
});
