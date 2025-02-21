# 1. Các lệnh phổ biến 
- push left: lpush list ele1 ele2 elen
- push right: rpush list ele1 ele2 elen 
- get all elements: lrange list 0 -1 (lấy từ vị trí 0 đến hết) (0 - n)
- del left element: lpop list 
- del multiple left elements: lpop list n
- del right element: rpop list
- del multiple right elements: rpop list n
- get value at index: lindex list index
- get leng: llen list
- remove element at index: lrem list count value (count > 0 => left ? right)
- lấy các phần tử trong một khoảng: ltrim list start top
- 
## 2. Trường hợp sử dụng 
- Blocking : trường hợp có 1 vé mà 2 người mua 
- blpop list time  (0: timeout) // chờ đợi cho đến khi hoàn thành