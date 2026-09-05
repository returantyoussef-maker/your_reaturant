const mongoose = require('mongoose');

/**
 * English English English English English English English MongoDB Atlas
 * Enterprise Security & Action Audit Log Schema
 */
const auditLogSchema = new mongoose.Schema({
    restaurantId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Restaurant',
        index: true,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        index: true
    },
    adminName: { 
        type: String, 
        required: [true, 'English English English'],
        trim: true 
    },
    adminEmail: { 
        type: String, 
        required: [true, 'English English English English'],
        trim: true,
        lowercase: true
    },
    action: { 
        type: String, 
        required: [true, 'English English English'], // English: LOGIN_SUCCESS, BAN_USER, PROMOTE_STAFF, DELETE_PRODUCT
        trim: true,
        index: true
    },
    status: { 
        type: String, 
        enum: ['SUCCESS', 'FAILED', 'WARNING'], 
        default: 'SUCCESS',
        index: true
    },
    ipAddress: { 
        type: String, 
        default: '127.0.0.1',
        trim: true
    },
    userAgent: { 
        type: String, 
        default: '',
        trim: true 
    },
    details: { 
        type: String, 
        default: '',
        trim: true 
    }
}, { 
    timestamps: true 
});

// ⚡ English English English English English English English English English English English 0ms
auditLogSchema.index({ restaurantId: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });
auditLogSchema.index({ adminEmail: 1, createdAt: -1 });

// ⚡ English English English English English English 180 English English English MongoDB Atlas
auditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 180 * 24 * 60 * 60 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
