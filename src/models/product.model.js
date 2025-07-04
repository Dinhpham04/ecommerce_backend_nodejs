'use strict'

const { model, Schema } = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = 'Spu'
const COLLECTION_NAME = 'Spus'


const variationOptionSchema = new Schema({
  value: { type: String, required: true }, // giá trị của biến thể, ví dụ: 'red', 'green'
  label: { type: String, required: true }, // tên hiển thị của giá trị, ví dụ: 'Đỏ', 'Xanh'
  image: { type: String, default: '' }, // ảnh đại diện cho giá trị, nếu có
  color_code: { type: String, default: '' },
  extra_price: { type: Number, default: 0 }, // giá trị phụ thêm cho biến thể này, nếu có
  is_available: { type: Boolean, default: true }, // có sẵn để mua không
  detail: { type: Object, default: {} } // thông tin chi tiết cho giá trị, có thể là mô tả, thuộc tính khác
}, { _id: false })

const variationSchema = new Schema({
  key: { type: String, required: true }, // tên biến thể, ví dụ: 'color', 'size'
  name: { type: String, required: true }, // tên hiển thị của biến thể, ví dụ: 'Màu sắc', 'Kích thước'
  type: { type: String, enum: ['color', 'size', 'material', 'style', 'pattern', 'other'], default: 'other' }, // kiểu biến thể
  options: { type: [variationOptionSchema], required: true },
  images: { type: [String], default: [] },
  description: { type: String, default: '' }, // mô tả ngắn cho biến thể
  is_required: { type: Boolean, default: true }, // biến thể này có bắt buộc không
  display_type: { type: String, enum: ['color', 'text', 'image', 'dropdown', 'radio', 'other'], default: 'text' }, // kiểu hiển thị
  sort_order: { type: Number, default: 0 }, // thứ tự hiển thị
}, { _id: false }) // không tạo id cho subdocument

const productSchema = new Schema({
  product_id: { type: String, unique: true, sparse: true }, // abc123 
  product_name: { type: String, required: true, trim: true },
  product_slug: { type: String, unique: true, index: true }, // quan-jean-sl
  product_thumb: { type: String, required: true },
  product_media: {
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] }
  },
  product_brand: { type: String, default: '', index: true },
  product_model: { type: String, default: '' },

  // Pricing 
  base_price: { type: Number, required: true },
  compare_price: { type: Number, default: 0 }, // so sánh giá (giá gốc)
  cost_price: { type: Number, default: 0 },

  // Inventory
  manage_inventory: { type: Boolean, default: true }, // quản lý tồn kho
  track_quantity: { type: Boolean, default: true }, // theo dõi số lượng tồn kho
  allow_backorders: { type: Boolean, default: false }, // cho phép đặt hàng khi hết hàng

  // SEO and Content
  meta_title: { type: String, default: '' },
  meta_description: { type: String, default: '' },
  product_description: { type: String, default: '' },
  product_short_description: { type: String, default: '' },

  // Categorization
  product_category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  product_categories: { type: [Schema.Types.ObjectId], ref: 'Category', default: [] },
  product_shop: { type: Schema.Types.ObjectId, ref: 'Shop', },

  // Dynamic Attributes
  product_attributes: { type: Schema.Types.Mixed, default: {} },

  // Variations
  product_variations: { type: [variationSchema], default: [] },
  has_variations: { type: Boolean, default: false }, // flag để query nhanh

  product_quantity: { type: Number, required: true },

  // stats
  product_ratingsAverage: {
    type: Number,
    default: 5,
    min: [1, 'Rating must be above 1.0'],
    max: [5, 'Rating must be below 5.0'],
    // 4.33333 => 4.3 
    set: (val) => Math.round(val * 10) / 10,
  },
  product_ratings_count: { type: Number, default: 0 },
  product_sales_count: { type: Number, default: 0 },
  product_view_count: { type: Number, default: 0 }, // số lượng đã xem
  product_favorite_count: { type: Number, default: 0 }, // số lượng đã yêu thích

  // Search and Tags
  product_tags: { type: [String], default: [], index: true }, // tags for product, ví dụ: ['jean', 'quần', 'áo']
  search_keywords: { type: [String], default: [] }, // danh sách từ khóa tìm kiếm, có thể là tên, mô tả, thuộc tính, v.v.

  // Status 
  status: {
    type: String,
    enum: ['draft', 'active', 'inactive', 'out_of_stock', 'discontinued'],
    default: 'draft',
    index: true
  },

  isDraft: { type: Boolean, default: true, index: true, select: false }, // select để khi find sẽ không lấy trường này
  isPublished: { type: Boolean, default: false, index: true, select: false },
  isDeleted: { type: Boolean, default: false, select: false },

  // Dates
  published_at: { type: Date },
  available_from: { type: Date, default: Date.now }, // ngày có sẵn để bán
  available_to: { type: Date }, // ngày hết hạn bán, nếu có
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

