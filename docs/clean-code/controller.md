Tách biệt rõ ràng: Controller chỉ nhận request, validate input, gọi service, trả response. Không chứa logic nghiệp vụ phức tạp.
Sử dụng service layer: Mọi logic xử lý (đăng ký, login, refresh, logout, v.v.) đều chuyển sang service, controller chỉ làm nhiệm vụ “điều phối”.
Xử lý lỗi rõ ràng: Validate input, throw error hợp lý, trả về response chuẩn.
Dễ test, dễ bảo trì: Controller mỏng, dễ mock/test từng chức năng.
Dễ mở rộng: Khi cần thêm logging, tracking, middleware, chỉ cần thêm vào controller mà không ảnh hưởng business logic.