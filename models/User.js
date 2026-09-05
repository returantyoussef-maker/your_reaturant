const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * English English English English English English English MongoDB Atlas
 * McDonald's Grade User Schema with Analytics & Recently Viewed Products
 */
const userSchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'English English English'] 
    },
    avatar: { 
        type: String, 
        default: 'default-avatar.png' // English English English
    },
    name: { 
        type: String, 
        required: [true, 'English English English'],
        trim: true 
    },
    email: { 
        type: String, 
        required: [true, 'English English English'],
        unique: true,
        lowercase: true,
        trim: true,
        index: true
    },
    phone: { 
        type: String, 
        required: [true, 'English English English'],
        trim: true,
        index: true
    },
    password: { 
        type: String, 
        required: [true, 'English English English'],
        minlength: [6, 'English English English English English English English 6 English']
    },
    role: { 
        type: String, 
        enum: ['customer', 'staff', 'superadmin'], 
        default: 'customer',
        index: true 
    },
    isBanned: { 
        type: Boolean, 
        default: false 
    },
    ordersCount: { 
        type: Number, 
        default: 0 // English English English English English English
    },
    totalSpent: { 
        type: Number, 
        default: 0 // English English English English Lifetime Value
    },
    lastOrderAt: { 
        type: Date // English English English English English
    },
    lastLoginIP: { 
        type: String, 
        default: '' 
    },
    lastLoginAt: { 
        type: Date 
    },
    addresses: [{
        title: { type: String, default: 'English English' },
        address: { type: String, required: true },
        lat: { type: Number },
        lng: { type: Number },
        isDefault: { type: Boolean, default: false }
    }],
    favorites: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' // English English English
    }],
    recentlyViewed: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product' // English English English English English English English English
    }],
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { 
    timestamps: true 
});

// English English English English English Bcrypt
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// 🔒 English English English English English English English (Unique Partial Filter Index)
// English English English English English English English English English superadmin English English English English English English (Race Conditions)
userSchema.index(
    { role: 1 }, 
    { 
        unique: true, 
        partialFilterExpression: { role: 'superadmin' },
        name: 'unique_single_superadmin_role'
    }
);

// English English English English English
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
