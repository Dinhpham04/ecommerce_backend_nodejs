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