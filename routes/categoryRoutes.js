const express = require('express');
const router = express.Router();
const {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controllers/categoryController');

const { protect, superAdminOnly, staffOrAdminOnly } = require('../middleware/authMiddleware');

/**
 * ==============================================================================
 * English English English English (Categories Routes)
 * ==============================================================================
 */

// 1. English English English English English English (English English English English)
// ⚡ English English English English English English English English English English English English English Lean Queries
router.get('/', getCategories);
router.get('/:id', getCategoryById);

// 2. English English English English (English English English English English English English)
router.post('/', protect, staffOrAdminOnly, createCategory);
router.put('/:id', protect, staffOrAdminOnly, updateCategory);

// 3. English English English (English English English English English SuperAdmin English English English)
router.delete('/:id', protect, superAdminOnly, deleteCategory);

module.exports = router;
