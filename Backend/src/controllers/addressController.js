const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/addresses
async function getAddresses(req, res, next) {
  try {
    const userId = req.user.user_id;
    const [rows] = await pool.query(
      'SELECT * FROM addresses WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    return successResponse(res, rows, 'Danh sách địa chỉ');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/addresses
async function createAddress(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { recipient_name, recipient_phone, street_address } = req.body;

    if (!recipient_name || !recipient_phone || !street_address) {
      return errorResponse(res, 'Vui lòng điền đầy đủ họ tên người nhận, số điện thoại và địa chỉ giao hàng', 400);
    }

    const [result] = await pool.query(
      'INSERT INTO addresses (user_id, recipient_name, recipient_phone, street_address) VALUES (?, ?, ?, ?)',
      [userId, recipient_name, recipient_phone, street_address]
    );

    return successResponse(
      res,
      {
        address_id: result.insertId,
        recipient_name,
        recipient_phone,
        street_address
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
    const userId = req.user.user_id;
    const { id } = req.params;
    const { recipient_name, recipient_phone, street_address } = req.body;

    const [existing] = await pool.query(
      'SELECT * FROM addresses WHERE address_id = ? AND user_id = ?',
      [id, userId]
    );

    if (existing.length === 0) {
      return errorResponse(res, 'Địa chỉ không tồn tại', 404);
    }

    await pool.query(
      `UPDATE addresses SET
        recipient_name = COALESCE(?, recipient_name),
        recipient_phone = COALESCE(?, recipient_phone),
        street_address = COALESCE(?, street_address)
       WHERE address_id = ? AND user_id = ?`,
      [recipient_name, recipient_phone, street_address, id, userId]
    );

    return successResponse(res, null, 'Cập nhật địa chỉ thành công');
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/addresses/:id
async function deleteAddress(req, res, next) {
  try {
    const userId = req.user.user_id;
    const { id } = req.params;

    const [result] = await pool.query(
      'DELETE FROM addresses WHERE address_id = ? AND user_id = ?',
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return errorResponse(res, 'Địa chỉ không tồn tại', 404);
    }

    return successResponse(res, null, 'Xóa địa chỉ thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress
};
