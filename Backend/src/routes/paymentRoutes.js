const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { verifyToken } = require('../middlewares/auth');

// Create payment URL (VNPay)
router.post('/create-payment', verifyToken, paymentController.createPayment);
router.post('/vnpay/create-payment', verifyToken, paymentController.createPayment);

// Callback from VNPay (Redirect from VNPay Gateway)
router.get('/vnpay_return', paymentController.vnpayReturn);
router.get('/vnpay/return', paymentController.vnpayReturn);

// Check transaction status
router.get('/vnpay/check-status/:txnRef', verifyToken, paymentController.checkTransactionStatus);

module.exports = router;
