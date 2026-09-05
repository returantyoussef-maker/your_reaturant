const Coupon = require('../models/Coupon');
const Restaurant = require('../models/Restaurant');

/**
 * English English English English English MongoDB Atlas
 * McDonald's Grade Coupon Controller with Per-Customer Limits & Fixed/Percentage Discounts
 */

// 1. English English English English English MongoDB English English English English English English English
exports.applyCoupon = async (req, res) => {
    try {
        const { code, subtotal, customerPhone } = req.body;

        if (!code) {
            return res.status(400).json({ success: false, message: 'English English English English' });
        }

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        const restaurantId = restaurant ? restaurant._id : null;

        const coupon = await Coupon.findOne({
            code: code.toUpperCase().trim(),
            restaurantId,
            isActive: true
        });

        if (!coupon) {
            return res.status(404).json({ success: false, message: 'English English English English English English English' });
        }

        const now = new Date();

        // English) English English English English English
        if (coupon.startDate && new Date(coupon.startDate) > now) {
            return res.status(400).json({ success: false, message: 'English! English English English English English English.' });
        }

        // English) English English English English
        if (new Date(coupon.expirationDate) < now) {
            return res.status(400).json({ success: false, message: 'English! English English English English English' });
        }

        // English) English English English English English English
        if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'English! English English English English English English English' });
        }

        // English) English English English English English English (English English English English English UserId)
        const currentPhone = customerPhone || (req.user ? req.user.phone : '');

        if (currentPhone && coupon.usageLimitPerUser > 0) {
            const userUsedCount = coupon.usedByUsers.filter(u => u.phone === currentPhone).length;
            if (userUsedCount >= coupon.usageLimitPerUser) {
                return res.status(400).json({ 
                    success: false, 
                    message: `English! English English English English English English English English English (${coupon.usageLimitPerUser} English).` 
                });
            }
        }

        // English) English English English English English
        const subtotalNum = Number(subtotal) || 0;
        if (subtotalNum < coupon.minOrderAmount) {
            return res.status(400).json({ 
                success: false, 
                message: `English English English English English English English [${coupon.minOrderAmount} English.English]` 
            });
        }

        // English) English English English English (English English English English English)
        let discountAmount = 0;

        if (coupon.discountType === 'fixed') {
            discountAmount = coupon.discountAmount;
        } else {
            discountAmount = (subtotalNum * coupon.discountPercentage) / 100;
            if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
                discountAmount = coupon.maxDiscountAmount;
            }
        }

        res.json({
            success: true,
            message: `🎉 English English English English!`,
            coupon: {
                code: coupon.code,
                discountType: coupon.discountType,
                discountPercentage: coupon.discountPercentage,
                discountAmount: Math.round(discountAmount)
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. English English English English English English English English
exports.getCoupons = async (req, res) => {
    try {
        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        const restaurantId = restaurant ? restaurant._id : null;

        const coupons = await Coupon.find({ restaurantId }).sort({ createdAt: -1 });
        res.json({ success: true, count: coupons.length, coupons });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. English English English English English English English English MongoDB
exports.createCoupon = async (req, res) => {
    try {
        const { 
            code, 
            discountType, 
            discountPercentage, 
            discountAmount, 
            maxDiscountAmount, 
            minOrderAmount, 
            startDate, 
            expirationDate, 
            usageLimit, 
            usageLimitPerUser 
        } = req.body;

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });

        const formattedCode = code.toUpperCase().trim();

        const existingCoupon = await Coupon.findOne({ restaurantId: restaurant._id, code: formattedCode });
        if (existingCoupon) {
            return res.status(400).json({ success: false, message: 'English English English English English English' });
        }

        const coupon = await Coupon.create({
            restaurantId: restaurant._id,
            code: formattedCode,
            discountType: discountType || 'percentage',
            discountPercentage: Number(discountPercentage) || 0,
            discountAmount: Number(discountAmount) || 0,
            maxDiscountAmount: Number(maxDiscountAmount) || 0,
            minOrderAmount: Number(minOrderAmount) || 0,
            startDate: startDate ? new Date(startDate) : new Date(),
            expirationDate: new Date(expirationDate),
            usageLimit: Number(usageLimit) || 100,
            usageLimitPerUser: Number(usageLimitPerUser) || 1
        });

        res.status(201).json({ 
            success: true, 
            message: '🎉 English English English English English English English English MongoDB!', 
            coupon 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. English English English English English English
exports.updateCoupon = async (req, res) => {
    try {
        const updatedCoupon = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCoupon) {
            return res.status(404).json({ success: false, message: 'English English English English English' });
        }

        res.json({ success: true, message: '✅ English English English English English English MongoDB!', coupon: updatedCoupon });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. English English English English MongoDB Atlas
exports.deleteCoupon = async (req, res) => {
    try {
        const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);

        if (!deletedCoupon) {
            return res.status(404).json({ success: false, message: 'English English English English English' });
        }

        res.json({ success: true, message: '✅ English English English English English English English English' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
