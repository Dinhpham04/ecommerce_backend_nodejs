// CREATE 

CREATE TABLE test_table (
    id int NOT NULL,
    name varchar(255) DEFAULT NULL,
    age int DEFAULT NULL,
    address varchar(255) DEFAULT NULL,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

// CREATE PROCEDURE

CREATE DEFINER=`dinhpham`@`%` PROCEDURE `insert_data`()
BEGIN 
DECLARE max_id INT DEFAULT 10;
DECLARE i INT DEFAULT 1;
WHILE i<= max_id DO
INSERT INTO test_table (id, name, age, address) VALUES (i, CONCAT('Name', i), i % 100, CONCAT('Address', i));
SET i = i + 1;
END WHILE;
END