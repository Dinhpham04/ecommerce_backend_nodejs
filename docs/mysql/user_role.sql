-- 1.shopdev_user
drop table if exists `shopdev_user`;
create table `shopdev_user` (
	user_id int not null auto_increment comment 'user id',
    user_name varchar(255) null default null comment 'user name',
    user_email varchar(255) null default null comment 'user email',
    primary key (`user_id`)
) engine = InnoDB character set = utf8mb4;

insert into shopdev_user values(1, 'admin', 'admin@anonystick');
insert into shopdev_user values(2, 'shop', 'shop@anonystick');
insert into shopdev_user value(3, 'user', 'user@anonystick');

-- 2. shopdev_role 
drop table if exists `shopdev_role`;
create table `shopdev_role`(
	role_id int not null comment 'role id',
    role_name varchar(255) null default null comment 'role name',
    role_description varchar(255) null default null comment 'role description',
    primary key (`role_id`)
) engine = InnoDB character set = utf8mb4;

insert into shopdev_role values(1, 'admin', 'read,update,delete,create');
insert into shopdev_role values(2, 'shop', 'read,update,create');
insert into shopdev_role values(3, 'user', 'read');

drop table if exists `shopdev_menu`;
create table `shopdev_menu` (
	menu_id int not null auto_increment comment 'menu id',
    menu_name varchar(255) null default null comment 'menu name',
    menu_pid varchar(255) null default null comment 'menu pid',
    menu_path varchar(255) null default null comment 'menu path',
    primary key (`menu_id`)
) engine = InnoDB auto_increment = 10 character set = utf8mb4;

-- run mock data 
-- https://shopee.vn/%C4%90%E1%BB%93ng-H%E1%BB%93-cat.11035788
insert into shopdev_menu values(11, 'Dong ho', '11035788', '/Đồng-Hồ-cat.11035788');
insert into shopdev_menu values(12, 'May tinh', '11035954', 'Máy-Tính-Laptop-cat.11035954'); 
insert into shopdev_menu values(13, 'Thoi trang nam', '11035567', 'Thời-Trang-Nam-cat.11035567');

select menu_id, menu_name, menu_pid, menu_path from shopdev_menu;

-- 4. shopdev_role_menu 
-- gan menu nao cho role nao ?

drop table if exists `shopdev_role_menu`;
create table `shopdev_role_menu` (
	role_id int not null comment 'role id',
    menu_id int not null comment 'menu id',
    primary key (`role_id`, `menu_id`)
) engine = InnoDB character set = utf8mb4;

-- run mock data 
insert into shopdev_role_menu values (1, 11);
insert into shopdev_role_menu values (1, 12);
insert into shopdev_role_menu values (1, 13);
insert into shopdev_role_menu values (2, 12);
insert into shopdev_role_menu values (2, 13);
insert into shopdev_role_menu values (3, 13);

-- shopdev_user_role 
drop table if exists `shopdev_user_role`;
create table `shopdev_user_role` (
	user_id int not null comment 'user id',
    role_id int not null comment 'role id', 
    primary key (`user_id`, `role_id`)
) engine = InnoDB character set = utf8mb4;

insert into shopdev_user_role values(1, 1);
insert into shopdev_user_role values(2, 2);
insert into shopdev_user_role values(3, 3);
-- 1. get quyen truy cap menu cho user = 1 
-- 1.1 xem thu user = 1 co nhung quyen truy cap gi 
select role_id from shopdev_user_role where user_id = 1; -- role_id = 1
-- 1.2 xem role co quyen truy cap nhung menu nao 
select menu_id from shopdev_role_menu where role_id = 1;
-- 1.3 xem nhung menu nao 
select * from shopdev_menu where menu_id in(11, 12, 13);

-- 1 cau lenh 
select * from shopdev_menu where menu_id in (
	select menu_id from shopdev_role_menu where role_id in (
		select role_id from shopdev_user_role where user_id = 1
    )
);

select * from shopdev_menu mn, 
(select rome.menu_id from shopdev_user_role usro, shopdev_role_menu rome where usro.role_id = rome.role_id and usro.user_id = 1) t
where mn.menu_id = t.menu_id;

-- xu ly duplicate field 
select distinct mn.* from shopdev_menu mn, 
(select rome.menu_id from shopdev_user_role usro, shopdev_role_menu rome where usro.role_id = rome.role_id and usro.user_id = 1) t
where mn.menu_id = t.menu_id;







