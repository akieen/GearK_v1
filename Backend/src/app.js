const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Main API routes
app.use('/api', routes);

// API Documentation / Info endpoint
app.get('/api-info', (req, res) => {
  res.json({
    name: 'GearK E-Commerce REST API',
    version: '1.0.0',
    description: 'Node.js Express API kết nối MySQL geark_db trên localhost:3306',
    health_check: '/api/health',
    endpoints: {
      auth: '/api/auth (register, login, profile, users)',
      categories: '/api/categories',
      brands: '/api/brands',
      products: '/api/products',
      cart: '/api/cart',
      orders: '/api/orders',
      reviews: '/api/reviews',
      coupons: '/api/coupons',
      addresses: '/api/addresses',
      wishlist: '/api/wishlist',
      dashboard: '/api/dashboard/stats'
    }
  });
});

// Serve frontend static build if available
const frontendDistPath = path.join(__dirname, '../../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));

  // SPA fallback for Express 5: any non-API GET request returns index.html
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(frontendDistPath, 'index.html'));
    }
    next();
  });
} else {
  // If frontend not built yet, redirect to Vite dev server
  app.get('/', (req, res) => {
    res.redirect('http://localhost:5173');
  });
}

// 404 & Centralized Error Handlers
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;

