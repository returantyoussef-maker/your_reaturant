const mongoose = require('mongoose');

/**
 * English English English English English English English English MongoDB Atlas
 * McDonald's Grade Coupon Schema with Per-User Usage Limits
 */
const couponSchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'English English English'],
        index: true 
    },
    code: { 
        type: String, 
        required: [true, 'English English English'],
        uppercase: true,
        trim: true 
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed'],
        default: 'percentage' // English English (%) English English English (English.English)
    },
    discountPercentage: { 
        type: Number, 
        default: 0,
        min: [0, 'English English English English English 0%'],
        max: [100, 'English English English English 100%']
    },
    discountAmount: {
        type: Number,
        default: 0,
        min: [0, 'English English English English English English English'] // English English English English
    },
    maxDiscountAmount: { 
        type: Number, 
        default: 0 // English English English English English
    },
    minOrderAmount: { 
        type: Number, 
        default: 0 // English English English English English English
    },
    startDate: {
        type: Date,
        default: Date.now // English English English English
    },
    expirationDate: { 
        type: Date, 
        required: [true, 'English English English English'],
        validate: {
            validator: function (value) {
                return !this.startDate || value >= this.startDate;
            },
            message: 'English English English English English English English English English English'
        }
    },
    usageLimit: { 
        type: Number, 
        default: 100 // English English English English English English English
    },
    usageLimitPerUser: { 
        type: Number, 
        default: 1 // English English English English English English English
    },
    usedCount: { 
        type: Number, 
        default: 0 
    },
    usedByUsers: [{
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        phone: { type: String, trim: true },
        usedAt: { type: Date, default: Date.now }
    }],
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

// ⚡ English English English English English English English MongoDB Atlas
couponSchema.index({ restaurantId: 1, code: 1 }, { unique: true });

// ⚡ English English English English English English English English English English
couponSchema.index({ restaurantId: 1, isActive: 1, expirationDate: 1 });

// ⚡ English English English English English English English
couponSchema.index({ 'usedByUsers.phone': 1 });
couponSchema.index({ 'usedByUsers.userId': 1 });

module.exports = mongoose.model('Coupon', couponSchema);
