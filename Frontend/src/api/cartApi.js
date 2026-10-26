import request from './client';

export const cartApi = {
  getCart: () => request('/cart'),

  addToCart: (variant_id, quantity = 1) =>
    request('/cart/items', {
      method: 'POST',
      body: JSON.stringify({ variant_id, quantity }),
    }),

  updateCartItem: (id, quantity) =>
    request(`/cart/items/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    }),

  removeCartItem: (id) =>
    request(`/cart/items/${id}`, {
      method: 'DELETE',
    }),

  clearCart: () =>
    request('/cart', {
      method: 'DELETE',
    }),
};

export const orderApi = {
  createOrder: (orderData) =>
    request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    }),

  getMyOrders: () => request('/orders'),

  getOrderDetail: (codeOrId) => request(`/orders/${codeOrId}`),

  getAllOrdersAdmin: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/orders/admin/all${qs ? `?${qs}` : ''}`);
  },

  updateOrderStatus: (id, status, payment_status) =>
    request(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status,
        order_status: status,
        payment_status,
      }),
    }),

  cancelOrder: (id) =>
    request(`/orders/${id}/cancel`, {
      method: 'PUT',
    }),
};
