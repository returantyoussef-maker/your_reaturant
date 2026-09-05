const mongoose = require('mongoose');

/**
 * English English English English English English English MongoDB Atlas
 * McDonald's Grade Fast Order Schema with Dedicated Customer WhatsApp Field
 */
const orderSchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant', 
        required: [true, 'English English English'],
        index: true 
    },
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        default: null,
        index: true
    },
    orderNumber: { 
        type: String, 
        required: [true, 'English English English English'], 
        unique: true,
        uppercase: true,
        trim: true,
        index: true 
    },
    orderDate: { 
        type: Date, 
        default: Date.now 
    },
    orderTime: { 
        type: String, 
        default: '',
        trim: true
    },
    scheduledDeliveryTime: { 
        type: String, 
        default: 'English English English (ASAP)',
        trim: true 
    },
    status: { 
        type: String, 
        enum: ['New', 'Reviewed', 'Preparing', 'Ready', 'OutForDelivery', 'Delivered', 'Cancelled', 'Rejected'], 
        default: 'New',
        index: true 
    },
    orderType: {
        type: String,
        enum: ['dinein', 'takeaway', 'delivery'],
        default: 'delivery',
        index: true
    },
    customer: {
        name: { type: String, required: [true, 'English English English'], trim: true },
        phone: { type: String, required: [true, 'English English English'], trim: true },
        whatsappPhone: { type: String, default: '', trim: true }, // English English English English English
        extraPhone: { type: String, default: '', trim: true }, // English English English (English / English) English
        address: { type: String, default: '', trim: true },
        tableId: { type: mongoose.Schema.Types.ObjectId, ref: 'Table', default: null },
        tableNumber: { type: String, default: '', trim: true }, // English English English English English English English English
        notes: { type: String, default: '', trim: true },
        gpsLocation: {
            lat: { type: Number, default: 0 },
            lng: { type: Number, default: 0 },
            mapUrl: { type: String, default: '', trim: true }
        }
    },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        title: { type: String, required: true, trim: true },
        selectedSize: {
            name: { type: String, default: '' },
            price: { type: Number, default: 0 }
        },
        selectedAddons: [{
            name: { type: String },
            price: { type: Number, default: 0 }
        }],
        unitPrice: { type: Number, required: true, min: [0, 'English English English English'] },
        quantity: { type: Number, required: true, min: [1, 'English English English English 1 English English'], default: 1 },
        itemTotal: { type: Number, required: true, min: [0, 'English English English English English'] }
    }],
    subtotal: { 
        type: Number, 
        required: true,
        min: [0, 'English English English English English'] 
    },
    deliveryFee: { 
        type: Number, 
        default: 0,
        min: [0, 'English English English English English English'] 
    },
    discountAmount: { 
        type: Number, 
        default: 0,
        min: [0, 'English English English English English English'] 
    },
    couponApplied: {
        code: { type: String, default: '', uppercase: true, trim: true },
        percentage: { type: Number, default: 0 }
    },
    taxAmount: { 
        type: Number, 
        default: 0,
        min: 0 
    },
    totalPrice: { 
        type: Number, 
        required: true,
        min: [0, 'English English English English English'] 
    },
    qrCodeData: { 
        type: String, 
        default: '' 
    },
    qrCodeImage: { 
        type: String, 
        default: '' // English English QR English Base64
    },
    qrCodeSignature: { 
        type: String, 
        default: '' // English English HMAC English English
    },
    paymentMethod: { 
        type: String, 
        enum: ['COD', 'Online', 'VodafoneCash'], 
        default: 'COD' 
    },
    paymentStatus: { 
        type: String, 
        enum: ['Unpaid', 'Paid'], 
        default: 'Unpaid' 
    },
    statusTimeline: [{
        status: { type: String },
        updatedAt: { type: Date, default: Date.now },
        note: { type: String, default: '' }
    }]
}, { 
    timestamps: true 
});

// ⚡ English English English English English English English English English English English 0ms
orderSchema.index({ restaurantId: 1, createdAt: -1 });
orderSchema.index({ restaurantId: 1, status: 1, createdAt: -1 });
orderSchema.index({ userId: 1, createdAt: -1 });
orderSchema.index({ 'customer.phone': 1, createdAt: -1 });
orderSchema.index({ 'customer.whatsappPhone': 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
