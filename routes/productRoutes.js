const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
} = require('../controllers/productController');

const { protect, superAdminOnly, staffOrAdminOnly } = require('../middleware/authMiddleware');

/**
 * ==============================================================================
 * English English English (Products & Menu Routes)
 * ==============================================================================
 */

// 1. English English English English English English (Pagination)
// ⚡ English English English English: English English English English English English English
router.get('/', getProducts);

// English English English English English ID
router.get('/:id', getProductById);

// 2. English English English English English English English (Staff & Admin)
router.post('/', protect, staffOrAdminOnly, createProduct);
router.put('/:id', protect, staffOrAdminOnly, updateProduct);

// 3. English English English English English English English (English English English English English SuperAdmin)
router.delete('/:id', protect, superAdminOnly, deleteProduct);

module.exports = router;
