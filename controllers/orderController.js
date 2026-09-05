const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Restaurant = require('../models/Restaurant');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Table = require('../models/Table');
const { generateOrderQR, verifyOrderSignature } = require('../utils/qrHelper');
const mongoose = require('mongoose');

/**
 * English English English English English Node.js English MongoDB Atlas
 * Production-Ready Order Controller with Server-Side Real QR Generation & Public Digital Invoice
 */

// 1. English English English English QR English English English English English English English/English
exports.createOrder = async (req, res) => {
    console.log("Order Data Received:", req.body);
    let occupiedTable = null;
    let createdOrder = null;
    const releaseClaimedTable = async () => {
        if (!occupiedTable || createdOrder) return;
        await Table.updateOne({ _id: occupiedTable._id, status: 'occupied' }, { $set: { status: 'available' } });
        occupiedTable = null;
    };
    try {
        const { customer, items, couponCode, deliveryFee, scheduledDeliveryTime, paymentMethod } = req.body;
        const orderType = ['dinein', 'takeaway', 'delivery'].includes(req.body.orderType) ? req.body.orderType : 'delivery';

        if (!customer || !customer.name || !customer.name.trim()) {
            return res.status(400).json({ success: false, message: 'English English English English English' });
        }

        if (!customer.phone || !customer.phone.trim()) {
            return res.status(400).json({ success: false, message: 'English English English English English' });
        }

        if (orderType === 'delivery' && (!customer.address || !customer.address.trim())) {
            return res.status(400).json({ success: false, message: 'English English English English English' });
        }

        const gps = customer.gpsLocation || {};
        if (orderType === 'delivery' && (gps.lat === '' || gps.lng === '' || !Number.isFinite(Number(gps.lat)) || !Number.isFinite(Number(gps.lng)))) {
            return res.status(400).json({ success: false, message: 'GPS location is required for delivery orders.' });
        }

        if (!items || items.length === 0) {
            return res.status(400).json({ success: false, message: 'English English English! English English English English.' });
        }

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' }).lean();
        if (!restaurant) {
            restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });
        }

        if (!restaurant.isAcceptingOrders) {
            return res.status(400).json({ success: false, message: '🚫 English! English English English English English English.' });
        }

        const requiresTable = ['dinein', 'takeaway'].includes(orderType);
        const tableNumber = requiresTable && customer.tableNumber ? String(customer.tableNumber).trim() : '';
        if (requiresTable && !tableNumber) {
            return res.status(400).json({ success: false, message: 'A table is required for dine-in and takeaway orders.' });
        }
        if (tableNumber) {
            // Atomic claim prevents two simultaneous dine-in orders from taking the same table.
            occupiedTable = await Table.findOneAndUpdate(
                { restaurantId: restaurant._id, tableNumber, status: 'available' },
                { $set: { status: 'occupied' } },
                { new: true }
            );

            if (!occupiedTable) {
                const tableExists = await Table.exists({ restaurantId: restaurant._id, tableNumber });
                return res.status(400).json({
                    success: false,
                    message: tableExists ? 'This table is no longer available.' : 'The selected table does not exist.'
                });
            }
        }

        let calculatedSubtotal = 0;
        const processedItems = [];

        for (const item of items) {
            const product = await Product.findById(item._id || item.product);

            if (!product) {
                await releaseClaimedTable();
                return res.status(404).json({ success: false, message: `English English English English English.` });
            }

            // English English English English English English English (English English English English)
            if (!product.isAvailable) {
                await releaseClaimedTable();
                return res.status(400).json({ success: false, message: `English! English [${product.title}] English English English English.` });
            }

            const reqQty = Number(item.quantity || 1);

            let unitPrice = product.discountPrice > 0 ? product.discountPrice : product.price;

            if (item.selectedSize && item.selectedSize.price) {
                unitPrice = Number(item.selectedSize.price);
            }

            let addonsTotal = 0;
            if (item.selectedAddons && Array.isArray(item.selectedAddons)) {
                addonsTotal = item.selectedAddons.reduce((sum, a) => sum + Number(a.price || 0), 0);
            }

            const itemTotalPrice = (unitPrice + addonsTotal) * reqQty;
            calculatedSubtotal += itemTotalPrice;

            processedItems.push({
                product: product._id,
                title: product.title,
                selectedSize: item.selectedSize || null,
                selectedAddons: item.selectedAddons || [],
                unitPrice: unitPrice + addonsTotal,
                quantity: reqQty,
                itemTotal: itemTotalPrice
            });

            // English English English English English English English English English English
            await Product.findByIdAndUpdate(product._id, {
                $inc: { salesCount: reqQty }
            });
        }

        let discountAmount = 0;
        let couponAppliedData = { code: '', percentage: 0 };

        if (couponCode) {
            const coupon = await Coupon.findOne({
                code: couponCode.toUpperCase(),
                restaurantId: restaurant._id,
                isActive: true,
                expirationDate: { $gte: new Date() }
            });

            if (coupon && calculatedSubtotal >= coupon.minOrderAmount) {
                if (coupon.discountType === 'fixed') {
                    discountAmount = coupon.discountAmount;
                } else {
                    discountAmount = (calculatedSubtotal * coupon.discountPercentage) / 100;
                    if (coupon.maxDiscountAmount > 0 && discountAmount > coupon.maxDiscountAmount) {
                        discountAmount = coupon.maxDiscountAmount;
                    }
                }
                couponAppliedData = { code: coupon.code, percentage: coupon.discountPercentage || 0 };
                coupon.usedCount += 1;
                await coupon.save();
            }
        }

        const fee = orderType === 'delivery' ? Number(deliveryFee) || 0 : 0;
        let taxAmount = 0;
        if (restaurant.taxPercentage > 0) {
            taxAmount = (calculatedSubtotal * restaurant.taxPercentage) / 100;
        }

        const finalTotalPrice = Math.round(Math.max(0, calculatedSubtotal - discountAmount + fee + taxAmount));
        const orderNumber = 'ORD-' + Math.floor(100000 + Math.random() * 900000);
        const orderDateObj = new Date();
        const formattedTime = orderDateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

        const realCustomerName = customer.name.trim();

        // English English English English MongoDB
        const newOrder = await Order.create({
            restaurantId: restaurant._id,
            userId: req.user ? req.user._id : null,
            orderNumber,
            orderDate: orderDateObj,
            orderTime: formattedTime,
            scheduledDeliveryTime: scheduledDeliveryTime || 'English English English (ASAP)',
            status: 'New',
            orderType,
            customer: {
                name: realCustomerName,
                phone: customer.phone.trim(),
                whatsappPhone: customer.whatsappPhone ? customer.whatsappPhone.trim() : customer.phone.trim(),
                extraPhone: customer.extraPhone ? customer.extraPhone.trim() : '',
                address: customer.address ? customer.address.trim() : '',
                tableId: occupiedTable ? occupiedTable._id : null,
                tableNumber,
                notes: customer.notes || '',
                gpsLocation: customer.gpsLocation || { lat: 0, lng: 0, mapUrl: '' }
            },
            items: processedItems,
            subtotal: calculatedSubtotal,
            deliveryFee: fee,
            discountAmount,
            couponApplied: couponAppliedData,
            taxAmount,
            totalPrice: finalTotalPrice,
            paymentMethod: paymentMethod || 'COD',
            statusTimeline: [{ status: 'New', note: 'English English English English English English' }]
        });
        createdOrder = newOrder;

        // English English English QR Code English English Base64 English English English English /invoice/:id
        const protocol = req.protocol || 'http';
        const host = req.get('host') || 'localhost:5000';
        const baseUrl = `${protocol}://${host}`;

        const { qrImageBase64, signature } = await generateOrderQR(newOrder, baseUrl);

        newOrder.qrCodeData = qrImageBase64;
        newOrder.qrCodeSignature = signature;
        await newOrder.save();

        if (req.user) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { ordersCount: 1, totalSpent: finalTotalPrice },
                $set: { lastOrderAt: orderDateObj }
            });
        }

        const tableInfoForNotification = newOrder.customer && newOrder.customer.tableNumber ? ` - English [${newOrder.customer.tableNumber}]` : '';

        await Notification.create({
            restaurantId: restaurant._id,
            title: '🚨 English English English',
            message: `English English English [${orderNumber}] English [${finalTotalPrice} English.English] English [${realCustomerName}]${tableInfoForNotification}`,
            type: 'NEW_ORDER',
            relatedId: String(newOrder._id)
        });

        const io = req.app.get('socketio');
        if (io) {
            io.emit(`new-order-${restaurant._id}`, newOrder);
            io.emit('new-order-global', newOrder);
            io.emit('notification-sound-alert', { type: 'NEW_ORDER', orderNumber });
        }

        res.status(201).json({
            success: true,
            message: '🎉 English English English English English English English English QR Code!',
            order: newOrder
        });
    } catch (error) {
        await releaseClaimedTable();
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. English English English English
exports.getPublicOrderInvoice = async (req, res) => {
    try {
        const { id } = req.params;
        const { sig } = req.query;

        let order = null;

        if (id && id !== 'latest' && id !== 'invoice.html' && id !== 'invoice' && id !== 'undefined' && id !== 'null') {
            const cleanId = id.trim().toUpperCase();
            order = await Order.findOne({
                $or: [
                    { orderNumber: cleanId },
                    { _id: mongoose.Types.ObjectId.isValid(cleanId) ? cleanId : null }
                ]
            }).populate('restaurantId', 'name logo phone whatsappPhone address').lean();
        }

        if (!order) {
            return res.status(404).json({ success: false, message: 'English English English English English' });
        }

        // 🔒 English English English English English (sig) English English English QR
        // English English English English English English English English English English English English
        const isValidSignature = verifyOrderSignature(order.orderNumber, order.totalPrice, String(order._id), sig);

        if (!isValidSignature) {
            return res.status(403).json({ success: false, message: '🚫 English English English English English English English English' });
        }

        res.json({
            success: true,
            order
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 3. English English English English English English English English English English
exports.getOrdersByPhoneOrUser = async (req, res) => {
    try {
        const { query } = req.params;
        if (!query) return res.status(400).json({ success: false, message: 'English English English English English English' });

        const trimmedQuery = query.trim();
        const cleanDigits = trimmedQuery.replace(/\D/g, '');

        let searchOr = [
            { 'customer.phone': trimmedQuery },
            { 'customer.whatsappPhone': trimmedQuery },
            { orderNumber: trimmedQuery.toUpperCase() }
        ];

        if (cleanDigits.length >= 6) {
            searchOr.push({ 'customer.phone': { $regex: cleanDigits, $options: 'i' } });
            searchOr.push({ 'customer.whatsappPhone': { $regex: cleanDigits, $options: 'i' } });
        }

        const orders = await Order.find({ $or: searchOr }).sort({ createdAt: -1 }).lean();

        if (!orders || orders.length === 0) {
            return res.status(404).json({ success: false, message: 'English English English English English English English' });
        }

        res.json({ success: true, count: orders.length, orders });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 4. English English English English English
exports.getOrders = async (req, res) => {
    try {
        const { status, search, page = 1, limit = 20 } = req.query;

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' }).lean();
        if (!restaurant) restaurant = await Restaurant.create({ name: 'English English English English', slug: 'abu-qoura' });

        let query = { restaurantId: restaurant._id };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (search) {
            query.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'customer.name': { $regex: search, $options: 'i' } },
                { 'customer.phone': { $regex: search, $options: 'i' } },
                { 'customer.whatsappPhone': { $regex: search, $options: 'i' } },
                { 'customer.extraPhone': { $regex: search, $options: 'i' } },
                { 'customer.tableNumber': { $regex: search, $options: 'i' } }
            ];
        }

        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        const orders = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean();

        const total = await Order.countDocuments(query);

        res.json({
            success: true,
            total,
            page: pageNum,
            pages: Math.ceil(total / limitNum) || 1,
            orders
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 5. English English English English English ID
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).lean();
        if (!order) return res.status(404).json({ success: false, message: 'English English English' });
        res.json({ success: true, order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 6. English English English
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status, note } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'English English English' });

        order.status = status;
        order.statusTimeline.push({
            status,
            updatedAt: new Date(),
            note: note || `English English English English: [${status}]`
        });

        await order.save();

        if (['Delivered', 'Cancelled', 'Rejected'].includes(status) && order.customer && order.customer.tableNumber) {
            await Table.updateOne(
                { restaurantId: order.restaurantId, tableNumber: order.customer.tableNumber, status: 'occupied' },
                { $set: { status: 'available' } }
            );
        }

        const io = req.app.get('socketio');
        if (io) {
            io.emit(`order-status-updated-${order._id}`, order);
            io.emit('order-status-updated-global', order);
        }

        res.json({ success: true, message: '✅ English English English English English Timeline English!', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 7. English English English English MongoDB Atlas
exports.deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);

        if (!deletedOrder) {
            return res.status(404).json({ success: false, message: 'English English English English English English' });
        }

        const io = req.app.get('socketio');
        if (io) {
            io.emit('order-deleted-global', { orderId: req.params.id });
        }

        res.json({ 
            success: true, 
            message: '✅ English English English English English English English!', 
            orderId: req.params.id 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 8. English English
exports.cancelOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ success: false, message: 'English English English' });

        order.status = 'Cancelled';
        order.statusTimeline.push({
            status: 'Cancelled',
            updatedAt: new Date(),
            note: 'English English English English English English English'
        });

        await order.save();

        if (order.customer && order.customer.tableNumber) {
            await Table.updateOne(
                { restaurantId: order.restaurantId, tableNumber: order.customer.tableNumber, status: 'occupied' },
                { $set: { status: 'available' } }
            );
        }

        const io = req.app.get('socketio');
        if (io) io.emit('order-status-updated-global', order);

        res.json({ success: true, message: '✅ English English English English', order });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
