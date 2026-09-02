const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, staffOrAdminOnly } = require('../middleware/authMiddleware');

/**
 * ==============================================================================
 * مسارات إعدادات المطعم (Restaurant Settings Routes)
 * ==============================================================================
 */

// 1. جلب إعدادات المطعم، الألوان، والنصوص
router.get('/', getSettings);

// 2. حفظ وتحديث إعدادات المطعم العامة وساعات العمل والهوية
router.put('/', protect, staffOrAdminOnly, updateSettings);

module.exports = router;