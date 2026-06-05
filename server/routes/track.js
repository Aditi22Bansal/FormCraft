const express = require('express');
const trackController = require('../controllers/trackController');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.post('/:formId', trackController.trackEvents);
router.get('/:formId/heatmap', protect, trackController.getHeatmapData);

module.exports = router;
