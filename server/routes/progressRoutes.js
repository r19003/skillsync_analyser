const express = require('express');
const router = express.Router();

const { getProgressOverview, updateTaskStatus, updateMilestoneStatus } = require('../controllers/progressController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:analysisId', protect, getProgressOverview);
router.patch('/task/:taskId', protect, updateTaskStatus);
router.patch('/milestone/:milestoneId', protect, updateMilestoneStatus);

module.exports = router;
