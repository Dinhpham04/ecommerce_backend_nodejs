# Access API Documentation

## Overview
Module quản lý xác thực, phân quyền, quản lý phiên đăng nhập, JWT, và các thao tác liên quan đến user session.

---

## 1. Đăng ký tài khoản
- **Endpoint:** `POST /api/v1/access/signup`
- **Body:**
```json
{
  "email": "string",
  "password": "string",
  "fullName": "string",
  "phone": "string (optional)"
}
```
- **Response:**
```json
{
  "message": "Registration successful. Please check your email to verify your account",
  "metadata": { ... }
}
```

---

## 2. Xác thực email
- **Endpoint:** `GET /api/v1/access/verify-email?token=...`
- **Response:**
```json
{
  "message": "Email verified successfully. You are now logged in.",
  "metadata": { ... }
}
```

---

## 3. Gửi lại email xác thực
- **Endpoint:** `POST /api/v1/access/resend-verification`
- **Body:**
```json
{
  "email": "string"
}
```
- **Response:**
```json
{
  "message": "Verification email sent successfully",
  "metadata": { ... }
}
```

---

## 4. Đăng nhập
- **Endpoint:** `POST /api/v1/access/login`
- **Body:**
```json
{
  "email": "string",
  "password": "string"
}
```
- **Response:**
```json
{
  "message": "Login successful",
  "metadata": {
    "user": { ... },
    "accessToken": "...",
    "expiresIn": 900,
    "deviceId": "..."
  }
}
```
- **Set-Cookie:** refreshToken (httpOnly)

---

## 5. Làm mới access token
- **Endpoint:** `POST /api/v1/access/refresh-token`
- **Body:** (nếu không dùng cookie)
```json
{
  "refreshToken": "string",
  "userId": "string",
  "deviceId": "string"
}
```
- **Response:**
```json
{
  "message": "Token refreshed successfully",
  "metadata": {
    "accessToken": "...",
    "expiresIn": 900,
    "deviceId": "..."
  }
}
```
- **Set-Cookie:** refreshToken (httpOnly)

---

## 6. Đăng xuất thiết bị hiện tại
- **Endpoint:** `POST /api/v1/access/logout`
- **Header:** Authorization: Bearer {accessToken}
- **Response:**
```json
{
  "message": "Logout successful",
  "metadata": { ... }
}
```

---

## 7. Đăng xuất tất cả thiết bị
- **Endpoint:** `POST /api/v1/access/logout-all`
- **Header:** Authorization: Bearer {accessToken}
- **Response:**
```json
{
  "message": "Logged out from all devices successfully",
  "metadata": { ... }
}
```

---

## 8. Lấy danh sách phiên đăng nhập
- **Endpoint:** `GET /api/v1/access/sessions`
- **Header:** Authorization: Bearer {accessToken}
- **Response:**
```json
{
  "message": "User sessions retrieved successfully",
  "metadata": {
    "sessions": [ ... ],
    "total": 2
  }
}
```

---

## 9. Thu hồi (logout) một phiên cụ thể
- **Endpoint:** `DELETE /api/v1/access/sessions/:deviceId`
- **Header:** Authorization: Bearer {accessToken}
- **Response:**
```json
{
  "message": "Session revoked successfully",
  "metadata": { ... }
}
```

---

## 10. Đổi mật khẩu
- **Endpoint:** `POST /api/v1/access/change-password`
- **Header:** Authorization: Bearer {accessToken}
- **Body:**
```json
{
  "currentPassword": "string",
  "newPassword": "string"
}
```
- **Response:**
```json
{
  "message": "Password changed successfully. Please login again.",
  "metadata": { ... }
}
```

---

## Lưu ý
- Các endpoint bảo vệ cần access token hợp lệ (trừ signup, login, verify-email, resend-verification).
- refreshToken được lưu ở httpOnly cookie hoặc truyền qua body.
- Tất cả response đều có trường `message` và `metadata`.
- Khi logout hoặc đổi mật khẩu, refreshToken sẽ bị xóa khỏi cookie.

---

## Error Response
```json
{
  "status": "error",
  "message": "...",
  "code": 400
}
```

---

## Author
- API by Access Module (JWT, Session, Device Management)
