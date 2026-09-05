const Restaurant = require('../models/Restaurant');
const { getEgyptMinutesNow } = require('../utils/restaurantStatus');

/**
 * English English English English English English English English English English English English (English English)
 * Ultra-Strict Working Hours Interceptor Middleware (Egypt Cairo Timezone)
 *
 * ⚡ English: English English English getEgyptMinutesNow() English English English
 * utils/restaurantStatus.js English English English English English English English English English
 * English English English English English English settingsController.js.
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

        // 1. English English English English English English English
        if (!restaurant.isAcceptingOrders) {
            return res.status(400).json({ 
                success: false, 
                message: '🚫 English! English English English English English English English English English. English English English English.' 
            });
        }

        // 2. English English English English English English English MongoDB
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
                return res.status(400).json({ 
                    success: false, 
                    message: `🌙 English! English English English English English English English. English English English English English English: [${restaurant.workingHoursText || 'English 10:00 AM English 12:00 AM'}]` 
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
