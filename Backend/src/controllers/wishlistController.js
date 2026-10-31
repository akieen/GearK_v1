const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/helpers');

async function getOrCreateWishlistId(userId) {
  const existing = await prisma.wishlist.findUnique({
    where: { user_id: userId },
  });
  if (existing) {
    return existing.wishlist_id;
  }
  const created = await prisma.wishlist.create({
    data: { user_id: userId },
  });
  return created.wishlist_id;
}

// [GET] /api/wishlist
async function getWishlist(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const wishlistId = await getOrCreateWishlistId(userId);

    const items = await prisma.wishlistItem.findMany({
      where: { wishlist_id: wishlistId },
      orderBy: { created_at: 'desc' },
      include: {
        variant: {
          include: {
            product: {
              include: {
                brand: {
                  select: { brand_name: true },
                },
              },
            },
          },
        },
      },
    });

    const formatted = items.map((wi) => ({
      wishlist_item_id: wi.wishlist_item_id,
      created_at: wi.created_at,
      variant_id: wi.variant?.variant_id,
      variant_name: wi.variant?.variant_name,
      price: wi.variant?.price,
      sale_price: wi.variant?.sale_price,
      stock: wi.variant?.stock,
      product_id: wi.variant?.product?.product_id,
      product_name: wi.variant?.product?.product_name,
      slug: wi.variant?.product?.slug,
      thumbnail_url: wi.variant?.product?.thumbnail_url,
      brand_name: wi.variant?.product?.brand?.brand_name || null,
    }));

    return successResponse(res, formatted, 'Danh sách sản phẩm yêu thích');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/wishlist/toggle
async function toggleWishlist(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const { variant_id, product_id } = req.body;

    let targetVariantId = variant_id ? BigInt(variant_id) : null;

    // If variant_id is not provided, look up the default/first variant of this product
    if (!targetVariantId && product_id) {
      const parsedProductId = BigInt(product_id);
      const firstVariant = await prisma.productVariant.findFirst({
        where: { product_id: parsedProductId },
        orderBy: { variant_id: 'asc' },
      });

      if (firstVariant) {
        targetVariantId = firstVariant.variant_id;
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
      existingItem = await prisma.wishlistItem.findFirst({
        where: {
          wishlist_id: wishlistId,
          variant_id: targetVariantId,
        },
      });
    } else if (product_id) {
      const parsedProductId = BigInt(product_id);
      existingItem = await prisma.wishlistItem.findFirst({
        where: {
          wishlist_id: wishlistId,
          variant: {
            product_id: parsedProductId,
          },
        },
      });
    }

    if (existingItem) {
      await prisma.wishlistItem.delete({
        where: { wishlist_item_id: existingItem.wishlist_item_id },
      });
      return successResponse(res, { in_wishlist: false }, 'Đã xóa khỏi danh sách yêu thích');
    } else {
      await prisma.wishlistItem.create({
        data: {
          wishlist_id: wishlistId,
          variant_id: targetVariantId,
        },
      });
      return successResponse(res, { in_wishlist: true }, 'Đã thêm vào danh sách yêu thích');
    }
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getWishlist,
  toggleWishlist,
};
