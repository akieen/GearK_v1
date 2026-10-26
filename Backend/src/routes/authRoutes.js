const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

// Admin user & staff management (Admin only)
router.get('/users', verifyToken, requireRoles('admin'), authController.getAllUsers);
router.post('/staff', verifyToken, requireRoles('admin'), authController.createStaff);
router.put('/users/:id/role', verifyToken, requireRoles('admin'), authController.updateUserRole);
router.delete('/users/:id', verifyToken, requireRoles('admin'), authController.deleteUser);

module.exports = router;
