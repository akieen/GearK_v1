const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

// Helper to get or create cart for user
async function getOrCreateCartId(userId, connection = pool) {
  const [rows] = await connection.query('SELECT cart_id FROM carts WHERE user_id = ? ORDER BY cart_id DESC LIMIT 1', [userId]);
  if (rows.length > 0) {
    return rows[0].cart_id;
  }
  const [result] = await connection.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
  return result.insertId;
}

// [GET] /api/cart
async function getCart(req, res, next) {
  try {
    const userId = req.user.user_id;
    const cartId = await getOrCreateCartId(userId);

    const [items] = await pool.query(`
      SELECT 
        ci.cart_item_id,
        ci.quantity,
        ci.created_at,
        v.variant_id,
        v.sku,
        v.variant_name,
        v.price,
        v.sale_price,
        v.stock,
        p.product_id,
        p.product_name,
        p.slug AS product_slug,
        COALESCE(p.thumbnail_url, '') AS thumbnail_url,
        (COALESCE(v.sale_price, v.price) * ci.quantity) AS item_total
      FROM cart_items ci
      JOIN product_variants v ON ci.variant_id = v.variant_id
      JOIN products p ON v.product_id = p.product_id
      WHERE ci.cart_id = ?
      ORDER BY ci.created_at DESC
    `, [cartId]);

    const totalItems = items.reduce((sum, item) => sum + Number(item.quantity), 0);
    const subtotal = items.reduce((sum, item) => sum + Number(item.item_total), 0);

    return successResponse(res, {
      cart_id: cartId,
      items,
      total_items: totalItems,
      subtotal,
      total_amount: subtotal
    }, 'Lấy thông tin giỏ hàng thành công');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/cart/items
async function addToCart(req, res, next) {
  try {
    const userId = req.user.user_id;
    let { variant_id, quantity = 1, product_id } = req.body;

    // Fallback: If variant_id is not directly given but product_id is provided, pick default variant
    if (!variant_id && product_id) {
      const [vRows] = await pool.query(
        'SELECT variant_id FROM product_variants WHERE product_id = ? ORDER BY price ASC LIMIT 1',
        [product_id]
      );
      if (vRows.length > 0) {
        variant_id = vRows[0].variant_id;
      }
    }

    if (!variant_id || Number(quantity) <= 0) {
      return errorResponse(res, 'Vui lòng cung cấp mã phiên bản sản phẩm và số lượng hợp lệ', 400);
    }

    // Check variant existence & stock
    const [variants] = await pool.query(
      'SELECT variant_id, stock FROM product_variants WHERE variant_id = ?',
      [variant_id]
    );

    if (variants.length === 0) {
      return errorResponse(res, 'Phiên bản sản phẩm không tồn tại', 404);
    }

    const availableStock = variants[0].stock;
    const cartId = await getOrCreateCartId(userId);

    // Check if variant already in cart
    const [existing] = await pool.query(
      'SELECT cart_item_id, quantity FROM cart_items WHERE cart_id = ? AND variant_id = ?',
      [cartId, variant_id]
    );

    let newQuantity = quantity;
    if (existing.length > 0) {
      newQuantity = existing[0].quantity + quantity;
      if (newQuantity > availableStock) {
        return errorResponse(res, `Số lượng yêu cầu (${newQuantity}) vượt quá số lượng còn lại trong kho (${availableStock})`, 400);
      }
      await pool.query(
        'UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?',
        [newQuantity, existing[0].cart_item_id]
      );
    } else {
      if (quantity > availableStock) {
        return errorResponse(res, `Số lượng yêu cầu (${quantity}) vượt quá số lượng còn lại trong kho (${availableStock})`, 400);
      }
      await pool.query(
        'INSERT INTO cart_items (cart_id, variant_id, quantity) VALUES (?, ?, ?)',
        [cartId, variant_id, quantity]
      );
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/cart/items/:id
async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return errorResponse(res, 'Vui lòng cung cấp số lượng mới', 400);
    }

    const cartId = await getOrCreateCartId(userId);

    // If quantity <= 0, remove item
    if (quantity <= 0) {
      await pool.query('DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?', [id, cartId]);
      return getCart(req, res, next);
    }

    // Check available stock
    const [items] = await pool.query(
      `SELECT ci.cart_item_id, v.stock 
       FROM cart_items ci
       JOIN product_variants v ON ci.variant_id = v.variant_id
       WHERE ci.cart_item_id = ? AND ci.cart_id = ?`,
      [id, cartId]
    );

    if (items.length === 0) {
      return errorResponse(res, 'Sản phẩm trong giỏ hàng không tồn tại', 404);
    }

    if (quantity > items[0].stock) {
      return errorResponse(res, `Số lượng cập nhật (${quantity}) vượt quá tồn kho (${items[0].stock})`, 400);
    }

    await pool.query('UPDATE cart_items SET quantity = ? WHERE cart_item_id = ?', [quantity, id]);

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/cart/items/:id
async function removeCartItem(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;
    const cartId = await getOrCreateCartId(userId);

    const [result] = await pool.query('DELETE FROM cart_items WHERE cart_item_id = ? AND cart_id = ?', [id, cartId]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 'Sản phẩm không có trong giỏ hàng', 404);
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/cart
async function clearCart(req, res, next) {
  try {
    const userId = req.user.user_id;
    const cartId = await getOrCreateCartId(userId);

    await pool.query('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);
    return successResponse(res, null, 'Đã làm trống giỏ hàng thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
