1. Không thể tạo chỉ mục primary bằng lệnh create mà chỉ có thể tạo bằng lệnh alter: 
- alter table video add primary key idx_video_id(video_id)
- chỉ mục khóa chính là chỉ mục duy nhất 
- Tạo chỉ mục full text search
	+ alter table tableName add add fulltext index indexName(column);
	+ create fulltext index indexName on tableName(columnName); 
	+ dành cho kiểu dữ liệu char, varchar 
- Show index: show index from tableName 
- Tìm kiếm full text: select count(video_id) as 'HowMany' from video where match(video_name) against('name 01'); 
- Hiệu quả khi độ dài trong  ft_max_word_len: 84 và ft_min_word_len: 4, phải nằm giữa khoảng này nếu không ra kết quả (show variables like ‘%ft%’ 
	
2. Trong mysql có bao nhiêu loại chỉ mục 
- Rất nhiểu loại chỉ mục: nomal index, unique index: sử dụng làm email, primary key, primary index, fulltext index, single column index, Composite index
	- Nguyên tắc trường nào xuất hiện trùng lặp nhiều thì không nên sử dụng index vì không hiệu quả
    - Create index idx_order_status On orders (orderNumber, status) // cách đúng
    - Create index idx_order_status On orders (status, orderNumber) // Cách sai
    - vì ở đây status quá nhiều 
3. Nguyên tắc sử dụng index ngoài cùng bên trái là như thế nào  ?
	- Khi Sử dụng chỉ mục kết hợp luôn phải kèm theo trường ngoài cùng được dùng làm chỉ mục kết hợp bên trái 
4. Sử dụng column nào làm index 
Select count(distinct orderNumber)/count(1) as o, count(distinct status)/count(1) as s from orders; 
=> Thằng nào nhiều hơn thằng đó ở ngoài cùng bên trái

=> Index rất nhanh vì index sử dụng cấu trúc dữ liệu B+Tree

create table test_table_001 (
	id int primary key,
    a int,
    b int, 
    c int,
    d int,
    index idx_abc (a, b, c) -- composite index
);
show index from test_table_001;

explain select * from test_table_001 where a = 1 and c = 2;
explain select a from test_table_001 where b = 1 and c = 2; -- use a

-- type:
-- all: tất cả truy vấn được thực hiện
-- system: thực hiện 1 phần
-- const: truy vấn được thực hiện trong điều kiện
-- range: truy vấn tìm kiếm trong phạm vi nhất định 
-- ref: truy vấn chỉ mục thông thường 
-- index: chỉ mục phụ đang được sử dụng

-- II Transaction trong MYSQL 

-- User A
-- 1. Check sản phẩm tồn kho 
update `shopdev_inventory` set ...;
-- 2. Tạo order 
insert into `shopdev_order` value(...);
-- 3. Thanh toán tiền mặt 
Insert into `shopdev_payment` values(...);
-- 4. push qua cho giao hàng
insert into `shopdev_logistics` values(...); 

-- User B ...
-- 1. Định nghĩa: 
	-- Transaction bao gồm 1 hoặc nhiều câu lệnh trong quá trình thực thị
-- 2. 4 Nguyên tác trong transaction ADIC
	-- 1. Atomictity (tính nguyên tử) 
		-- 1 Nhóm tạo lên giao dịch đều được thành công hoặc thất bại
    -- 2. Consistency (tính nhất quán)
		-- Bất kỳ trức và sau khi giao dịch thì dữ liệu gốc đều phải nhất quán
        -- Số lượng hàng toàn kho + đơn hàng luôn bằng tổng lượng hàng ban đầu
        -- Nếu xảy ra ngoại lệ trong transaction thì sẽ có cơ chế khôi phục lại dữ liệu ban đầu đề đảm bảo tính nhất quán
    -- 3. Isolation (Độc lập, cô lập)
		-- Cả 2 cùng thao tác đặt hàng tại cùng 1 thời điểm vd 1 sản phẩm 2 người mua
        -- Thực hiện tuần tự các giao dịch đồng thời, nghĩa là giao dịch chưa hoàn thành thì sẽ không ảnh hưởng tới giao dịch khác
        -- tùy theo level mà sẽ có mức độ nhất quán dữ liệu nhất định
    -- 4. Durablity (tính kiên trì)
		-- 1 khi transaction được thực hiện thì tồn tại vĩnh viễn và tất cả dữ liệu thay đổi sẽ ghi vào disk vào database
        -- có thể khôi phục bởi cơ chế log của database
    
    -- Bắt đầu 1 giao dịch
	Start transaction | begin | begin work 
    
    -- Kết thúc 1 giao dịch 
    Commit
    
    --  KHôi phục một giao dịch
    Rollback
