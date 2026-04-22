const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

/**
 * Multer disk storage configuration.
 * Files are saved as: uploads/<userId>_<timestamp>_<originalname>
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const userId = req.user ? req.user._id : 'unknown';
    const timestamp = Date.now();
    const safeOriginalName = file.originalname.replace(/\s+/g, '_');
    const fileName = `${userId}_${timestamp}_${safeOriginalName}`;
    cb(null, fileName);
  },
});

/**
 * File filter: only allow PDF files.
 */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true); // Accept
  } else {
    cb(new Error('Only PDF files are allowed.'), false); // Reject
  }
};

/**
 * Multer upload middleware.
 * - Accepts single file with field name "resume"
 * - Max size: 5MB
 */
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
});

module.exports = upload;
