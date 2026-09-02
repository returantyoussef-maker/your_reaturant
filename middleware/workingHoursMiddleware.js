const Restaurant = require('../models/Restaurant');
const { getEgyptMinutesNow } = require('../utils/restaurantStatus');

/**
 * برمجية الفحص الذكي الصارم لمواعيد وساعات عمل المطبخ قبل قبول أي طلب (بتوقيت القاهرة)
 * Ultra-Strict Working Hours Interceptor Middleware (Egypt Cairo Timezone)
 *
 * ⚡ ملاحظة: دالة حساب التوقيت getEgyptMinutesNow() أصبحت مستوردة من
 * utils/restaurantStatus.js بدلاً من كونها معرّفة هنا بشكل مكرر، لأنها كانت
 * مطابقة حرفياً لنفس الدالة الموجودة في settingsController.js.
 */
const checkWorkingHours = async (req, res, next) => {
    try {
        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' }).lean();

        if (!restaurant) {
            restaurant = await Restaurant.create({ 
                slug: 'abu-qoura',
                isAcceptingOrders: true,
                autoCloseOutsideWorkingHours: true,
                openingTime: '10:00',
                closingTime: '23:59'
            });
        }

        // 1. الفحص المباشر لمفتاح القفل اليدوي من الإدارة
        if (!restaurant.isAcceptingOrders) {
            return res.status(400).json({ 
                success: false, 
                message: '🚫 عفواً! المطبخ متوقف حالياً عن استقبال الطلبات بقرار من الإدارة. حاول في وقت لاحق.' 
            });
        }

        // 2. الفحص الدقيق بساعات عمل القاهرة المباشرة بـ MongoDB
        if (restaurant.autoCloseOutsideWorkingHours) {
            const currentMinutes = getEgyptMinutesNow();

            const [openH, openM] = (restaurant.openingTime || '10:00').split(':').map(Number);
            const [closeH, closeM] = (restaurant.closingTime || '23:59').split(':').map(Number);

            const openMinutes = openH * 60 + openM;
            const closeMinutes = closeH * 60 + closeM;

            let isOpen = false;

            if (openMinutes <= closeMinutes) {
                // مواعيد داخل نفس اليوم (مثال: من 10:00 ص إلى 11:59 م)
                if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
                    isOpen = true;
                }
            } else {
                // مواعيد ممتدة لما بعد منتصف الليل (مثال: من 10:00 ص إلى 02:00 فجراً)
                if (currentMinutes >= openMinutes || currentMinutes <= closeMinutes) {
                    isOpen = true;
                }
            }

            if (!isOpen) {
                return res.status(400).json({ 
                    success: false, 
                    message: `🌙 عفواً! المطبخ مغلق حالياً خارج مواعيد العمل الرسمية. مواعيد استقبال الطلبات الرسمية بتوقيت القاهرة: [${restaurant.workingHoursText || 'من 10:00 AM حتى 12:00 AM'}]` 
                });
            }
        }

        next();
    } catch (error) {
        console.error('Working Hours Middleware Error:', error.message);
        next();
    }
};

module.exports = { checkWorkingHours, getEgyptMinutesNow };
