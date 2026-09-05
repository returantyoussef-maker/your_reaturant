const express = require('express');
const router = express.Router();
const createLimiter = require('../middleware/conditionalRateLimit');

const {
    createReview,
    getProductReviews,
    getAllReviewsAdmin,
    toggleReviewApproval,
    deleteReview
} = require('../controllers/reviewController');

const { protect, superAdminOnly, staffOrAdminOnly } = require('../middleware/authMiddleware');

// English English English English English English
// ⚡ English English English English NODE_ENV=production
const reviewLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // English English
    max: 5, // English English 5 English English English English IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, message: 'English English English English English English English English.' }
});

// 1. English English
router.post('/', protect, reviewLimiter, createReview);
router.get('/product/:productId', getProductReviews);

// 2. English English English
router.get('/admin/all', protect, staffOrAdminOnly, getAllReviewsAdmin);
router.put('/:id/toggle-approval', protect, staffOrAdminOnly, toggleReviewApproval);

// 3. English English (English SuperAdmin English)
router.delete('/:id', protect, superAdminOnly, deleteReview);

module.exports = router;
