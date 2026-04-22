const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const { protect } = require('../middleware/authMiddleware');
const {
  createAnalysis,
  getMyAnalyses,
  getAnalysisById,
  deleteAnalysis,
} = require('../controllers/analysisController');

// All analysis routes require authentication
router.use(protect);

// Validation rules for creating an analysis
const analysisValidation = [
  body('resumeId')
    .notEmpty().withMessage('resumeId is required')
    .isMongoId().withMessage('resumeId must be a valid MongoDB ID'),

  body('jobDescription')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 50 }).withMessage('Job description must be at least 50 characters'),
];

// POST   /api/analysis/       — run analysis on resume + JD
router.post('/', analysisValidation, createAnalysis);

// GET    /api/analysis/        — list all analyses for the user
router.get('/', getMyAnalyses);

// GET    /api/analysis/:id     — get one full analysis
router.get('/:id', getAnalysisById);

// DELETE /api/analysis/:id     — delete an analysis
router.delete('/:id', deleteAnalysis);

module.exports = router;
