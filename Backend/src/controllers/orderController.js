const { pool } = require('../config/db');
const { generateOrderCode, successResponse, errorResponse } = require('../utils/helpers');

// [POST] /api/orders
async function createOrder(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const userId = req.user.user_id;
    const {
      address_id,
      recipient_name,
      recipient_phone,
      street_address,
      payment_method = 'COD',
      coupon_code,
      items: customItems
    } = req.body;

    // 1. Resolve Address
    let finalAddressId = address_id;
    if (!finalAddressId) {
      if (!recipient_name || !recipient_phone || !street_address) {
        return errorResponse(res, 'Vui lòng cung cấp địa chỉ nhận hàng (address_id hoặc thông tin người nhận)', 400);
      }
      const [addrResult] = await connection.query(
        'INSERT INTO addresses (user_id, recipient_name, recipient_phone, street_address) VALUES (?, ?, ?, ?)',
        [userId, recipient_name, recipient_phone, street_address]
      );
      finalAddressId = addrResult.insertId;
    }

    // 2. Resolve Items
    let orderItemsData = [];

    if (Array.isArray(customItems) && customItems.length > 0) {
      orderItemsData = customItems;
    } else {
      // Get from the user's latest cart
      const [userCarts] = await connection.query(
        'SELECT cart_id FROM carts WHERE user_id = ? ORDER BY cart_id DESC LIMIT 1',
        [userId]
      );
      if (userCarts.length === 0) {
        await connection.rollback();
        return errorResponse(res, 'Giỏ hàng của bạn đang trống, không thể tạo đơn hàng', 400);
      }
      const cartId = userCarts[0].cart_id;

      const [cartRows] = await connection.query(
        `SELECT ci.variant_id, ci.quantity 
         FROM cart_items ci
         WHERE ci.cart_id = ?`,
        [cartId]
      );
      if (cartRows.length === 0) {
        await connection.rollback();
        return errorResponse(res, 'Giỏ hàng của bạn đang trống, không thể tạo đơn hàng', 400);
      }
      orderItemsData = cartRows;
    }

    // Consolidate order items if any duplicate variants exist
    const itemMap = new Map();
    for (const item of orderItemsData) {
      const vId = Number(item.variant_id);
      const qty = Number(item.quantity) || 1;
      if (!vId || qty <= 0) continue;
      itemMap.set(vId, (itemMap.get(vId) || 0) + qty);
    }

    if (itemMap.size === 0) {
      await connection.rollback();
      return errorResponse(res, 'Không có sản phẩm hợp lệ trong đơn hàng để thanh toán', 400);
    }

    // 3. Validate stock & calculate subtotal
    let subtotal = 0;
    const itemsToInsert = [];

    for (const [variantId, quantity] of itemMap.entries()) {
      const [variantRows] = await connection.query(
        `SELECT v.variant_id, v.variant_name, v.price, v.sale_price, v.stock, p.product_name
         FROM product_variants v
         JOIN products p ON v.product_id = p.product_id
         WHERE v.variant_id = ? FOR UPDATE`,
        [variantId]
      );

      if (variantRows.length === 0) {
        await connection.rollback();
        return errorResponse(res, `Sản phẩm với mã phiên bản ${variantId} không tồn tại`, 404);
      }

      const variant = variantRows[0];

      if (variant.stock < quantity) {
        await connection.rollback();
        return errorResponse(
          res,
          `Sản phẩm "${variant.product_name} - ${variant.variant_name}" chỉ còn ${variant.stock} sản phẩm trong kho (bạn đặt ${quantity})`,
          400
        );
      }

      const unitPrice = variant.sale_price !== null ? Number(variant.sale_price) : Number(variant.price);
      const lineTotal = unitPrice * quantity;
      subtotal += lineTotal;

      itemsToInsert.push({
        variant_id: variant.variant_id,
        product_name: variant.product_name,
        variant_name: variant.variant_name,
        unit_price: unitPrice,
        quantity,
        line_total: lineTotal,
        current_stock: variant.stock
      });
    }

    // 4. Handle Coupon discount
    let discountAmount = 0;
    let appliedCouponId = null;

    if (coupon_code) {
      const [coupons] = await connection.query(
        'SELECT * FROM coupons WHERE coupon_code = ? LIMIT 1',
        [coupon_code]
      );
      if (coupons.length > 0) {
        const cp = coupons[0];
        const now = new Date();

        // Kiểm tra thời hạn hiệu lực của mã
        if (cp.start_date && new Date(cp.start_date) > now) {
          await connection.rollback();
          return errorResponse(res, `Mã giảm giá chưa đến ngày có hiệu lực (bắt đầu từ ${new Date(cp.start_date).toLocaleDateString('vi-VN')})`, 400);
        }
        if (cp.end_date && new Date(cp.end_date) < now) {
          await connection.rollback();
          return errorResponse(res, 'Mã giảm giá đã hết hạn sử dụng', 400);
        }

        // Kiểm tra giới hạn lượt dùng
        if (cp.usage_limit !== null && cp.used_count >= cp.usage_limit) {
          await connection.rollback();
          return errorResponse(res, 'Mã giảm giá đã hết lượt sử dụng', 400);
        }
        appliedCouponId = cp.coupon_id;
        if (cp.discount_type === 'percent') {
          discountAmount = (subtotal * Number(cp.discount_value)) / 100;
        } else {
          discountAmount = Number(cp.discount_value);
        }
        discountAmount = Math.min(discountAmount, subtotal);
      }
    }

    const totalAmount = Math.max(0, subtotal - discountAmount);
    const orderCode = generateOrderCode();

    // 5. Insert into orders
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, address_id, order_code, total_amount, order_status, payment_status)
       VALUES (?, ?, ?, ?, 'pending', 'unpaid')`,
      [userId, finalAddressId, orderCode, totalAmount]
    );
    const orderId = orderResult.insertId;

    // 6. Insert order items & update inventory
    for (const it of itemsToInsert) {
      await connection.query(
        `INSERT INTO order_items (order_id, variant_id, product_name, variant_name, unit_price, quantity, line_total)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [orderId, it.variant_id, it.product_name, it.variant_name, it.unit_price, it.quantity, it.line_total]
      );

      // Deduct stock
      const newStock = it.current_stock - it.quantity;
      await connection.query('UPDATE product_variants SET stock = ? WHERE variant_id = ?', [newStock, it.variant_id]);

      // Record inventory transaction
      await connection.query(
        `INSERT INTO inventory_transactions (variant_id, created_by, transaction_type, quantity_delta, stock_after)
         VALUES (?, ?, 'sale', ?, ?)`,
        [it.variant_id, userId, -it.quantity, newStock]
      );
    }

    // 7. Insert coupon if applied
    if (appliedCouponId && discountAmount > 0) {
      await connection.query(
        'INSERT INTO order_coupons (order_id, coupon_id, discount_amount) VALUES (?, ?, ?)',
        [orderId, appliedCouponId, discountAmount]
      );
      // Tăng số lượt đã dùng
      await connection.query(
        'UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = ?',
        [appliedCouponId]
      );
    }

    // 8. Insert status history
    await connection.query(
      'INSERT INTO order_status_history (order_id, changed_by, old_status, new_status) VALUES (?, ?, NULL, "pending")',
      [orderId, userId]
    );

    // 9. Insert payment record
    await connection.query(
      `INSERT INTO payments (order_id, payment_method, amount, payment_status)
       VALUES (?, ?, ?, 'pending')`,
      [orderId, payment_method, totalAmount]
    );

    // 10. Always clear cart for the user after checkout
    await connection.query(
      `DELETE ci FROM cart_items ci
       JOIN carts c ON ci.cart_id = c.cart_id
       WHERE c.user_id = ?`,
      [userId]
    );

    await connection.commit();

    return successResponse(
      res,
      {
        order_id: orderId,
        order_code: orderCode,
        total_amount: totalAmount,
        discount_amount: discountAmount,
        order_status: 'pending',
        payment_status: 'unpaid'
      },
      'Đặt hàng thành công',
      201
    );
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// [GET] /api/orders
async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.user_id;

    const [orders] = await pool.query(
      `SELECT o.*, 
              COALESCE(a.recipient_name, u.full_name) AS recipient_name, 
              a.recipient_phone, 
              a.street_address,
              a.street_address AS shipping_address,
              (SELECT payment_method FROM payments WHERE order_id = o.order_id ORDER BY payment_id DESC LIMIT 1) AS payment_method
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       LEFT JOIN addresses a ON o.address_id = a.address_id
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
      [userId]
    );

    if (orders.length === 0) {
      return successResponse(res, [], 'Danh sách đơn hàng của bạn');
    }

    const orderIds = orders.map(o => o.order_id);
    const [items] = await pool.query(
      `SELECT oi.*, p.thumbnail_url, p.slug AS product_slug
       FROM order_items oi
       LEFT JOIN product_variants v ON oi.variant_id = v.variant_id
       LEFT JOIN products p ON v.product_id = p.product_id
       WHERE oi.order_id IN (?)`,
      [orderIds]
    );

    const ordersWithItems = orders.map(o => ({
      ...o,
      items: items.filter(it => it.order_id === o.order_id)
    }));

    return successResponse(res, ordersWithItems, 'Danh sách đơn hàng của bạn');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/orders/:codeOrId
async function getOrderDetail(req, res, next) {
  try {
    const { codeOrId } = req.params;
    const userId = req.user.user_id;
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    let condition = isNaN(codeOrId) ? 'o.order_code = ?' : 'o.order_id = ?';
    let params = [codeOrId];

    if (!isAdmin) {
      condition += ' AND o.user_id = ?';
      params.push(userId);
    }

    const [orders] = await pool.query(
      `SELECT o.*, u.full_name AS customer_name, u.email AS customer_email,
              a.recipient_name, a.recipient_phone, a.street_address
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       LEFT JOIN addresses a ON o.address_id = a.address_id
       WHERE ${condition}
       LIMIT 1`,
      params
    );

    if (orders.length === 0) {
      return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    }

    const order = orders[0];

    // Order items
    const [items] = await pool.query(
      `SELECT oi.*, p.thumbnail_url, p.slug AS product_slug
       FROM order_items oi
       LEFT JOIN product_variants v ON oi.variant_id = v.variant_id
       LEFT JOIN products p ON v.product_id = p.product_id
       WHERE oi.order_id = ?`,
      [order.order_id]
    );

    // Payments
    const [payments] = await pool.query(
      'SELECT * FROM payments WHERE order_id = ? ORDER BY created_at DESC',
      [order.order_id]
    );

    // Status history
    const [history] = await pool.query(
      `SELECT h.*, u.full_name AS changed_by_name
       FROM order_status_history h
       LEFT JOIN users u ON h.changed_by = u.user_id
       WHERE h.order_id = ?
       ORDER BY h.changed_at ASC`,
      [order.order_id]
    );

    // Coupon discount
    const [coupons] = await pool.query(
      `SELECT oc.*, c.coupon_code 
       FROM order_coupons oc
       JOIN coupons c ON oc.coupon_id = c.coupon_id
       WHERE oc.order_id = ?`,
      [order.order_id]
    );

    return successResponse(res, {
      ...order,
      items,
      payments,
      history,
      coupons: coupons[0] || null
    }, 'Chi tiết đơn hàng');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/orders/admin/all (Admin / Staff only)
async function getAllOrders(req, res, next) {
  try {
    const { order_status, status, payment_status, search, page = 1, limit = 100 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = [];
    const params = [];

    const effectiveStatus = order_status || status;
    if (effectiveStatus) {
      whereConditions.push('o.order_status = ?');
      params.push(effectiveStatus);
    }
    if (payment_status) {
      whereConditions.push('o.payment_status = ?');
      params.push(payment_status);
    }
    if (search) {
      whereConditions.push('(o.order_code LIKE ? OR u.full_name LIKE ? OR u.email LIKE ? OR a.recipient_name LIKE ? OR a.recipient_phone LIKE ?)');
      const kw = `%${search.trim()}%`;
      params.push(kw, kw, kw, kw, kw);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const [countResult] = await pool.query(
      `SELECT COUNT(*) AS total 
       FROM orders o 
       JOIN users u ON o.user_id = u.user_id 
       LEFT JOIN addresses a ON o.address_id = a.address_id
       ${whereClause}`,
      params
    );
    const total = countResult[0].total;

    const [orders] = await pool.query(
      `SELECT 
         o.*, 
         u.full_name AS customer_name, 
         u.email AS customer_email,
         u.email AS email,
         COALESCE(a.recipient_name, u.full_name) AS recipient_name,
         a.recipient_phone,
         a.street_address AS shipping_address,
         a.street_address,
         (SELECT payment_method FROM payments WHERE order_id = o.order_id ORDER BY payment_id DESC LIMIT 1) AS payment_method
       FROM orders o
       JOIN users u ON o.user_id = u.user_id
       LEFT JOIN addresses a ON o.address_id = a.address_id
       ${whereClause}
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    return successResponse(res, {
      items: orders,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    }, 'Danh sách tất cả đơn hàng');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/orders/:id/status (Admin / Staff only)
async function updateOrderStatus(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const targetOrderStatus = req.body.order_status || req.body.status;
    const targetPaymentStatus = req.body.payment_status;
    const changedBy = req.user.user_id;

    const [existing] = await connection.query('SELECT * FROM orders WHERE order_id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Đơn hàng không tồn tại', 404);
    }

    const oldOrder = existing[0];

    if (targetOrderStatus && targetOrderStatus !== oldOrder.order_status) {
      await connection.query(
        'UPDATE orders SET order_status = ? WHERE order_id = ?',
        [targetOrderStatus, id]
      );

      // Record status history
      await connection.query(
        'INSERT INTO order_status_history (order_id, changed_by, old_status, new_status) VALUES (?, ?, ?, ?)',
        [id, changedBy, oldOrder.order_status, targetOrderStatus]
      );

      // If cancelled, restore variant inventory
      if (targetOrderStatus === 'cancelled' && oldOrder.order_status !== 'cancelled') {
        const [items] = await connection.query(
          'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
          [id]
        );
        for (const item of items) {
          if (item.variant_id) {
            await connection.query(
              'UPDATE product_variants SET stock = stock + ? WHERE variant_id = ?',
              [item.quantity, item.variant_id]
            );
          }
        }
      }

      // If completed, automatically mark payment as paid if unpaid
      if (targetOrderStatus === 'completed' && oldOrder.payment_status !== 'paid') {
        await connection.query(
          'UPDATE orders SET payment_status = "paid" WHERE order_id = ?',
          [id]
        );
        await connection.query(
          'UPDATE payments SET payment_status = "success", paid_at = CURRENT_TIMESTAMP WHERE order_id = ?',
          [id]
        );
      }
    }

    if (targetPaymentStatus && targetPaymentStatus !== oldOrder.payment_status) {
      await connection.query(
        'UPDATE orders SET payment_status = ? WHERE order_id = ?',
        [targetPaymentStatus, id]
      );

      if (targetPaymentStatus === 'paid') {
        await connection.query(
          'UPDATE payments SET payment_status = "success", paid_at = CURRENT_TIMESTAMP WHERE order_id = ?',
          [id]
        );
      }
    }

    await connection.commit();
    return successResponse(res, null, 'Cập nhật trạng thái đơn hàng thành công');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

// [PUT] /api/orders/:id/cancel (Khách hàng tự hủy đơn khi đơn còn ở trạng thái pending)
async function cancelOrder(req, res, next) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const userId = req.user.user_id;

    const [orders] = await connection.query(
      'SELECT * FROM orders WHERE order_id = ? AND user_id = ? FOR UPDATE',
      [id, userId]
    );

    if (orders.length === 0) {
      await connection.rollback();
      return errorResponse(res, 'Không tìm thấy đơn hàng của bạn', 404);
    }

    const order = orders[0];
    if (order.order_status !== 'pending') {
      await connection.rollback();
      return errorResponse(res, 'Chỉ có thể hủy đơn hàng đang ở trạng thái "Chờ xác nhận"', 400);
    }

    // Update status to cancelled
    await connection.query(
      'UPDATE orders SET order_status = "cancelled" WHERE order_id = ?',
      [id]
    );

    // Record status history
    await connection.query(
      'INSERT INTO order_status_history (order_id, changed_by, old_status, new_status) VALUES (?, ?, ?, "cancelled")',
      [id, userId, order.order_status]
    );

    // Restore inventory stock
    const [items] = await connection.query(
      'SELECT variant_id, quantity FROM order_items WHERE order_id = ?',
      [id]
    );
    for (const item of items) {
      if (item.variant_id) {
        await connection.query(
          'UPDATE product_variants SET stock = stock + ? WHERE variant_id = ?',
          [item.quantity, item.variant_id]
        );
      }
    }

    await connection.commit();
    return successResponse(res, null, 'Hủy đơn hàng thành công');
  } catch (error) {
    await connection.rollback();
    next(error);
  } finally {
    connection.release();
  }
}

module.exports = {
  createOrder,
  getUserOrders,
  getOrderDetail,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};
