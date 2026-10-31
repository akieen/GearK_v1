const prisma = require('../config/prisma');
const { generateOrderCode, successResponse, errorResponse } = require('../utils/helpers');

// Core order creation logic reusable by createOrder and VNPay payment callback
async function executeOrderCreation(tx, {
  userId,
  address_id,
  recipient_name,
  recipient_phone,
  street_address,
  payment_method = 'COD',
  coupon_code,
  items: customItems,
  payment_status = 'unpaid',
  paid_at = null,
  order_status = null,
}) {
  const parsedUserId = BigInt(userId);

  // 1. Resolve Address
  let finalAddressId = address_id ? BigInt(address_id) : null;
  if (!finalAddressId) {
    if (!recipient_name || !recipient_phone || !street_address) {
      const err = new Error('Vui lòng cung cấp địa chỉ nhận hàng (address_id hoặc thông tin người nhận)');
      err.status = 400;
      throw err;
    }
    const newAddr = await tx.address.create({
      data: {
        user_id: parsedUserId,
        recipient_name: recipient_name.trim(),
        recipient_phone: recipient_phone.trim(),
        street_address: street_address.trim(),
      },
    });
    finalAddressId = newAddr.address_id;
  }

  // 2. Resolve Items
  let orderItemsData = [];
  if (Array.isArray(customItems) && customItems.length > 0) {
    orderItemsData = customItems;
  } else {
    // Get from the user's latest cart
    const userCart = await tx.cart.findFirst({
      where: { user_id: parsedUserId },
      orderBy: { cart_id: 'desc' },
      include: {
        items: {
          select: { variant_id: true, quantity: true },
        },
      },
    });

    if (!userCart || userCart.items.length === 0) {
      const err = new Error('Giỏ hàng của bạn đang trống, không thể tạo đơn hàng');
      err.status = 400;
      throw err;
    }
    orderItemsData = userCart.items;
  }

  // Consolidate order items if any duplicate variants exist
  const itemMap = new Map();
  for (const item of orderItemsData) {
    const vId = item.variant_id ? BigInt(item.variant_id) : null;
    const qty = Number(item.quantity) || 1;
    if (!vId || qty <= 0) continue;
    const vIdKey = vId.toString();
    itemMap.set(vIdKey, { variant_id: vId, quantity: (itemMap.get(vIdKey)?.quantity || 0) + qty });
  }

  if (itemMap.size === 0) {
    const err = new Error('Không có sản phẩm hợp lệ trong đơn hàng để thanh toán');
    err.status = 400;
    throw err;
  }

  // 3. Validate stock & calculate subtotal
  let subtotal = 0;
  const itemsToInsert = [];

  for (const { variant_id, quantity } of itemMap.values()) {
    const variant = await tx.productVariant.findUnique({
      where: { variant_id },
      include: {
        product: { select: { product_name: true } },
      },
    });

    if (!variant) {
      const err = new Error(`Sản phẩm với mã phiên bản ${variant_id} không tồn tại`);
      err.status = 404;
      throw err;
    }

    if (variant.stock < quantity) {
      const err = new Error(
        `Sản phẩm "${variant.product.product_name} - ${variant.variant_name}" chỉ còn ${variant.stock} sản phẩm trong kho (bạn đặt ${quantity})`
      );
      err.status = 400;
      throw err;
    }

    const unitPrice = variant.sale_price !== null ? Number(variant.sale_price) : Number(variant.price);
    const lineTotal = unitPrice * quantity;
    subtotal += lineTotal;

    itemsToInsert.push({
      variant_id: variant.variant_id,
      product_name: variant.product.product_name,
      variant_name: variant.variant_name,
      unit_price: unitPrice,
      quantity,
      line_total: lineTotal,
      current_stock: variant.stock,
    });
  }

  // 4. Handle Coupon discount
  let discountAmount = 0;
  let appliedCouponId = null;

  if (coupon_code) {
    const cp = await tx.coupon.findUnique({
      where: { coupon_code: coupon_code.trim().toUpperCase() },
    });

    if (cp) {
      const now = new Date();
      if (cp.start_date && new Date(cp.start_date) > now) {
        const err = new Error(
          `Mã giảm giá chưa đến ngày có hiệu lực (bắt đầu từ ${new Date(cp.start_date).toLocaleDateString('vi-VN')})`
        );
        err.status = 400;
        throw err;
      }
      if (cp.end_date && new Date(cp.end_date) < now) {
        const err = new Error('Mã giảm giá đã hết hạn sử dụng');
        err.status = 400;
        throw err;
      }
      if (cp.usage_limit !== null && cp.used_count >= cp.usage_limit) {
        const err = new Error('Mã giảm giá đã hết lượt sử dụng');
        err.status = 400;
        throw err;
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
  const finalOrderStatus = order_status || (payment_status === 'paid' ? 'confirmed' : 'pending');

  // 5. Insert into orders
  const newOrder = await tx.order.create({
    data: {
      user_id: parsedUserId,
      address_id: finalAddressId,
      order_code: orderCode,
      total_amount: totalAmount,
      order_status: finalOrderStatus,
      payment_status,
    },
  });

  const orderId = newOrder.order_id;

  // 6. Insert order items & update inventory
  for (const it of itemsToInsert) {
    await tx.orderItem.create({
      data: {
        order_id: orderId,
        variant_id: it.variant_id,
        product_name: it.product_name,
        variant_name: it.variant_name,
        unit_price: it.unit_price,
        quantity: it.quantity,
        line_total: it.line_total,
      },
    });

    // Deduct stock
    const newStock = it.current_stock - it.quantity;
    await tx.productVariant.update({
      where: { variant_id: it.variant_id },
      data: { stock: newStock },
    });

    // Record inventory transaction
    await tx.inventoryTransaction.create({
      data: {
        variant_id: it.variant_id,
        created_by: parsedUserId,
        transaction_type: 'sale',
        quantity_delta: -it.quantity,
        stock_after: newStock,
      },
    });
  }

  // 7. Insert coupon if applied
  if (appliedCouponId && discountAmount > 0) {
    await tx.orderCoupon.create({
      data: {
        order_id: orderId,
        coupon_id: appliedCouponId,
        discount_amount: discountAmount,
      },
    });

    await tx.coupon.update({
      where: { coupon_id: appliedCouponId },
      data: { used_count: { increment: 1 } },
    });
  }

  // 8. Insert status history
  await tx.orderStatusHistory.create({
    data: {
      order_id: orderId,
      changed_by: parsedUserId,
      old_status: null,
      new_status: finalOrderStatus,
    },
  });

  // 9. Insert payment record
  const paymentRecordStatus = payment_status === 'paid' ? 'success' : 'pending';
  await tx.payment.create({
    data: {
      order_id: orderId,
      payment_method,
      amount: totalAmount,
      payment_status: paymentRecordStatus,
      paid_at: paid_at || (payment_status === 'paid' ? new Date() : null),
    },
  });

  // 10. Clear cart for the user after checkout
  const userCart = await tx.cart.findUnique({
    where: { user_id: parsedUserId },
  });
  if (userCart) {
    await tx.cartItem.deleteMany({
      where: { cart_id: userCart.cart_id },
    });
  }

  return {
    order_id: orderId,
    order_code: orderCode,
    total_amount: totalAmount,
    discount_amount: discountAmount,
    order_status: finalOrderStatus,
    payment_status,
  };
}

// [POST] /api/orders
async function createOrder(req, res, next) {
  try {
    const orderData = await prisma.$transaction(async (tx) => {
      return executeOrderCreation(tx, {
        userId: req.user.user_id,
        address_id: req.body.address_id,
        recipient_name: req.body.recipient_name,
        recipient_phone: req.body.recipient_phone,
        street_address: req.body.street_address,
        payment_method: req.body.payment_method || 'COD',
        coupon_code: req.body.coupon_code,
        items: req.body.items,
        payment_status: 'unpaid',
      });
    });

    return successResponse(res, orderData, 'Đặt hàng thành công', 201);
  } catch (error) {
    next(error);
  }
}

// [GET] /api/orders
async function getUserOrders(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);

    const orders = await prisma.order.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
      include: {
        address: true,
        user: { select: { full_name: true } },
        payments: {
          orderBy: { payment_id: 'desc' },
          take: 1,
        },
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { thumbnail_url: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    const formattedOrders = orders.map((o) => {
      const payment_method = o.payments[0]?.payment_method || 'COD';
      const recipient_name = o.address?.recipient_name || o.user?.full_name || 'Khách hàng';
      const recipient_phone = o.address?.recipient_phone || '';
      const street_address = o.address?.street_address || '';

      const items = o.items.map((it) => ({
        order_item_id: it.order_item_id,
        order_id: it.order_id,
        variant_id: it.variant_id,
        product_name: it.product_name,
        variant_name: it.variant_name,
        unit_price: it.unit_price,
        quantity: it.quantity,
        line_total: it.line_total,
        thumbnail_url: it.variant?.product?.thumbnail_url || null,
        product_slug: it.variant?.product?.slug || null,
      }));

      return {
        order_id: o.order_id,
        user_id: o.user_id,
        address_id: o.address_id,
        order_code: o.order_code,
        total_amount: o.total_amount,
        order_status: o.order_status,
        payment_status: o.payment_status,
        created_at: o.created_at,
        updated_at: o.updated_at,
        recipient_name,
        recipient_phone,
        street_address,
        shipping_address: street_address,
        payment_method,
        items,
      };
    });

    return successResponse(res, formattedOrders, 'Danh sách đơn hàng của bạn');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/orders/:codeOrId
async function getOrderDetail(req, res, next) {
  try {
    const { codeOrId } = req.params;
    const userId = BigInt(req.user.user_id);
    const isAdmin = req.user.role === 'admin' || req.user.role === 'staff';

    const isNumeric = !isNaN(codeOrId);
    const whereCondition = isNumeric
      ? { order_id: BigInt(codeOrId) }
      : { order_code: codeOrId };

    if (!isAdmin) {
      whereCondition.user_id = userId;
    }

    const order = await prisma.order.findFirst({
      where: whereCondition,
      include: {
        user: { select: { full_name: true, email: true } },
        address: true,
        items: {
          include: {
            variant: {
              include: {
                product: {
                  select: { thumbnail_url: true, slug: true },
                },
              },
            },
          },
        },
        payments: { orderBy: { created_at: 'desc' } },
        status_history: {
          orderBy: { changed_at: 'asc' },
          include: {
            user: { select: { full_name: true } },
          },
        },
        coupons: {
          include: { coupon: { select: { coupon_code: true } } },
        },
      },
    });

    if (!order) {
      return errorResponse(res, 'Không tìm thấy đơn hàng', 404);
    }

    const items = order.items.map((it) => ({
      order_item_id: it.order_item_id,
      order_id: it.order_id,
      variant_id: it.variant_id,
      product_name: it.product_name,
      variant_name: it.variant_name,
      unit_price: it.unit_price,
      quantity: it.quantity,
      line_total: it.line_total,
      thumbnail_url: it.variant?.product?.thumbnail_url || null,
      product_slug: it.variant?.product?.slug || null,
    }));

    const history = order.status_history.map((h) => ({
      history_id: h.history_id,
      order_id: h.order_id,
      changed_by: h.changed_by,
      old_status: h.old_status,
      new_status: h.new_status,
      changed_at: h.changed_at,
      changed_by_name: h.user?.full_name || null,
    }));

    const couponData = order.coupons.length > 0
      ? {
          order_id: order.coupons[0].order_id,
          coupon_id: order.coupons[0].coupon_id,
          discount_amount: order.coupons[0].discount_amount,
          coupon_code: order.coupons[0].coupon?.coupon_code || '',
        }
      : null;

    const result = {
      order_id: order.order_id,
      user_id: order.user_id,
      address_id: order.address_id,
      order_code: order.order_code,
      total_amount: order.total_amount,
      order_status: order.order_status,
      payment_status: order.payment_status,
      created_at: order.created_at,
      updated_at: order.updated_at,
      customer_name: order.user?.full_name || 'Khách hàng',
      customer_email: order.user?.email || '',
      recipient_name: order.address?.recipient_name || order.user?.full_name || '',
      recipient_phone: order.address?.recipient_phone || '',
      street_address: order.address?.street_address || '',
      items,
      payments: order.payments,
      history,
      coupons: couponData,
    };

    return successResponse(res, result, 'Chi tiết đơn hàng');
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

    const whereConditions = {};

    const effectiveStatus = order_status || status;
    if (effectiveStatus) {
      whereConditions.order_status = effectiveStatus;
    }

    if (payment_status) {
      whereConditions.payment_status = payment_status;
    }

    if (search && search.trim() !== '') {
      const kw = search.trim();
      whereConditions.OR = [
        { order_code: { contains: kw } },
        { user: { full_name: { contains: kw } } },
        { user: { email: { contains: kw } } },
        { address: { recipient_name: { contains: kw } } },
        { address: { recipient_phone: { contains: kw } } },
      ];
    }

    const [total, orders] = await Promise.all([
      prisma.order.count({ where: whereConditions }),
      prisma.order.findMany({
        where: whereConditions,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limitNum,
        include: {
          user: { select: { full_name: true, email: true } },
          address: true,
          payments: {
            orderBy: { payment_id: 'desc' },
            take: 1,
            select: { payment_method: true },
          },
        },
      }),
    ]);

    const formattedOrders = orders.map((o) => ({
      order_id: o.order_id,
      user_id: o.user_id,
      address_id: o.address_id,
      order_code: o.order_code,
      total_amount: o.total_amount,
      order_status: o.order_status,
      payment_status: o.payment_status,
      created_at: o.created_at,
      updated_at: o.updated_at,
      customer_name: o.user?.full_name || 'Khách hàng',
      customer_email: o.user?.email || '',
      email: o.user?.email || '',
      recipient_name: o.address?.recipient_name || o.user?.full_name || 'Khách hàng',
      recipient_phone: o.address?.recipient_phone || '',
      shipping_address: o.address?.street_address || '',
      street_address: o.address?.street_address || '',
      payment_method: o.payments[0]?.payment_method || 'COD',
    }));

    return successResponse(
      res,
      {
        items: formattedOrders,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
      'Danh sách tất cả đơn hàng'
    );
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/orders/:id/status (Admin / Staff only)
async function updateOrderStatus(req, res, next) {
  try {
    const orderId = BigInt(req.params.id);
    const targetOrderStatus = req.body.order_status || req.body.status;
    const targetPaymentStatus = req.body.payment_status;
    const changedBy = BigInt(req.user.user_id);

    const oldOrder = await prisma.order.findUnique({
      where: { order_id: orderId },
      include: { items: true },
    });

    if (!oldOrder) {
      return errorResponse(res, 'Đơn hàng không tồn tại', 404);
    }

    await prisma.$transaction(async (tx) => {
      if (targetOrderStatus && targetOrderStatus !== oldOrder.order_status) {
        await tx.order.update({
          where: { order_id: orderId },
          data: { order_status: targetOrderStatus },
        });

        // Record status history
        await tx.orderStatusHistory.create({
          data: {
            order_id: orderId,
            changed_by: changedBy,
            old_status: oldOrder.order_status,
            new_status: targetOrderStatus,
          },
        });

        // If cancelled, restore variant inventory
        if (targetOrderStatus === 'cancelled' && oldOrder.order_status !== 'cancelled') {
          for (const item of oldOrder.items) {
            if (item.variant_id) {
              await tx.productVariant.update({
                where: { variant_id: item.variant_id },
                data: { stock: { increment: item.quantity } },
              });
            }
          }
        }

        // If completed, automatically mark payment as paid if unpaid
        if (targetOrderStatus === 'completed' && oldOrder.payment_status !== 'paid') {
          await tx.order.update({
            where: { order_id: orderId },
            data: { payment_status: 'paid' },
          });

          await tx.payment.updateMany({
            where: { order_id: orderId },
            data: {
              payment_status: 'success',
              paid_at: new Date(),
            },
          });
        }
      }

      if (targetPaymentStatus && targetPaymentStatus !== oldOrder.payment_status) {
        await tx.order.update({
          where: { order_id: orderId },
          data: { payment_status: targetPaymentStatus },
        });

        if (targetPaymentStatus === 'paid') {
          await tx.payment.updateMany({
            where: { order_id: orderId },
            data: {
              payment_status: 'success',
              paid_at: new Date(),
            },
          });
        }
      }
    });

    return successResponse(res, null, 'Cập nhật trạng thái đơn hàng thành công');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/orders/:id/cancel (Khách hàng tự hủy đơn khi đơn còn ở trạng thái pending)
async function cancelOrder(req, res, next) {
  try {
    const orderId = BigInt(req.params.id);
    const userId = BigInt(req.user.user_id);

    const order = await prisma.order.findFirst({
      where: {
        order_id: orderId,
        user_id: userId,
      },
      include: { items: true },
    });

    if (!order) {
      return errorResponse(res, 'Không tìm thấy đơn hàng của bạn', 404);
    }

    if (order.order_status !== 'pending') {
      return errorResponse(res, 'Chỉ có thể hủy đơn hàng đang ở trạng thái "Chờ xác nhận"', 400);
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { order_id: orderId },
        data: { order_status: 'cancelled' },
      });

      await tx.orderStatusHistory.create({
        data: {
          order_id: orderId,
          changed_by: userId,
          old_status: order.order_status,
          new_status: 'cancelled',
        },
      });

      for (const item of order.items) {
        if (item.variant_id) {
          await tx.productVariant.update({
            where: { variant_id: item.variant_id },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    });

    return successResponse(res, null, 'Hủy đơn hàng thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createOrder,
  executeOrderCreation,
  getUserOrders,
  getOrderDetail,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
