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

  deleteCoupon: (id) =>
    request(`/coupons/${id}`, {
      method: 'DELETE',
    }),
};

export const reviewApi = {
  getProductReviews: (productId) => request(`/reviews/product/${productId}`),

  createReview: (productId, rating, content) =>
    request('/reviews', {
      method: 'POST',
      body: JSON.stringify({ product_id: productId, rating, content }),
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

  toggleWishlist: (product_id) =>
    request('/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ product_id }),
    }),
};

export const dashboardApi = {
  getStats: () => request('/dashboard/stats'),
};
