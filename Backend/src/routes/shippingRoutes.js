const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

// Public / Customer Address & Shipping Information
router.get('/provinces', shippingController.getProvinces);
router.get('/districts', shippingController.getDistricts);
router.get('/wards', shippingController.getWards);
router.post('/services', shippingController.getAvailableServices);
router.post('/calculate-fee', shippingController.calculateFee);
router.get('/tracking/:code', shippingController.getTrackingInfo);

// GHN Webhook Callback (Public for GHN server)
router.post('/webhook/ghn', shippingController.webhookGHN);

// Admin / Staff Shipping Operations
router.post(
  '/admin/create-shipment/:orderId',
  verifyToken,
  requireRoles('admin', 'staff'),
  shippingController.createShipment
);

router.post(
  '/admin/cancel-shipment/:orderId',
  verifyToken,
  requireRoles('admin', 'staff'),
  shippingController.cancelShipment
);

router.get(
  '/admin/print-token/:orderCode',
  verifyToken,
  requireRoles('admin', 'staff'),
  shippingController.getPrintToken
);

module.exports = router;
