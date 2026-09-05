const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');
const mongoose = require('mongoose');

/**
 * English English English English English English English MongoDB Aggregations
 * McDonald's Grade Admin Analytics & Executive Reporting Controller
 */

// 1. English English English English English English English English MongoDB
exports.getAdminStats = async (req, res) => {
    try {
        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        if (!restaurant) restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });

        const restaurantId = restaurant._id;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // English) English English
        const newOrdersCount = await Order.countDocuments({ restaurantId, status: 'New' });

        // English) English English English (English English English English English English English)
        const activeOrdersNow = await Order.countDocuments({ 
            restaurantId, 
            status: { $in: ['New', 'Reviewed', 'Preparing', 'Ready', 'OutForDelivery'] } 
        });

        // English) English English
        const completedOrders = await Order.countDocuments({ restaurantId, status: 'Delivered' });

        // English) English English English English
        const cancelledOrders = await Order.countDocuments({ 
            restaurantId, 
            status: { $in: ['Cancelled', 'Rejected'] } 
        });

        // English) English English (English English 45 English English English)
        const fortyFiveMinsAgo = new Date(Date.now() - 45 * 60 * 1000);
        const lateOrders = await Order.countDocuments({
            restaurantId,
            status: { $in: ['New', 'Reviewed', 'Preparing', 'Ready', 'OutForDelivery'] },
            createdAt: { $lte: fortyFiveMinsAgo }
        });

        // English) English English English English English
        const totalRevenueAgg = await Order.aggregate([
            { 
                $match: { 
                    restaurantId: new mongoose.Types.ObjectId(restaurantId),
                    status: 'Delivered'
                } 
            },
            { $group: { _id: null, total: { $sum: '$totalPrice' } } }
        ]);
        const totalRevenue = totalRevenueAgg[0] ? totalRevenueAgg[0].total : 0;

        // English) English English English English (Average Order Value - AOV)
        const averageOrderValue = completedOrders > 0 ? Math.round(totalRevenue / completedOrders) : 0;

        // English) English English English English English MongoDB
        const topSellingProduct = await Product.findOne({ restaurantId }).sort({ salesCount: -1 }).select('title salesCount price');
        const lowestSellingProduct = await Product.findOne({ restaurantId }).sort({ salesCount: 1 }).select('title salesCount price');

        // English) English English English
        const recentCustomers = await User.find({ restaurantId, role: 'customer' })
            .select('name email phone totalSpent ordersCount createdAt')
            .sort({ createdAt: -1 })
            .limit(5);

        // English) English 10 English English English English
        const recentOrders = await Order.find({ restaurantId })
            .sort({ createdAt: -1 })
            .limit(10);

        res.json({
            success: true,
            stats: {
                activeOrdersNow,
                newOrders: newOrdersCount,
                lateOrders,
                cancelledOrders,
                completedOrders,
                totalRevenue,
                averageOrderValue,
                topSellingProduct: topSellingProduct ? `${topSellingProduct.title} (${topSellingProduct.salesCount} English)` : 'English English',
                lowestSellingProduct: lowestSellingProduct ? `${lowestSellingProduct.title} (${lowestSellingProduct.salesCount} English)` : 'English English'
            },
            recentCustomers,
            recentOrders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. English English English English English (Pagination) - English 20 English English English English English
//    English English English English English English (English English 632 English English) English English English
exports.getAllOrders = async (req, res) => {
    try {
        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        const restaurantId = restaurant ? restaurant._id : null;

        // ⚡ page & limit English English English English (English English 1 English 20 English)
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        let query = { restaurantId };

        // English English English (English / English English / English) English English English English English
        if (req.query.status && req.query.status !== 'all') {
            query.status = req.query.status;
        }

        // English English English English English English English English English English English English English
        if (req.query.q) {
            const q = String(req.query.q).trim();
            if (q) {
                const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
                query.$or = [
                    { orderNumber: regex },
                    { 'customer.name': regex },
                    { 'customer.phone': regex },
                    { 'customer.whatsappPhone': regex },
                    { 'customer.extraPhone': regex },
                    { 'customer.tableNumber': regex }
                ];
            }
        }

        const [orders, total] = await Promise.all([
            Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Order.countDocuments(query)
        ]);

        res.json({
            success: true,
            count: orders.length,
            total,
            page,
            totalPages: Math.ceil(total / limit) || 1,
            hasMore: skip + orders.length < total,
            orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. English English English English
exports.getSalesReport = async (req, res) => {
    try {
        const { startDate, endDate } = req.query;

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });
        const restaurantId = restaurant._id;

        let matchQuery = { 
            restaurantId: new mongoose.Types.ObjectId(restaurantId),
            status: 'Delivered'
        };

        if (startDate && endDate) {
            matchQuery.createdAt = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        }

        const report = await Order.aggregate([
            { $match: matchQuery },
            { 
                $group: { 
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                    totalOrders: { $sum: 1 },
                    totalSales: { $sum: "$totalPrice" },
                    avgValue: { $avg: "$totalPrice" }
                } 
            },
            { $sort: { _id: -1 } }
        ]);

        res.json({ success: true, report });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
