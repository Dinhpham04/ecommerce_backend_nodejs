'use strict'

const { model, Schema } = require('mongoose')
const slugify = require('slugify')


const DOCUMENT_NAME = 'Category'
const COLLECTION_NAME = 'Categories'


const attributeSchema = new Schema({
  name: { type: String, required: true },
  key: { type: String, required: true },
  type: { type: String, enum: ['string', 'number', 'boolean', 'enum', 'array'], required: true },
  options: { type: [String], default: [] }, // chỉ dùng khi type là enum hoặc array
  is_required: { type: Boolean, default: false },
  is_filterable: { type: Boolean, default: false }, // có thể lọc theo thuộc tính này không
  is_searchable: { type: Boolean, default: false }, // có thể tìm kiếm theo thuộc tính này không
  display_order: { type: Number, default: 0 }, // thứ tự hiển thị của thuộc tính trong danh sách
}, {
  _id: false // không tạo id cho subdocument
})

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, trim: true, index: true }, // slug cho category, ví dụ: "quan-jean"
  description: { type: String, default: '' }, // mô tả của category
  image: { type: String, default: '' }, // ảnh đại diện của category
  parent_id: { type: Schema.Types.ObjectId, ref: DOCUMENT_NAME, default: null, index: true }, // ref to parent category
  ancestors: [{ type: [Schema.Types.ObjectId], default: [] }], // danh sách các category cha, dùng để tìm kiếm nhanh
  children_count: { type: Number, default: 0 }, // số lượng category con, dùng để tối ưu truy vấn
  product_count: { type: Number, default: 0 }, // số lượng sản phẩm trong category này, dùng để tối ưu truy vấn
  level: { type: Number, default: 0, min: 0, max: 5 }, // cấp độ của category, 0 là cấp cao nhất
  path: { type: String, default: '', index: true }, // đường dẫn của category, ví dụ: "root/parent/child"
  attributes: { type: [attributeSchema], default: [] }, // danh sách thuộc tính của category
  variations: { type: [attributeSchema], default: [] }, // danh sách biến thể của category
  search_keywords: { type: [String], default: [] }, // danh sách từ khóa tìm kiếm, có thể là tên, mô tả, thuộc tính, v.v.
  is_active: { type: Boolean, default: true, index: true },
  sort_order: { type: Number, default: 0 }
}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

// Hàm middleware để tự động tạo slug từ tên category
categorySchema.pre('save', function (next) {
  if (this.isModified('name') && !this.slug) {
    this.slug = slugify(this.name, { lower: true, strict: true })
  }
  next();
})

// Index compound cho search hiệu quả
categorySchema.index({ name: 'text', search_keywords: 'text' })
categorySchema.index({ parent_id: 1, is_active: 1, sort_order: 1 }) // index cho truy vấn theo parent_id và trạng thái hoạt động

module.exports = model(DOCUMENT_NAME, categorySchema)



/**
 {
  "name": "Quần Jean",
  "slug": "quan-jean",
  "description": "Các loại quần jean thời trang",
  "image": "https://example.com/images/quan-jean.jpg",
  "parent_id": null,
  "level": 0,
  "path": "root/quan-jean",
  "attributes": [
    {
      "name": "Chất liệu",
      "type": "string",
      "is_required": true
    },
    {
      "name": "Kiểu dáng",
      "type": "enum",
      "options": ["Slim", "Regular", "Loose"],
      "is_required": false
    }
  ],
  "variations": [
    {
      "name": "Màu sắc",
      "type": "enum",
      "options": ["Xanh", "Đen", "Trắng"],
      "is_required": true
    },
    {
      "name": "Kích cỡ",
      "type": "enum",
      "options": ["S", "M", "L", "XL"],
      "is_required": true
    }
  ],
  "search_keywords": ["quần jean", "jeans", "quần bò"]
}
 */