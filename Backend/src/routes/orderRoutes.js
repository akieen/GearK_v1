const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

router.use(verifyToken);

// Customer endpoints
router.post('/', orderController.createOrder);
router.get('/', orderController.getUserOrders);
router.get('/:codeOrId', orderController.getOrderDetail);

// Admin / Staff endpoints
router.get('/admin/all', requireRoles('admin', 'staff'), orderController.getAllOrders);
router.put('/:id/status', requireRoles('admin', 'staff'), orderController.updateOrderStatus);

module.exports = router;
