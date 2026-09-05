const QRCode = require('qrcode');
const crypto = require('crypto');

/**
 * English English English English English English English English English
 */
function generateInvoiceSignature(orderId, orderNumber) {
    const secret = process.env.QR_SECRET || process.env.JWT_SECRET || 'fallback_qr_secret_2026';
    return crypto
        .createHmac('sha256', secret)
        .update(`${orderId || ''}|${orderNumber || ''}`)
        .digest('hex')
        .substring(0, 24);
}

/**
 * English English English English QR English English English English English English
 * Generates Real Scannable Base64 QR Code Linking to Digital Web Invoice
 * 
 * @param {Object} order - English English
 * @param {String} baseUrl - English English English
 */
async function generateOrderQR(order, baseUrl) {
    try {
        if (!order) {
            throw new Error('English English English (Order Object Null or Undefined)');
        }

        // English English English English: English English baseUrl English English English English controller (English English English request)English
        // English English English English fallbackEnglish English localhost English English English
        const hostUrl = baseUrl || process.env.APP_BASE_URL || process.env.BASE_URL || process.env.CLIENT_URL || 'http://localhost:5000';
        const cleanBaseUrl = String(hostUrl).replace(/\/+$/, '');

        // English English English English
        const orderIdStr = String(order._id || order.id || order.orderNumber || '');
        const orderNum = order.orderNumber || orderIdStr;

        if (!orderIdStr) {
            throw new Error('English English _id English orderNumber English English English');
        }

        // English English English English English English English
        const sig = generateInvoiceSignature(orderIdStr, orderNum);

        // English English English English English
        const invoiceUrl = `${cleanBaseUrl}/invoice/${orderIdStr}?sig=${sig}`;

        // ⚡ English English: English English English 280px English English M English English English English English English
        const qrImageBase64 = await QRCode.toDataURL(invoiceUrl, {
            errorCorrectionLevel: 'M',
            type: 'image/png',
            margin: 1,
            width: 280,
            color: {
                dark: '#000000',
                light: '#ffffff'
            }
        });

        return { invoiceUrl, qrImageBase64, signature: sig };
    } catch (error) {
        console.error('❌ English English English English QR (QR Generation Error):', error.message);
        
        const fallbackUrl = (baseUrl || 'http://localhost:5000').replace(/\/+$/, '');
        return { 
            invoiceUrl: `${fallbackUrl}/invoice.html`, 
            qrImageBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
            signature: ''
        };
    }
}

module.exports = { generateOrderQR, generateInvoiceSignature };
