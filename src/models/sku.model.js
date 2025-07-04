'use strict';

const { model, Schema } = require('mongoose')
const DOCUMENT_NAME = 'Sku'
const COLLECTION_NAME = 'Skus'

const SkuSchema = new Schema({
    sku_id: { type: String, required: true, unique: true }, // string "{spu_id}1234-{shop_id}"
    sku_code: { type: String, unique: true, sparse: true }, // mã sku, có thể là mã vạch hoặc mã riêng của sku

    // Liên kết với SPU 
    product_id: { type: Schema.Types.ObjectId, ref: 'Spu', required: true }, // ref to product

    // Variation mapping
    sku_tier_idx: { type: [Number], default: [] }, // [1, 0], [1, 2]
    variation_values: { type: Schema.Types.Mixed, default: {} }, // { color: 'red', size: 'M' } hoặc { color: 0, size: 1 }
    /**
        color: [red, green] = [0, 1],
        size: [S, M, L] = [0, 1, 2] 
        => [0, 0] = red, s,
        => [1, 2] => green, L  
     */

    // Pricing
    sku_price: { type: Number, required: true, min: 0 }, // trong mô hình hiện đại thì phải tách price ra thành một bảng riêng vì giá cập nhật thường xuyên
    compare_price: { type: Number, default: 0 },
    cost_price: { type: Number, default: 0 },

    // sku_slug: { type: String, default: '' },
    sku_description: { type: String, default: '' }, // mô tả của sku, có thể là mô tả của spu hoặc mô tả riêng của sku

    // Physical properties
    weight: { type: Number, default: 0 }, // trọng lượng của sku, dùng để tính phí vận chuyển
    dimensions: {
        length: { type: Number, default: 0 }, // chiều dài
        width: { type: Number, default: 0 }, // chiều rộng
        height: { type: Number, default: 0 } // chiều cao
    },

    // Identifiers
    barcode: { type: String, unique: true, sparse: true }, // mã vạch của sku, dùng để quét khi bán hàng
    upc: { type: String, unique: true, sparse: true }, // mã UPC của sku, dùng để quét khi bán hàng


    // Media
    sku_media: {
        thumbnail: { type: String, default: '' },
        images: { type: [String], default: [] },
        videos: { type: [String], default: [] }
    },

    // Status 
    sku_status: {
        type: String,
        enum: ['active', 'inactive', 'out_of_stock', 'discontinued'],
        default: 'active',
        index: true
    },
    sku_default: { type: Boolean, default: false }, // true nếu là sku mặc định
    sku_sort: { type: Number, default: 0 }, // thứ tự hiển thị của sku trong list sku

    sales_count: { type: Number, default: 0 },

    isDraft: { type: Boolean, default: true, index: true, select: false }, // select để khi find sẽ không lấy trường này
    isPublished: { type: Boolean, default: false, index: true, select: false },
    isDeleted: { type: Boolean, default: false, select: false }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

SkuSchema.index({ product_id: 1, sku_status: 1 })
SkuSchema.index({ sku_tier_idx: 1 })
SkuSchema.index({ sku_price: 1, sku_status: 1 })


module.exports = model(DOCUMENT_NAME, SkuSchema)