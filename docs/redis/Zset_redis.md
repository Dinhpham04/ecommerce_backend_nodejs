# 1. Cấu trúc 
- Giống như set chỉ gồm các phần tử duy nhất 
- Các phần tử được sắp xếp theo điểm số (score)

## 2. Các lệnh phổ biến 
add: zadd key [socre member]
get: zrange key || zrevrange key start stop
del: zrem key value 
count: scard key 
incre score: zincrby key score value 
get by score: zrangebyscore key score1 score2 
### 3. Kịch bản sử dụng 