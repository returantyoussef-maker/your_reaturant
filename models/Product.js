const mongoose = require('mongoose');

/**
 * English English English English English English MongoDB Atlas
 * McDonald's Grade Product Schema with Multi-Images, Stock & Auto Discount
 */
const productSchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'English English English'],
        index: true 
    },
    categoryId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category', 
        required: [true, 'English English English'],
        index: true 
    },
    title: { 
        type: String, 
        required: [true, 'English English English English'],
        trim: true 
    },
    titleEn: { 
        type: String, 
        default: '',
        trim: true 
    },
    shortDescription: { 
        type: String, 
        default: '',
        trim: true 
    },
    fullDescription: { 
        type: String, 
        default: '',
        trim: true 
    },
    images: [{ 
        type: String, 
        default: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1' 
    }],
    price: { 
        type: Number, 
        required: [true, 'English English English'],
        min: [0, 'English English English English English English'] 
    },
discountPrice: { 
        type: Number, 
        default: 0,
        min: [0, 'English English English English English English English'],
        validate: {
            validator: function (val) {
                // English English English English 0 English English English English English
                if (!val || Number(val) === 0) return true;

                // English English English English English English (English English English)
                let basePrice = this.price;

                // English English English English findByIdAndUpdateEnglish English English English English English
                if (basePrice === undefined && typeof this.getUpdate === 'function') {
                    const update = this.getUpdate();
                    basePrice = update.price ?? update.$set?.price;
                }

                // English English English English English English English English English English English English English
                if (basePrice === undefined || basePrice === null) return true;

                return Number(val) <= Number(basePrice);
            },
            message: 'English English English English English English English English English English'
        }
    },
    isAvailable: { 
        type: Boolean, 
        default: true,
        index: true 
    },
    isFeatured: { 
        type: Boolean, 
        default: false // English English English English English
    },
    isDeal: { 
        type: Boolean, 
        default: false // English English English English English
    },
    isTopSeller: { 
        type: Boolean, 
        default: false // English English English
    },
    isNewArrival: { 
        type: Boolean, 
        default: false // English English English
    },
    stockQuantity: { 
        type: Number, 
        default: 100, // English English English
        min: [0, 'English English English English English'] 
    },
    maxOrderLimit: { 
        type: Number, 
        default: 10, // English English English English
        min: [1, 'English English English English English English English English'] 
    },
    keywords: [{ 
        type: String, 
        trim: true 
    }],
    sizes: [{
        name: { type: String, required: true, trim: true },
        price: { type: Number, required: true, min: 0 }
    }],
    addons: [{
        name: { type: String, required: true, trim: true },
        price: { type: Number, default: 0, min: 0 },
        image: { type: String, default: '' },
        isHidden: { type: Boolean, default: false } // English English English
    }],
    salesCount: { 
        type: Number, 
        default: 0,
        min: 0,
        index: true 
    },
    rating: { 
        type: Number, 
        default: 5.0,
        min: 1,
        max: 5,
        index: true 
    },
    ratingsCount: { 
        type: Number, 
        default: 1,
        min: 0 
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ⚡ English English English English English English English
productSchema.virtual('discountPercentage').get(function () {
    if (this.discountPrice > 0 && this.discountPrice < this.price) {
        return Math.round(((this.price - this.discountPrice) / this.price) * 100);
    }
    return 0;
});

// ⚡ English English English English English English English English English English
productSchema.index(
    { 
        title: 'text', 
        keywords: 'text', 
        shortDescription: 'text', 
        fullDescription: 'text' 
    },
    {
        weights: {
            title: 10,
            keywords: 5,
            shortDescription: 2,
            fullDescription: 1
        },
        default_language: 'none',
        name: 'ProductTextSearchIndex'
    }
);

//  English English English English English English
productSchema.index({ restaurantId: 1, isAvailable: 1, createdAt: -1 });
productSchema.index({ restaurantId: 1, categoryId: 1, isAvailable: 1, createdAt: -1 });
productSchema.index({ restaurantId: 1, isAvailable: 1, salesCount: -1 });
productSchema.index({ restaurantId: 1, categoryId: 1, isAvailable: 1, salesCount: -1 });
productSchema.index({ restaurantId: 1, isAvailable: 1, rating: -1 });
productSchema.index({ restaurantId: 1, categoryId: 1, isAvailable: 1, rating: -1 });
productSchema.index({ restaurantId: 1, isAvailable: 1, price: 1 });
productSchema.index({ restaurantId: 1, categoryId: 1, isAvailable: 1, price: 1 });
productSchema.index({ restaurantId: 1, isDeal: 1, isAvailable: 1 });
productSchema.index({ restaurantId: 1, isFeatured: 1, isAvailable: 1 });

module.exports = mongoose.model('Product', productSchema);
