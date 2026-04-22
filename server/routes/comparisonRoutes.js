const express = require('express');
const router = express.Router();

const { runComparison } = require('../controllers/comparisonController');
const { protect } = require('../middleware/authMiddleware');

router.post('/run', protect, runComparison);

module.exports = router;
