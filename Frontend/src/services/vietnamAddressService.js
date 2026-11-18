import provincesData from '../data/vietnamProvinces2025.json';

export const vietnamAddressService = {
  /**
   * Danh sách 34 tỉnh/thành phố sau sáp nhập (API v2 - 2025)
   */
  getProvinces: () => {
    return provincesData.map((p) => ({
      code: p.code,
      name: p.name,
      division_type: p.division_type,
    }));
  },

  /**
   * Lấy danh sách phường/xã theo mã hoặc tên tỉnh
   */
  getWardsByProvinceCode: (provinceCodeOrName) => {
    if (!provinceCodeOrName) return [];
    const province = provincesData.find(
      (p) => p.code === Number(provinceCodeOrName) || p.name === provinceCodeOrName
    );
    return province?.wards || [];
  },

  /**
   * Tìm tỉnh theo code hoặc tên
   */
  findProvince: (identifier) => {
    if (!identifier) return null;
    return (
      provincesData.find(
        (p) => p.code === Number(identifier) || p.name === identifier
      ) || null
    );
  },

  /**
   * Ghép chuỗi địa chỉ hoàn chỉnh: "Địa chỉ chi tiết, Phường/Xã, Tỉnh/Thành phố"
   */
  formatAddress: (detail, ward, province) => {
    const parts = [];
    if (detail && detail.trim()) parts.push(detail.trim());
    if (ward) {
      const wardName = typeof ward === 'object' ? ward.name : ward;
      if (wardName && wardName.trim()) parts.push(wardName.trim());
    }
    if (province) {
      const provinceName = typeof province === 'object' ? province.name : province;
      if (provinceName && provinceName.trim()) parts.push(provinceName.trim());
    }
    return parts.join(', ');
  },
};

export default vietnamAddressService;
