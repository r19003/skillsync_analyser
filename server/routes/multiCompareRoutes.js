const express = require('express');
const router = express.Router();
const { runMultiComparison, getComparisons, getComparisonById } = require('../controllers/multiCompareController');
const { protect } = require('../middleware/authMiddleware');

router.post('/run', protect, runMultiComparison);
router.get('/', protect, getComparisons);
router.get('/:id', protect, getComparisonById);

module.exports = router;
