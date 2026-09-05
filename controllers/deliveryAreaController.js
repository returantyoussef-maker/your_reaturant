const DeliveryArea = require('../models/DeliveryArea');
const Restaurant = require('../models/Restaurant');
const cache = require('../utils/cache');

/**
 * English English English English 100% English MongoDB Atlas (English English English English)
 * ⚡ English English English English English English English English English English
 */

const CACHE_KEY = 'delivery-areas:list';
const CACHE_TTL = 10 * 60 * 1000; // 10 English

// 1. English English English English English English English MongoDB English
exports.getDeliveryAreas = async (req, res) => {
    try {
        const cached = cache.get(CACHE_KEY);
        if (cached) {
            return res.json(cached);
        }

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) {
            restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });
        }

        // English English English English English English English Seed English
        const areas = await DeliveryArea.find({ restaurantId: restaurant._id, isActive: true }).sort({ areaName: 1 }).lean();

        const responsePayload = {
            success: true,
            count: areas.length,
            areas
        };

        cache.set(CACHE_KEY, responsePayload, CACHE_TTL);

        res.json(responsePayload);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. English English English English English English English MongoDB Atlas
exports.createDeliveryArea = async (req, res) => {
    try {
        const { areaName, deliveryFee, minOrderAmount, estimatedTimeMinutes } = req.body;

        if (!areaName || deliveryFee === undefined) {
            return res.status(400).json({ success: false, message: 'English English English English English English' });
        }

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) {
            restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });
        }

        const area = await DeliveryArea.create({
            restaurantId: restaurant._id,
            areaName,
            deliveryFee: Number(deliveryFee),
            minOrderAmount: Number(minOrderAmount) || 0,
            estimatedTimeMinutes: Number(estimatedTimeMinutes) || 30
        });

        // ⚡ English English English English English English English
        cache.del(CACHE_KEY);

        res.status(201).json({ 
            success: true, 
            message: '🎉 English English English English English English English English MongoDB!', 
            area 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. English English English English English MongoDB
exports.updateDeliveryArea = async (req, res) => {
    try {
        const updatedArea = await DeliveryArea.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedArea) {
            return res.status(404).json({ success: false, message: 'English English English English' });
        }

        // ⚡ English English English English English English English
        cache.del(CACHE_KEY);

        res.json({ 
            success: true, 
            message: '✅ English English English English English English English MongoDB!', 
            area: updatedArea 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. English English English English English MongoDB Atlas
exports.deleteDeliveryArea = async (req, res) => {
    try {
        const deletedArea = await DeliveryArea.findByIdAndDelete(req.params.id);

        if (!deletedArea) {
            return res.status(404).json({ success: false, message: 'English English English' });
        }

        // ⚡ English English English English English English English
        cache.del(CACHE_KEY);

        res.json({ 
            success: true, 
            message: '✅ English English English English English English English English MongoDB' 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
