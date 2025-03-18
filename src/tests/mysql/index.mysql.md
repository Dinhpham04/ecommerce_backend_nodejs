CREATE TABLE `users` (
	`usr_id` int not null auto_increment,
    `usr_age` int default '0',
    `usr_status` int default '0',
    `usr_name` varchar(128) collate utf8mb4_bin default null,
    `usr_email` varchar(128) collate utf8mb4_bin default null,
    `usr_address` varchar(128) collate utf8mb4_bin default null,
    
    primary key (`usr_id`),
    key `idx_email_age_name` (`usr_email`, `usr_age`, `usr_name`),
    key `idx_status` (`usr_status`)
) engine = InnoDB auto_increment=4 default charset=utf8mb4 collate utf8mb4_bin;
-- auto_incrent=4 để phân bảng con ví dụ từ 1 - 100, 101 - hết 
-- messi, ronaldo, anonystick 
insert into users (usr_id, usr_age, usr_status, usr_name, usr_email, usr_address) values (
	1, 36, 1, 'messi', 'messi@gmail.com', 'hanoi'
);

insert into users (usr_id, usr_age, usr_status, usr_name, usr_email, usr_address) values (
	2, 38, 0, 'ronaldo', 'ronaldo@gmail.com', 'hanoi'
);

insert into users (usr_id, usr_age, usr_status, usr_name, usr_email, usr_address) values (
	3, 39, 1, 'anonystick', 'anonystick@gmail.com', 'HCM'
);

select * from users;
delete from users where (usr_id = 1);
select version();

explain select * from users where usr_id = 1;

-- index = idx_email_age_name 
explain select * from users where usr_email = 'ronaldo@gmail.com';
explain select * from users where usr_email = 'ronaldo@gmail.com' and usr_age = 38;
explain select * from users where usr_email = 'ronaldo@gmail.com' and usr_age = 38 and usr_name = 'ronaldo';

explain select * from users where usr_age = 38;
explain select * from users where usr_age = 38 and usr_name = 'ronaldo';

-- SELECT * 
explain select usr_email from users where usr_age = 38; -- Sử dụng index 
-- Nếu các cột truy vấn bao gồm các cột đánh index thì sẽ được sử dụng index

-- Nói không với tính toán trên chỉ mục khi truy vấn 
explain select * from users where usr_id + 1 = 2;

-- idx_status 
explain select * from users where substr(usr_status,1 , 2) = 1; -- không sử dụng index 

-- truy vấn sai kiểu dữ liệu 
explain select * from users where usr_status = '1';

-- like % 
explain select * from users where usr_email  like '%@%'; -- not index
explain select * from users where usr_email  like 'ronaldo@%'; -- have index
explain select * from users where usr_email  like '%.com'; -- not index

-- OR 
explain select * from users where usr_id = 1 OR usr_status = 0; -- use index
explain select * from users where usr_id = 1 OR usr_status = 0 or usr_address = 'hanoi'; -- not use index because usr_address not have index
explain select * from users where usr_id = 1 OR usr_status = 0 or usr_email = 'dinhpham'; -- user composite index

-- order by

explain select * from users where usr_email = 'abc' order by usr_email, usr_name; -- use index
explain select * from users order by usr_email, usr_name; -- not use index because not have where or limit