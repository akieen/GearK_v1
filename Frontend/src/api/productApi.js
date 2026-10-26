import request from './client';

export const uploadApi = {
  // Upload single file (File or FormData)
  uploadFile: (file) => {
    const formData = file instanceof FormData ? file : new FormData();
    if (!(file instanceof FormData)) {
      formData.append('file', file);
    }
    return request('/upload', {
      method: 'POST',
      body: formData,
    });
  },

  // Upload multiple files (FileList, Array<File>, or FormData)
  uploadFiles: (files) => {
    const formData = files instanceof FormData ? files : new FormData();
    if (!(files instanceof FormData)) {
      Array.from(files).forEach((f) => formData.append('images', f));
    }
    return request('/upload/multiple', {
      method: 'POST',
      body: formData,
    });
  },
};

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
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  updateProduct: (id, data) =>
    request(`/products/${id}`, {
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    }),

  deleteProduct: (id) =>
    request(`/products/${id}`, {
      method: 'DELETE',
    }),

  addVariant: (productId, data) =>
    request(`/products/${productId}/variants`, {
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
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

  // Product Images APIs
  getProductImages: (productId) => request(`/products/${productId}/images`),

  addProductImage: (productId, dataOrFile) => {
    let body;
    if (dataOrFile instanceof FormData) {
      body = dataOrFile;
    } else if (dataOrFile instanceof File) {
      body = new FormData();
      body.append('image', dataOrFile);
    } else {
      body = JSON.stringify(dataOrFile);
    }
    return request(`/products/${productId}/images`, {
      method: 'POST',
      body,
    });
  },

  deleteProductImage: (imageId) =>
    request(`/products/images/${imageId}`, {
      method: 'DELETE',
    }),

  setPrimaryProductImage: (imageId) =>
    request(`/products/images/${imageId}/primary`, {
      method: 'PUT',
    }),

  // Variant Images APIs
  getVariantImages: (variantId) => request(`/products/variants/${variantId}/images`),

  addVariantImage: (variantId, dataOrFile) => {
    let body;
    if (dataOrFile instanceof FormData) {
      body = dataOrFile;
    } else if (dataOrFile instanceof File) {
      body = new FormData();
      body.append('image', dataOrFile);
    } else {
      body = JSON.stringify(dataOrFile);
    }
    return request(`/products/variants/${variantId}/images`, {
      method: 'POST',
      body,
    });
  },

  deleteVariantImage: (imageId) =>
    request(`/products/variants/images/${imageId}`, {
      method: 'DELETE',
    }),

  setPrimaryVariantImage: (imageId) =>
    request(`/products/variants/images/${imageId}/primary`, {
      method: 'PUT',
    }),
};

export default productApi;
