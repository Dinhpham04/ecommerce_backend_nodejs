1. Tạo index trong mongodb 
db.Scheme.createIndex({attributes: 1})
vd: db.products.createIndex({produce_code: 1})

2. Nguyên tắc ngoài cùng bên trái 
- Chi khi sử dụng index ngoài cùng bên trái mới gọi là dùng index 
index: {a: 1, b: 1, c: 1}
=> {a: 1}
=> {a: 1, b: 1}
=> {a: 1, b: 1, c: 1}
=> {a: 1, c: 1}

=> Có idxcan

=> {b: 1}, {c: 1}, {b: 1, c: 1} => Không có idxcan