const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/addresses
async function getAddresses(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const rows = await prisma.address.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' },
    });
    return successResponse(res, rows, 'Danh sách địa chỉ');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/addresses
async function createAddress(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const { recipient_name, recipient_phone, street_address, province_id, district_id, ward_code, is_default } = req.body;

    if (!recipient_name || !recipient_phone || !street_address) {
      return errorResponse(res, 'Vui lòng điền đầy đủ họ tên người nhận, số điện thoại và địa chỉ giao hàng', 400);
    }

    if (is_default) {
      await prisma.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        user_id: userId,
        recipient_name: recipient_name.trim(),
        recipient_phone: recipient_phone.trim(),
        street_address: street_address.trim(),
        province_id: province_id ? parseInt(province_id, 10) : null,
        district_id: district_id ? parseInt(district_id, 10) : null,
        ward_code: ward_code ? String(ward_code) : null,
        is_default: !!is_default,
      },
    });

    return successResponse(
      res,
      {
        address_id: newAddress.address_id,
        recipient_name: newAddress.recipient_name,
        recipient_phone: newAddress.recipient_phone,
        street_address: newAddress.street_address,
        province_id: newAddress.province_id,
        district_id: newAddress.district_id,
        ward_code: newAddress.ward_code,
        is_default: newAddress.is_default,
      },
      'Thêm địa chỉ giao hàng thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/addresses/:id
async function updateAddress(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const addressId = BigInt(req.params.id);
    const { recipient_name, recipient_phone, street_address, province_id, district_id, ward_code, is_default } = req.body;

    const existing = await prisma.address.findFirst({
      where: {
        address_id: addressId,
        user_id: userId,
      },
    });

    if (!existing) {
      return errorResponse(res, 'Địa chỉ không tồn tại', 404);
    }

    if (is_default) {
      await prisma.address.updateMany({
        where: { user_id: userId },
        data: { is_default: false },
      });
    }

    const updateData = {};
    if (recipient_name !== undefined) updateData.recipient_name = recipient_name.trim();
    if (recipient_phone !== undefined) updateData.recipient_phone = recipient_phone.trim();
    if (street_address !== undefined) updateData.street_address = street_address.trim();
    if (province_id !== undefined) updateData.province_id = province_id ? parseInt(province_id, 10) : null;
    if (district_id !== undefined) updateData.district_id = district_id ? parseInt(district_id, 10) : null;
    if (ward_code !== undefined) updateData.ward_code = ward_code ? String(ward_code) : null;
    if (is_default !== undefined) updateData.is_default = !!is_default;

    await prisma.address.update({
      where: { address_id: addressId },
      data: updateData,
    });

    return successResponse(res, null, 'Cập nhật địa chỉ thành công');
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/addresses/:id
async function deleteAddress(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const addressId = BigInt(req.params.id);

    const existing = await prisma.address.findFirst({
      where: {
        address_id: addressId,
        user_id: userId,
      },
    });

    if (!existing) {
      return errorResponse(res, 'Địa chỉ không tồn tại', 404);
    }

    await prisma.address.delete({
      where: { address_id: addressId },
    });

    return successResponse(res, null, 'Xóa địa chỉ thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
};
