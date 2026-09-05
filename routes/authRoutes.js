const express = require('express');
const router = express.Router();
const createLimiter = require('../middleware/conditionalRateLimit');

const {
    checkSuperAdminExists,
    registerSuperAdmin,
    getMe,
    loginAdmin,
    promoteToStaff,
    banUserToggle,
    deleteUser,
    getAllUsers,
    registerUser,
    loginUser,
    logoutUser
} = require('../controllers/authController');

const { protect, superAdminOnly } = require('../middleware/authMiddleware');

/**
 * 🔒 English English English English English (Brute-Force Protection)
 * English English English English English English English English English English English
 * ⚡ English English English English NODE_ENV=production
 */
const authLimiter = createLimiter({
    windowMs: 15 * 60 * 1000, // 15 English
    max: 10, // English English 10 English English English English IP English English
    standardHeaders: true,
    legacyHeaders: false,
    message: { 
        status: 429, 
        message: 'English English English English English English English. English English 15 English English English English.' 
    }
});

// ==============================================================================
// 1. English English English English English English English English English
// ==============================================================================
// English English English English (English English English English English English)
router.get('/check-superadmin/:restaurantId?', checkSuperAdminExists);

// 🔒 English English: English protect English English English English English English req.user English
router.get('/me', protect, getMe);

// ==============================================================================
// 2. English English English English English English (English English authLimiter English English)
// ==============================================================================
// English English English English English English (English English English English English English)
router.post('/register-superadmin', authLimiter, registerSuperAdmin);

// 🔒 English English English English English (English English English English English English English user English English English)
router.post('/login-admin', authLimiter, loginAdmin);

// English English English English English English English English
router.post('/register', authLimiter, registerUser);
router.post('/login', authLimiter, loginUser);

// English English
router.post('/logout', logoutUser);

// ==============================================================================
// 3. English English English English English English (SuperAdmin Only)
// ==============================================================================
// English English English English
router.get('/users/:restaurantId?', protect, superAdminOnly, getAllUsers);

// English English English English (Staff)
router.put('/promote/:userId', protect, superAdminOnly, promoteToStaff);

// English English English English English (Ban / Unban)
router.put('/ban/:userId', protect, superAdminOnly, banUserToggle);

// English English English English English English
router.delete('/users/:userId', protect, superAdminOnly, deleteUser);

module.exports = router;
