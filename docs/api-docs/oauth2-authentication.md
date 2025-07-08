# OAuth2 Authentication System

## Overview
This document describes the OAuth2 authentication system for the eCommerce backend, supporting Google and Facebook authentication.

## Features
- Google OAuth2 authentication
- Facebook OAuth2 authentication
- Secure state parameter for CSRF protection
- Rate limiting and security headers
- JWT token generation after successful authentication
- User account creation and linking
- Clean Architecture implementation

## Architecture

### Components
1. **OAuth2 Configuration** (`src/configs/oauth2.config.js`)
   - Environment-based configuration
   - Provider-specific settings
   - Security parameters

2. **OAuth2 Service** (`src/services/oauth2.service.js`)
   - Authorization URL generation
   - Token exchange
   - User information retrieval
   - State management

3. **OAuth2 User Service** (`src/services/oauth2User.service.js`)
   - User creation and updates
   - Account linking
   - User validation

4. **OAuth2 Controller** (`src/controllers/oauth2.controller.js`)
   - HTTP request handling
   - Response formatting
   - Error handling

5. **OAuth2 Middleware** (`src/middlewares/oauth2.middleware.js`)
   - Rate limiting
   - Security headers
   - Provider validation
   - CSRF protection

## API Endpoints

### Public Routes

#### 1. Get Supported Providers
```
GET /v1/api/auth/oauth2/providers
```
**Response:**
```json
{
  "code": 200,
  "message": "OAuth2 providers retrieved successfully",
  "metadata": {
    "providers": [
      {
        "name": "google",
        "displayName": "Google",
        "icon": "google",
        "available": true,
        "scopes": ["profile", "email"]
      },
      {
        "name": "facebook",
        "displayName": "Facebook",
        "icon": "facebook",
        "available": true,
        "scopes": ["email", "public_profile"]
      }
    ],
    "totalProviders": 2,
    "configurationStatus": "configured"
  }
}
```

#### 2. Initiate OAuth2 Authentication
```
GET /v1/api/auth/oauth2/:provider
```
**Parameters:**
- `provider`: `google` or `facebook`

**Response:**
```json
{
  "code": 200,
  "message": "OAuth2 google authorization URL generated successfully",
  "metadata": {
    "provider": "google",
    "authorizationUrl": "https://accounts.google.com/o/oauth2/v2/auth?client_id=...",
    "state": "google_1641234567890_abcdef...",
    "expiresAt": "2024-01-01T12:00:00.000Z",
    "instructions": {
      "step1": "Redirect user to authorizationUrl",
      "step2": "User will be redirected back to callback URL with authorization code",
      "step3": "Call the callback endpoint with the authorization code"
    }
  }
}
```

#### 3. Handle OAuth2 Callback
```
GET /v1/api/auth/oauth2/:provider/callback?code=...&state=...
```
**Parameters:**
- `provider`: `google` or `facebook`
- `code`: Authorization code from OAuth2 provider
- `state`: State parameter for CSRF protection

**Response:**
```json
{
  "code": 201,
  "message": "OAuth2 google authentication successful",
  "metadata": {
    "user": {
      "id": "60d5ecb74f6c2b001f647b8c",
      "email": "user@example.com",
      "fullName": "John Doe",
      "firstName": "John",
      "lastName": "Doe",
      "avatar": "https://example.com/avatar.jpg",
      "role": "customer",
      "status": "active",
      "lastLogin": "2024-01-01T12:00:00.000Z",
      "isNewUser": false
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "deviceId": "device_123456789",
    "provider": "google",
    "loginTime": "2024-01-01T12:00:00.000Z"
  }
}
```

### Protected Routes (Require Authentication)

#### 4. Get Linked Providers
```
GET /v1/api/auth/oauth2/linked
Headers: Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "code": 200,
  "message": "Linked OAuth2 providers retrieved successfully",
  "metadata": {
    "linkedProviders": [],
    "totalLinked": 0
  }
}
```

#### 5. Unlink Provider
```
DELETE /v1/api/auth/oauth2/:provider
Headers: Authorization: Bearer <access_token>
```
**Response:**
```json
{
  "code": 200,
  "message": "OAuth2 google provider unlinked successfully",
  "metadata": {
    "userId": "60d5ecb74f6c2b001f647b8c",
    "provider": "google",
    "unlinkTime": "2024-01-01T12:00:00.000Z"
  }
}
```

## Environment Variables

### Required Variables
```bash
# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/v1/api/auth/oauth2/google/callback

# Facebook OAuth2
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret
FACEBOOK_REDIRECT_URI=http://localhost:3000/v1/api/auth/oauth2/facebook/callback

# Security
OAUTH2_STATE_SECRET=your_super_secret_state_key_minimum_32_characters
```

