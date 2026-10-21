const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

// Public endpoints
router.get('/', productController.getProducts);
router.get('/:slug', productController.getProductBySlug);
router.get('/id/:id', productController.getProductById);

// Admin / Staff product management
router.post('/', verifyToken, requireRoles('admin', 'staff'), productController.createProduct);
router.put('/:id', verifyToken, requireRoles('admin', 'staff'), productController.updateProduct);
router.delete('/:id', verifyToken, requireRoles('admin'), productController.deleteProduct);

// Admin variant management
router.post('/:id/variants', verifyToken, requireRoles('admin', 'staff'), productController.addVariant);
router.put('/variants/:variantId', verifyToken, requireRoles('admin', 'staff'), productController.updateVariant);
router.delete('/variants/:variantId', verifyToken, requireRoles('admin'), productController.deleteVariant);

module.exports = router;
