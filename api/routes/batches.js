const express = require('express');
const router = express.Router();
const batchController = require('../controllers/batchController');

router.post('/', batchController.createBatch);
router.get('/active', batchController.getActiveBatch);
router.get('/', batchController.getBatches);
router.patch('/:id/complete', batchController.completeBatch);
router.delete('/:id', batchController.deleteBatch);

router.post('/:id/raw-materials', batchController.addRawMaterial);
router.post('/:id/roasting-readings', batchController.addRoastingReading);
router.post('/:id/jaggery-readings', batchController.addJaggeryReading);

module.exports = router;