### Optional Variables
```bash
# JWT Configuration (if not already set)
JWT_SECRET=your_jwt_secret
JWT_ACCESS_TOKEN_EXPIRE=15m
JWT_REFRESH_TOKEN_EXPIRE=7d

# Node Environment
NODE_ENV=development
```

## Security Features

### CSRF Protection
- Secure state parameter with expiration
- IP address tracking (optional)
- State validation on callback

### Rate Limiting
- Maximum 5 requests per IP per 15 minutes
- Configurable limits
- Redis-based storage

### Security Headers
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Content Security Policy

### Data Protection
- Secure token storage
- Password generation for OAuth2 users
- User data validation

## Setup Instructions

### 1. Install Dependencies
```bash
npm install axios
```

### 2. Google OAuth2 Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth2 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/v1/api/auth/oauth2/google/callback` (development)
   - `https://yourdomain.com/v1/api/auth/oauth2/google/callback` (production)

### 3. Facebook OAuth2 Setup
1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs:
   - `http://localhost:3000/v1/api/auth/oauth2/facebook/callback` (development)
   - `https://yourdomain.com/v1/api/auth/oauth2/facebook/callback` (production)

### 4. Environment Configuration
Create a `.env` file with the required variables listed above.

### 5. Test the Implementation
```bash
# Run tests
npm test -- oauth2.test.js

# Test with Postman
# 1. GET /v1/api/auth/oauth2/providers
# 2. GET /v1/api/auth/oauth2/google
# 3. Use the returned authorization URL in browser
# 4. Complete OAuth2 flow
```

## Frontend Integration

### React Example
```javascript
const handleGoogleLogin = async () => {
  try {
    // Get authorization URL
    const response = await fetch('/v1/api/auth/oauth2/google');
    const data = await response.json();
    
    // Redirect to Google
    window.location.href = data.metadata.authorizationUrl;
  } catch (error) {
    console.error('OAuth2 error:', error);
  }
};

// Handle callback (in callback component)
const handleCallback = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const code = urlParams.get('code');
  const state = urlParams.get('state');
  
  if (code && state) {
    // The callback will be handled by the backend
    // User will be redirected with tokens
  }
};
```

### Mobile App Integration
```javascript
// Use WebView or system browser
const authenticateWithGoogle = () => {
  const authUrl = 'https://yourapi.com/v1/api/auth/oauth2/google';
  
  // Open in WebView or system browser
  // Handle the callback URL to extract tokens
};
```

## Error Handling

### Common Errors
- `400 Bad Request`: Invalid parameters or unsupported provider
- `401 Unauthorized`: OAuth2 authentication failed
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server configuration or processing error

### Error Response Format
```json
{
  "code": 400,
  "message": "OAuth2 authentication failed: User denied access",
  "reasonStatusCode": "BadRequestError",
  "metadata": null
}
```

## Monitoring and Logging

### Metrics to Monitor
- OAuth2 success/failure rates
- Rate limiting triggers
- Provider-specific errors
- User registration through OAuth2

### Logging
The system logs important events including:
- OAuth2 authentication attempts
- Rate limiting events
- Configuration errors
- Security violations

## Production Considerations

### Security
- Use HTTPS in production
- Regularly rotate CLIENT_SECRET values
- Monitor for suspicious activity
- Implement proper CORS policies

### Performance
- Redis connection pooling
- Token caching strategies
- Rate limiting optimization
- Error handling improvements

### Scaling
- Load balancer configuration
- Redis cluster setup
- Database connection pooling
- CDN for static assets

## Troubleshooting

### Common Issues
1. **"OAuth2 is not properly configured"**
   - Check environment variables
   - Verify CLIENT_ID and CLIENT_SECRET

2. **"Invalid or expired state parameter"**
   - Check Redis connection
   - Verify state parameter expiration

3. **"Too many OAuth2 requests"**
   - Rate limiting triggered
   - Check IP-based limiting

4. **"Provider token request failed"**
   - Verify provider configuration
   - Check network connectivity
   - Validate redirect URIs

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## Testing

### Unit Tests
```bash
npm test -- oauth2.test.js
```

### Integration Testing
Use Postman collection for API testing:
1. Import the OAuth2 collection
2. Set environment variables
3. Run the test suite

### Load Testing
- Test rate limiting under load
- Verify Redis performance
- Monitor JWT token generation

## Migration from Existing System

### Database Migration
If migrating from an existing OAuth2 system:
1. Map existing user OAuth2 links
2. Update user registration sources
3. Migrate tokens if needed

### API Migration
- Update existing OAuth2 endpoints
- Maintain backward compatibility
- Gradual migration strategy

## Contributing

### Code Style
- Follow existing code patterns
- Use proper error handling
- Add comprehensive tests
- Document all changes

### Pull Request Process
1. Create feature branch
2. Implement changes
3. Add tests
4. Update documentation
5. Submit pull request

## License
This OAuth2 implementation is part of the eCommerce backend project.
