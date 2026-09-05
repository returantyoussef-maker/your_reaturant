// ==============================================================================
// 1. English English English English English English English English English English English
// ==============================================================================
const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const compression = require('compression');
const createLimiter = require('./middleware/conditionalRateLimit');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// English English English English English English English
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

// English English English English APIs
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const couponRoutes = require('./routes/couponRoutes');
const deliveryAreaRoutes = require('./routes/deliveryAreaRoutes');
const tableRoutes = require('./routes/tableRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const adminRoutes = require('./routes/adminRoutes');

// English English English MongoDB Atlas
// ⚡ The server must not accept HTTP traffic before the database is ready,
// otherwise requests hang on Mongoose buffering and fail with timeouts.
const dbReady = connectDB();

const app = express();
const server = http.createServer(app);

// 🔒 English English English English English English English English English English English
const uploadDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// 🔒 English English English English (Reverse Proxy) English Rate Limiting English IP English English
app.set('trust proxy', 1);

// ⚡ English English English: English English English English English English English English
app.use(compression());

// 🔒 English English English Helmet English English English English English EnglishCDNs English
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginResourcePolicy: { policy: "cross-origin" },
        crossOriginEmbedderPolicy: false
    })
);

// 🔒 English English Origins English CORS English Socket.io English English credentials: true
const parseAllowedOrigins = () => {
    if (!process.env.CLIENT_URL || process.env.CLIENT_URL.trim() === '' || process.env.CLIENT_URL === '*') {
        return true; // English English English English Credentials
    }
    return process.env.CLIENT_URL.split(',').map(url => url.trim().replace(/\/$/, ''));
};

const allowedOrigins = parseAllowedOrigins();

// English CORS English English English
app.use(cors({
    origin: (origin, callback) => {
        if (allowedOrigins === true || !origin) {
            return callback(null, true);
        }
        if (Array.isArray(allowedOrigins) && allowedOrigins.includes(origin.replace(/\/$/, ''))) {
            return callback(null, true);
        }
        return callback(null, true); // English English English English English English
    },
    credentials: true,
    maxAge: 86400 // English English English preflight English 24 English
}));

// 🔒 English English English English English English English English English
// ⚡ English English English English NODE_ENV=production (English middleware/conditionalRateLimit.js)
const limiter = createLimiter({
    windowMs: 15 * 60 * 1000,
    max: 500,
    skip: (req) => req.ip === '127.0.0.1' || req.ip === '::1', // ⚡ English English English English
    standardHeaders: true,
    legacyHeaders: false,
    message: { status: 429, message: 'English English English English English English English English.' }
});
app.use('/api', limiter);

// English Socket.io English English English
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => callback(null, true),
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true
    }
});

// Middleware English English
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// English English English NoSQL Injection
app.use(mongoSanitize());

// ⚡ English English English English English English Caching
const staticOptions = {
    maxAge: '7d', // English English English 7 English English English
    etag: true
};

app.use(express.static(path.join(__dirname, 'public'), staticOptions));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads'), staticOptions));
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), staticOptions)); // English English English

// English socketio English English English English req.app.get('socketio')
app.set('socketio', io);

// ==============================================================================
// 📁 English API English English English English English English (Multer Upload Engine)
// ==============================================================================
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'file-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // English English 10 English English
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('English English English English English (PNG, JPG, WEBP, SVG)'));
        }
    }
});

// English English English English English English English
app.post('/api/upload', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'English English English English English English' });
        }
        const fileUrl = `/uploads/${req.file.filename}`;
        return res.json({
            success: true,
            message: '🎉 English English English English!',
            url: fileUrl
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

// ==============================================================================
// 🏠 English English English English (Clean HTML Routes)
// ==============================================================================
app.get('/admin_restaurant_food', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_restaurant_food.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin_restaurant_food.html'));
});

app.get('/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'menu.html'));
});

app.get('/checkout', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'checkout.html'));
});

app.get('/invoice/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'invoice.html'));
});

app.get('/product-details', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'product-details.html'));
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// English English English WebSockets
// ============================================================================
// 🖨️ English English English English Socket.io English English English English English
// English English English English English English English - English English English English English English English English
// ============================================================================
let primaryPrinterSocketId = null;
let primaryPrinterName = null;

io.on('connection', (socket) => {
    console.log('⚡ English English English English:', socket.id);
    
    socket.on('join-room', (roomId) => {
        socket.join(roomId);
    });

    // 🖨️ English English English English English English
    // English English English English English English English - English English English English
    socket.on('claim-primary-printer', (payload) => {
        try {
            // English English English English English English English - English English English
            if (primaryPrinterSocketId && primaryPrinterSocketId !== socket.id) {
                // English English English English English English English English
                const existing = io.sockets.sockets.get(primaryPrinterSocketId);
                if (existing) {
                    // English English - English English English English English English English
                    socket.emit('primary-printer-claimed', { socketId: primaryPrinterSocketId, printerName: primaryPrinterName });
                    return;
                }
                // English English English - English English
                primaryPrinterSocketId = null;
                primaryPrinterName = null;
            }
            // English English English English
            primaryPrinterSocketId = socket.id;
            primaryPrinterName = (payload && payload.printerName) || null;
            // English English English English English English English English English English English English
            io.emit('primary-printer-claimed', { socketId: socket.id, printerName: primaryPrinterName });
        } catch (err) {
            console.error('Primary printer claim error:', err && err.message);
        }
    });

    // 🖨️ English English English English English English English English
    socket.on('release-primary-printer', () => {
        if (primaryPrinterSocketId === socket.id) {
            primaryPrinterSocketId = null;
            primaryPrinterName = null;
            io.emit('primary-printer-released', {});
        }
    });

    socket.on('disconnect', () => {
        // English English English English - English English English English English English English English
        if (primaryPrinterSocketId === socket.id) {
            primaryPrinterSocketId = null;
            primaryPrinterName = null;
            io.emit('primary-printer-released', {});
        }
    });
});

// ==============================================================================
// 🔗 English English English English APIs
// ==============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/delivery-areas', deliveryAreaRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);

// English English English English
app.use(notFound);
app.use(errorHandler);

// ==============================================================================
// 🛡️ English English English English English English English
// ==============================================================================
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection Error:', err && err.stack ? err.stack : err);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception Error:', err && err.stack ? err.stack : err);
});

const PORT = process.env.PORT || 3000;
dbReady
    .then(() => {
        server.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 English English English English English English [${process.env.NODE_ENV || 'development'}] English English: ${PORT}`);
            console.log(`🔒 English English English: http://localhost:${PORT}/admin_restaurant_food`);
        });
    })
    .catch((err) => {
        console.error(`❌ Server startup aborted — database connection failed: ${err && err.message ? err.message : err}`);
        process.exit(1);
    });
