const express = require('express');
const { protect } = require('../middleware/auth');
const formController = require('../controllers/formController');
const aiController = require('../controllers/aiController');
const analyticsController = require('../controllers/analyticsController');

const router = express.Router();
router.use(protect);

router.get('/', formController.listForms);
router.post('/', formController.createForm);
router.post('/generate-ai', aiController.generateForm);
router.get('/:id', formController.getForm);
router.put('/:id', formController.updateForm);
router.delete('/:id', formController.deleteForm);
router.post('/:id/duplicate', formController.duplicateForm);
router.get('/:id/versions', formController.getFormVersions);
router.post('/:id/restore/:version', formController.restoreFormVersion);

router.get('/:id/responses', analyticsController.getResponses);
router.get('/:id/responses/export', analyticsController.exportCsv);
router.get('/:id/analytics', analyticsController.getAnalytics);
router.get('/:id/health-score', analyticsController.getHealthScore);
router.get('/:id/responses/:responseId/comments', analyticsController.getComments);
router.post('/:id/responses/:responseId/comments', analyticsController.addComment);

module.exports = router;
