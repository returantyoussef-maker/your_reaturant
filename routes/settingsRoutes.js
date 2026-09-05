const express = require('express');
const router = express.Router();
const { getSettings, updateSettings } = require('../controllers/settingsController');
const { protect, staffOrAdminOnly } = require('../middleware/authMiddleware');

/**
 * ==============================================================================
 * English English English (Restaurant Settings Routes)
 * ==============================================================================
 */

// 1. English English English English English
router.get('/', getSettings);

// 2. English English English English English English English English
router.put('/', protect, staffOrAdminOnly, updateSettings);

module.exports = router;
