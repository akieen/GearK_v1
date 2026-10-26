const express = require('express');
const router = express.Router();

const { pool } = require('../config/db');
const authRoutes = require('./authRoutes');
const categoryRoutes = require('./categoryRoutes');
const brandRoutes = require('./brandRoutes');
const productRoutes = require('./productRoutes');
const cartRoutes = require('./cartRoutes');
const orderRoutes = require('./orderRoutes');
const reviewRoutes = require('./reviewRoutes');
const couponRoutes = require('./couponRoutes');
const addressRoutes = require('./addressRoutes');
const wishlistRoutes = require('./wishlistRoutes');
const dashboardRoutes = require('./dashboardRoutes');
const uploadRoutes = require('./uploadRoutes');
const inventoryRoutes = require('./inventoryRoutes');

// API Health Check & Database connection status
router.get('/health', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT 1 + 1 AS result');
    res.json({
      success: true,
      status: 'UP',
      database: 'Connected',
      database_name: process.env.DB_NAME || 'geark_db',
      db_port: process.env.DB_PORT || 3306,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'DOWN',
      database: 'Disconnected',
      error: error.message
    });
  }
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/reviews', reviewRoutes);
router.use('/coupons', couponRoutes);
router.use('/addresses', addressRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/upload', uploadRoutes);
router.use('/inventory', inventoryRoutes);

module.exports = router;
