const Category = require('../models/Category');
const Restaurant = require('../models/Restaurant');
const cache = require('../utils/cache');

/**
 * English English English English 100% English MongoDB Atlas (English English English English)
 * ⚡ English English English English English English English English English English English English
 */

const CACHE_PREFIX = 'categories:';
const CACHE_TTL = 10 * 60 * 1000; // 10 English

// 1. English English English English English English MongoDB English
exports.getCategories = async (req, res) => {
    try {
        const { search, isActive } = req.query;

        // ⚡ English English English English English English (search/isActive)
        const cacheKey = `${CACHE_PREFIX}${search || ''}:${isActive || ''}`;
        const cached = cache.get(cacheKey);
        if (cached) {
            return res.json(cached);
        }

        let query = {};

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) {
            restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });
        }

        query.restaurantId = restaurant._id;

        if (isActive !== undefined) {
            query.isActive = isActive === 'true';
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { nameEn: { $regex: search, $options: 'i' } }
            ];
        }

        // English English English MongoDB English English Seed English
        const categories = await Category.find(query).sort({ sortOrder: 1, createdAt: 1 }).lean();

        const responsePayload = {
            success: true,
            count: categories.length,
            categories
        };

        cache.set(cacheKey, responsePayload, CACHE_TTL);

        res.json(responsePayload);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. English English English English English ID
exports.getCategoryById = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: 'English English English English English' });
        }
        res.json({ success: true, category });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. English English English English English MongoDB English English English Socket.io
exports.createCategory = async (req, res) => {
    try {
        const { name, nameEn, image, sortOrder, isActive } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: 'English English English English' });
        }

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });

        // English English English English
        const existingCategory = await Category.findOne({ restaurantId: restaurant._id, name });
        if (existingCategory) {
            return res.status(400).json({ success: false, message: 'English English English English English English English' });
        }

        const category = await Category.create({
            restaurantId: restaurant._id,
            name,
            nameEn: nameEn || '',
            image: image || 'default-category.png',
            sortOrder: Number(sortOrder) || 0,
            isActive: isActive !== undefined ? isActive : true
        });

        // ⚡ English English English English English English English English English English English English
        cache.delByPrefix(CACHE_PREFIX);

        // English English English English Socket.io English English
        const io = req.app.get('socketio');
        if (io) io.emit('categories-updated', { type: 'CREATE', category });

        res.status(201).json({ 
            success: true, 
            message: '🎉 English English English English English English English English English MongoDB!', 
            category 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. English English English English English MongoDB Atlas
exports.updateCategory = async (req, res) => {
    try {
        const updatedCategory = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedCategory) {
            return res.status(404).json({ success: false, message: 'English English English English English' });
        }

        // ⚡ English English English English English English
        cache.delByPrefix(CACHE_PREFIX);

        const io = req.app.get('socketio');
        if (io) io.emit('categories-updated', { type: 'UPDATE', category: updatedCategory });

        res.json({ 
            success: true, 
            message: '✅ English English English English English English MongoDB!', 
            category: updatedCategory 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. English English English English English MongoDB Atlas English English English
exports.deleteCategory = async (req, res) => {
    try {
        const deletedCategory = await Category.findByIdAndDelete(req.params.id);

        if (!deletedCategory) {
            return res.status(404).json({ success: false, message: 'English English English English English' });
        }

        // ⚡ English English English English English English
        cache.delByPrefix(CACHE_PREFIX);

        const io = req.app.get('socketio');
        if (io) io.emit('categories-updated', { type: 'DELETE', categoryId: req.params.id });

        res.json({ 
            success: true, 
            message: '✅ English English English English English English English English', 
            categoryId: req.params.id 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
