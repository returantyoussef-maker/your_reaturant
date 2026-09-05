const express = require('express');
const router = express.Router();
const createLimiter = require('../middleware/conditionalRateLimit');

const {
    createOrder,
    getOrdersByPhoneOrUser,
    getPublicOrderInvoice,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
    cancelOrder
} = require('../controllers/orderController');

const { protect, superAdminOnly, staffOrAdminOnly } = require('../middleware/authMiddleware');
const { checkWorkingHours } = require('../middleware/workingHoursMiddleware');

/**
 * 🔒 English English English English English English English English English (Spam Protection)
 * ⚡ English English English English NODE_ENV=production
 */
const orderLimiter = createLimiter({
    windowMs: 10 * 60 * 1000, // 10 English
    max: 10, // English English 10 English English English 10 English English English English IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, message: 'English English English English English English English English English English English English.' }
});

// ==============================================================================
// 1. English English English English English
// ==============================================================================
// ⚡ English English English English English English + Rate Limiter English English
router.post('/', orderLimiter, checkWorkingHours, createOrder);

// English English English English English English English
router.get('/track/:query', getOrdersByPhoneOrUser);

// English English English (English English English English QR)
router.get('/invoice/:id', getPublicOrderInvoice);

// ==============================================================================
// 2. English English English English (English English English English English English)
// ==============================================================================
// ⚡ English English English (English English English - English English :id English English Express)
router.get('/', protect, staffOrAdminOnly, getOrders);

// English English English English English
router.get('/:id', getOrderById);

// English English English (English English English English... English)
router.put('/:id/status', protect, staffOrAdminOnly, updateOrderStatus);

// English English (English English English English)
router.put('/:id/cancel', protect, cancelOrder);

// ==============================================================================
// 3. English English English English English English (English English English English SuperAdmin)
// ==============================================================================
router.delete('/:id', protect, superAdminOnly, deleteOrder);

module.exports = router;