// Indexes
productSchema.index({ product_name: 'text', product_description: 'text', search_keywords: 'text' }) // text index 
productSchema.index({ product_shop: 1, status: 1, createdAt: -1 }) // compound index 
productSchema.index({ product_category: 1, status: 1, product_sales_count: -1 })
productSchema.index({ base_price: 1, status: 1 })


// Document middleware: runs before .save() and .create() // trước khi nó save hoặc create thì nó sẽ đi vào middleware 
productSchema.pre('save', function (next) {
  if (this.isModified('product_name')) {
    this.product_slug = slugify(this.product_name, { lower: true, locale: 'vi' })
  }

  // Auto set has_variations
  this.has_variations = this.product_variations && this.product_variations.length > 0;

  // Auto generate search keywords
  if (this.isModified('product_name') || this.isModified('product_tags')) {
    this.search_keywords = [
      ...this.product_name.toLowerCase().split(' '),
      ...this.product_tags.map(tag => tag.toLowerCase()),
      this.product_brand.toLowerCase()
    ].filter(Boolean); // loại bỏ các từ rỗng
  }
  next();
})


module.exports = model(DOCUMENT_NAME, productSchema)


/** 
 {
  "product_id": "abc123",
  "product_name": "Quần Jean Nam",
  "product_thumb": "https://example.com/images/jean-thumb.jpg",
  "product_brand": "Levi's",
  "product_media": [
    "https://example.com/images/jean1.jpg",
    "https://example.com/images/jean2.jpg"
  ],
  "product_short_description": "Quần jean nam thời trang, chất liệu cao cấp.",
  "product_description": "Quần jean nam Levi's, co giãn tốt, phù hợp mọi hoạt động.",
  "product_price": 499000,
  "product_quantity": 100,
  "product_category": "60f7c2b8e1b1c8a1b8e1b1c8", // ObjectId của category
  "product_shop": "60f7c2b8e1b1c8a1b8e1b1c9",     // ObjectId của shop
  "product_attributes": {
    "origin": "Việt Nam",
    "material": "Denim"
  },
  "product_variations": [
    {
      "key": "color",
      "name": "Màu sắc",
      "options": [
        {
          "value": "blue",
          "label": "Xanh",
          "image": "https://example.com/images/blue.jpg",
          "detail": {}
        },
        {
          "value": "black",
          "label": "Đen",
          "image": "https://example.com/images/black.jpg",
          "detail": {}
        }
      ],
      "images": [],
      "description": "Chọn màu sắc sản phẩm",
      "is_required": true,
      "display_type": "color",
      "sort_order": 1
    },
    {
      "key": "size",
      "name": "Kích thước",
      "options": [
        { "value": "S", "label": "Size S", "image": "", "detail": {} },
        { "value": "M", "label": "Size M", "image": "", "detail": {} },
        { "value": "L", "label": "Size L", "image": "", "detail": {} }
      ],
      "images": [],
      "description": "Chọn kích thước sản phẩm",
      "is_required": true,
      "display_type": "dropdown",
      "sort_order": 2
    }
  ],
  "product_tags": ["jean", "quần", "nam"],
  "product_searchable": ["jean", "quần jean nam", "levis"]
}
 */