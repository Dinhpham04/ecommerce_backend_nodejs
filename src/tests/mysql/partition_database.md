# 1. Khái niệm
    - Khả năng mở rộng, chia vùng, giảm tắc nghẽn IO 
    - Khi truy vẫn chỉ cần truy vẫn vào phân vùng 
    - Quản lý, bảo trì đơn giản hơn

create table orders (
	order_id INT, -- key hoa don
    order_date DATE NOT NULL, -- ngay hoa don
    total_amount decimal(10,2), -- tien tra
    PRIMARY KEY (order_id, order_date)
)

PARTITION BY RANGE COLUMNS (order_date) (
	PARTITION p0 VALUES LESS THAN ('2023-01-01'),
    PARTITION p2024 VALUES LESS THAN ('2024-01-01'),
    PARTITION p2025 VALUES LESS THAN ('2025-01-01'),
    PARTITION pmax VALUES LESS THAN (MAXVALUE)
)

-- select data 
explain select * from orders

-- phải có range trước khi truy xuất không thì sẽ quét hết partition
-- chèn đúng phân vùng
-- insert data 
insert into orders(order_id, order_date, total_amount) values (1, '2022-10-01', 100);
insert into orders(order_id, order_date, total_amount) values (2, '2024-10-01', 100);
insert into orders(order_id, order_date, total_amount) values (3, '2025-10-01', 100);

-- select data by range 
explain select * from orders partition (p2025);

explain select * from orders where order_date >= '2024-02-02' and order_date < '2025-1-05';


-- Tạo bảng phân vùng mỗi tháng một lần 
call create_table_auto_month() -- gọi để tạo table cho tháng tiếp theo

-- show event
show events;

-- create event 
CREATE EVENT 
`create_table_auto_month_event` -- tạo name event 
ON SCHEDULE EVERY
	1 MONTH  -- moi thang tháng một lần
STARTS 
 '2025-03-13 8:37:30' -- bat dau sau thoi gian nay là start
ON COMPLETION 
	PRESERVE ENABLE -- không xóa bộ count thời gian khi thực hiện xong
DO 
	call create_table_auto_month();
	
-- xóa event 
DROP EVENT create_table_auto_month_event;

-- 