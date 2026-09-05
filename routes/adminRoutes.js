const express = require('express');
const router = express.Router();
const {
    getAdminStats,
    getAllOrders,
    getSalesReport
} = require('../controllers/adminController');

const { protect, superAdminOnly, staffOrAdminOnly } = require('../middleware/authMiddleware');

/**
 * ==============================================================================
 * English English English English (Admin & Management Routes)
 * ==============================================================================
 * 🔒 English English:
 * - English English English English English protect English English English English English.
 * - English English English English English English English English (role: 'user') English English English.
 * - English (superadmin, admin, staff) English English English English.
 */

// 1. English English English English English English English MongoDB
// ⚡ English English :restaurantId? English English English 404 English English English English English
router.get('/stats/:restaurantId?', protect, staffOrAdminOnly, getAdminStats);
router.get('/orders/:restaurantId?', protect, staffOrAdminOnly, getAllOrders);

// 2. English English English English English English English English English English English (SuperAdmin Only)
router.get('/reports/sales', protect, superAdminOnly, getSalesReport);

module.exports = router;
