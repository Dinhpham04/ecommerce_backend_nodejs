# 1. Redis là gì ? Mà bạn quan tâm
    * Là một cơ sử dữ liệu trong đó dữ liệu được lưu trữ trong bộ nhớ ram
    * Tốc độ rất nhanh
    * Thường được sử dụng trong khóa phân tán
    * Hỗ trợ transactions .... 

# 2. Tại sao sử dụng 
        1. Hiệu xuất cao 
            + Dữ liệu lần đầu tiên truy cập được lấy từ đĩa, sau đó truy cập lần nữa thì lấy từ bộ điệm
            Bộ nhớ catch là rất nhanh,
        2. Đồng thời cao 
            + Các yêu cầu tới bộ nhớ điệm cao hơn nhiều so với truy xuất từ database 
# 3. Memcached vs Redis 
    * Redis phong phú hơn, hỗ trợ nhiều kịch bản hơn list, string ..
    * Redis hỗ trợ bền bỉ dữ liệu, có thể lưu trữ trên đĩa hoặc catch 
    * Chế độ cluster 
    * Redis mô hình đơn luồng
# 4. Redis có bao nhiêu kiểu dữ liệu và kịch bản sử dụng
    * String (get, set, ...) bộ đệm, bộ đếm
    * Hash (get, set, geton) Lưu trữ các đối tượng 
    * List () Lưu trữ danh sách 
    * Set () Danh sách hàm, tự động sắp xếp các bảng 
    * Access () sắp xếp với các chức năng trọng điểm hơn 

# 5. Redis giải quyết cơ chế hết hạn dữ liệu thế nào ? 
    * Sắp xếp độ ưu tiên 
    * Xóa định kỳ
    
    * Giải pháp khác phục sự cố 

# 6. Làm sao đảm bảo tính nhất quán cơ sở dữ liệu 

# 7. Cách giải quyết vấn đề cạnh tranh đồng thời trong redis (khóa phần tán)