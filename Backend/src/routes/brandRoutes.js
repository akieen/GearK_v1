const express = require('express');
const router = express.Router();
const brandController = require('../controllers/brandController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

router.get('/', brandController.getBrands);
router.get('/:slug', brandController.getBrandBySlug);

// Admin only
router.post('/', verifyToken, requireRoles('admin'), brandController.createBrand);
router.put('/:id', verifyToken, requireRoles('admin'), brandController.updateBrand);
router.delete('/:id', verifyToken, requireRoles('admin'), brandController.deleteBrand);

module.exports = router;
