const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/helpers');

// Helper to get or create cart for user
async function getOrCreateCartId(userId) {
  const existing = await prisma.cart.findUnique({
    where: { user_id: userId },
  });
  if (existing) {
    return existing.cart_id;
  }
  const created = await prisma.cart.create({
    data: { user_id: userId },
  });
  return created.cart_id;
}

// [GET] /api/cart
async function getCart(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const cartId = await getOrCreateCartId(userId);

    const items = await prisma.cartItem.findMany({
      where: { cart_id: cartId },
      orderBy: { created_at: 'desc' },
      include: {
        variant: {
          include: {
            product: {
              select: {
                product_id: true,
                product_name: true,
                slug: true,
                thumbnail_url: true,
              },
            },
          },
        },
      },
    });

    const formattedItems = items.map((ci) => {
      const price = Number(ci.variant?.price || 0);
      const sale_price = ci.variant?.sale_price !== null ? Number(ci.variant.sale_price) : null;
      const effectivePrice = sale_price !== null ? sale_price : price;
      const item_total = effectivePrice * ci.quantity;

      return {
        cart_item_id: ci.cart_item_id,
        quantity: ci.quantity,
        created_at: ci.created_at,
        variant_id: ci.variant?.variant_id,
        sku: ci.variant?.sku,
        variant_name: ci.variant?.variant_name,
        price,
        sale_price,
        stock: ci.variant?.stock || 0,
        product_id: ci.variant?.product?.product_id,
        product_name: ci.variant?.product?.product_name,
        product_slug: ci.variant?.product?.slug,
        thumbnail_url: ci.variant?.product?.thumbnail_url || '',
        item_total,
      };
    });

    const totalItems = formattedItems.reduce((sum, item) => sum + Number(item.quantity), 0);
    const subtotal = formattedItems.reduce((sum, item) => sum + Number(item.item_total), 0);

    return successResponse(
      res,
      {
        cart_id: cartId,
        items: formattedItems,
        total_items: totalItems,
        subtotal,
        total_amount: subtotal,
      },
      'Lấy thông tin giỏ hàng thành công'
    );
  } catch (error) {
    next(error);
  }
}

// [POST] /api/cart/items
async function addToCart(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    let { variant_id, quantity = 1, product_id } = req.body;
    const qty = parseInt(quantity, 10);

    // Fallback: If variant_id is not directly given but product_id is provided, pick default variant
    if (!variant_id && product_id) {
      const firstVariant = await prisma.productVariant.findFirst({
        where: { product_id: BigInt(product_id) },
        orderBy: { price: 'asc' },
      });
      if (firstVariant) {
        variant_id = firstVariant.variant_id;
      }
    }

    if (!variant_id || isNaN(qty) || qty <= 0) {
      return errorResponse(res, 'Vui lòng cung cấp mã phiên bản sản phẩm và số lượng hợp lệ', 400);
    }

    const parsedVariantId = BigInt(variant_id);

    const variant = await prisma.productVariant.findUnique({
      where: { variant_id: parsedVariantId },
      select: { variant_id: true, stock: true },
    });

    if (!variant) {
      return errorResponse(res, 'Phiên bản sản phẩm không tồn tại', 404);
    }

    const availableStock = variant.stock;
    const cartId = await getOrCreateCartId(userId);

    const existing = await prisma.cartItem.findUnique({
      where: {
        cart_id_variant_id: {
          cart_id: cartId,
          variant_id: parsedVariantId,
        },
      },
    });

    if (existing) {
      const newQuantity = existing.quantity + qty;
      if (newQuantity > availableStock) {
        return errorResponse(
          res,
          `Số lượng yêu cầu (${newQuantity}) vượt quá số lượng còn lại trong kho (${availableStock})`,
          400
        );
      }
      await prisma.cartItem.update({
        where: { cart_item_id: existing.cart_item_id },
        data: { quantity: newQuantity },
      });
    } else {
      if (qty > availableStock) {
        return errorResponse(
          res,
          `Số lượng yêu cầu (${qty}) vượt quá số lượng còn lại trong kho (${availableStock})`,
          400
        );
      }
      await prisma.cartItem.create({
        data: {
          cart_id: cartId,
          variant_id: parsedVariantId,
          quantity: qty,
        },
      });
    }

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/cart/items/:id
async function updateCartItem(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const cartItemId = BigInt(req.params.id);
    const { quantity } = req.body;

    if (quantity === undefined) {
      return errorResponse(res, 'Vui lòng cung cấp số lượng mới', 400);
    }

    const qty = parseInt(quantity, 10);
    const cartId = await getOrCreateCartId(userId);

    // If quantity <= 0, remove item
    if (qty <= 0) {
      await prisma.cartItem.deleteMany({
        where: {
          cart_item_id: cartItemId,
          cart_id: cartId,
        },
      });
      return getCart(req, res, next);
    }

    const item = await prisma.cartItem.findFirst({
      where: {
        cart_item_id: cartItemId,
        cart_id: cartId,
      },
      include: {
        variant: {
          select: { stock: true },
        },
      },
    });

    if (!item) {
      return errorResponse(res, 'Sản phẩm trong giỏ hàng không tồn tại', 404);
    }

    if (qty > item.variant.stock) {
      return errorResponse(
        res,
        `Số lượng cập nhật (${qty}) vượt quá tồn kho (${item.variant.stock})`,
        400
      );
    }

    await prisma.cartItem.update({
      where: { cart_item_id: cartItemId },
      data: { quantity: qty },
    });

    return getCart(req, res, next);
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/cart/items/:id
async function removeCartItem(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const cartItemId = BigInt(req.params.id);
    const cartId = await getOrCreateCartId(userId);

    const deleted = await prisma.cartItem.deleteMany({
      where: {
        cart_item_id: cartItemId,
        cart_id: cartId,
      },
    });

    if (deleted.count === 0) {
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
    const userId = BigInt(req.user.user_id);
    const cartId = await getOrCreateCartId(userId);

    await prisma.cartItem.deleteMany({
      where: { cart_id: cartId },
    });

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
  clearCart,
};
