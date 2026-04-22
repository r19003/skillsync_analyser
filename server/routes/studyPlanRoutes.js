const express = require('express');
const router = express.Router();
const { generateStudyPlan, getStudyPlan } = require('../controllers/studyPlanController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateStudyPlan);
router.get('/:analysisId', protect, getStudyPlan);

module.exports = router;
