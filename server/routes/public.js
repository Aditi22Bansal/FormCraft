const express = require('express');
const publicController = require('../controllers/publicController');

const router = express.Router();
router.get('/:slug', publicController.getPublicForm);
router.post('/:slug/submit', publicController.submitResponse);
router.post('/:slug/followup', publicController.submitFollowUp);

module.exports = router;
