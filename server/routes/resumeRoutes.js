const express = require('express');
const multer = require('multer');
const router = express.Router();

const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  uploadResume,
  getMyResumes,
  getResumeById,
  deleteResume,
} = require('../controllers/resumeController');

// All resume routes require authentication
router.use(protect);

// ─────────────────────────────────────────────────────────────────────────────
// Multer error wrapper
// Catches file-type rejections and file-size errors before they hit the
// global error handler — returns a clean JSON 400 response instead of crashing.
// ─────────────────────────────────────────────────────────────────────────────
const handleUpload = (req, res, next) => {
  upload.single('resume')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // Multer-specific errors (e.g. file too large)
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File is too large. Maximum allowed size is 5MB.',
        });
      }
      return res.status(400).json({ success: false, message: err.message });
    } else if (err) {
      // Custom errors thrown in fileFilter (e.g. "Only PDF files are allowed.")
      return res.status(400).json({ success: false, message: err.message });
    }
    next(); // No error — proceed to controller
  });
};

// POST   /api/resume/upload  — upload PDF + extract text + parse
router.post('/upload', handleUpload, uploadResume);

// GET    /api/resume/         — list all user's resumes (no extracted text)
router.get('/', getMyResumes);

// GET    /api/resume/:id      — get single resume with full extracted text
router.get('/:id', getResumeById);

// DELETE /api/resume/:id      — delete resume document + physical PDF file
router.delete('/:id', deleteResume);

module.exports = router;
