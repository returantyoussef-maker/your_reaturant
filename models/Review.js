const mongoose = require('mongoose');

/**
 * English English English English English English English MongoDB Atlas
 */
const reviewSchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'English English English'],
        index: true 
    },
    productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: [true, 'English English English'],
        index: true 
    },
    orderId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Order',
        default: null 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: [true, 'English English English'] 
    },
    userName: { 
        type: String, 
        required: [true, 'English English English'],
        trim: true 
    },
    foodRating: { 
        type: Number, 
        required: [true, 'English English English'],
        min: [1, 'English English English English 1'],
        max: [5, 'English English English 5'] 
    },
    deliverySpeedRating: { 
        type: Number, 
        default: 5,
        min: 1,
        max: 5
    },
    serviceRating: { 
        type: Number, 
        default: 5,
        min: 1,
        max: 5
    },
    comment: { 
        type: String, 
        default: '',
        trim: true
    },
    images: [{ 
        type: String
    }],
    isApproved: { 
        type: Boolean, 
        default: true
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// English English English English English English
reviewSchema.virtual('overallRating').get(function () {
    return Number(((this.foodRating + this.deliverySpeedRating + this.serviceRating) / 3).toFixed(1));
});

// English English English English APIs
reviewSchema.index({ productId: 1, isApproved: 1, createdAt: -1 });

module.exports = mongoose.model('Review', reviewSchema);
