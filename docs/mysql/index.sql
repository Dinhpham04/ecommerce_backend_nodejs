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
	- Nguyên tắc trường nào xuất hiện trùng lặp nhiều thì để đầu tiên
3. Nguyên tắc sử dụng index ngoài cùng bên trái là như thế nào  ?
	- Khi Sử dụng chỉ mục kết hợp luôn phải kèm theo trường ngoài cùng được dùng làm chỉ mục kết hợp bên trái 

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
explain select a from test_table_001 where b = 1 and c = 2;

-- type:
-- all:  