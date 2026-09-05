const rateLimit = require('express-rate-limit');

/**
 * ==============================================================================
 * Rate Limiter English English English English (NODE_ENV)
 * ==============================================================================
 * - English English English (NODE_ENV=production): English English English Rate Limiting English
 *   English English English English English English.
 * - English English English English (development English test English English English): English English English English
 *   (middleware English English English English) English English English English English English.
 *
 * English: English English express-rate-limit English English English
 * `rateLimit(options)` English `createLimiter(options)`.
 * ==============================================================================
 */
function createLimiter(options) {
    const isProduction = process.env.NODE_ENV === 'production';

    if (!isProduction) {
        // English English English English English English English - English English English English
        return (req, res, next) => next();
    }

    return rateLimit(options);
}

module.exports = createLimiter;
