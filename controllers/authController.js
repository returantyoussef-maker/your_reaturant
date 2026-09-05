const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const AuditLog = require('../models/AuditLog');
const jwt = require('jsonwebtoken');

// English English English English English 30 English English English English
const COOKIE_OPTIONS = {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 30 * 24 * 60 * 60 * 1000 // 30 English
};

const generateToken = (id, role, restaurantId) => {
    return jwt.sign({ id, role, restaurantId }, process.env.JWT_SECRET || 'ORA_SECRET_KEY_2026', {
        expiresIn: '30d'
    });
};

const logSecurityEvent = async (restaurantId, adminName, adminEmail, action, status, req, details = '') => {
    try {
        await AuditLog.create({
            restaurantId,
            adminName: adminName || 'English',
            adminEmail: adminEmail || 'unknown@domain.com',
            action,
            status,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || '127.0.0.1',
            userAgent: req.headers['user-agent'] || '',
            details
        });
    } catch (e) {}
};

// 1. English English English English English (SuperAdmin) English MongoDB
exports.checkSuperAdminExists = async (req, res) => {
    try {
        const existingAdmin = await User.findOne({ role: 'superadmin' }).lean();

        if (existingAdmin) {
            return res.json({ 
                exists: true, 
                message: 'English English English English English.' 
            });
        } else {
            return res.json({ 
                exists: false, 
                message: 'English English English English English English. English English English English English.' 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ==============================================================================
// 2. English English English English (SuperAdmin) - English English English English
// ==============================================================================
exports.registerSuperAdmin = async (req, res) => {
    try {
        // 🔒 English English English English English English English English
        const existingAdmin = await User.findOne({ role: 'superadmin' }).lean();

        if (existingAdmin) {
            await logSecurityEvent(
                null, 
                req.body.name || 'English', 
                req.body.email || 'unknown@domain.com', 
                'UNAUTHORIZED_SUPERADMIN_REGISTER_ATTEMPT', 
                'FAILED', 
                req, 
                'English English English English English English English English English English English English'
            );

            return res.status(400).json({ 
                success: false, 
                message: '🚫 English! English English English English English English English English English English English English English English.' 
            });
        }

        // English English English English English
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'English English English English English English (English English English English English)' });
        }

        // English English English English English
        const normalizedEmail = email.trim().toLowerCase();
        const existingUserEmail = await User.findOne({ email: normalizedEmail }).lean();
        if (existingUserEmail) {
            return res.status(400).json({ success: false, message: 'English English English English English English English' });
        }

        // English English English English English
        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });

        // English English English English English
        const user = await User.create({
            restaurantId: restaurant._id,
            name: name.trim(),
            email: normalizedEmail,
            phone: phone.trim(),
            password,
            role: 'superadmin'
        });

        const token = generateToken(user._id, user.role, user.restaurantId);
        res.cookie('jwt', token, COOKIE_OPTIONS);

        await logSecurityEvent(restaurant._id, user.name, user.email, 'REGISTER_SUPERADMIN', 'SUCCESS', req, 'English English English English English English');

        res.status(201).json({
            success: true,
            message: '🎉 English English English English English English English!',
            user: { _id: user._id, name: user.name, email: user.email, role: user.role, phone: user.phone },
            token
        });
    } catch (error) {
        // 🔒 English English English English (Duplicate Key Error code 11000) English English English
        if (error.code === 11000) {
            if (error.keyPattern && error.keyPattern.role) {
                return res.status(400).json({ 
                    success: false, 
                    message: '🚫 English! English English English English English English English English English English English English English English.' 
                });
            }
            if (error.keyPattern && error.keyPattern.email) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'English English English English English English English' 
                });
            }
            return res.status(400).json({ 
                success: false, 
                message: 'English English English English English English' 
            });
        }
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. English English English English English English English English English English
// 3. English English English English English English English English English English English
exports.getMe = async (req, res) => {
    try {
        let token = null;

        // ⚡ English English English English English English English English English English English English
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        } else if (req.cookies && req.cookies.jwt) {
            token = req.cookies.jwt;
        }

        if (!token) {
            return res.status(200).json({ success: false, user: null, message: 'English English English' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ORA_SECRET_KEY_2026');
        
        // ⚡ English English English English English English English English English English English English
        const user = await User.findById(decoded.id).select('-password').lean();

        if (!user || user.isBanned) {
            return res.status(200).json({ success: false, user: null, message: 'English English English English English' });
        }

        // English English English English English English English English (staff English superadmin)
        const refreshedToken = generateToken(user._id, user.role, user.restaurantId);
        res.cookie('jwt', refreshedToken, COOKIE_OPTIONS);

        res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role,
                restaurantId: user.restaurantId
            },
            token: refreshedToken
        });
    } catch (error) {
        res.status(200).json({ success: false, user: null, message: 'English English English' });
    }
};

