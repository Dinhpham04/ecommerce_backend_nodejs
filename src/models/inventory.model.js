'use strict'

const { Schema, model } = require('mongoose'); // Erase if already required

const DOCUMENT_NAME = 'Inventory'
const COLLECTION_NAME = 'Inventories'

const reservationSchema = new Schema({
    cart_id: { type: Schema.Types.ObjectId, ref: 'Cart' },
    order_id: { type: Schema.Types.ObjectId, ref: 'Order' },
    quantity: { type: Number, required: true },
    reserved_at: { type: Date, default: Date.now },
    expires_at: { type: Date, required: true }, // TTL  for reservations
    status: { type: String, enum: ['active', 'expired', 'consumed'], default: 'active' }
}, { _id: false })

// Declare the Schema of the Mongo model
const inventorySchema = new Schema({
    product_id: { type: Schema.Types.ObjectId, ref: 'Spu', required: true, index: true },
    sku_id: { type: Schema.Types.ObjectId, ref: 'Sku', required: true, index: true }, // Sku liên kết với SPU
    shop_id: { type: Schema.Types.ObjectId, ref: 'Shop', required: true, index: true },

    // Location
    warehouse_id: { type: String, default: '', index: true }, // kho hàng, nếu có
    warehouse_name: { type: String, default: '' },
    location: { type: String, default: '' },

    // stock 
    total_stock: { type: Number, required: true, min: 0 },
    available_stock: { type: Number, required: true, min: 0, default: 0 },
    reserved_stock: { type: Number, default: 0, min: 0 },
    sold_stock: { type: Number, default: 0, min: 0 }, // số lượng đã bán

    // Reservations
    reservations: { type: [reservationSchema], default: [] }, // danh sách đặt hàng đã đặt nhưng chưa giao

    // Thresholds
    min_stock_level: { type: Number, default: 0, min: 0 }, // mức tồn kho tối thiểu
    max_stock_level: { type: Number, default: 0, min: 0 }, // mức tồn kho tối đa
    reorder_level: { type: Number, default: 0, min: 0 }, // mức tồn kho để đặt hàng lại

    // Stock movements tracking
    last_movement: {
        type: { type: String, enum: ['in', 'out', 'adjustment', 'reserved', 'released'] },
        quantity: { type: Number },
        reason: { type: String },
        created_at: { type: Date, default: Date.now },
    },

    // Status
    status: { type: String, enum: ['active', 'inactive', 'blocked'], default: 'active', index: true }

}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// Indexes for performance
// inventorySchema.index({ sku_id: 1, warehouse_id: 1 }, { unique: true });
inventorySchema.index({ shop_id: 1, status: 1 });
inventorySchema.index({ available_stock: 1, status: 1 })
inventorySchema.index({ 'reservations.expires_at': 1 }, { expireAfterSeconds: 0 }); // TTL index for reservations

// Middleware to calculate available stock
inventorySchema.pre('save', function (next) {
    // Clean expired reservations
    const now = new Date();
    this.reservations = this.reservations.filter(res => res.expires_at > now && res.status === 'active');

    // Calculate reserved stock 
    this.reserved_stock = this.reservations.reduce((sum, res) => sum + res.quantity, 0);

    // Calculate available stock
    this.available_stock = Math.max(0, this.total_stock - this.reserved_stock)
    next();
})
//Export the model
module.exports = {
    inventory: model(DOCUMENT_NAME, inventorySchema)
}
