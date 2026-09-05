const mongoose = require('mongoose');

/**
 * English English English English English English MongoDB Atlas
 * Enterprise Delivery Zone & Pricing Schema
 */
const deliveryAreaSchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'English English English'],
        index: true 
    },
    areaName: { 
        type: String, 
        required: [true, 'English English English English'],
        trim: true 
    },
    deliveryFee: { 
        type: Number, 
        required: [true, 'English English English'],
        min: [0, 'English English English English English English English'] 
    },
    minOrderAmount: { 
        type: Number, 
        default: 0,
        min: [0, 'English English English English English English English English English'] // English English English English English English English English
    },
    estimatedTimeMinutes: { 
        type: Number, 
        default: 30,
        min: [1, 'English English English English English English English English English English'] // English English English English
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true 
});

// ⚡ English English English English English English English English MongoDB Atlas
deliveryAreaSchema.index({ restaurantId: 1, areaName: 1 }, { unique: true });

// ⚡ English English English English English English English English 0ms English In-Memory Sort
deliveryAreaSchema.index({ restaurantId: 1, isActive: 1, areaName: 1 });

module.exports = mongoose.model('DeliveryArea', deliveryAreaSchema);
