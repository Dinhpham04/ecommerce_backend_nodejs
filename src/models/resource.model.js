'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Resource'
const COLLECTION_NAME = 'Resources'

const resourceSchema = new Schema({
    name: { type: String, required: true, unique: true }, // 'products', 'orders', 'users'
    display_name: { type: String, required: true }, // 'Sản phẩm', 'Đơn hàng'
    description: { type: String, default: '' },

    // Available actions for this resource
    available_actions: [{
        action: { type: String, required: true }, // 'create', 'read', 'update', 'delete'
        display_name: { type: String, required: true }, // 'Tạo mới', 'Xem'
        description: { type: String, default: '' }
    }],

    // Available attributes for this resource
    available_attributes: [{
        attribute: { type: String, required: true }, // 'price', 'cost_price', 'inventory'
        display_name: { type: String, required: true },
        is_sensitive: { type: Boolean, default: false } // sensitive data
    }],

    // Resource category
    category: { type: String, enum: ['core', 'commerce', 'user', 'system'], default: 'core' },

    // Status
    is_active: { type: Boolean, default: true },

}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

module.exports = model(DOCUMENT_NAME, resourceSchema)