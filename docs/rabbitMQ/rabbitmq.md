# 1. Tại sao sử dụng message queue
- 1. Tách biệt và xử lý bất đồng bộ 
    + message queue giúp tách biệt các phần khác nhau trong hệ thống. Thay vì một ứng dụng phải xử lý mọi thứ ngay lập tức thì nó có thể gửi yêu cầu vào hàng đợi và sử lý sau (bất đồng bộ). 
    + Ví dụ khi người dùng đặt hàng trên website, hệ thống cần gửi tin nhắn xác nhận qua email. Hệ thống có thể gửi yêu cầu gửi email cho người dùng vào hàng đợi và thực hiện sau, giảm lượng tài nguyên cần dùng
- 2. Tăng khả năng chịu tải 
    + Trong hệ thống lớn, nếu có quá nhiều yêu cầu cùng một lúc hệ thống có thể quá tải. Message queue cho phép xếp hàng các yêu cầu này và xử lý từng cái một
- 3. Đảm bảo độ tin cậy 
    + Nếu một phần của hệ thống bị lỗi (ví dụ như server gửi email bị lỗi), message queue có thể lưu trữ tin nhắn cho đến khi hệ thống hoạt động trở lại. Đảm bảo dữ liệu không bị mất
- 4. Phân phối công việc 
    + Message queue hỗ trợ chia nhỏ công việc cho nhiều worker (máy chủ hoặc tiến trình)
    + Ví dụ nếu một ứng dụng cần xử lý nhiều video, có thể gửi từng video vào queue để nhiều máy xử lý xong xong, tăng tốc độ
- 5. Dễ mở rộng
    + Khi hệ thống phát triển, chỉ cần thêm worker để xử lý queue à không cần thay đổi cấu trúc lớn. Hữu ích trong hệ thống phân tán và microservice
# 2. Ưu và nhược điểm của message queue là gì ? 
- 1. Độ phức tạp tăng: đòi hỏi phải quản lý thêm một thành phần như queue server RabbitMQ, Kafka 
- 2. Độ trễ: vì là sử lý bất đồng bộ
- 3. Khó debug và theo dõi: khi có lỗi việc tìm hiểu tin nhắn nào thất bại hoặc bị kẹt trọng queue có thể phức tạp
- 4. Chi phí vận hàng
- 5. Khả năng trùng lặp hoặc mất thứ tự: tin nhắn xử lý nhiều lần, không theo thức tự
- 6. Phụ thuộc vào hệ thống queue: khi bị down toàn bộ luồng xử lý có thể bị gián đoạn
- 7. Có thể mất tin nhắn, tính nhất quán của hệ thống
# 3. Tình huống nào phù hợp cho MQ
- 1. Sử lý bất đồng bộ
- 2. Sử lý lượng đồng thời cao 
# 4. kafka và rabbitMQ
- kafka thông lượng cao hơn
- khả dụng thì rabbitMQ cao hơn
- kafka độ trễ cao hơn

## MÔ HÌNH TRONG RABBITMQ