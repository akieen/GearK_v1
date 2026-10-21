const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

router.use(verifyToken, requireRoles('admin', 'staff'));

router.get('/stats', dashboardController.getStats);

module.exports = router;
