# 1. Khái niệm
Cookie là một đoạn dữ liệu nhỏ mà server gửi về trình duyệt và được trình duyệt lưu lại, tự động gửi kèm theo mỗi request HTTP tiếp theo đến cùng domain.
# 2. Đặc điểm
- Lưu trữ ở phía client (trình duyệt), không phải ở server.
- Có thể chứa thông tin đăng nhập, session, token, tuỳ chọn người dùng, v.v.
- Có các thuộc tính bảo mật như: httpOnly, secure, sameSite, maxAge, domain, path.
# 3. Vai trò
- Lưu refresh token, session id, hoặc các thông tin cần server kiểm soát.
- Khi có httpOnly: true, cookie chỉ server đọc được, JavaScript không truy cập được (chống XSS).
- Cookie sẽ tự động được gửi lên server khi gọi API cùng domain.
-> Tóm lại:
Cookie là phương tiện lưu trữ và truyền dữ liệu nhỏ giữa client và server, rất quan trọng trong xác thực và bảo mật web!