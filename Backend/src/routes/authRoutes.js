const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/verify-otp', authController.verifyOtpAndRegister);
router.post('/resend-otp', authController.resendOtp);
router.post('/login', authController.login);
router.post('/google', authController.googleLogin);

// Quên mật khẩu & Đặt lại mật khẩu qua OTP
router.post('/forgot-password', authController.forgotPassword);
router.post('/verify-reset-otp', authController.verifyResetOtp);
router.post('/resend-reset-otp', authController.resendResetOtp);
router.post('/reset-password', authController.resetPassword);

router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

// Admin user & staff management (Admin only)
router.get('/users', verifyToken, requireRoles('admin'), authController.getAllUsers);
router.post('/staff', verifyToken, requireRoles('admin'), authController.createStaff);
router.put('/users/:id/role', verifyToken, requireRoles('admin'), authController.updateUserRole);
router.delete('/users/:id', verifyToken, requireRoles('admin'), authController.deleteUser);

module.exports = router;
