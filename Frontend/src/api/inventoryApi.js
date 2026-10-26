import request from './client';

export const inventoryApi = {
  // Query inventory items and summary
  getInventory: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/inventory${qs ? `?${qs}` : ''}`);
  },

  // Query transaction history
  getTransactions: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/inventory/transactions${qs ? `?${qs}` : ''}`);
  },

  // Import goods into warehouse
  importStock: (data) =>
    request('/inventory/import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Export goods out of warehouse
  exportStock: (data) =>
    request('/inventory/export', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Suppliers
  getSuppliers: () => request('/inventory/suppliers'),

  createSupplier: (data) =>
    request('/inventory/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export default inventoryApi;
