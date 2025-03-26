### HASH REDIS

# 1. Cấu trúc hash
- 1 biến hash có thể lưu trữ được nhiều cặp key-value (2^32 - 1)
# 2. Các lệnh phổ biến 
- set field: hset name key value 
- get field: hget name key 
- set multi field: hmset name key1 value1 key2 value2 ... keyn valuen
- get multi field: hmget name key1 key2 ... keyn
- delete field: hdel name key
- get length field: hlen name
- get all key: hgetall name
- check exists field: hexists name field 
- increment field by: hincrby name field 
- get key: hkeys name 
- get value: hvals name
# 3. Khi nào dùng hash
- Lưu trữ giỏ hàng 
