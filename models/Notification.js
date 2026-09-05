const mongoose = require('mongoose');

/**
 * English English English English English English English MongoDB Atlas
 * Enterprise Real-Time Notification & Low-Stock Sound Alert Schema
 */
const notificationSchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'English English English'],
        index: true 
    },
    title: { 
        type: String, 
        required: [true, 'English English English'],
        trim: true 
    },
    message: { 
        type: String, 
        required: [true, 'English English English'],
        trim: true 
    },
    type: { 
        type: String, 
        enum: ['NEW_ORDER', 'CANCELLED_ORDER', 'LOW_STOCK', 'COUPON_EXPIRED', 'SYSTEM'], 
        required: true,
        index: true 
    },
    relatedId: { 
        type: String, 
        default: '' // English English English English English English English English
    },
    relatedModel: {
        type: String,
        enum: ['Order', 'Product', 'Coupon', 'Restaurant', 'System'],
        default: 'System' // English English English English English English English English
    },
    isRead: { 
        type: Boolean, 
        default: false,
        index: true
    },
    soundAlert: { 
        type: Boolean, 
        default: true // English English English English English English English
    }
}, { 
    timestamps: true 
});

// ⚡ English English English English English English English English English English English
notificationSchema.index({ restaurantId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ restaurantId: 1, createdAt: -1 });

// ⚡ English English English English English English English 60 English English English MongoDB Atlas
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 24 * 60 * 60 });

module.exports = mongoose.model('Notification', notificationSchema);
