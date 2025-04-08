'use strict'

const { model, Schema } = require('mongoose');
const slugify = require('slugify');

const DOCUMENT_NAME = 'Spu'
const COLLECTION_NAME = 'Spus'

const productSchema = new Schema({
    product_id: { type: String, default: '' }, // abc123 
    product_name: { type: String, required: true },
    product_thumb: { type: String, required: true },
    product_description: String,
    product_slug: String, // quan-jean-sl
    product_price: { type: Number, required: true },
    product_quantity: { type: Number, required: true },
    product_category: { type: Array, default: [] },
    product_shop: { type: Schema.Types.ObjectId, ref: 'Shop', },
    product_attributes: { type: Schema.Types.Mixed, required: true },
    // more 
    product_ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        // 4.33333 => 4.3 
        set: (val) => Math.round(val * 10) / 10,
    },
    product_variations: { type: Array, default: [] },
    /**
     * tier_variations: [
     * {
     *   images: [],
         name: 'color'
         options: ['red', 'green']
     * },{
         name: size,
         options: ['S', 'M', 'L']
         images: []
        }]
     */
    isDraft: { type: Boolean, default: true, index: true, select: false }, // select để khi find sẽ không lấy trường này
    isPublished: { type: Boolean, default: false, index: true, select: false },
    isDeleted: { type: Boolean, deafalt: false }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

// create index for search 
productSchema.index({ product_name: 'text', product_description: 'text' })

// Document middleware: runs before .save() and .create() // trước khi nó save hoặc create thì nó sẽ đi vào middleware 
productSchema.pre('save', function (next) {
    this.product_slug = slugify(this.product_name, { lower: true })
    next()
})


module.exports = model(DOCUMENT_NAME, productSchema)