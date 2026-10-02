const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const careerWorkspaceController = require('../controllers/careerWorkspaceController');

// All routes require JWT authentication
router.use(protect);

// 1. Overview
router.get('/:analysisId/overview', careerWorkspaceController.getWorkspaceOverview);

// 2. Personal Profile / Settings
router.get('/:analysisId/profile', careerWorkspaceController.getUserProfile);
router.post('/:analysisId/profile', careerWorkspaceController.saveUserProfile);

// 3. Skill Gaps
router.get('/:analysisId/skills', careerWorkspaceController.getSkillGaps);

// 4. Resume Evidence
router.get('/:analysisId/evidence', careerWorkspaceController.getResumeEvidence);
router.post('/:analysisId/evidence/feedback', careerWorkspaceController.submitEvidenceFeedback);

// 5. Market Insights
router.get('/:analysisId/market', careerWorkspaceController.getMarketInsights);

// 6. Adaptive Roadmap
router.get('/:analysisId/roadmap', careerWorkspaceController.getRoadmap);
router.patch('/:analysisId/roadmap/task/:taskId', careerWorkspaceController.updateTask);
router.patch('/:analysisId/roadmap/task/:taskId/replace-resource', careerWorkspaceController.replaceTaskResource);
router.post('/:analysisId/roadmap/replan-week', careerWorkspaceController.replanSingleWeek);

// 7. Personalized Resources
router.get('/:analysisId/resources', careerWorkspaceController.getPersonalizedResources);
router.post('/:analysisId/resources/feedback', careerWorkspaceController.submitResourceFeedback);

// 8. Diagnostic Assessments
router.get('/:analysisId/assessments', careerWorkspaceController.getAssessmentQuestions);
router.post('/:analysisId/assessments/submit', careerWorkspaceController.submitAssessment);

// 9. Progress Tracking
router.get('/:analysisId/progress', careerWorkspaceController.getProgressAnalytics);

module.exports = router;
