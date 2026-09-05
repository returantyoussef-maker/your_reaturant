const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * English English English English English English English English
 */
const protect = async (req, res, next) => {
    let token = null;

    // ⚡ English English English English English
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        return res.status(401).json({ 
            success: false, 
            message: '🚫 English English English! English English English English English English English.' 
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ORA_SECRET_KEY_2026');
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: '🚫 English English English English English.' 
            });
        }

        if (user.isBanned) {
            return res.status(403).json({ 
                success: false, 
                message: '❌ English English English English English English.' 
            });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ 
            success: false, 
            message: '🚫 English English English English English English English English.' 
        });
    }
};

const superAdminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'superadmin' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: '🚫 English! English English English English English English English English (SuperAdmin).' 
        });
    }
};

const staffOrAdminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'superadmin' || req.user.role === 'staff' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: '🚫 English! English English English English English English English English English.' 
        });
    }
};

module.exports = { 
    protect, 
    superAdminOnly, 
    staffOrAdminOnly,
    adminOnly: staffOrAdminOnly 
};
