'use strict'

const { lowerCase } = require('lodash')
const { model, Schema } = require('mongoose')

const DOCUMENT_NAME = 'User'
const COLLECTION_NAME = 'Users'

// Declare the Schema of the Mongo model

const addressSchema = new Schema({
    label: { type: String, default: '' }, // tên địa chỉ, ví dụ: "Nhà riêng", "Công ty"
    full_address: { type: String, default: '' },
    street: { type: String, default: '' }, // số nhà, tên đường
    ward: { type: String, default: '' }, // phường/xã
    district: { type: String, default: '' }, // quận/huyện
    city: { type: String, default: '' }, // thành phố
    country: { type: String, default: 'VietNam' },
    postal_code: { type: String, default: '' },
    coordinates: {
        lat: { type: Number, default: 0 }, // vĩ độ
        lng: { type: Number, default: 0 } // kinh độ
    },
    is_default: { type: Boolean, default: false } // địa chỉ mặc định
}, { _id: false })

const userSchema = new Schema({
    user_id: { type: String, unique: true, sparse: true }, // Business ID,
    user_name: { type: String, unique: true, sparse: true, trim: true }, // username for login
    full_name: { type: String, default: '', trim: true },
    first_name: { type: String, default: '', trim: true },
    last_name: { type: String, default: '', trim: true },

    // contact info
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },

    // Authentication
    password: { type: String, required: true, select: false }, // hide by default
    email_verified_at: { type: Date }, // timestamp when email was verified
    last_login: { type: Date },
    login_attempts: { type: Number, default: 0 }, // số lần đăng nhập không thành công
    locked_until: { type: Date }, // thời gian khóa tài khoản nếu đăng nhập không thành công quá nhiều lần

    // Personal information
    gender: { type: String, enum: ['male', 'female', 'other', 'prefer_not_to_say'], default: 'prefer_not_to_say' },
    date_of_birth: { type: Date },
    avatar: { type: String, default: '' },

    // Address - multiple addresses support
    addresses: { type: [addressSchema], default: [] },
    default_address: { type: Number, default: 0 }, // index of the default address in the addresses array

    // Preferences: 
    language: { type: String, default: 'vi' },
    currency: { type: String, default: 'VND' }, // default currency
    timezone: { type: String, default: 'Asia/Ho_Chi_Minh' }, // default timezone

    // Marketing
    newsletter_subscribed: { type: Boolean, default: false }, // đăng ký nhận bản tin
    sms_notifications: { type: Boolean, default: true }, // nhận thông báo qua SMS
    email_notifications: { type: Boolean, default: true }, // nhận thông báo qua email

    // System
    role: { type: String, enum: ['customer', 'seller', 'admin', 'moderator'], default: 'customer' }, // role of the user
    permissions: { type: Schema.Types.ObjectId, ref: 'UserRole' },
    status: { type: String, enum: ['pending', 'active', 'blocked', 'suspended'], default: 'pending', index: true },
    reset_password_token: { type: String, select: false }, // token for password reset
    reset_password_expires: { type: Date, select: false }, // expiration time for password reset token

    // Stats
    total_orders: { type: Number, default: 0 },
    total_spent: { type: Number, default: 0 }, // tổng số tiền đã chi tiêu
    loyalty_points: { type: Number, default: 0 }, // điểm thưởng của người dùng

    // Tracking
    referral_code: { type: String }, // mã giới thiệu của người dùng
    referral_by: { type: Schema.Types.ObjectId, ref: 'User' }, // người giới thiệu, nếu có
    registration_source: { type: String, default: 'direct' },
    last_active: { type: Date, default: Date.now },

    // Soft delete
    is_deleted: { type: Boolean, default: false, select: false },
    deleted_at: { type: Date, select: false },

}, {
    collection: COLLECTION_NAME,
    timestamps: true,
    // timestamps: {
    //     createdAt: 'createdAt',
    //     updatedAt: 'modifiedAt'
    // }
})

// Indexes
userSchema.index({ email: 1, status: 1 })
userSchema.index({ phone: 1 }, { sparse: true })
userSchema.index({ referral_code: 1 }, { unique: true, sparse: true })
userSchema.index({ role: 1, status: 1 })
userSchema.index({ last_active: 1 })

// virtuals for full name
userSchema.virtual('display_name').get(function () {
    return this.full_name || `${this.first_name} ${this.last_name}`.trim() || this.user_name || this.email
})

// Virtual to get verification status
userSchema.virtual('verification_status').get(async function () {
    const Verification = require('./verification.model')
    return await Verification.find({
        target_id: this._id,
        target_type: 'user',
        status: 'verified'
    })
})

// Instance method to check if account is locked
userSchema.methods.isLocked = function () {
    return !!(this.locked_until && this.locked_until > Date.now())
}

module.exports = model(DOCUMENT_NAME, userSchema)