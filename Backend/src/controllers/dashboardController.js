const { pool } = require('../config/db');
const { successResponse } = require('../utils/helpers');

// [GET] /api/dashboard/stats (Admin / Staff only)
async function getStats(req, res, next) {
  try {
    // 1. Total users
    const [userCount] = await pool.query('SELECT COUNT(*) AS total_users FROM users WHERE role = "customer"');

    // 2. Total products
    const [productCount] = await pool.query('SELECT COUNT(*) AS total_products FROM products WHERE status != "archived"');

    // 3. Total orders and revenue
    const [orderSummary] = await pool.query(`
      SELECT 
        COUNT(*) AS total_orders,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' OR order_status = 'completed' THEN total_amount ELSE 0 END), 0) AS total_revenue
      FROM orders
    `);

    // 4. Orders grouped by status
    const [ordersByStatus] = await pool.query(`
      SELECT order_status, COUNT(*) AS count
      FROM orders
      GROUP BY order_status
    `);

    // 5. Low stock variants (stock <= 5)
    const [lowStockVariants] = await pool.query(`
      SELECT 
        v.variant_id,
        v.sku,
        v.variant_name,
        v.stock,
        p.product_id,
        p.product_name,
        p.thumbnail_url
      FROM product_variants v
      JOIN products p ON v.product_id = p.product_id
      WHERE v.stock <= 5
      ORDER BY v.stock ASC
      LIMIT 10
    `);

    // 6. Recent 5 orders
    const [recentOrders] = await pool.query(`
      SELECT 
        o.order_id,
        o.order_code,
        o.total_amount,
        o.order_status,
        o.payment_status,
        o.created_at,
        u.full_name AS customer_name,
        u.email AS customer_email
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      ORDER BY o.created_at DESC
      LIMIT 5
    `);

    return successResponse(res, {
      summary: {
        total_users: userCount[0].total_users,
        total_products: productCount[0].total_products,
        total_orders: orderSummary[0].total_orders,
        total_revenue: orderSummary[0].total_revenue
      },
      orders_by_status: ordersByStatus,
      low_stock_items: lowStockVariants,
      recent_orders: recentOrders
    }, 'Thống kê tổng quan trang quản trị');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats
};
