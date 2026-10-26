import request from './client';

export const authApi = {
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (full_name, email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ full_name, email, password }),
    }),

  getProfile: () => request('/auth/profile'),

  updateProfile: (data) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getUsers: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.page) searchParams.append('page', params.page);
    if (params.limit) searchParams.append('limit', params.limit);
    if (params.role) searchParams.append('role', params.role);
    if (params.search) searchParams.append('search', params.search);
    const qs = searchParams.toString();
    return request(`/auth/users${qs ? `?${qs}` : ''}`);
  },

  createStaff: (data) =>
    request('/auth/staff', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateUserRole: (id, role) =>
    request(`/auth/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),

  deleteUser: (id) =>
    request(`/auth/users/${id}`, {
      method: 'DELETE',
    }),
};
