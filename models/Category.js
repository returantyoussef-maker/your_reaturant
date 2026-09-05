const mongoose = require('mongoose');

/**
 * English English English English English English MongoDB Atlas
 * McDonald's Grade Category Schema with Icon, Description & Auto Products Count
 */
const categorySchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'English English English'],
        index: true 
    },
    name: { 
        type: String, 
        required: [true, 'English English English English'],
        trim: true 
    },
    nameEn: { 
        type: String, 
        default: '',
        trim: true 
    },
    slug: {
        type: String,
        lowercase: true,
        trim: true
    },
    description: { 
        type: String, 
        default: '',
        trim: true // English English (English: English English English English English English)
    },
    image: { 
        type: String, 
        default: 'default-category.png' // English English English
    },
    icon: { 
        type: String, 
        default: '🍔' // English English English
    },
    sortOrder: { 
        type: Number, 
        default: 0 // English English English English English English English
    },
    isHidden: { 
        type: Boolean, 
        default: false // English English English English English English English
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ⚡ English English (Virtual Population) English English English English English English English MongoDB
categorySchema.virtual('productsCount', {
    ref: 'Product',
    localField: '_id',
    foreignField: 'categoryId',
    count: true
});

// ⚡ English English English English English English English MongoDB Atlas
categorySchema.index({ restaurantId: 1, name: 1 }, { unique: true });

// ⚡ English English English English English ESR (Equality, Sort, Range) English English
categorySchema.index({ restaurantId: 1, isActive: 1, isHidden: 1, sortOrder: 1 });

module.exports = mongoose.model('Category', categorySchema);
