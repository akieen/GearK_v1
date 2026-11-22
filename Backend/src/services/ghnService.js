class GHNService {
  constructor() {
    this.apiUrl = (process.env.GHN_API_URL || 'https://dev-online-gateway.ghn.vn/shiip/public-api').replace(/\/$/, '');
    this.token = process.env.GHN_TOKEN || '';
    this.shopId = process.env.GHN_SHOP_ID ? parseInt(process.env.GHN_SHOP_ID, 10) : null;
    this.defaultWeight = parseInt(process.env.GHN_DEFAULT_WEIGHT, 10) || 500;
    this.fromDistrictId = parseInt(process.env.GHN_FROM_DISTRICT_ID, 10) || 1442; // Mặc định Quận 1, TP.HCM
    this.isSimulation = process.env.GHN_SIMULATION === 'true';

    // In-memory cache cho master data
    this.cache = {
      provinces: null,
      districts: new Map(),
      wards: new Map(),
    };
  }

  // Native HTTP client sử dụng global fetch của Node.js
  async request(endpoint, { method = 'GET', body = null, extraHeaders = {} } = {}) {
    const url = `${this.apiUrl}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      'Token': this.token,
      ...extraHeaders,
    };
    if (this.shopId) {
      headers['ShopId'] = String(this.shopId);
    }

    const options = {
      method,
      headers,
      signal: AbortSignal.timeout(10000),
    };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      options.body = JSON.stringify(body);
    }

    const res = await fetch(url, options);
    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const err = new Error(json?.message || `GHN API HTTP ${res.status}`);
      err.response = { status: res.status, data: json };
      throw err;
    }

    return json;
  }

  // 1. Danh sách Tỉnh / Thành phố
  async getProvinces() {
    if (this.cache.provinces) return this.cache.provinces;
    try {
      const res = await this.request('/master-data/province');
      if (res && res.data) {
        const provinces = res.data
          .filter((p) => p.Status === 1)
          .map((p) => ({
            province_id: p.ProvinceID,
            province_name: p.ProvinceName,
            code: p.Code,
          }));
        this.cache.provinces = provinces;
        return provinces;
      }
      return [];
    } catch (err) {
      console.error('[GHN Error] Lỗi lấy danh sách tỉnh thành:', err.response?.data || err.message);
      return [];
    }
  }

  // 2. Danh sách Quận / Huyện theo Tỉnh
  async getDistricts(provinceId) {
    const pid = parseInt(provinceId, 10);
    if (this.cache.districts.has(pid)) return this.cache.districts.get(pid);
    try {
      const res = await this.request(`/master-data/district?province_id=${pid}`);
      if (res && res.data) {
        const districts = res.data
          .filter((d) => d.Status === 1)
          .map((d) => ({
            district_id: d.DistrictID,
            district_name: d.DistrictName,
            province_id: d.ProvinceID,
            code: d.Code,
          }));
        this.cache.districts.set(pid, districts);
        return districts;
      }
      return [];
    } catch (err) {
      console.error('[GHN Error] Lỗi lấy danh sách quận huyện:', err.response?.data || err.message);
      return [];
    }
  }

  // 3. Danh sách Phường / Xã theo Quận
  async getWards(districtId) {
    const did = parseInt(districtId, 10);
    if (this.cache.wards.has(did)) return this.cache.wards.get(did);
    try {
      const res = await this.request(`/master-data/ward?district_id=${did}`);
      if (res && res.data) {
        const wards = res.data
          .filter((w) => w.Status === 1)
          .map((w) => ({
            ward_code: w.WardCode,
            ward_name: w.WardName,
            district_id: w.DistrictID,
          }));
        this.cache.wards.set(did, wards);
        return wards;
      }
      return [];
    } catch (err) {
      console.error('[GHN Error] Lỗi lấy danh sách phường xã:', err.response?.data || err.message);
      return [];
    }
  }

  // 4. Lấy danh sách dịch vụ giao hàng khả dụng
  async getAvailableServices({ from_district, to_district }) {
    const fromDistrict = from_district ? parseInt(from_district, 10) : this.fromDistrictId;
    const toDistrict = parseInt(to_district, 10);

    try {
      const res = await this.request('/v2/shipping-order/available-services', {
        method: 'POST',
        body: {
          shop_id: this.shopId,
          from_district: fromDistrict,
          to_district: toDistrict,
        },
      });

      if (res && res.data && Array.isArray(res.data)) {
        return res.data.map((s) => ({
          service_id: s.service_id,
          service_type_id: s.service_type_id,
          short_name: s.short_name || 'Giao tiêu chuẩn GHN',
        }));
      }
    } catch (err) {
      console.warn('[GHN Warning] Không lấy được dịch vụ khả dụng từ API GHN:', err.response?.data?.message || err.message);
    }

    // Dịch vụ mặc định tiêu chuẩn nếu GHN chưa cấu hình xong
    return [
      { service_id: 53320, service_type_id: 2, short_name: 'Giao Hàng Nhanh (Tiêu chuẩn)' },
    ];
  }

  // 5. Tính phí vận chuyển chính xác từ GHN
  async calculateFee({
    to_district_id,
    to_ward_code,
    service_id,
    service_type_id,
    weight,
    length = 20,
    width = 15,
    height = 10,
    insurance_value = 0,
    from_district_id,
  }) {
    const fromDistrict = from_district_id ? parseInt(from_district_id, 10) : this.fromDistrictId;
    const totalWeight = Math.max(100, parseInt(weight, 10) || this.defaultWeight);
    const insurance = Math.min(5000000, Math.max(0, parseInt(insurance_value, 10) || 0)); // GHN giới hạn bảo hiểm

    const payload = {
      from_district_id: fromDistrict,
      to_district_id: parseInt(to_district_id, 10),
      to_ward_code: to_ward_code ? String(to_ward_code) : '',
      weight: totalWeight,
      length: parseInt(length, 10) || 20,
      width: parseInt(width, 10) || 15,
      height: parseInt(height, 10) || 10,
      insurance_value: insurance,
    };

    if (service_id) {
      payload.service_id = parseInt(service_id, 10);
    } else {
      payload.service_type_id = parseInt(service_type_id, 10) || 2;
    }

    try {
      const res = await this.request('/v2/shipping-order/fee', {
        method: 'POST',
        body: payload,
      });

      if (res && res.data) {
        return {
          success: true,
          total_fee: res.data.total || res.data.service_fee || 30000,
          service_fee: res.data.service_fee || 0,
          insurance_fee: res.data.insurance_fee || 0,
          expected_delivery: res.data.expected_delivery_time || null,
          data: res.data,
        };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      console.warn('[GHN Calculate Fee Warning]:', errMsg);

      // Fallback tính cước ước lượng thông minh nếu GHN Staging chưa khai báo kho
      const isInnerCity = fromDistrict === parseInt(to_district_id, 10);
      const estimatedFee = isInnerCity ? 22000 : 35000;

      return {
        success: true,
        is_estimated: true,
        total_fee: estimatedFee,
        service_fee: estimatedFee,
        insurance_fee: 0,
        expected_delivery: null,
        note: 'Cước vận chuyển ước lượng (GHN Staging Mode)',
      };
    }
  }

  // 6. Tạo vận đơn giao hàng trên GHN
  async createShippingOrder({
    to_name,
    to_phone,
    to_address,
    to_ward_code,
    to_district_id,
    weight,
    length = 20,
    width = 15,
    height = 10,
    service_id,
    service_type_id = 2,
    cod_amount = 0,
    insurance_value = 0,
    client_order_code,
    required_note = 'CHOXEMHANGKHONGTHU', // CHOTHUHANG | CHOXEMHANGKHONGTHU | KHONGCHOXEMHANG
    content = 'Thiết bị Gaming Gear chính hãng GearK',
    items = [],
  }) {
    const totalWeight = Math.max(100, parseInt(weight, 10) || this.defaultWeight);
    const cod = Math.max(0, parseInt(cod_amount, 10) || 0);
    const insurance = Math.min(5000000, Math.max(0, parseInt(insurance_value, 10) || 0));

    // Chuẩn hóa danh sách sản phẩm theo định dạng GHN
    const ghnItems = items.map((it) => ({
      name: it.product_name || 'Sản phẩm GearK',
      code: it.sku || String(it.variant_id || 'GEARK'),
      quantity: parseInt(it.quantity, 10) || 1,
      price: parseInt(it.unit_price, 10) || 0,
      weight: parseInt(it.weight, 10) || 300,
    }));

    const payload = {
      payment_type_id: cod > 0 ? 2 : 1, // 1: Người gửi trả cước, 2: Người nhận trả cước / COD
      note: 'Hàng điện tử cao cấp, vui lòng nhẹ tay. ' + (required_note === 'CHOXEMHANGKHONGTHU' ? 'Cho xem hàng không cho thử.' : ''),
      required_note,
      client_order_code: client_order_code ? String(client_order_code) : undefined,
      to_name: to_name.trim(),
      to_phone: to_phone.trim(),
      to_address: to_address.trim(),
      to_ward_code: String(to_ward_code),
      to_district_id: parseInt(to_district_id, 10),
      cod_amount: cod,
      content,
      weight: totalWeight,
      length: parseInt(length, 10) || 20,
      width: parseInt(width, 10) || 15,
      height: parseInt(height, 10) || 10,
      insurance_value: insurance,
      service_type_id: parseInt(service_type_id, 10) || 2,
      items: ghnItems.length > 0 ? ghnItems : [{ name: content, quantity: 1, weight: totalWeight }],
    };

    if (service_id) {
      payload.service_id = parseInt(service_id, 10);
    }

    try {
      const res = await this.request('/v2/shipping-order/create', {
        method: 'POST',
        body: payload,
      });

      if (res && res.data) {
        return {
          success: true,
          order_code: res.data.order_code,
          trans_type: res.data.trans_type,
          total_fee: res.data.total_fee,
          expected_delivery_time: res.data.expected_delivery_time,
          raw: res.data,
        };
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || err.message;
      console.warn('[GHN Create Order Warning]:', errMsg);

      // Chế độ giả lập an toàn nếu đang dùng Staging gateway hoặc shop chưa cấu hình kho
      const shouldSimulate =
        this.isSimulation ||
        this.apiUrl.includes('dev-online-gateway') ||
        errMsg.includes('SHOP_INFO_ERROR') ||
        errMsg.includes('Token is not valid') ||
        errMsg.includes('địa chỉ cửa hàng');

      if (shouldSimulate) {
        const mockTrackingCode = 'GHNDEV' + Math.floor(10000000 + Math.random() * 90000000);
        const estDelivery = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
        return {
          success: true,
          is_simulation: true,
          order_code: mockTrackingCode,
          trans_type: 'truck',
          total_fee: 30000,
          expected_delivery_time: estDelivery,
          raw: {
            order_code: mockTrackingCode,
            simulated: true,
            note: 'Vận đơn tạo qua chế độ GHN Staging Test / Fallback',
            original_error: errMsg,
          },
        };
      }

      throw err;
    }

    throw new Error('Không tạo được vận đơn trên hệ thống GHN');
  }

  // 7. Hủy vận đơn trên GHN
  async cancelShippingOrder(orderCodes) {
    const codes = Array.isArray(orderCodes) ? orderCodes : [orderCodes];
    try {
      return await this.request('/v2/switch-status/cancel', {
        method: 'POST',
        body: {
          order_codes: codes,
        },
      });
    } catch (err) {
      if (codes[0]?.startsWith('GHNDEV') || this.isSimulation) {
        return { success: true, message: 'Đã hủy vận đơn GHN thành công (Dev Mode)' };
      }
      throw err;
    }
  }

  // 8. Lấy Token in tem vận đơn A5
  async printOrderToken(orderCodes) {
    const codes = Array.isArray(orderCodes) ? orderCodes : [orderCodes];
    try {
      const res = await this.request('/v2/a5/gen-token', {
        method: 'POST',
        body: {
          order_codes: codes,
        },
      });

      if (res && res.data?.token) {
        const printToken = res.data.token;
        const isStaging = this.apiUrl.includes('dev-online-gateway');
        const printUrl = isStaging
          ? `https://dev-online-gateway.ghn.vn/a5/index.html?token=${printToken}`
          : `https://online-gateway.ghn.vn/a5/index.html?token=${printToken}`;

        return {
          success: true,
          token: printToken,
          print_url: printUrl,
        };
      }
    } catch (err) {
      if (codes[0]?.startsWith('GHNDEV') || this.isSimulation) {
        return {
          success: true,
          token: 'SIMULATION_PRINT_TOKEN',
          print_url: `https://online-gateway.ghn.vn/a5/index.html?token=SIMULATION_DEV_TOKEN`,
        };
      }
      throw err;
    }

    throw new Error('Không lấy được mã in phiếu vận đơn');
  }

  // 9. Lấy chi tiết thông tin và hành trình vận đơn
  async getOrderDetail(orderCode) {
    const res = await this.request(`/v2/shipping-order/detail?order_code=${orderCode}`);
    return res?.data || null;
  }
}

module.exports = new GHNService();
