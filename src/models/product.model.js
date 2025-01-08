'use strict'

const { model, Schema } = require('mongoose');

const DOCUMENT_NAME = 'Product'
const COLLECTION_NAME = 'Products'

const productSchema = new Schema({
    product_name: {
        type: String,
        required: true
    },
    product_thumb: {
        type: String,
        required: true
    },
    product_decription: String,
    product_price: {
        type: Number,
        required: true
    },
    product_quantity: {
        type: Number,
        required: true
    },
    product_type: {
        type: String,
        required: true,
        enum: ['Electronic', 'Clothing', 'Furniture']
    },
    product_shop: {
        type: Schema.Types.ObjectId,
        ref: 'Shop',
    },
    product_attributes: {
        type: Schema.Types.Mixed,
        required: true
    }
}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

// define the product type = electronic 

const clothingSchema = new Schema({
    manufacturer: { type: String, require: true },
    model: String,
    color: String,
    product_shop: Schema.Types.ObjectId,
}, {
    collection: 'Clothes',
    timestamps: true
})

const electronicSchema = new Schema({
    brand: { type: String, require: true },
    size: String,
    material: String,
    product_shop: Schema.Types.ObjectId,
}, {
    collection: 'Electronics',
    timestamps: true
})

const furnitureSchema = new Schema({
    manufacturer: { type: String, require: true },
    model: String,
    color: String,
    product_shop: Schema.Types.ObjectId,
}, {
    collection: 'Furnitures',
    timestamps: true
})

module.exports = {
    product: model(DOCUMENT_NAME, productSchema),
    clothing: model('Clothing', clothingSchema),
    electronic: model('Electronic', electronicSchema),
    furniture: model('Furniture', furnitureSchema)
}