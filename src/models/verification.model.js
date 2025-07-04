'use strict'

const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'Verification'
const COLLECTION_NAME = 'Verifications'

const verificationSchema = new Schema({
    // Target reference
    target_id: { type: Schema.Types.ObjectId, required: true, index: true },
    target_type: { type: String, enum: ['user', 'shop'], required: true },

    // Verification type
    verification_type: {
        type: String,
        enum: ['email', 'phone', 'identity', 'business_license', 'tax_id', 'bank_account'],
        required: true
    },

    // Verification data
    verification_value: { type: String, required: true }, // email, phone, license number
    verification_token: { type: String, select: false },
    verification_code: { type: String, select: false },

    // Status
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected', 'expired'],
        default: 'pending',
        index: true
    },

    // Verification details
    verified_at: { type: Date },
    verified_by: { type: Schema.Types.ObjectId, ref: 'User' }, // admin who verified
    expires_at: { type: Date },

    // Rejection/failure info
    rejection_reason: { type: String },
    attempts: { type: Number, default: 0 },
    max_attempts: { type: Number, default: 3 },

    // Documents (for business verification)
    documents: [{
        type: { type: String }, // 'license', 'tax_certificate', 'id_card'
        url: { type: String },
        uploaded_at: { type: Date, default: Date.now }
    }],

    // Metadata
    verification_method: { type: String, enum: ['automatic', 'manual'], default: 'automatic' },
    notes: { type: String, default: '' },

}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

// Indexes
verificationSchema.index({ target_id: 1, target_type: 1, verification_type: 1 })
verificationSchema.index({ status: 1, verification_type: 1 })
verificationSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 })

// Compound unique index để tránh duplicate verification
verificationSchema.index({
    target_id: 1,
    target_type: 1,
    verification_type: 1,
    status: 1
}, {
    unique: true,
    partialFilterExpression: { status: { $in: ['pending', 'verified'] } }
})

module.exports = model(DOCUMENT_NAME, verificationSchema)