const prisma = require('../config/prisma');
const { successResponse, errorResponse, validatePhone } = require('../utils/helpers');

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
    const { recipient_name, recipient_phone, street_address } = req.body;

    if (!recipient_name || !recipient_phone || !street_address) {
      return errorResponse(res, 'Vui lòng điền đầy đủ họ tên người nhận, số điện thoại và địa chỉ giao hàng', 400);
    }

    const cleanPhone = recipient_phone.trim();
    const phoneValidation = validatePhone(cleanPhone);
    if (!phoneValidation.valid) {
      return errorResponse(res, phoneValidation.message, 400);
    }

    // 1. Kiểm tra số điện thoại không được thuộc về người dùng khác
    const otherUser = await prisma.user.findFirst({
      where: {
        phone: cleanPhone,
        user_id: { not: userId },
      },
    });
    if (otherUser) {
      return errorResponse(res, 'Số điện thoại này đã được tài khoản khác sử dụng', 409);
    }

    // 2. Quy tắc: mỗi user chỉ có duy nhất 1 số điện thoại
    const currentUser = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (currentUser?.phone) {
      if (currentUser.phone !== cleanPhone) {
        return errorResponse(
          res,
          `Mỗi tài khoản chỉ được sử dụng 1 số điện thoại duy nhất (${currentUser.phone}). Vui lòng dùng đúng số điện thoại của bạn!`,
          400
        );
      }
    } else {
      // Nếu user chưa có số điện thoại trong hồ sơ, tự động đồng bộ số điện thoại này vào user
      await prisma.user.update({
        where: { user_id: userId },
        data: { phone: cleanPhone },
      });
    }

    const newAddress = await prisma.address.create({
      data: {
        user_id: userId,
        recipient_name: recipient_name.trim(),
        recipient_phone: cleanPhone,
        street_address: street_address.trim(),
      },
    });

    return successResponse(
      res,
      {
        address_id: newAddress.address_id,
        recipient_name: newAddress.recipient_name,
        recipient_phone: newAddress.recipient_phone,
        street_address: newAddress.street_address,
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
    const { recipient_name, recipient_phone, street_address } = req.body;

    const existing = await prisma.address.findFirst({
      where: {
        address_id: addressId,
        user_id: userId,
      },
    });

    if (!existing) {
      return errorResponse(res, 'Địa chỉ không tồn tại', 404);
    }

    const updateData = {};
    if (recipient_name !== undefined) updateData.recipient_name = recipient_name.trim();

    if (recipient_phone !== undefined) {
      const cleanPhone = recipient_phone.trim();
      const phoneValidation = validatePhone(cleanPhone);
      if (!phoneValidation.valid) {
        return errorResponse(res, phoneValidation.message, 400);
      }

      // Kiểm tra xem số điện thoại có thuộc về user khác không
      const otherUser = await prisma.user.findFirst({
        where: {
          phone: cleanPhone,
          user_id: { not: userId },
        },
      });
      if (otherUser) {
        return errorResponse(res, 'Số điện thoại này đã được tài khoản khác sử dụng', 409);
      }

      // Quy tắc: Mỗi user chỉ dùng duy nhất 1 số điện thoại
      const currentUser = await prisma.user.findUnique({
        where: { user_id: userId },
      });

      if (currentUser?.phone) {
        if (currentUser.phone !== cleanPhone) {
          return errorResponse(
            res,
            `Mỗi tài khoản chỉ được sử dụng 1 số điện thoại duy nhất (${currentUser.phone}). Vui lòng dùng đúng số điện thoại của bạn!`,
            400
          );
        }
      } else {
        await prisma.user.update({
          where: { user_id: userId },
          data: { phone: cleanPhone },
        });
      }

      updateData.recipient_phone = cleanPhone;
    }

    if (street_address !== undefined) updateData.street_address = street_address.trim();

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
