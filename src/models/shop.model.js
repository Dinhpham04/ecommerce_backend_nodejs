'use strict'

const { model, Schema } = require('mongoose')
const slugify = require('slugify')

const DOCUMENT_NAME = 'Shop'
const COLLECTION_NAME = 'Shops'

const addressSchema = new Schema({
    label: { type: String, default: '' },
    full_address: { type: String, default: '' },
    street: { type: String, default: '' },
    ward: { type: String, default: '' },
    district: { type: String, default: '' },
    city: { type: String, default: '' },
    country: { type: String, default: 'Vietnam' },
    postal_code: { type: String, default: '' },
    coordinates: {
        lat: { type: Number, default: 0 },
        lng: { type: Number, default: 0 }
    },
    is_pickup_address: { type: Boolean, default: false },
    is_return_address: { type: Boolean, default: false }
}, { _id: false })

const businessHoursSchema = new Schema({
    day: { type: String, enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'] },
    open_time: { type: String, default: '09:00' }, // HH:mm format
    close_time: { type: String, default: '18:00' },
    is_closed: { type: Boolean, default: false }
}, { _id: false })

const socialMediaSchema = new Schema({
    platform: { type: String, enum: ['facebook', 'instagram', 'youtube', 'tiktok', 'website'] },
    url: { type: String, required: true }
}, { _id: false })

const ShopSchema = new Schema({
    // Basic Info
    shop_id: { type: String, unique: true, sparse: true }, // Business ID
    name: { type: String, required: true, trim: true, maxLength: 150 },
    slug: { type: String, unique: true, index: true },
    description: { type: String, default: '', maxLength: 1000 },

    // Owner
    owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // Contact Info
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, default: '', trim: true },
    website: { type: String, default: '' },
    social_media: { type: [socialMediaSchema], default: [] },

    // Business Info
    business_type: { type: String, enum: ['individual', 'company', 'enterprise'], default: 'individual' },
    tax_id: { type: String, default: '', trim: true }, // mã số thuế
    business_license: { type: String, default: '' }, // giấy phép kinh doanh

    // Address
    addresses: { type: [addressSchema], default: [] },
    pickup_address_index: { type: Number, default: 0 },
    return_address_index: { type: Number, default: 0 },

    // Media
    logo: { type: String, default: '' },
    cover: { type: String, default: '' },
    banner: { type: String, default: '' },
    gallery: { type: [String], default: [] },

    // Ratings & Stats
    rating: {
        average: { type: Number, default: 0, min: 0, max: 5 },
        count: { type: Number, default: 0 },
        breakdown: {
            five_star: { type: Number, default: 0 },
            four_star: { type: Number, default: 0 },
            three_star: { type: Number, default: 0 },
            two_star: { type: Number, default: 0 },
            one_star: { type: Number, default: 0 }
        }
    },

    // Social Stats
    followers_count: { type: Number, default: 0 },
    total_products: { type: Number, default: 0 },
    total_orders: { type: Number, default: 0 },
    total_sales: { type: Number, default: 0 },

    // Business Hours
    business_hours: { type: [businessHoursSchema], default: [] },
    is_always_open: { type: Boolean, default: true },

    // Policies
    return_policy: { type: String, default: '' },
    shipping_policy: { type: String, default: '' },
    warranty_policy: { type: String, default: '' },

    // Categories
    main_categories: { type: [Schema.Types.ObjectId], ref: 'Category', default: [] },

    // Verification & Status


    status: {
        type: String,
        enum: ['pending', 'active', 'inactive', 'suspended', 'banned'],
        default: 'pending',
        index: true
    },

    // Features
    features: {
        chat_support: { type: Boolean, default: true },
        warranty_support: { type: Boolean, default: false },
        installation_service: { type: Boolean, default: false },
        cod_available: { type: Boolean, default: true }, // cash on delivery
        return_accepted: { type: Boolean, default: true }
    },

    // Subscription
    subscription_plan: { type: String, enum: ['free', 'basic', 'premium', 'enterprise'], default: 'free' },
    subscription_expires: { type: Date },

    // Tracking
    last_active: { type: Date, default: Date.now },
    response_rate: { type: Number, default: 0, min: 0, max: 100 }, // % response rate
    response_time: { type: Number, default: 0 }, // hours

    // Soft delete
    is_deleted: { type: Boolean, default: false, select: false },
    deleted_at: { type: Date, select: false },

}, {
    timestamps: true,
    collection: COLLECTION_NAME
})

// Indexes
ShopSchema.index({ owner_id: 1, status: 1 })
ShopSchema.index({ name: 'text', description: 'text' })
ShopSchema.index({ 'rating.average': -1, status: 1 })
ShopSchema.index({ status: 1, is_verified: 1 })
ShopSchema.index({ main_categories: 1, status: 1 })

// Auto generate slug
ShopSchema.pre('save', function (next) {
    if (this.isModified('name') && !this.slug) {
        this.slug = slugify(this.name, { lower: true, locale: 'vi' })
    }
    next()
})

// Virtual for display address
ShopSchema.virtual('display_address').get(function () {
    if (this.addresses && this.addresses.length > 0) {
        const address = this.addresses[this.pickup_address_index] || this.addresses[0]
        return address.full_address || `${address.street}, ${address.ward}, ${address.district}, ${address.city}`
    }
    return ''
})

// Virtual to get verification status
ShopSchema.virtual('verification_status').get(async function () {
    const Verification = require('./verification.model')
    return await Verification.find({
        target_id: this._id,
        target_type: 'shop',
        status: 'verified'
    })
})
module.exports = model(DOCUMENT_NAME, ShopSchema)