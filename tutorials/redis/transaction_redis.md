- là các lệnh, thực thi tuần tự 

# Lệnh phố biến 
1. Watch: giám sát 1 key (khi 1 giao dịch đang được thực, nếu key bị thay đổi thì hàng đợi sẽ không được thực thi, transaction không thành công)
2. Multi: bắt đầu giao dịch (đưa lệnh vào hàng đợi )
3. exec: thực thi transaction
4. Discard: từ bỏ giao dịch

-- Nếu có 1 lệnh bị lỗi trong transaction bị lỗi thì transaction sẽ bị hủy bỏ (Lỗi cú pháp)
- Nếu lệnh bị lỗi do lập trình thì transaction vẫn được thực thi, lệnh bị lỗi sẽ bị catch, các lệnh còn lại vẫn chạy