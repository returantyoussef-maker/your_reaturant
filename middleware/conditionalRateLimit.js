const rateLimit = require('express-rate-limit');

/**
 * ==============================================================================
 * Rate Limiter ديناميكي حسب بيئة التشغيل (NODE_ENV)
 * ==============================================================================
 * - في وضع الإنتاج (NODE_ENV=production): يتم تفعيل الـ Rate Limiting فعلياً
 *   لحماية السيرفر من الإغراق وهجمات التخمين.
 * - في أي وضع آخر (development أو test أو غير محدد): يتم تجاوز الفحص تماماً
 *   (middleware شفاف بيمرر الطلب مباشرة) عشان تسهيل الاختبار المحلي بدون حظر.
 *
 * الاستخدام: نفس استخدام express-rate-limit العادي، فقط استبدل
 * `rateLimit(options)` بـ `createLimiter(options)`.
 * ==============================================================================
 */
function createLimiter(options) {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
        // لا يوجد أي حظر في بيئة التطوير - يمرر كل الطلبات مباشرة
        return (req, res, next) => next();
    }

    return rateLimit(options);
}

module.exports = createLimiter;