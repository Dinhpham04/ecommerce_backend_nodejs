'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Cart'
const COLLECTION_NAME = 'Carts'

// Declare the Schema of the Mongo model

const cartSchema = new Schema({
    cart_state: {
        type: String,
        required: true,
        enum: ['active', 'completed', 'failed', 'pending'],
        default: 'active',
    },
    cart_products: { type: Array, required: true, default: [] },
    /* 
    [
        {
        productId,
        shopId,
        quantity,
        name: 
        price
        }
    ]
    */
    cart_count_product: { type: Number, required: true, default: 0 },
    cart_userId: { type: String, required: true }

}, {
    collection: COLLECTION_NAME,
    timestamps: true,
    // timestamps: {
    //     createdAt: 'createdAt',
    //     updatedAt: 'modifiedAt'
    // }
})

module.exports = {
    cart: model(DOCUMENT_NAME, cartSchema)
}