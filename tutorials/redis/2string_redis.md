
# 1. Kịch bản ứng dụng: 
- Đối tượng bộ đệm, số lượng thông thường, khóa phân tán, thông tin phiên được chia sẻ
- Lưu trữ tối đa 512MB 
- String -> SDS 
- Có 3 loại mã hóa 
    + embstr 44 byte
    + raw > 44 byte
    + int

## Thao tác cơ bản 
- Set key: set key value
- Get key: get key
- check exists: Exists key 
- get length: strlen key
- get data type: object encoding key 
- delete key: del key 
- set multi key: MSET key1 value1 key2 value2 
- get multi key: MGET key1 key2
- increment value: incr key 
- increment by value: incrby key newvalue (incrby num 8) // tang len 8 gia tri
- decrement value: decr key 
- decrement by value: decrby key newvalue 
- find key: keys 'char*' (key 'nu*' => num)
- set expire time for key: expire key time 
- get expire time: ttl key 
- set key with expire time: set key value EX time 
- set value if key not exit: SETNX key value
- set key with id: set user:id (set user:1)
- set object: mset user:1:name dinh user:1:age 20

## Khóa phân tán 
- set lock_key unique_value NX PX 10000
## Section (trạng thái phiên) 
- máy chủ redis quản lý section chung 