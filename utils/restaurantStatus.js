/**
 * ==============================================================================
 * English English English English English English English English/English English
 * Shared Egypt-Timezone & Restaurant Open/Closed Status Utility
 * ------------------------------------------------------------------------------
 * ⚡ English English English getEgyptMinutesNow() English English English English English English
 * English English English English English workingHoursMiddleware.js English settingsController.js.
 * ⚡ English checkIsOpenNow() English English English English English settingsController.js
 * English (English English English English). English workingHoursMiddleware.js English English
 * English English English English English English English English English English English
 * (English English English English English English English)English English English English English English
 * English English English English English English English English English English English English.
 * ==============================================================================
 */

/**
 * English English English English English English (Africa/Cairo) English English English English English
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
 * English English English English English English/English English English English English
 * English English:
 * - workingHoursMiddleware.js (English English English English English English)
 * - settingsController.js (English English English English English English)
 * @param {Object} restaurant - English English (lean English English English English)
 */
function checkIsOpenNow(restaurant) {
    if (!restaurant) return { isOpenNow: false, reason: 'English English English English' };

    // 1. English English English English English
    if (!restaurant.isAcceptingOrders) {
        return {
            isOpenNow: false,
            reason: '🚫 English! English English English English English English English English English.'
        };
    }

    // 2. English English English English English English English
    if (restaurant.autoCloseOutsideWorkingHours) {
        const currentMinutes = getEgyptMinutesNow();

        const [openH, openM] = (restaurant.openingTime || '10:00').split(':').map(Number);
        const [closeH, closeM] = (restaurant.closingTime || '23:59').split(':').map(Number);

        const openMinutes = openH * 60 + openM;
        const closeMinutes = closeH * 60 + closeM;

        let isOpen = false;

        if (openMinutes <= closeMinutes) {
            // English English English English (English: English 10:00 English English 11:59 English)
            if (currentMinutes >= openMinutes && currentMinutes <= closeMinutes) {
                isOpen = true;
            }
        } else {
            // English English English English English English (English: English 10:00 English English 02:00 English)
            if (currentMinutes >= openMinutes || currentMinutes <= closeMinutes) {
                isOpen = true;
            }
        }

        if (!isOpen) {
            return {
                isOpenNow: false,
                reason: `🌙 English English English English English. English English English English: [${restaurant.workingHoursText || 'English 10:00 AM English 12:00 AM'}]`
            };
        }
    }

    return { isOpenNow: true, reason: 'English English English English English ✅' };
}

module.exports = { getEgyptMinutesNow, checkIsOpenNow };
