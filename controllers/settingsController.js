const Restaurant = require('../models/Restaurant');
const cache = require('../utils/cache');

/**
 * English English English English English English (Africa/Cairo)
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
 * English English English English English/English English English English English
 */
const checkIsOpenNow = (restaurant) => {
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
};

// ⚡ English English English English English (English isOpenNow English English English English English English)
const SETTINGS_CACHE_KEY = 'settings:restaurant-doc';
const SETTINGS_CACHE_TTL = 10 * 60 * 1000; // 10 English

async function getRestaurantDocCached() {
    const cached = cache.get(SETTINGS_CACHE_KEY);
    if (cached) return cached;

    let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' }).lean({ flattenMaps: true });

    if (!restaurant) {
        restaurant = await Restaurant.create({
            name: 'English English English English',
            slug: 'abu-qoura',
            whatsappPhone: '01120751467',
            phone: '01120751467',
            address: 'English - English English - English',
            openingTime: '10:00',
            closingTime: '23:59',
            workingHoursText: 'English English 10:00 English English 12:00 English English',
            isAcceptingOrders: true,
            autoCloseOutsideWorkingHours: true
        });
        restaurant = restaurant.toObject({ flattenMaps: true });
    }

    cache.set(SETTINGS_CACHE_KEY, restaurant, SETTINGS_CACHE_TTL);
    return restaurant;
}

