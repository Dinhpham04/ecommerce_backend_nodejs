# JWT Authentication System with Device Management

## Overview
Hệ thống xác thực JWT hiện đại với quản lý thiết bị, phiên đăng nhập, và refresh token lưu trữ trong Redis.

## Features
- ✅ JWT Access Token (stateless)
- ✅ Refresh Token lưu trong Redis (stateful)
- ✅ Quản lý thiết bị và phiên đăng nhập
- ✅ Blacklist access token khi cần thiết
- ✅ Đăng xuất từ thiết bị cụ thể hoặc tất cả thiết bị
- ✅ Thay đổi mật khẩu tự động revoke tất cả phiên
- ✅ Xác thực email với auto-login

## Architecture

### Access Token (JWT)
- **Thời hạn**: 15 phút (có thể cấu hình)
- **Loại**: Stateless
- **Payload**: userId, email, role, deviceId, jti (JWT ID)
- **Ký bằng**: Secret key chung
- **Lưu trữ**: Chỉ ở client (memory hoặc localStorage)

### Refresh Token
- **Thời hạn**: 7 ngày (có thể cấu hình)
- **Loại**: Stateful
- **Format**: Random string (32 bytes hex)
- **Lưu trữ**: Redis với key pattern `refresh:{userId}:{deviceId}`
- **Metadata**: userId, deviceId, userAgent, ipAddress, issuedAt, expiresAt

### Device Management
- **Device ID**: MD5 hash của userAgent + ipAddress
- **Session tracking**: Mỗi thiết bị có refresh token riêng
- **Revocation**: Có thể thu hồi từng thiết bị hoặc tất cả

## API Endpoints

### Public Routes

#### 1. User Registration
```
POST /v1/api/auth/signup
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "fullName": "John Doe",
  "phone": "+84123456789"
}
```

#### 2. Email Verification
```
GET /v1/api/auth/verify-email?token=verification_token
```

#### 3. User Login
```
POST /v1/api/auth/login
```
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### 4. Refresh Token
```
POST /v1/api/auth/refresh-token
```
**Body:**
```json
{
  "refreshToken": "refresh_token_here", // hoặc từ httpOnly cookie
  "userId": "user_id",
  "deviceId": "device_id"
}
```

### Protected Routes (Require Authentication)

#### 5. Logout Current Device
```
POST /v1/api/auth/logout
Headers: Authorization: Bearer <access_token>
```

#### 6. Logout All Devices
```
POST /v1/api/auth/logout-all
Headers: Authorization: Bearer <access_token>
```

#### 7. Get User Sessions
```
GET /v1/api/auth/sessions
Headers: Authorization: Bearer <access_token>
```

#### 8. Revoke Specific Session
```
DELETE /v1/api/auth/sessions/:deviceId
Headers: Authorization: Bearer <access_token>
```

#### 9. Change Password
```
POST /v1/api/auth/change-password
Headers: Authorization: Bearer <access_token>
```
**Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

## Environment Variables

```bash
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_ACCESS_TOKEN_EXPIRE=15m
JWT_REFRESH_TOKEN_EXPIRE=7d
JWT_ISSUER=ecommerce-auth-server
JWT_AUDIENCE=ecommerce-app

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

## Security Features

### 1. Token Security
- Access token có thời hạn ngắn (15 phút)
- Refresh token có thể thu hồi bất cứ lúc nào
- JWT ID (jti) để blacklist access token khi cần

### 2. Device Tracking
- Mỗi thiết bị có refresh token riêng
- Track user agent, IP address, thời gian đăng nhập
- Có thể đăng xuất từ thiết bị cụ thể

### 3. Password Security
- Bcrypt với salt rounds = 12
- Thay đổi mật khẩu tự động revoke tất cả phiên đăng nhập

### 4. Blacklist Mechanism
- Access token có thể bị blacklist khi logout
- Refresh token bị xóa khỏi Redis khi logout

## Usage Example

### 1. Client Login Flow
```javascript
// 1. Login
const loginResponse = await fetch('/v1/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { accessToken, deviceId } = await loginResponse.json();

// 2. Store access token
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('deviceId', deviceId);

// 3. Use access token for API calls
const apiResponse = await fetch('/v1/api/protected-route', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});
```

### 2. Token Refresh Flow
```javascript
// When access token expires
const refreshResponse = await fetch('/v1/api/auth/refresh-token', {
  method: 'POST',
  credentials: 'include', // Include httpOnly cookie
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    userId: currentUserId,
    deviceId: localStorage.getItem('deviceId')
  })
});

const { accessToken } = await refreshResponse.json();
localStorage.setItem('accessToken', accessToken);
```

## Redis Storage Structure

```
# Refresh tokens
refresh:{userId}:{deviceId} -> {
  "refreshToken": "abc123...",
  "userId": "user_id",
  "deviceId": "device_id",
  "userAgent": "Mozilla/5.0...",
  "ipAddress": "192.168.1.1",
  "issuedAt": "2025-07-05T10:00:00.000Z",
  "expiresAt": "2025-07-12T10:00:00.000Z"
}

# Blacklisted access tokens
blacklist:{jti} -> "revoked"
```

## Benefits

1. **Stateless Access Token**: Hiệu năng cao, không cần truy vấn database
2. **Stateful Refresh Token**: Bảo mật cao, có thể thu hồi bất cứ lúc nào
3. **Device Management**: Quản lý phiên đăng nhập chi tiết
4. **Scalability**: Dễ mở rộng với Redis cluster
5. **Security**: Nhiều lớp bảo mật, blacklist, device tracking

## Migration from Old System

1. **Keep old routes**: Hệ thống cũ vẫn hoạt động tại `/v1/api/shop/*`
2. **New routes**: Hệ thống mới tại `/v1/api/auth/*`
3. **Gradual migration**: Từ từ chuyển các route sang JWT authentication
4. **Database compatibility**: Sử dụng cùng user model
