/**
 * English English English APIs English English (404 Not Found)
 */
const notFound = (req, res, next) => {
    const error = new Error(`🔍 English English English English: [${req.originalUrl}]`);
    res.status(404);
    next(error);
};

/**
 * English English English English English English English
 * Enterprise Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message || 'English English English English English';

    // 1. English English MongoDB English English English ID English English (CastError)
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        statusCode = 404;
        message = 'English English English English English (English ID English English)';
    }

    // 2. English English English English English English English English English English (Duplicate Key Code 11000)
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `English English English English English English English: [${field}]`;
    }

    // 3. English English English English English English English Schema (ValidationError)
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = Object.values(err.errors).map(val => val.message).join(' - ');
    }

    // 4. English English English JWT English
    if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'English English English English English';
    }

    if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'English English English English. English English English English';
    }

    res.status(statusCode).json({
        success: false,
        message: message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};

module.exports = { notFound, errorHandler };
