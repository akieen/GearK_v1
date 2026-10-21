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

  getUsers: () => request('/auth/users'),

  updateUserRole: (id, role) =>
    request(`/auth/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    }),
};
