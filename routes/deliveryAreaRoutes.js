const express = require('express');
const router = express.Router();
const {
    getDeliveryAreas,
    createDeliveryArea,
    updateDeliveryArea,
    deleteDeliveryArea
} = require('../controllers/deliveryAreaController');

const { protect, superAdminOnly, staffOrAdminOnly } = require('../middleware/authMiddleware');

/**
 * ==============================================================================
 * English English English English (Delivery Areas Routes)
 * ==============================================================================
 */

// 1. English English English English English (English English English English English English)
router.get('/', getDeliveryAreas);

// 2. English English English English English (English English English English English English English)
router.post('/', protect, staffOrAdminOnly, createDeliveryArea);
router.put('/:id', protect, staffOrAdminOnly, updateDeliveryArea);

// 3. English English English English (English English English English English SuperAdmin Only)
router.delete('/:id', protect, superAdminOnly, deleteDeliveryArea);

module.exports = router;