// 4. English English English English (SuperAdmin / Staff)
exports.loginAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                message: 'English English English English English English' 
            });
        }

        const formattedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: formattedEmail });

        // English English English English English English English English English
        if (!user || user.role === 'customer') {
            await logSecurityEvent(user ? user.restaurantId : null, user ? user.name : formattedEmail, formattedEmail, 'LOGIN_ADMIN_DENIED', 'FAILED', req, 'English English English English English English English English (English English English English)');
            return res.status(403).json({ 
                success: false, 
                message: '🚫 English English English English English English English English English!' 
            });
        }

        if (user.isBanned) {
            await logSecurityEvent(user.restaurantId, user.name, user.email, 'LOGIN_ADMIN_BANNED', 'FAILED', req, 'English English English English');
            return res.status(403).json({ 
                success: false, 
                message: '🚫 English English English English English English English English!' 
            });
        }

        const isMatch = await user.matchPassword(password);
        if (isMatch) {
            user.lastLoginIP = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
            user.lastLoginAt = new Date();
            await user.save();

            const token = generateToken(user._id, user.role, user.restaurantId);
            res.cookie('jwt', token, COOKIE_OPTIONS);

            await logSecurityEvent(user.restaurantId, user.name, user.email, 'LOGIN_SUCCESS', 'SUCCESS', req, `English English English English English English [${user.role}]`);

            res.json({
                success: true,
                message: `English English English ${user.name}!`,
                user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
                token
            });
        } else {
            await logSecurityEvent(user.restaurantId, user.name, user.email, 'LOGIN_FAILED', 'FAILED', req, 'English English English English English English English English');
            res.status(401).json({ 
                success: false, 
                message: '❌ English English English English' 
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. English English English English
exports.registerUser = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ success: false, message: 'English English English English English' });
        }

        const formattedEmail = email.trim().toLowerCase();
        const userExists = await User.findOne({ email: formattedEmail });
        if (userExists) {
            return res.status(400).json({ success: false, message: '❌ English English English English English' });
        }

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });

        const user = await User.create({
            restaurantId: restaurant._id,
            name: name.trim(),
            email: formattedEmail,
            phone: phone.trim(),
            password,
            role: 'customer'
        });

        const token = generateToken(user._id, user.role, user.restaurantId);
        res.cookie('jwt', token, COOKIE_OPTIONS);

        res.status(201).json({
            success: true,
            message: '🎉 English English English English English!',
            user: { _id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role },
            token
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. English English English
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'English English English English English English' });
        }

        const formattedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: formattedEmail });

        if (!user) {
            return res.status(401).json({ success: false, message: '❌ English English English English English English English' });
        }

        if (user.isBanned) {
            return res.status(403).json({ success: false, message: '❌ English English English English English English.' });
        }

        const isMatch = await user.matchPassword(password);
        if (isMatch) {
            user.lastLoginIP = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
            user.lastLoginAt = new Date();
            await user.save();

            const token = generateToken(user._id, user.role, user.restaurantId);
            res.cookie('jwt', token, COOKIE_OPTIONS);

            const isStaffOrAdmin = user.role === 'superadmin' || user.role === 'staff' || user.role === 'admin';

            res.json({
                success: true,
                message: isStaffOrAdmin 
                    ? `🎉 English English English ${user.name}! English English English English English [${user.role}] English English English English English English.`
                    : `🎉 English English English ${user.name}!`,
                user: { 
                    _id: user._id, 
                    name: user.name, 
                    email: user.email, 
                    phone: user.phone, 
                    role: user.role,
                    restaurantId: user.restaurantId 
                },
                token
            });
        } else {
            res.status(401).json({ success: false, message: '❌ English English English English' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. English English English (Staff) English English + English English English
exports.promoteToStaff = async (req, res) => {
    try {
        const { userId } = req.params;
        const targetUser = await User.findById(userId);

        if (!targetUser) return res.status(404).json({ success: false, message: 'English English English' });
        if (targetUser.role === 'superadmin' || targetUser.role === 'admin') return res.status(400).json({ success: false, message: 'English English English English English!' });

        targetUser.role = targetUser.role === 'staff' ? 'customer' : 'staff';
        await targetUser.save();

        const newToken = generateToken(targetUser._id, targetUser.role, targetUser.restaurantId);

        const io = req.app.get('socketio');
        if (io) {
            io.emit('user-account-status-changed', {
                userId: targetUser._id.toString(),
                action: 'role_updated',
                role: targetUser.role,
                token: newToken,
                message: targetUser.role === 'staff' 
                    ? '🎉 English! English English English English English English (Staff) English English English English English English English.' 
                    : 'ℹ️ English English English English English English English English English English.'
            });
        }

        res.json({
            success: true,
            message: targetUser.role === 'staff' 
                ? `🎉 English English [${targetUser.name}] English English English (Staff) English English English English English!` 
                : `✅ English English [${targetUser.name}] English English English English English English English English English!`,
            user: targetUser
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. English English English English English
exports.banUserToggle = async (req, res) => {
    try {
        const { userId } = req.params;
        const targetUser = await User.findById(userId);

        if (!targetUser) return res.status(404).json({ success: false, message: 'English English English' });
        if (targetUser.role === 'superadmin' || targetUser.role === 'admin') return res.status(400).json({ success: false, message: '❌ English English English English English!' });

        targetUser.isBanned = !targetUser.isBanned;
        await targetUser.save();

        const io = req.app.get('socketio');
        if (io) {
            io.emit('user-account-status-changed', {
                userId: targetUser._id.toString(),
                action: targetUser.isBanned ? 'banned' : 'unbanned',
                isBanned: targetUser.isBanned,
                message: targetUser.isBanned 
                    ? '🚫 English English English English English English English! English English English English.' 
                    : '✅ English English English English English.'
            });
        }

        await logSecurityEvent(targetUser.restaurantId, req.user ? req.user.name : 'SuperAdmin', req.user ? req.user.email : '', 'BAN_USER_TOGGLE', 'SUCCESS', req, `English English English [${targetUser.name}]: ${targetUser.isBanned}`);

        res.json({
            success: true,
            message: targetUser.isBanned ? `❌ English English English [${targetUser.name}] English English English` : `✅ English English English English [${targetUser.name}] English`,
            isBanned: targetUser.isBanned
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 9. English English English
exports.deleteUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const targetUser = await User.findById(userId);

        if (!targetUser) return res.status(404).json({ success: false, message: 'English English English' });
        if (targetUser.role === 'superadmin' || targetUser.role === 'admin') {
            return res.status(400).json({ success: false, message: '❌ English English English English English English!' });
        }

        await User.findByIdAndDelete(userId);

        const io = req.app.get('socketio');
        if (io) {
            io.emit('user-account-status-changed', {
                userId: userId.toString(),
                action: 'deleted',
                message: '🗑️ English English English English English English English English.'
            });
        }

        await logSecurityEvent(null, req.user ? req.user.name : 'SuperAdmin', req.user ? req.user.email : '', 'DELETE_USER', 'SUCCESS', req, `English English [${targetUser.name}]`);

        res.json({
            success: true,
            message: `✅ English English English [${targetUser.name}] English English English English!`
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 10. English English English
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select('-password').sort({ createdAt: -1 });
        res.json({ success: true, count: users.length, users });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 11. English English
exports.logoutUser = (req, res) => {
    res.cookie('jwt', '', { httpOnly: true, expires: new Date(0), path: '/' });
    res.json({ success: true, message: 'English English English English' });
};
