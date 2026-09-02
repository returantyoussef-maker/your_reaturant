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

// حماية ضد نشر التقييمات السبام بكثرة
// ⚡ يعمل فعلياً فقط لو NODE_ENV=production
const reviewLimiter = createLimiter({
    windowMs: 60 * 60 * 1000, // ساعة واحدة
    max: 5, // حد أقصى 5 تقييمات في الساعة لكل IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, message: 'تجاوزت الحد المسموح لكتابة التقييمات، يرجى المحاولة لاحقاً.' }
});

// 1. مسارات العملاء
router.post('/', protect, reviewLimiter, createReview);
router.get('/product/:productId', getProductReviews);

// 2. مسارات الأدمن والموظفين
router.get('/admin/all', protect, staffOrAdminOnly, getAllReviewsAdmin);
router.put('/:id/toggle-approval', protect, staffOrAdminOnly, toggleReviewApproval);

// 3. الحذف النهائي (للمالك SuperAdmin فقط)
router.delete('/:id', protect, superAdminOnly, deleteReview);

module.exports = router;