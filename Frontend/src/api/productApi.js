import request from './client';

export const productApi = {
  // Query params: page, limit, search, category_slug, brand_slug, min_price, max_price, sort
  getProducts: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/products${qs ? `?${qs}` : ''}`);
  },

  getProductBySlug: (slug) => request(`/products/${slug}`),

  getProductById: (id) => request(`/products/id/${id}`),

  createProduct: (data) =>
    request('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateProduct: (id, data) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  addVariant: (productId, data) =>
    request(`/products/${productId}/variants`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateVariant: (variantId, data) =>
    request(`/products/variants/${variantId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteVariant: (variantId) =>
    request(`/products/variants/${variantId}`, {
      method: 'DELETE',
    }),
};
