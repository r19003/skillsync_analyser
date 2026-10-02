/**
 * careerAnalyticsRoutes.js
 *
 * API Routes for SkillSync Career Intelligence & Skill-Gap Analytics Platform.
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');

const {
  getRoleProfiles,
  analyzeCareerReadiness,
  getCareerAnalysisById,
  getCareerAnalysisHistory,
  runWhatIfSimulation,
  updateRoadmapTask,
  getProgressAnalytics,
  importJobPosting,
  getMarketAnalyticsByTrack,
  getKeywordAnalytics,
  recalculateKeywords,
  getKeywordEvidence
} = require('../controllers/careerAnalyticsController');

// All career analytics routes require JWT authentication
router.use(protect);

// 1. Roles & Profiles
router.get('/roles', getRoleProfiles);

// 2. Core Analysis
router.post('/analyze', analyzeCareerReadiness);
router.get('/history', getCareerAnalysisHistory);
router.get('/:id', getCareerAnalysisById);

// 3. What-If Simulator
router.post('/:id/simulate', runWhatIfSimulation);

// 4. Learning Roadmap Task Status & Progress
router.patch('/:id/roadmap/task/:taskId', updateRoadmapTask);
router.get('/:id/progress', getProgressAnalytics);

// 5. Market Corpus & Custom Import
router.post('/job-data/import', importJobPosting);
router.get('/market/:roleTrack', getMarketAnalyticsByTrack);

// 6. ATS Keyword Intelligence
router.get('/:id/keywords', getKeywordAnalytics);
router.post('/:id/keywords/recalculate', recalculateKeywords);
router.get('/:id/keywords/:keyword/evidence', getKeywordEvidence);

module.exports = router;
