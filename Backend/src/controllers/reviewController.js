const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/reviews/product/:productId
async function getProductReviews(req, res, next) {
  try {
    const productId = BigInt(req.params.productId);

    const reviews = await prisma.review.findMany({
      where: { product_id: productId },
      orderBy: { created_at: 'desc' },
      include: {
        user: {
          select: {
            user_id: true,
            full_name: true,
          },
        },
      },
    });

    const formatted = reviews.map((r) => ({
      review_id: r.review_id,
      rating: r.rating,
      content: r.content,
      created_at: r.created_at,
      user_id: r.user?.user_id,
      full_name: r.user?.full_name,
      user_name: r.user?.full_name,
    }));

    return successResponse(res, formatted, 'Danh sách đánh giá sản phẩm');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/reviews/check-eligibility/:productId
// Kiểm tra user hiện tại đã mua sản phẩm hay chưa
async function checkEligibility(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const productId = BigInt(req.params.productId);

    // 1. Kiểm tra xem user đã từng đánh giá sản phẩm này chưa
    const existing = await prisma.review.findFirst({
      where: {
        user_id: userId,
        product_id: productId,
      },
      select: {
        review_id: true,
        rating: true,
        content: true,
        created_at: true,
      },
    });

    if (existing) {
      return successResponse(res, {
        can_review: false,
        already_reviewed: true,
        review: existing,
        message: 'Bạn đã đánh giá sản phẩm này rồi.',
      }, 'Trạng thái quyền đánh giá');
    }

    // 2. Kiểm tra xem user có đơn hàng hợp lệ chứa sản phẩm này không
    const purchases = await prisma.orderItem.findMany({
      where: {
        variant: { product_id: productId },
        order: { user_id: userId },
      },
      include: {
        order: {
          select: {
            order_id: true,
            order_status: true,
            created_at: true,
          },
        },
      },
      orderBy: {
        order: { created_at: 'desc' },
      },
    });

    if (purchases.length === 0) {
      return successResponse(res, {
        can_review: false,
        already_reviewed: false,
        reason: 'not_purchased',
        message: 'Chỉ khách hàng đã mua và nhận sản phẩm thành công tại GearK mới có thể gửi nhận xét.',
      }, 'Trạng thái quyền đánh giá');
    }

    // Chỉ cho phép đánh giá nếu đơn hàng đã hoàn tất thành công (order_status === 'completed')
    const completedPurchases = purchases.filter((p) => p.order?.order_status === 'completed');

    if (completedPurchases.length === 0) {
      const activeOrder = purchases.find((p) =>
        ['pending', 'confirmed', 'processing', 'shipping'].includes(p.order?.order_status)
      );
      if (activeOrder) {
        return successResponse(res, {
          can_review: false,
          already_reviewed: false,
          reason: 'order_in_progress',
          message: 'Đơn hàng của bạn đang được xử lý hoặc giao hàng. Bạn chỉ có thể đánh giá sau khi đã nhận hàng thành công (Trạng thái: Đã hoàn thành).',
        }, 'Trạng thái quyền đánh giá');
      }

      return successResponse(res, {
        can_review: false,
        already_reviewed: false,
        reason: 'order_cancelled',
        message: 'Đơn hàng của bạn đã bị hủy hoặc hoàn tiền nên không thể gửi đánh giá.',
      }, 'Trạng thái quyền đánh giá');
    }

    return successResponse(res, {
      can_review: true,
      already_reviewed: false,
      order_item_id: completedPurchases[0].order_item_id,
      message: 'Bạn đủ điều kiện đánh giá sản phẩm này.',
    }, 'Trạng thái quyền đánh giá');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/reviews
async function createReview(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const { product_id, rating, content, order_item_id } = req.body;

    if (!product_id || !rating) {
      return errorResponse(res, 'Vui lòng cung cấp mã sản phẩm và điểm đánh giá (1-5)', 400);
    }

    const numRating = Number(rating);
    if (numRating < 1 || numRating > 5) {
      return errorResponse(res, 'Điểm đánh giá phải từ 1 đến 5 sao', 400);
    }

    const parsedProductId = BigInt(product_id);

    // 1. Kiểm tra đã đánh giá chưa
    const existing = await prisma.review.findFirst({
      where: {
        user_id: userId,
        product_id: parsedProductId,
      },
    });
    if (existing) {
      return errorResponse(res, 'Bạn đã gửi đánh giá cho sản phẩm này rồi!', 400);
    }

    // 2. Kiểm tra xem user đã mua sản phẩm này thành công (order_status = 'completed') hay chưa
    const purchases = await prisma.orderItem.findMany({
      where: {
        variant: { product_id: parsedProductId },
        order: { user_id: userId },
      },
      include: {
        order: {
          select: {
            order_id: true,
            order_status: true,
          },
        },
      },
    });

    if (purchases.length === 0) {
      return errorResponse(res, 'Chỉ khách hàng đã mua và nhận sản phẩm thành công tại GearK mới có thể gửi nhận xét!', 403);
    }

    const completedPurchases = purchases.filter((p) => p.order?.order_status === 'completed');

    if (completedPurchases.length === 0) {
      const activeOrder = purchases.find((p) =>
        ['pending', 'confirmed', 'processing', 'shipping'].includes(p.order?.order_status)
      );
      if (activeOrder) {
        return errorResponse(
          res,
          'Đơn hàng của bạn chưa hoàn tất. Bạn chỉ có thể gửi nhận xét sau khi đơn hàng đã được giao thành công (Trạng thái: Đã hoàn thành)!',
          400
        );
      }
      return errorResponse(res, 'Đơn hàng chứa sản phẩm này đã bị hủy hoặc hoàn tiền nên không thể gửi nhận xét!', 400);
    }

    const finalOrderItemId = order_item_id
      ? BigInt(order_item_id)
      : completedPurchases[0].order_item_id || null;

    const newReview = await prisma.review.create({
      data: {
        user_id: userId,
        product_id: parsedProductId,
        order_item_id: finalOrderItemId,
        rating: numRating,
        content: content ? content.trim() : null,
      },
    });

    return successResponse(
      res,
      { review_id: newReview.review_id },
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
    const reviewId = BigInt(req.params.id);
    const userId = BigInt(req.user.user_id);
    const isAdmin = req.user.role === 'admin';

    const existing = await prisma.review.findUnique({
      where: { review_id: reviewId },
    });

    if (!existing || (!isAdmin && existing.user_id !== userId)) {
      return errorResponse(res, 'Đánh giá không tồn tại hoặc bạn không có quyền xóa', 404);
    }

    await prisma.review.delete({
      where: { review_id: reviewId },
    });

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

    const whereConditions = {};

    if (rating && !isNaN(rating)) {
      whereConditions.rating = parseInt(rating);
    }

    if (search && search.trim()) {
      const term = search.trim();
      whereConditions.OR = [
        { product: { product_name: { contains: term } } },
        { user: { full_name: { contains: term } } },
        { user: { email: { contains: term } } },
        { content: { contains: term } },
      ];
    }

    // 1. Thống kê tổng quan
    const [
      total_reviews,
      avgResult,
      count_5_star,
      count_4_star,
      count_3_star,
      count_low_star,
      total,
      items,
    ] = await Promise.all([
      prisma.review.count(),
      prisma.review.aggregate({ _avg: { rating: true } }),
      prisma.review.count({ where: { rating: 5 } }),
      prisma.review.count({ where: { rating: 4 } }),
      prisma.review.count({ where: { rating: 3 } }),
      prisma.review.count({ where: { rating: { lte: 2 } } }),
      prisma.review.count({ where: whereConditions }),
      prisma.review.findMany({
        where: whereConditions,
        orderBy: { created_at: 'desc' },
        skip: offset,
        take: limit,
        include: {
          product: {
            select: {
              product_name: true,
              thumbnail_url: true,
            },
          },
          user: {
            select: {
              full_name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    const formattedItems = items.map((r) => ({
      review_id: r.review_id,
      product_id: r.product_id,
      user_id: r.user_id,
      order_item_id: r.order_item_id,
      rating: r.rating,
      content: r.content,
      created_at: r.created_at,
      product_name: r.product?.product_name || 'Sản phẩm',
      thumbnail_url: r.product?.thumbnail_url || null,
      full_name: r.user?.full_name || 'Khách hàng',
      email: r.user?.email || '',
    }));

    return successResponse(
      res,
      {
        items: formattedItems,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
        summary: {
          total_reviews,
          avg_rating: avgResult._avg?.rating ? Number(avgResult._avg.rating) : 5.0,
          count_5_star,
          count_4_star,
          count_3_star,
          count_low_star,
        },
      },
      'Danh sách đánh giá sản phẩm (Admin)'
    );
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProductReviews,
  checkEligibility,
  createReview,
  deleteReview,
  getAllReviewsAdmin,
};
