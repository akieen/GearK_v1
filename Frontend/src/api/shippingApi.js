import request from './client';

export const shippingApi = {
  // Lấy danh sách Tỉnh / Thành phố
  getProvinces: () => request('/shipping/provinces'),

  // Lấy danh sách Quận / Huyện theo Tỉnh
  getDistricts: (provinceId) => request(`/shipping/districts?province_id=${provinceId}`),

  // Lấy danh sách Phường / Xã theo Quận
  getWards: (districtId) => request(`/shipping/wards?district_id=${districtId}`),

  // Lấy danh sách dịch vụ vận chuyển GHN
  getServices: (toDistrict, fromDistrict) =>
    request('/shipping/services', {
      method: 'POST',
      body: JSON.stringify({
        to_district: toDistrict,
        from_district: fromDistrict,
      }),
    }),

  // Tính phí vận chuyển GHN
  calculateFee: (params) =>
    request('/shipping/calculate-fee', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  // Tra cứu hành trình vận đơn
  getTracking: (code) => request(`/shipping/tracking/${code}`),

  // [Admin] Tạo vận đơn GHN cho đơn hàng
  createShipment: (orderId, data = {}) =>
    request(`/shipping/admin/create-shipment/${orderId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // [Admin] Hủy vận đơn GHN
  cancelShipment: (orderId) =>
    request(`/shipping/admin/cancel-shipment/${orderId}`, {
      method: 'POST',
    }),

  // [Admin] Lấy link in phiếu gửi hàng A5
  getPrintToken: (orderCode) => request(`/shipping/admin/print-token/${orderCode}`),

  // [Dev / Test] Giả lập Webhook GHN gửi về server
  sendWebhook: (payload) =>
    request('/shipping/webhook/ghn', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};

export default shippingApi;
