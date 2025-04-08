'use strict';

const { model, Schema } = require('mongoose')
const DOCUMENT_NAME = 'Sku'
const COLLECTION_NAME = 'Skus'
const SkuSchema = new Schema({
    sku_id: { type: String, required: true, unique: true }, // string "{spu_id}1234-{shop_id}"
    sku_tier_idx: { type: Array, default: [0] }, // [1, 0], [1, 2]

    /**
        color: [red, green] = [0, 1],
        size: [S, M, L] = [0, 1, 2] 
        => [0, 0] = red, s,
        => [1, 2] => green, L  
     */

    sku_default: { type: Boolean, default: false }, // true nếu là sku mặc định
    sku_slug: { type: String, default: '' },
    sku_sort: { type: Number, default: 0 }, // thứ tự hiển thị của sku trong list sku
    sku_price: { type: String, required: true }, // trong mô hình hiện đại thì phải tách price ra thành một bảng riêng vì giá cập nhật thường xuyên
    sku_stock: { type: Number, default: 0 }, // số lượng tồn kho của sku này, có thể là array, chứa sl của kho hàng, địa chỉ, hợp lệ không
    product_id: { type: String, require: true }, // ref to product

    isDraft: { type: Boolean, default: true, index: true, select: false }, // select để khi find sẽ không lấy trường này
    isPublished: { type: Boolean, default: false, index: true, select: false },
    isDeleted: { type: Boolean, deafalt: false }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, SkuSchema)