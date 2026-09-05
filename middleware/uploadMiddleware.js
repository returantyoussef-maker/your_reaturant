const multer = require('multer');
const path = require('path');
const fs = require('fs');

// English English English English English English English English English English English
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// English English English English English
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // English English English English English English English English English English
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname).toLowerCase();
        cb(null, 'img-' + uniqueSuffix + ext);
    }
});

// English English English English English English (English English)
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp|gif/;
    const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimeType = allowedTypes.test(file.mimetype);

    if (extName && mimeType) {
        cb(null, true);
    } else {
        cb(new Error('🚫 English! English English English English English English English: (JPG, PNG, WEBP, GIF)'));
    }
};

// English Multer English English 5 English English English
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: fileFilter
});

module.exports = {
    uploadSingle: upload.single('image'),
    uploadMultiple: upload.array('images', 5) // English English English English 5 English English English English
};