// 1. English English English English English English English English English MongoDB Atlas
exports.getSettings = async (req, res) => {
    try {
        const restaurant = await getRestaurantDocCached();

        // ⚡ English English/English English English English English English (English English) English English English English
        const statusCheck = checkIsOpenNow(restaurant);

        // 🖨️ English English English printingSettings English English English English English English English English
        const defaultPrintingSettings = {
            enabled: false,
            printerName: '',
            printerType: 'unknown',
            protocol: 'unknown',
            connection: 'qz-queue',
            paperSize: '80mm',
            copies: 1,
            autoPrintNewOrders: true,
            printOnStatusChange: false,
            cutPaper: true,
            beep: true,
            marginBottom: 4
        };
        const printingSettings = (restaurant.printingSettings && typeof restaurant.printingSettings === 'object')
            ? { ...defaultPrintingSettings, ...restaurant.printingSettings }
            : defaultPrintingSettings;

        res.json({
            success: true,
            settings: {
                ...restaurant,
                printingSettings,
                isOpenNow: statusCheck.isOpenNow,
                closedReason: statusCheck.reason
            }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// 2. English English English English English English + English English English Socket.io
exports.updateSettings = async (req, res) => {
    try {
        const { 
            name, 
            whatsappPhone, 
            phone, 
            address, 
            description, 
            logo,
            coverImage,
            openingTime,
            closingTime,
            workingHoursText, 
            isAcceptingOrders, 
            autoCloseOutsideWorkingHours, 
            taxPercentage, 
            serviceCharge,
            socialLinks,
            theme,
            content,
            printingSettings
        } = req.body;

        let restaurant = await Restaurant.findOne({ slug: 'abu-qoura' });

        if (!restaurant) {
            restaurant = new Restaurant({ slug: 'abu-qoura' });
        }

        // English English English
        if (name !== undefined) restaurant.name = name;
        if (whatsappPhone !== undefined) restaurant.whatsappPhone = whatsappPhone.trim();
        if (phone !== undefined) restaurant.phone = phone.trim();
        if (address !== undefined) restaurant.address = address;
        if (description !== undefined) restaurant.description = description;
        if (logo !== undefined) restaurant.logo = logo;
        if (coverImage !== undefined) restaurant.coverImage = coverImage;
        if (openingTime !== undefined) restaurant.openingTime = openingTime;
        if (closingTime !== undefined) restaurant.closingTime = closingTime;
        if (workingHoursText !== undefined) restaurant.workingHoursText = workingHoursText;
        if (isAcceptingOrders !== undefined) restaurant.isAcceptingOrders = isAcceptingOrders;
        if (autoCloseOutsideWorkingHours !== undefined) restaurant.autoCloseOutsideWorkingHours = autoCloseOutsideWorkingHours;
        if (taxPercentage !== undefined) restaurant.taxPercentage = Number(taxPercentage);
        if (serviceCharge !== undefined) restaurant.serviceCharge = Number(serviceCharge);
        if (socialLinks !== undefined) restaurant.socialLinks = { ...restaurant.socialLinks, ...socialLinks };

        if (theme && typeof theme === 'object') {
            restaurant.theme = {
                primaryColor: theme.primaryColor || restaurant.theme?.primaryColor || '#a82810',
                primaryHover: theme.primaryHover || restaurant.theme?.primaryHover || '#8e1f0b',
                secondaryColor: theme.secondaryColor || restaurant.theme?.secondaryColor || '#5a4b10',
                goldLight: theme.goldLight || restaurant.theme?.goldLight || '#f7f3e8',
                darkColor: theme.darkColor || restaurant.theme?.darkColor || '#1a1816',
                bgColor: theme.bgColor || restaurant.theme?.bgColor || '#fbf9f5',
                cardBgColor: theme.cardBgColor || restaurant.theme?.cardBgColor || '#ffffff',
                textColor: theme.textColor || restaurant.theme?.textColor || '#1a1816',
                textMutedColor: theme.textMutedColor || restaurant.theme?.textMutedColor || '#726b65',
                borderColor: theme.borderColor || restaurant.theme?.borderColor || '#eee9e0',
                borderRadius: theme.borderRadius || restaurant.theme?.borderRadius || '20px',
                fontFamily: theme.fontFamily || restaurant.theme?.fontFamily || 'Tajawal',
                customCss: theme.customCss !== undefined ? theme.customCss : (restaurant.theme?.customCss || '')
            };
        }

        if (content && typeof content === 'object') {
            restaurant.content = {
                brandName: content.brandName || restaurant.content?.brandName || 'English English ✨',
                brandTagline: content.brandTagline || restaurant.content?.brandTagline || 'English English English English',
                heroTitle: content.heroTitle || restaurant.content?.heroTitle || 'English',
                heroSubtitle: content.heroSubtitle || restaurant.content?.heroSubtitle || 'English English English English English',
                heroBtn1Text: content.heroBtn1Text || restaurant.content?.heroBtn1Text || 'English English 🍱',
                heroBtn2Text: content.heroBtn2Text || restaurant.content?.heroBtn2Text || '🔥 English English',
                heroBgImage: content.heroBgImage || restaurant.content?.heroBgImage || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1600',
                dealsSectionTitle: content.dealsSectionTitle || restaurant.content?.dealsSectionTitle || '🔥 English English English English',
                dealsSectionSubtitle: content.dealsSectionSubtitle || restaurant.content?.dealsSectionSubtitle || 'English English English English English English',
                topSellersTitle: content.topSellersTitle || restaurant.content?.topSellersTitle || '🏆 English 10 English English English English',
                topSellersSubtitle: content.topSellersSubtitle || restaurant.content?.topSellersSubtitle || 'English English English English English English English English English English English English English',
                menuPageTitle: content.menuPageTitle || restaurant.content?.menuPageTitle || 'English English English 📜',
                menuPageSubtitle: content.menuPageSubtitle || restaurant.content?.menuPageSubtitle || 'English English English English English English English English English',
                announcementText: content.announcementText || restaurant.content?.announcementText || '',
                showAnnouncement: content.showAnnouncement !== undefined ? content.showAnnouncement : (restaurant.content?.showAnnouncement || false),
                footerText: content.footerText || restaurant.content?.footerText || 'English English English © 2026 English English English - English English English'
            };
        }

        // 🖨️ English English English English QZ Tray English English English English English
        if (printingSettings && typeof printingSettings === 'object') {
            const existing = restaurant.printingSettings ? restaurant.printingSettings.toObject() : {};
            restaurant.printingSettings = {
                enabled: printingSettings.enabled !== undefined ? Boolean(printingSettings.enabled) : (existing.enabled || false),
                printerName: printingSettings.printerName !== undefined ? String(printingSettings.printerName).trim() : (existing.printerName || ''),
                printerType: ['thermal', 'office', 'unknown'].includes(printingSettings.printerType) ? printingSettings.printerType : (existing.printerType || 'unknown'),
                protocol: ['escpos-raster', 'escpos-text', 'browser', 'unknown'].includes(printingSettings.protocol) ? printingSettings.protocol : (existing.protocol || 'unknown'),
                connection: 'qz-queue',
                paperSize: printingSettings.paperSize === '58mm' ? '58mm' : (printingSettings.paperSize === '80mm' ? '80mm' : (existing.paperSize || '80mm')),
                copies: Math.min(5, Math.max(1, Number(printingSettings.copies) || existing.copies || 1)),
                autoPrintNewOrders: printingSettings.autoPrintNewOrders !== undefined ? Boolean(printingSettings.autoPrintNewOrders) : (existing.autoPrintNewOrders !== undefined ? existing.autoPrintNewOrders : true),
                printOnStatusChange: printingSettings.printOnStatusChange !== undefined ? Boolean(printingSettings.printOnStatusChange) : (existing.printOnStatusChange || false),
                cutPaper: printingSettings.cutPaper !== undefined ? Boolean(printingSettings.cutPaper) : (existing.cutPaper !== undefined ? existing.cutPaper : true),
                beep: printingSettings.beep !== undefined ? Boolean(printingSettings.beep) : (existing.beep !== undefined ? existing.beep : true),
                marginBottom: Math.min(50, Math.max(0, Number(printingSettings.marginBottom) || existing.marginBottom || 4))
            };
        }

        const updatedRestaurant = await restaurant.save();

        // ⚡ English English English English English English English English English English English English
        cache.del(SETTINGS_CACHE_KEY);

        const statusCheck = checkIsOpenNow(updatedRestaurant.toObject({ flattenMaps: true }));

        const responseSettings = {
            ...updatedRestaurant.toObject({ flattenMaps: true }),
            isOpenNow: statusCheck.isOpenNow,
            closedReason: statusCheck.reason
        };

        const io = req.app.get('socketio');
        if (io) io.emit('settings-updated', responseSettings);

        res.json({
            success: true,
            message: '🎉 English English English English English English English English English English!',
            settings: responseSettings
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
