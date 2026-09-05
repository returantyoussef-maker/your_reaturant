const mongoose = require('mongoose');

/**
 * English English English English English English English English MongoDB Atlas
 * Enterprise Restaurant Config & Hostinger-Style Visual Live Editor Schema
 */
const restaurantSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'English English English'],
        default: 'English English English English',
        trim: true 
    },
    slug: { 
        type: String, 
        required: [true, 'English English English'],
        unique: true,
        lowercase: true,
        trim: true,
        default: 'abu-qoura',
        index: true
    },
    logo: { 
        type: String, 
        default: 'default-logo.png',
        trim: true 
    },
    coverImage: { 
        type: String, 
        default: 'default-cover.jpg',
        trim: true 
    },
    description: { 
        type: String, 
        default: 'English English English English English English',
        trim: true 
    },
    whatsappPhone: { 
        type: String, 
        required: [true, 'English English English English'],
        default: '01120751467',
        trim: true 
    },
    phone: { 
        type: String, 
        default: '01120751467',
        trim: true 
    },
    address: { 
        type: String, 
        default: 'English - English English - English',
        trim: true 
    },
    currency: { 
        type: String, 
        default: 'English.English',
        trim: true 
    },
    isAcceptingOrders: { 
        type: Boolean, 
        default: true // English English English English/English English
    },
    autoCloseOutsideWorkingHours: { 
        type: Boolean, 
        default: true // English English English English English English English
    },
    openingTime: { 
        type: String, 
        default: '10:00', // English English English English 24 English (HH:mm)
        trim: true,
        validate: {
            validator: function (v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: 'English English English English English. English English English 24 English (English: 10:00)'
        }
    },
    closingTime: { 
        type: String, 
        default: '23:59', // English English English English 24 English (HH:mm)
        trim: true,
        validate: {
            validator: function (v) {
                return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
            },
            message: 'English English English English English. English English English 24 English (English: 23:59)'
        }
    },
    workingHoursText: { 
        type: String, 
        default: 'English English 10:00 English English 12:00 English English',
        trim: true 
    },
    taxPercentage: { 
        type: Number, 
        default: 0,
        min: [0, 'English English English English English English English'],
        max: [100, 'English English English English 100%']
    },
    serviceCharge: { 
        type: Number, 
        default: 0,
        min: [0, 'English English English English English English English']
    },

    // =========================================================================
    // 🖨️ English English English English QZ Tray (Auto Thermal Printing Settings)
    // =========================================================================
    printingSettings: {
        enabled: { 
            type: Boolean, 
            default: false // English English English English English
        },
        printerName: { 
            type: String, 
            default: '', // English English English English English English QZ Tray
            trim: true 
        },
        printerType: {
            type: String,
            enum: ['thermal', 'office', 'unknown'],
            default: 'unknown'
        },
        protocol: {
            type: String,
            enum: ['escpos-raster', 'escpos-text', 'browser', 'unknown'],
            default: 'unknown'
        },
        connection: {
            type: String,
            enum: ['qz-queue'],
            default: 'qz-queue'
        },
        paperSize: { 
            type: String, 
            enum: ['80mm', '58mm'],
            default: '80mm' // English English English
        },
        copies: { 
            type: Number, 
            default: 1, // English English English English English English
            min: [1, 'English English English English English 1 English English'],
            max: [5, 'English English English English 5']
        },
        autoPrintNewOrders: { 
            type: Boolean, 
            default: true // English English English English English English English
        },
        printOnStatusChange: { 
            type: Boolean, 
            default: false // English English English English English English (English - English English)
        },
        cutPaper: { 
            type: Boolean, 
            default: true // English English English English English English
        },
        beep: { 
            type: Boolean, 
            default: true // English English English English English English
        },
        marginBottom: { 
            type: Number, 
            default: 4, // English English English English English
            min: [0, 'English English English English'],
            max: [50, 'English English 50 English']
        }
    },

    // =========================================================================
    // 🎨 English English English English English (Global Theme Palette)
    // =========================================================================
    theme: {
        primaryColor: { type: String, default: '#a82810' },       // English English (English English)
        primaryHover: { type: String, default: '#8e1f0b' },       // English English English English English
        secondaryColor: { type: String, default: '#5a4b10' },     // English English / English
        goldLight: { type: String, default: '#f7f3e8' },          // English English English English
        darkColor: { type: String, default: '#1a1816' },          // English English English
        bgColor: { type: String, default: '#fbf9f5' },            // English English English
        cardBgColor: { type: String, default: '#ffffff' },        // English English English
        textColor: { type: String, default: '#1a1816' },          // English English English
        textMutedColor: { type: String, default: '#726b65' },     // English English English English
        borderColor: { type: String, default: '#eee9e0' },        // English English English
        borderRadius: { type: String, default: '20px' },          // English English English English
        fontFamily: { type: String, default: 'Tajawal' },         // English English English
        customCss: { type: String, default: '' }                  // English CSS English English English English English
    },

    // =========================================================================
    // 📝 English English English English (Content Studio)
    // =========================================================================
    content: {
        brandName: { type: String, default: 'English English ✨' },
        brandTagline: { type: String, default: 'English English English English' },
        heroTitle: { type: String, default: 'English' },
        heroSubtitle: { type: String, default: 'English English English English English' },
        heroBtn1Text: { type: String, default: 'English English 🍱' },
        heroBtn2Text: { type: String, default: '🔥 English English' },
        heroBgImage: { type: String, default: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600' },
        dealsSectionTitle: { type: String, default: '🔥 English English English English' },
        dealsSectionSubtitle: { type: String, default: 'English English English English English English' },
        topSellersTitle: { type: String, default: '🏆 English 10 English English English English' },
        topSellersSubtitle: { type: String, default: 'English English English English English English English English English English English English English' },
        menuPageTitle: { type: String, default: 'English English English 📜' },
        menuPageSubtitle: { type: String, default: 'English English English English English English English English English' },
        announcementText: { type: String, default: '🎉 English English! English 20% English English English English English English' },
        showAnnouncement: { type: Boolean, default: false },
        footerText: { type: String, default: 'English English English © 2026 English English English - English English English' }
    },

    socialLinks: {
        facebook: { type: String, default: '', trim: true },
        instagram: { type: String, default: '', trim: true },
        tiktok: { type: String, default: '', trim: true }
    }
}, { 
    timestamps: true,
    toJSON: { flattenMaps: true },
    toObject: { flattenMaps: true }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
