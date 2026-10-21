const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);

// Admin only
router.post('/', verifyToken, requireRoles('admin'), categoryController.createCategory);
router.put('/:id', verifyToken, requireRoles('admin'), categoryController.updateCategory);
router.delete('/:id', verifyToken, requireRoles('admin'), categoryController.deleteCategory);

module.exports = router;
