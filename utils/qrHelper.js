const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * English English English English English English English English English English English
 */
function getSecretKey() {
    const secret = process.env.QR_SECRET;
    if (!secret) {
        console.warn('⚠️ English: QR_SECRET English English English English English English English English English English.');
        return process.env.JWT_SECRET || 'default_fallback_qr_secret_key_abu_qoura_2026';
    }
    return secret;
}

/**
 * English English English (HMAC) English English English
 * English English English English English English QR English
 */
function generateOrderSignature(orderNumber, totalPrice, orderId) {
    const secret = getSecretKey();
    
    // English English English English English English English English English
    const safeOrderId = String(orderId || '');
    const safeOrderNum = String(orderNumber || '');
    const safePrice = Number(totalPrice || 0).toFixed(2);

    const payload = `${safeOrderId}|${safeOrderNum}|${safePrice}`;

    return crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex')
        .substring(0, 32); // English 32 English English English English
}

/**
 * English English English English English English English English (Timing Attacks)
 */
function verifyOrderSignature(orderNumber, totalPrice, orderId, signatureToVerify) {
    if (!signatureToVerify) return false;
    
    const expectedSignature = generateOrderSignature(orderNumber, totalPrice, orderId);
    
    try {
        const bufA = Buffer.from(signatureToVerify, 'utf8');
        const bufB = Buffer.from(expectedSignature, 'utf8');
        if (bufA.length !== bufB.length) return false;
        return crypto.timingSafeEqual(bufA, bufB);
    } catch (err) {
        return false;
    }
}

/**
 * English English QR English (Base64 PNG) + English English English
 * @param {Object} order - English English English English English MongoDB
 * @param {String} baseUrl - English English English
 */
async function generateOrderQR(order, baseUrl = 'http://localhost:5000') {
    try {
        if (!order || (!order._id && !order.orderNumber)) {
            throw new Error('English English English English English English English QR');
        }

        const orderIdStr = String(order._id || order.orderNumber);
        const signature = generateOrderSignature(order.orderNumber, order.totalPrice, orderIdStr);

        // English English English English English (Trailing Slash) English English English
        const cleanBaseUrl = String(baseUrl).replace(/\/+$/, '');
        const verifyUrl = `${cleanBaseUrl}/invoice/${orderIdStr}?sig=${signature}`;

        // ⚡ English English: English English English 280px English English M English English English English English English
        const qrImageBase64 = await QRCode.toDataURL(verifyUrl, {
            errorCorrectionLevel: 'M', 
            type: 'image/png',
            margin: 1,
            width: 280,
            color: {
                dark: '#1a1a1a',
                light: '#ffffff'
            }
        });

        return { verifyUrl, signature, qrImageBase64 };
    } catch (error) {
        console.error('❌ English English English English English QR:', error.message);
        return {
            verifyUrl: `${baseUrl}/invoice/${order?._id || ''}`,
            signature: '',
            qrImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
        };
    }
}

module.exports = {
    generateOrderSignature,
    verifyOrderSignature,
    generateOrderQR
};
