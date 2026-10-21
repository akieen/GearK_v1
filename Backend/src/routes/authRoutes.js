const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/profile', verifyToken, authController.getProfile);
router.put('/profile', verifyToken, authController.updateProfile);

// Admin user management
router.get('/users', verifyToken, requireRoles('admin'), authController.getAllUsers);
router.put('/users/:id/role', verifyToken, requireRoles('admin'), authController.updateUserRole);

module.exports = router;
