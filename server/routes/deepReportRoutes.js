const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  generateDeepReport,
  getDeepReport,
  updateTaskStatus,
  updateMilestoneStatus,
  getStudyPlanById
} = require('../controllers/deepReportController');

// ── POST /api/deep-report/generate
// Trigger Grok + Gemini full report generation
router.post('/generate', protect, generateDeepReport);

// ── PATCH /api/deep-report/task/:taskId
router.patch('/task/:taskId', protect, updateTaskStatus);

// ── PATCH /api/deep-report/milestone/:milestoneId
router.patch('/milestone/:milestoneId', protect, updateMilestoneStatus);

// ── GET  /api/deep-report/study-plan/:planId  (MUST be before /:analysisId)
router.get('/study-plan/:planId', protect, getStudyPlanById);

// ── GET  /api/deep-report/:analysisId
router.get('/:analysisId', protect, getDeepReport);

module.exports = router;
