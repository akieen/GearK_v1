const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

router.post('/validate', couponController.validateCoupon);

// Admin / Staff management
router.get('/', verifyToken, requireRoles('admin', 'staff'), couponController.getCoupons);
router.post('/', verifyToken, requireRoles('admin'), couponController.createCoupon);
router.put('/:id', verifyToken, requireRoles('admin'), couponController.updateCoupon);
router.delete('/:id', verifyToken, requireRoles('admin'), couponController.deleteCoupon);

module.exports = router;
