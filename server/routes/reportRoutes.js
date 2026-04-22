const express = require('express');
const router = express.Router();
const { generateReport, getReport } = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate', protect, generateReport);
router.get('/:analysisId', protect, getReport);

module.exports = router;
