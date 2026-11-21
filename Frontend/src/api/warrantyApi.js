import request from './client';

export const warrantyApi = {
  // Khách hàng gửi yêu cầu bảo hành
  createClaim: (claimData) =>
    request('/warranties', {
      method: 'POST',
      body: JSON.stringify(claimData),
    }),

  // Khách hàng xem danh sách yêu cầu bảo hành đã gửi
  getMyClaims: () => request('/warranties/my-claims'),

  // Khách hàng lấy danh sách sản phẩm đủ điều kiện bảo hành từ các đơn đã giao
  getEligibleItems: () => request('/warranties/eligible-items'),

  // Admin/Staff lấy danh sách tất cả yêu cầu bảo hành
  getAllClaimsAdmin: (params = {}) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    return request(`/warranties/admin/all${qs ? `?${qs}` : ''}`);
  },

  // Admin/Staff cập nhật trạng thái yêu cầu bảo hành
  updateClaimStatus: (claimId, data) =>
    request(`/warranties/admin/${claimId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export default warrantyApi;
