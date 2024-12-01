const multer = require('multer');
const path = require('path');
const { AppError } = require('./errorHandler');
const fs = require('fs');
const logger = require('./logger');

// Define the upload directory
const uploadDir = path.join(process.cwd(), 'uploads', 'profilePictures');

// Create upload directory if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  logger.info(`Created upload directory at ${uploadDir}`);
}

// Configure storage settings for multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, req.user._id + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter to validate file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Unsupported file type.', 400), false);
  }
};

// Initialize multer with defined settings
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;