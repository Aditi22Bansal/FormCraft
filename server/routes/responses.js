const express = require('express');
const { protect } = require('../middleware/auth');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();
router.use(protect);
router.get('/:id', analyticsController.getResponse);
router.get('/:id/comments', analyticsController.getComments);
router.post('/:id/comments', analyticsController.addComment);

module.exports = router;
