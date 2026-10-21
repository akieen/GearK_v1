const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getOrCreateWishlistId(userId) {
  const [rows] = await pool.query('SELECT wishlist_id FROM wishlists WHERE user_id = ? LIMIT 1', [userId]);
  if (rows.length > 0) {
    return rows[0].wishlist_id;
  }
  const [res] = await pool.query('INSERT INTO wishlists (user_id) VALUES (?)', [userId]);
  return res.insertId;
}

// [GET] /api/wishlist
async function getWishlist(req, res, next) {
  try {
    const userId = req.user.user_id;
    const wishlistId = await getOrCreateWishlistId(userId);

    const [items] = await pool.query(`
      SELECT 
        wi.wishlist_item_id,
        wi.created_at,
        v.variant_id,
        v.variant_name,
        v.price,
        v.sale_price,
        v.stock,
        p.product_id,
        p.product_name,
        p.slug,
        p.thumbnail_url
      FROM wishlist_items wi
      JOIN product_variants v ON wi.variant_id = v.variant_id
      JOIN products p ON v.product_id = p.product_id
      WHERE wi.wishlist_id = ?
      ORDER BY wi.created_at DESC
    `, [wishlistId]);

    return successResponse(res, items, 'Danh sách sản phẩm yêu thích');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/wishlist/toggle
async function toggleWishlist(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { variant_id } = req.body;

    if (!variant_id) {
      return errorResponse(res, 'Vui lòng cung cấp mã phiên bản sản phẩm (variant_id)', 400);
    }

    const wishlistId = await getOrCreateWishlistId(userId);

    const [existing] = await pool.query(
      'SELECT wishlist_item_id FROM wishlist_items WHERE wishlist_id = ? AND variant_id = ?',
      [wishlistId, variant_id]
    );

    if (existing.length > 0) {
      await pool.query('DELETE FROM wishlist_items WHERE wishlist_item_id = ?', [existing[0].wishlist_item_id]);
      return successResponse(res, { in_wishlist: false }, 'Đã xóa khỏi danh sách yêu thích');
    } else {
      await pool.query('INSERT INTO wishlist_items (wishlist_id, variant_id) VALUES (?, ?)', [wishlistId, variant_id]);
      return successResponse(res, { in_wishlist: true }, 'Đã thêm vào danh sách yêu thích');
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWishlist,
  toggleWishlist
};
