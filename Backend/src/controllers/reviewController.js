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

    const [result] = await pool.query(
      `INSERT INTO reviews (user_id, product_id, order_item_id, rating, content)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, product_id, order_item_id || null, numRating, content || null]
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

module.exports = {
  getProductReviews,
  createReview,
  deleteReview
};
