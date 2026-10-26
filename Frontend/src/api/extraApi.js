import request from './client';

export const couponApi = {
  validateCoupon: (coupon_code, total_amount) =>
    request('/coupons/validate', {
      method: 'POST',
      body: JSON.stringify({ coupon_code, total_amount }),
    }),

  getCoupons: () => request('/coupons'),

  createCoupon: (data) =>
    request('/coupons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCoupon: (id, data) =>
    request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteCoupon: (id) =>
    request(`/coupons/${id}`, {
      method: 'DELETE',
    }),
};

export const reviewApi = {
  getProductReviews: (productId) => request(`/reviews/product/${productId}`),

  checkEligibility: (productId) => request(`/reviews/check-eligibility/${productId}`),

  createReview: (productId, rating, content, order_item_id) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, rating, content, order_item_id }),
    }),

  deleteReview: (id) =>
    request(`/reviews/${id}`, {
      method: 'DELETE',
    }),
};

export const addressApi = {
  getAddresses: () => request('/addresses'),

  createAddress: (data) =>
    request('/addresses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAddress: (id, data) =>
    request(`/addresses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteAddress: (id) =>
    request(`/addresses/${id}`, {
      method: 'DELETE',
    }),
};

export const wishlistApi = {
  getWishlist: () => request('/wishlist'),

  toggleWishlist: (payload) => {
    const body = typeof payload === 'object' && payload !== null ? payload : { product_id: payload };
    return request('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },
};

export const dashboardApi = {
  getStats: () => request('/dashboard/stats'),
};
