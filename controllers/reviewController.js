const Review = require('../models/Review');
const Product = require('../models/Product');
const Restaurant = require('../models/Restaurant');

/**
 * English English English English English English MongoDB Atlas
 */

// 1. English English English English English English English English
exports.createReview = async (req, res) => {
    try {
        const { productId, orderId, foodRating, deliverySpeedRating, serviceRating, comment, userName, images } = req.body;

        if (!productId || !foodRating) {
            return res.status(400).json({ success: false, message: 'English English English English English' });
        }

        // English English English English
        let realCustomerName = '';
        if (req.user && req.user.name) {
            realCustomerName = req.user.name;
        } else if (userName && userName.trim()) {
            realCustomerName = userName.trim();
        } else {
            return res.status(400).json({ success: false, message: 'English English English English English' });
        }

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });

        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'English English English English English' });
        }

        let reviewImages = [];
        if (req.files && req.files.length > 0) {
            reviewImages = req.files.map(f => `/uploads/${f.filename}`);
        } else if (images && Array.isArray(images)) {
            reviewImages = images;
        }

        const review = await Review.create({
            restaurantId: restaurant._id,
            productId,
            orderId: orderId || null,
            userId: req.user ? req.user._id : null,
            userName: realCustomerName,
            foodRating: Number(foodRating),
            deliverySpeedRating: Number(deliverySpeedRating) || 5,
            serviceRating: Number(serviceRating) || 5,
            comment: comment ? comment.trim() : '',
            images: reviewImages,
            isApproved: true
        });

        // English English English English English English
        const reviewsStats = await Review.aggregate([
            { $match: { productId: product._id, isApproved: true } },
            { $group: { _id: '$productId', avgRating: { $avg: '$foodRating' }, count: { $sum: 1 } } }
        ]);

        if (reviewsStats.length > 0) {
            product.rating = Number(reviewsStats[0].avgRating.toFixed(1));
            product.ratingsCount = reviewsStats[0].count;
            await product.save();
        }

        res.status(201).json({
            success: true,
            message: '🎉 English English English English!',
            review
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. English English English English English
exports.getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;
        const reviews = await Review.find({ productId, isApproved: true }).sort({ createdAt: -1 }).lean();

        let avgFood = 5, avgDelivery = 5, avgService = 5;
        if (reviews.length > 0) {
            avgFood = (reviews.reduce((s, r) => s + r.foodRating, 0) / reviews.length).toFixed(1);
            avgDelivery = (reviews.reduce((s, r) => s + r.deliverySpeedRating, 0) / reviews.length).toFixed(1);
            avgService = (reviews.reduce((s, r) => s + r.serviceRating, 0) / reviews.length).toFixed(1);
        }

        res.json({
            success: true,
            count: reviews.length,
            averages: {
                food: Number(avgFood),
                delivery: Number(avgDelivery),
                service: Number(avgService)
            },
            reviews
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. English English English English English
exports.getAllReviewsAdmin = async (req, res) => {
    try {
        const reviews = await Review.find({})
            .populate('productId', 'title price images')
            .sort({ createdAt: -1 })
            .lean();

        res.json({ success: true, count: reviews.length, reviews });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. English English English English English English
exports.toggleReviewApproval = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) {
            return res.status(404).json({ success: false, message: 'English English English' });
        }

        review.isApproved = !review.isApproved;
        await review.save();

        res.json({
            success: true,
            message: review.isApproved ? '✅ English English English English' : '🚫 English English English English English',
            isApproved: review.isApproved
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. English English English
exports.deleteReview = async (req, res) => {
    try {
        const deletedReview = await Review.findByIdAndDelete(req.params.id);
        if (!deletedReview) {
            return res.status(404).json({ success: false, message: 'English English English' });
        }
        res.json({ success: true, message: '✅ English English English English' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
