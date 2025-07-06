'use strict'

const { Schema, model } = require('mongoose');

const DOCUMENT_NAME = 'KeyToken'
const COLLECTION_NAME = 'KeyTokens'

// Enhanced KeyToken schema for complete JWT authentication
const keyTokenSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User', // Support both User and Shop
        index: true
    },
    target_type: {
        type: String,
        enum: ['user', 'shop'],
        default: 'user',
        required: true
    },
    publicKey: {
        type: String,
        required: true,
    },
    privateKey: {
        type: String,
        required: true,
        select: false // Don't return in queries by default
    },
    // Current active refresh token
    refreshToken: {
        type: String,
        required: true,
        select: false
    },
    // Array of used refresh tokens (for detection of refresh token reuse)
    refreshTokensUsed: {
        type: [String],
        default: [],
        select: false
    },
    // Device/session information
    device_info: {
        user_agent: String,
        ip_address: String,
        device_id: String,
        device_name: String
    },
    // Security features
    last_used_at: {
        type: Date,
        default: Date.now
    },
    expires_at: {
        type: Date,
        required: true,
    },
    is_active: {
        type: Boolean,
        default: true,
        index: true
    },
    // Security flags
    is_suspicious: {
        type: Boolean,
        default: false
    },
    login_attempts: {
        type: Number,
        default: 0
    },
    // Metadata
    // Metadata
    created_by_ip: String,
    notes: String
}, {
    timestamps: true,
    collection: COLLECTION_NAME
});

// Indexes for better performance
keyTokenSchema.index({ user: 1, target_type: 1 });
keyTokenSchema.index({ expires_at: 1 }, { expireAfterSeconds: 0 });
keyTokenSchema.index({ is_active: 1, last_used_at: -1 });
keyTokenSchema.index({ refreshToken: 1 }, { sparse: true });

// Methods
keyTokenSchema.methods.updateLastUsed = function () {
    this.last_used_at = new Date();
    return this.save();
};

keyTokenSchema.methods.markSuspicious = function (reason) {
    this.is_suspicious = true;
    this.notes = reason;
    return this.save();
};

keyTokenSchema.methods.deactivate = function () {
    this.is_active = false;
    return this.save();
};

// Static methods
keyTokenSchema.statics.findActiveByUser = function (userId, targetType = 'user') {
    return this.findOne({
        user: userId,
        target_type: targetType,
        is_active: true,
        expires_at: { $gt: new Date() }
    });
};

keyTokenSchema.statics.deactivateAllForUser = function (userId, targetType = 'user') {
    return this.updateMany(
        { user: userId, target_type: targetType },
        { is_active: false }
    );
};

//Export the model
module.exports = model(DOCUMENT_NAME, keyTokenSchema);