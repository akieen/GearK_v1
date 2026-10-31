const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/reviews/product/:productId
async function getProductReviews(req, res, next) {
  try {
    const { productId } = req.params;

    const [reviews] = await pool.query(`
      SELECT 
        r.review_id,
        r.rating,
        r.content,
        r.created_at,
        u.user_id,
        u.full_name,
        u.full_name AS user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      WHERE r.product_id = ?
      ORDER BY r.created_at DESC
    `, [productId]);

    return successResponse(res, reviews, 'Danh sách đánh giá sản phẩm');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/reviews/check-eligibility/:productId
// Kiểm tra user hiện tại đã mua sản phẩm hay chưa
async function checkEligibility(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { productId } = req.params;

    // 1. Kiểm tra xem user đã từng đánh giá sản phẩm này chưa
    const [existing] = await pool.query(
      `SELECT review_id, rating, content, created_at 
       FROM reviews 
       WHERE user_id = ? AND product_id = ? 
       LIMIT 1`,
      [userId, productId]
    );

    if (existing.length > 0) {
      return successResponse(res, {
        can_review: false,
        already_reviewed: true,
        review: existing[0],
        message: 'Bạn đã đánh giá sản phẩm này rồi.'
      }, 'Trạng thái quyền đánh giá');
    }

    // 2. Kiểm tra xem user có đơn hàng hợp lệ chứa sản phẩm này không
    const [purchases] = await pool.query(`
      SELECT oi.order_item_id, o.order_id, o.order_status
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN product_variants pv ON oi.variant_id = pv.variant_id
      WHERE o.user_id = ?
        AND pv.product_id = ?
      ORDER BY 
        CASE 
          WHEN o.order_status = 'completed' THEN 1
          WHEN o.order_status IN ('shipping', 'processing', 'confirmed') THEN 2
          WHEN o.order_status = 'pending' THEN 3
          ELSE 4
        END ASC,
        o.created_at DESC
    `, [userId, productId]);

    if (purchases.length === 0) {
      return successResponse(res, {
        can_review: false,
        already_reviewed: false,
        reason: 'not_purchased',
        message: 'Chỉ khách hàng đã mua và nhận sản phẩm thành công tại GearK mới có thể gửi nhận xét.'
      }, 'Trạng thái quyền đánh giá');
    }

    // Chỉ cho phép đánh giá nếu đơn hàng đã hoàn tất thành công (order_status === 'completed')
    const completedPurchases = purchases.filter(p => p.order_status === 'completed');

    if (completedPurchases.length === 0) {
      const activeOrder = purchases.find(p => ['pending', 'confirmed', 'processing', 'shipping'].includes(p.order_status));
      if (activeOrder) {
        return successResponse(res, {
          can_review: false,
          already_reviewed: false,
          reason: 'order_in_progress',
          message: 'Đơn hàng của bạn đang được xử lý hoặc giao hàng. Bạn chỉ có thể đánh giá sau khi đã nhận hàng thành công (Trạng thái: Đã hoàn thành).'
        }, 'Trạng thái quyền đánh giá');
      }

      return successResponse(res, {
        can_review: false,
        already_reviewed: false,
        reason: 'order_cancelled',
        message: 'Đơn hàng của bạn đã bị hủy hoặc hoàn tiền nên không thể gửi đánh giá.'
      }, 'Trạng thái quyền đánh giá');
    }

    return successResponse(res, {
      can_review: true,
      already_reviewed: false,
      order_item_id: completedPurchases[0].order_item_id,
      message: 'Bạn đủ điều kiện đánh giá sản phẩm này.'
    }, 'Trạng thái quyền đánh giá');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/reviews
async function createReview(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { product_id, rating, content, order_item_id } = req.body;

    if (!product_id || !rating) {
      return errorResponse(res, 'Vui lòng cung cấp mã sản phẩm và điểm đánh giá (1-5)', 400);
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return errorResponse(res, 'Điểm đánh giá phải từ 1 đến 5 sao', 400);
    }

    // 1. Kiểm tra đã đánh giá chưa
    const [existing] = await pool.query(
      `SELECT review_id FROM reviews WHERE user_id = ? AND product_id = ? LIMIT 1`,
      [userId, product_id]
    );
    if (existing.length > 0) {
      return errorResponse(res, 'Bạn đã gửi đánh giá cho sản phẩm này rồi!', 400);
    }

    // 2. Kiểm tra xem user đã mua sản phẩm này thành công (order_status = 'completed') hay chưa
    const [purchases] = await pool.query(`
      SELECT oi.order_item_id, o.order_status
      FROM orders o
      JOIN order_items oi ON o.order_id = oi.order_id
      JOIN product_variants pv ON oi.variant_id = pv.variant_id
      WHERE o.user_id = ?
        AND pv.product_id = ?
      ORDER BY 
        CASE 
          WHEN o.order_status = 'completed' THEN 1
          WHEN o.order_status IN ('shipping', 'processing', 'confirmed') THEN 2
          WHEN o.order_status = 'pending' THEN 3
          ELSE 4
        END ASC,
        o.created_at DESC
    `, [userId, product_id]);

    if (purchases.length === 0) {
      return errorResponse(res, 'Chỉ khách hàng đã mua và nhận sản phẩm thành công tại GearK mới có thể gửi nhận xét!', 403);
    }

    const completedPurchases = purchases.filter(p => p.order_status === 'completed');

    if (completedPurchases.length === 0) {
      const activeOrder = purchases.find(p => ['pending', 'confirmed', 'processing', 'shipping'].includes(p.order_status));
      if (activeOrder) {
        return errorResponse(
          res,
          'Đơn hàng của bạn chưa hoàn tất. Bạn chỉ có thể gửi nhận xét sau khi đơn hàng đã được giao thành công (Trạng thái: Đã hoàn thành)!',
          400
        );
      }
      return errorResponse(res, 'Đơn hàng chứa sản phẩm này đã bị hủy hoặc hoàn tiền nên không thể gửi nhận xét!', 400);
    }

    const finalOrderItemId = order_item_id || completedPurchases[0].order_item_id || null;

    const [result] = await pool.query(
      `INSERT INTO reviews (user_id, product_id, order_item_id, rating, content)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, product_id, finalOrderItemId, numRating, content || null]
    );

    return successResponse(
      res,
      { review_id: result.insertId },
      'Đánh giá sản phẩm thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/reviews/:id
async function deleteReview(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user.role === 'admin';

    let condition = 'review_id = ?';
    let params = [id];

    if (!isAdmin) {
      condition += ' AND user_id = ?';
      params.push(userId);
    }

    const [result] = await pool.query(`DELETE FROM reviews WHERE ${condition}`, params);
    if (result.affectedRows === 0) {
      return errorResponse(res, 'Đánh giá không tồn tại hoặc bạn không có quyền xóa', 404);
    }

    return successResponse(res, null, 'Xóa đánh giá thành công');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/reviews (Admin & Staff)
async function getAllReviewsAdmin(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const { rating, search } = req.query;

    const conditions = ['1=1'];
    const params = [];

    if (rating && !isNaN(rating)) {
      conditions.push('r.rating = ?');
      params.push(parseInt(rating));
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(p.product_name LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR r.content LIKE ?)');
      params.push(term, term, term, term);
    }

    const whereClause = conditions.join(' AND ');

    // 1. Thống kê tổng quan đánh giá
    const [summaryRows] = await pool.query(`
      SELECT 
        COUNT(*) AS total_reviews,
        COALESCE(AVG(rating), 5.0) AS avg_rating,
        SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS count_5_star,
        SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS count_4_star,
        SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS count_3_star,
        SUM(CASE WHEN rating <= 2 THEN 1 ELSE 0 END) AS count_low_star
      FROM reviews
    `);

    const summary = summaryRows[0] || {
      total_reviews: 0,
      avg_rating: 5.0,
      count_5_star: 0,
      count_4_star: 0,
      count_3_star: 0,
      count_low_star: 0,
    };

    // 2. Đếm số lượng theo bộ lọc
    const [countRows] = await pool.query(`
      SELECT COUNT(*) AS total
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN products p ON r.product_id = p.product_id
      WHERE ${whereClause}
    `, params);

    const total = countRows[0]?.total || 0;

    // 3. Lấy danh sách đánh giá phân trang
    const queryParams = [...params, limit, offset];
    const [items] = await pool.query(`
      SELECT 
        r.review_id,
        r.product_id,
        r.user_id,
        r.order_item_id,
        r.rating,
        r.content,
        r.created_at,
        p.product_name,
        p.thumbnail_url,
        u.full_name,
        u.email
      FROM reviews r
      JOIN users u ON r.user_id = u.user_id
      JOIN products p ON r.product_id = p.product_id
      WHERE ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `, queryParams);

    return successResponse(res, {
      items,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        total_reviews: Number(summary.total_reviews) || 0,
        avg_rating: Number(summary.avg_rating) || 5.0,
        count_5_star: Number(summary.count_5_star) || 0,
        count_4_star: Number(summary.count_4_star) || 0,
        count_3_star: Number(summary.count_3_star) || 0,
        count_low_star: Number(summary.count_low_star) || 0,
      }
    }, 'Danh sách đánh giá sản phẩm (Admin)');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProductReviews,
  checkEligibility,
  createReview,
  deleteReview,
  getAllReviewsAdmin
};

