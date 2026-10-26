const express = require('express');
const router = express.Router();
const multer = require('multer');
const productController = require('../controllers/productController');
const variantController = require('../controllers/variantController');
const { verifyToken, requireRoles } = require('../middlewares/auth');
const { upload } = require('../middlewares/upload');
const { errorResponse } = require('../utils/helpers');

// Helper wrapper for multer errors
function handleUpload(middleware) {
  return (req, res, next) => {
    middleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'Dung lượng ảnh vượt quá giới hạn 10MB', 400);
        }
        return errorResponse(res, `Lỗi tải tệp: ${err.message}`, 400);
      } else if (err) {
        return errorResponse(res, err.message, 400);
      }
      next();
    });
  };
}

// Public endpoints
router.get('/', productController.getProducts);
router.get('/id/:id', productController.getProductById);
router.get('/:slug', productController.getProductBySlug);

// Admin / Staff product management
router.post(
  '/',
  verifyToken,
  requireRoles('admin', 'staff'),
  handleUpload(upload.any()),
  productController.createProduct
);
router.put('/:id', verifyToken, requireRoles('admin', 'staff'), productController.updateProduct);
router.delete('/:id', verifyToken, requireRoles('admin'), productController.deleteProduct);

// Product images endpoints
router.get('/:id/images', productController.getProductImages);
router.post(
  '/:id/images',
  verifyToken,
  requireRoles('admin', 'staff'),
  handleUpload(upload.any()),
  productController.addProductImage
);
router.delete('/images/:imageId', verifyToken, requireRoles('admin', 'staff'), productController.deleteProductImage);
router.put('/images/:imageId/primary', verifyToken, requireRoles('admin', 'staff'), productController.setPrimaryProductImage);

// Admin / Staff variant management (using separated variantController)
router.post(
  '/:id/variants',
  verifyToken,
  requireRoles('admin', 'staff'),
  handleUpload(upload.any()),
  variantController.addVariant
);
router.put('/variants/:variantId', verifyToken, requireRoles('admin', 'staff'), variantController.updateVariant);
router.delete('/variants/:variantId', verifyToken, requireRoles('admin'), variantController.deleteVariant);

// Variant images endpoints
router.get('/variants/:variantId/images', variantController.getVariantImages);
router.post(
  '/variants/:variantId/images',
  verifyToken,
  requireRoles('admin', 'staff'),
  handleUpload(upload.any()),
  variantController.addVariantImage
);
router.delete('/variants/images/:imageId', verifyToken, requireRoles('admin', 'staff'), variantController.deleteVariantImage);
router.put('/variants/images/:imageId/primary', verifyToken, requireRoles('admin', 'staff'), variantController.setPrimaryVariantImage);

module.exports = router;
