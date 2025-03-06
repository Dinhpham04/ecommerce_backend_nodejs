# 1. Cấu trúc 
- Lưu các phần tử không lặp lại 
## 2. Các lệnh phổ biến 
- thêm phần tử mới: sadd key value1 value2 value3
- get value: smembers key
- delete value: srem key value
- get length: scard key
- check exist value: sismember ke value
- get random count value: srandmember key count
- delete value: spop key count
- move to new set: smove keyold keynew value
- giao giữa 2 set: sinter key1 key2
- khác nhau giữa 2 set: sdiff key1 key2
### Kịch bản ứng dụng 
- like 
- tìm chung, tìm riêng