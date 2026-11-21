const express = require('express');
const router = express.Router();
const warrantyController = require('../controllers/warrantyController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

// Toàn bộ endpoint yêu cầu đăng nhập
router.use(verifyToken);

// Customer endpoints
router.post('/', warrantyController.createClaim);
router.get('/my-claims', warrantyController.getMyClaims);
router.get('/eligible-items', warrantyController.getEligibleItems);

// Admin / Staff endpoints
router.get('/admin/all', requireRoles('admin', 'staff'), warrantyController.getAllClaims);
router.put('/admin/:id/status', requireRoles('admin', 'staff'), warrantyController.updateClaimStatus);

module.exports = router;
