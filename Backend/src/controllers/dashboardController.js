const prisma = require('../config/prisma');
const { successResponse } = require('../utils/helpers');

// [GET] /api/dashboard/stats (Admin / Staff only)
async function getStats(req, res, next) {
  try {
    const [
      total_users,
      total_products,
      total_orders,
      revenueResult,
      statusGroups,
      lowStock,
      recent,
    ] = await Promise.all([
      // 1. Total users
      prisma.user.count({ where: { role: 'customer' } }),

      // 2. Total products
      prisma.product.count({ where: { status: { not: 'archived' } } }),

      // 3. Total orders
      prisma.order.count(),

      // 4. Revenue
      prisma.order.aggregate({
        _sum: { total_amount: true },
        where: {
          OR: [{ payment_status: 'paid' }, { order_status: 'completed' }],
        },
      }),

      // 5. Orders by status
      prisma.order.groupBy({
        by: ['order_status'],
        _count: { order_id: true },
      }),

      // 6. Low stock variants (stock <= 5)
      prisma.productVariant.findMany({
        where: { stock: { lte: 5 } },
        orderBy: { stock: 'asc' },
        take: 10,
        include: {
          product: {
            select: {
              product_id: true,
              product_name: true,
              thumbnail_url: true,
            },
          },
        },
      }),

      // 7. Recent 5 orders
      prisma.order.findMany({
        orderBy: { created_at: 'desc' },
        take: 5,
        include: {
          user: {
            select: {
              full_name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const orders_by_status = statusGroups.map((g) => ({
      order_status: g.order_status,
      count: g._count.order_id,
    }));

    const low_stock_items = lowStock.map((v) => ({
      variant_id: v.variant_id,
      sku: v.sku,
      variant_name: v.variant_name,
      stock: v.stock,
      product_id: v.product?.product_id,
      product_name: v.product?.product_name,
      thumbnail_url: v.product?.thumbnail_url,
    }));

    const recent_orders = recent.map((o) => ({
      order_id: o.order_id,
      order_code: o.order_code,
      total_amount: o.total_amount,
      order_status: o.order_status,
      payment_status: o.payment_status,
      created_at: o.created_at,
      customer_name: o.user?.full_name || 'Khách hàng',
      customer_email: o.user?.email || '',
    }));

    return successResponse(
      res,
      {
        summary: {
          total_users,
          total_products,
          total_orders,
          total_revenue: revenueResult._sum?.total_amount ? Number(revenueResult._sum.total_amount) : 0,
        },
        orders_by_status,
        low_stock_items,
        recent_orders,
      },
      'Thống kê tổng quan trang quản trị'
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getStats,
};
