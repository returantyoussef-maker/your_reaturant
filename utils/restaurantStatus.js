/**
 * ==============================================================================
 * وحدة مساعدة موحّدة لحساب توقيت مصر وحالة فتح/إغلاق المطبخ
 * Shared Egypt-Timezone & Restaurant Open/Closed Status Utility
 * ------------------------------------------------------------------------------
 * ⚡ تم استخراج دالة getEgyptMinutesNow() هنا لأنها كانت مكررة حرفياً وبنفس
 * الكود تماماً في كل من workingHoursMiddleware.js و settingsController.js.
 * ⚡ دالة checkIsOpenNow() هنا هي النسخة المستخدمة من settingsController.js
 * فقط (لعرض حالة المطعم للعميل). أما workingHoursMiddleware.js فيحتفظ بمنطقه
 * الخاص لحجب الطلبات لأن نصوص الرسائل الموجهة للعميل مختلفة عمداً هناك
 * (تحتوي على توجيه صريح لإعادة المحاولة لاحقاً)، فلم يتم دمجها لتفادي أي
 * تغيير غير مقصود في نص الرسائل التي يراها العميل عند رفض الطلب.
 * ==============================================================================
 */

/**
 * دالة دقيقة لحساب التوقيت المحلي لمصر (Africa/Cairo) بغض النظر عن توقيت السيرفر
 */
function getEgyptMinutesNow() {
    try {
        const formatter = new Intl.DateTimeFormat('en-US', {
            timeZone: 'Africa/Cairo',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
        });
        const parts = formatter.formatToParts(new Date());
        let hours = 0, minutes = 0;
        for (const part of parts) {
            if (part.type === 'hour') hours = parseInt(part.value, 10);
            if (part.type === 'minute') minutes = parseInt(part.value, 10);
        }
        if (hours === 24) hours = 0;
        return hours * 60 + minutes;
    } catch (e) {
        const now = new Date();
        return now.getHours() * 60 + now.getMinutes();
    }
}

/**
 * دالة مساعدة موحّدة لحساب حالة فتح/إغلاق المطبخ اللحظية بتوقيت القاهرة
 * تُستخدم من:
 * - workingHoursMiddleware.js (لمنع إنشاء طلبات خارج ساعات العمل)
 * - settingsController.js (لعرض حالة المطعم للعميل في الواجهة)
 * @param {Object} restaurant - كائن المطعم (lean أو مستند مونجو كامل)
 */
function checkIsOpenNow(restaurant) {
    if (!restaurant) return { isOpenNow: false, reason: 'بيانات المطعم غير مسجلة' };

    // 1. الفحص المباشر لمفتاح القفل اليدوي
    if (!restaurant.isAcceptingOrders) {
        return {
            isOpenNow: false,
            reason: '🚫 عفواً! المطبخ متوقف حالياً عن استقبال الطلبات بقرار من الإدارة.'
        };
    }

    // 2. الفحص التلقائي لمواعيد وساعات العمل بتوقيت القاهرة
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
            return {
                isOpenNow: false,
                reason: `🌙 المطبخ مغلق حالياً بتوقيت القاهرة. مواعيد استقبال الطلبات الرسمية: [${restaurant.workingHoursText || 'من 10:00 AM حتى 12:00 AM'}]`
            };
        }
    }

    return { isOpenNow: true, reason: 'المطبخ مفتوح ويستقبل الطلبات الآن ✅' };
}

module.exports = { getEgyptMinutesNow, checkIsOpenNow };