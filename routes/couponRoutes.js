const express = require('express');
const router = express.Router();
const createLimiter = require('../middleware/conditionalRateLimit');

const {
    applyCoupon,
    getCoupons,
    createCoupon,
    updateCoupon,
    deleteCoupon
} = require('../controllers/couponController');

const { protect, superAdminOnly, staffOrAdminOnly } = require('../middleware/authMiddleware');

/**
 * 🔒 English English English English English English English English English
 * ⚡ English English English English NODE_ENV=production
 */
const couponLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 English
    max: 10, // English English 10 English English English English 15 English English IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, message: 'English English English English English English English English English.' }
});

// ==============================================================================
// 1. English English English (English English English English English Rate Limiting English English)
// ==============================================================================
router.post('/apply', couponLimiter, applyCoupon);

// ==============================================================================
// 2. English English English English English English English
// ==============================================================================
// English English English English English (English English English English)
router.get('/', protect, staffOrAdminOnly, getCoupons);
router.post('/', protect, staffOrAdminOnly, createCoupon);
router.put('/:id', protect, staffOrAdminOnly, updateCoupon);

// English English English (English English English English English SuperAdmin Only)
router.delete('/:id', protect, superAdminOnly, deleteCoupon);

module.exports = router;
