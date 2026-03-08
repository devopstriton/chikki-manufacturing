const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

router.get('/stats', dashboardController.getStats);
router.get('/insights', dashboardController.getInsights);
router.get('/scatter-data', dashboardController.getScatterData);

module.exports = router;
