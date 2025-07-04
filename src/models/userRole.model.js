'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'UserRole'
const COLLECTION_NAME = 'UserRoles'

const userRoleSchema = new Schema({
    user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role_id: { type: Schema.Types.ObjectId, ref: 'Role', required: true },

    // Scope context
    scope_type: { type: String, enum: ['global', 'shop'], default: 'global' },
    scope_id: { type: Schema.Types.ObjectId }, // shop_id if scope_type = 'shop'

    // Assignment info
    assigned_by: { type: Schema.Types.ObjectId, ref: 'User' },
    assigned_at: { type: Date, default: Date.now },

    // Expiration
    expires_at: { type: Date },

    // Status
    status: { type: String, enum: ['active', 'inactive', 'expired'], default: 'active' },

    // Additional permissions (override role permissions)
    additional_grants: [{
        resource: { type: Schema.Types.ObjectId, ref: 'Resource' },
        actions: [String],
        attributes: String
    }],

    // Restricted permissions (remove from role permissions)
    restricted_grants: [{
        resource: { type: Schema.Types.ObjectId, ref: 'Resource' },
        actions: [String],
        attributes: String
    }],

}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

// Indexes
userRoleSchema.index({ user_id: 1, status: 1 })
userRoleSchema.index({ role_id: 1, status: 1 })
userRoleSchema.index({ user_id: 1, scope_type: 1, scope_id: 1 })
userRoleSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })

// Ensure unique role per user per scope
userRoleSchema.index({
    user_id: 1,
    role_id: 1,
    scope_type: 1,
    scope_id: 1
}, { unique: true })

module.exports = model(DOCUMENT_NAME, userRoleSchema)