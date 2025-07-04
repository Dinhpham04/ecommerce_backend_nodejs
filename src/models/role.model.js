'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Role'
const COLLECTION_NAME = 'Roles'

const grantSchema = new Schema({
  resource: { type: Schema.Types.ObjectId, ref: 'Resource', required: true },
  actions: [{ type: String, required: true }], // ['create', 'read', 'update']
  attributes: { type: String, default: '*' }, // '*', '*, !cost_price', 'name, price'
  conditions: { type: Schema.Types.Mixed, default: {} } // { owner: true, shop_id: '$user.shop_id' }
}, { _id: false })

const roleSchema = new Schema({
  name: { type: String, required: true, unique: true }, // 'admin', 'seller', 'customer'
  display_name: { type: String, required: true }, // 'Quản trị viên', 'Người bán'
  description: { type: String, default: '' },

  // Role type
  type: { type: String, enum: ['system', 'custom'], default: 'system' },

  // Permissions
  grants: [grantSchema],

  // Role hierarchy
  parent_role: { type: Schema.Types.ObjectId, ref: 'Role' },
  level: { type: Number, default: 0 }, // 0 = highest level

  // Status
  status: { type: String, enum: ['active', 'inactive'], default: 'active' },

  // Scope
  scope: { type: String, enum: ['global', 'shop', 'user'], default: 'global' },

  // Metadata
  is_default: { type: Boolean, default: false },
  max_users: { type: Number, default: 0 }, // 0 = unlimited

}, {
  timestamps: true,
  collection: COLLECTION_NAME
})

// Indexes
roleSchema.index({ name: 1, status: 1 })
roleSchema.index({ type: 1, status: 1 })
roleSchema.index({ scope: 1, status: 1 })

module.exports = model(DOCUMENT_NAME, roleSchema)