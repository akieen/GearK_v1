import request from './client';

export const categoryApi = {
  getCategories: (tree = false) => request(`/categories${tree ? '?tree=true' : ''}`),
  getCategoryBySlug: (slug) => request(`/categories/${slug}`),
  createCategory: (data) =>
    request('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateCategory: (id, data) =>
    request(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteCategory: (id) =>
    request(`/categories/${id}`, {
      method: 'DELETE',
    }),
};

export const brandApi = {
  getBrands: () => request('/brands'),
  getBrandBySlug: (slug) => request(`/brands/${slug}`),
  createBrand: (data) =>
    request('/brands', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateBrand: (id, data) =>
    request(`/brands/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteBrand: (id) =>
    request(`/brands/${id}`, {
      method: 'DELETE',
    }),
};
