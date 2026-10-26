const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { verifyToken, requireRoles } = require('../middlewares/auth');

// All inventory endpoints require Admin or Staff role
router.use(verifyToken, requireRoles('admin', 'staff'));

// Stock management
router.get('/', inventoryController.getInventory);
router.get('/transactions', inventoryController.getInventoryTransactions);
router.post('/import', inventoryController.importStock);
router.post('/export', inventoryController.exportStock);

// Suppliers
router.get('/suppliers', inventoryController.getSuppliers);
router.post('/suppliers', inventoryController.createSupplier);

module.exports = router;
