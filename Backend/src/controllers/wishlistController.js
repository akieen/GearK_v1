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
        p.thumbnail_url,
        b.brand_name
      FROM wishlist_items wi
      JOIN product_variants v ON wi.variant_id = v.variant_id
      JOIN products p ON v.product_id = p.product_id
      LEFT JOIN brands b ON p.brand_id = b.brand_id
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
    const { variant_id, product_id } = req.body;

    let targetVariantId = variant_id;

    // If variant_id is not provided, look up the default/first variant of this product
    if (!targetVariantId && product_id) {
      const [variants] = await pool.query(
        'SELECT variant_id FROM product_variants WHERE product_id = ? ORDER BY variant_id ASC LIMIT 1',
        [product_id]
      );
      if (variants.length > 0) {
        targetVariantId = variants[0].variant_id;
      } else {
        return errorResponse(res, 'Sản phẩm này chưa có biến thể nào trong hệ thống', 400);
      }
    }

    if (!targetVariantId) {
      return errorResponse(res, 'Vui lòng cung cấp mã sản phẩm (product_id) hoặc mã phiên bản (variant_id)', 400);
    }

    const wishlistId = await getOrCreateWishlistId(userId);

    // Check if item or product is already in wishlist
    let existingItem = null;
    if (variant_id) {
      const [existing] = await pool.query(
        'SELECT wishlist_item_id FROM wishlist_items WHERE wishlist_id = ? AND variant_id = ?',
        [wishlistId, targetVariantId]
      );
      if (existing.length > 0) existingItem = existing[0];
    } else if (product_id) {
      const [existing] = await pool.query(
        `SELECT wi.wishlist_item_id 
         FROM wishlist_items wi
         JOIN product_variants v ON wi.variant_id = v.variant_id
         WHERE wi.wishlist_id = ? AND v.product_id = ?
         LIMIT 1`,
        [wishlistId, product_id]
      );
      if (existing.length > 0) existingItem = existing[0];
    }

    if (existingItem) {
      await pool.query('DELETE FROM wishlist_items WHERE wishlist_item_id = ?', [existingItem.wishlist_item_id]);
      return successResponse(res, { in_wishlist: false }, 'Đã xóa khỏi danh sách yêu thích');
    } else {
      await pool.query('INSERT INTO wishlist_items (wishlist_id, variant_id) VALUES (?, ?)', [wishlistId, targetVariantId]);
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
