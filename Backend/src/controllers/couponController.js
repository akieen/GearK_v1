const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

// [GET] /api/coupons (Admin only or public list)
async function getCoupons(req, res, next) {
  try {
    const [coupons] = await pool.query('SELECT * FROM coupons ORDER BY coupon_id DESC');
    return successResponse(res, coupons, 'Danh sách mã giảm giá');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/coupons/validate
async function validateCoupon(req, res, next) {
  try {
    const { coupon_code, total_amount = 0 } = req.body;

    if (!coupon_code) {
      return errorResponse(res, 'Vui lòng nhập mã giảm giá', 400);
    }

    const [rows] = await pool.query(
      'SELECT * FROM coupons WHERE coupon_code = ? LIMIT 1',
      [coupon_code.trim().toUpperCase()]
    );

    if (rows.length === 0) {
      return errorResponse(res, 'Mã giảm giá không hợp lệ hoặc không tồn tại', 404);
    }

    const coupon = rows[0];
    const now = new Date();

    // 1. Kiểm tra ngày bắt đầu hiệu lực
    if (coupon.start_date && new Date(coupon.start_date) > now) {
      return errorResponse(res, `Mã giảm giá chưa đến ngày có hiệu lực (bắt đầu từ ${new Date(coupon.start_date).toLocaleDateString('vi-VN')})`, 400);
    }

    // 2. Kiểm tra ngày hết hạn
    if (coupon.end_date && new Date(coupon.end_date) < now) {
      return errorResponse(res, `Mã giảm giá đã hết hạn sử dụng (hết hạn lúc ${new Date(coupon.end_date).toLocaleDateString('vi-VN')})`, 400);
    }

    // 3. Kiểm tra giới hạn lượt dùng
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return errorResponse(res, 'Mã giảm giá đã hết lượt sử dụng', 400);
    }

    const subtotal = Number(total_amount);
    let discountAmount = 0;

    if (coupon.discount_type === 'percent') {
      discountAmount = (subtotal * Number(coupon.discount_value)) / 100;
    } else {
      discountAmount = Number(coupon.discount_value);
    }

    discountAmount = Math.min(discountAmount, subtotal);

    return successResponse(res, {
      coupon_id: coupon.coupon_id,
      coupon_code: coupon.coupon_code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: discountAmount,
      final_amount: Math.max(0, subtotal - discountAmount),
      used_count: coupon.used_count,
      usage_limit: coupon.usage_limit,
      start_date: coupon.start_date,
      end_date: coupon.end_date,
    }, 'Áp dụng mã giảm giá thành công');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/coupons (Admin only)
async function createCoupon(req, res, next) {
  try {
    const { coupon_code, discount_type, discount_value, usage_limit, start_date, end_date } = req.body;

    if (!coupon_code || !discount_type || discount_value === undefined) {
      return errorResponse(res, 'Vui lòng điền mã code, loại giảm giá (percent/fixed) và giá trị giảm', 400);
    }

    if (!['percent', 'fixed'].includes(discount_type)) {
      return errorResponse(res, 'Loại giảm giá phải là "percent" hoặc "fixed"', 400);
    }

    let startDateVal = null;
    if (start_date) {
      startDateVal = new Date(start_date);
      if (typeof start_date === 'string' && start_date.length === 10) {
        startDateVal.setHours(0, 0, 0, 0);
      }
    }

    let endDateVal = null;
    if (end_date) {
      endDateVal = new Date(end_date);
      if (typeof end_date === 'string' && end_date.length === 10) {
        endDateVal.setHours(23, 59, 59, 999);
      }
    }

    if (startDateVal && endDateVal && startDateVal > endDateVal) {
      return errorResponse(res, 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', 400);
    }

    const [result] = await pool.query(
      'INSERT INTO coupons (coupon_code, discount_type, discount_value, usage_limit, start_date, end_date) VALUES (?, ?, ?, ?, ?, ?)',
      [
        coupon_code.trim().toUpperCase(),
        discount_type,
        Number(discount_value),
        limitValue,
        startDateVal,
        endDateVal
      ]
    );

    return successResponse(res, { coupon_id: result.insertId }, 'Tạo mã giảm giá thành công', 201);
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/coupons/:id (Admin only)
async function updateCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const { coupon_code, discount_type, discount_value, usage_limit, start_date, end_date } = req.body;

    const [existing] = await pool.query('SELECT * FROM coupons WHERE coupon_id = ?', [id]);
    if (existing.length === 0) {
      return errorResponse(res, 'Mã giảm giá không tồn tại', 404);
    }

    let startDateVal = start_date !== undefined ? (start_date ? new Date(start_date) : null) : existing[0].start_date;
    if (startDateVal && typeof start_date === 'string' && start_date.length === 10) {
      startDateVal.setHours(0, 0, 0, 0);
    }

    let endDateVal = end_date !== undefined ? (end_date ? new Date(end_date) : null) : existing[0].end_date;
    if (endDateVal && typeof end_date === 'string' && end_date.length === 10) {
      endDateVal.setHours(23, 59, 59, 999);
    }

    if (startDateVal && endDateVal && new Date(startDateVal) > new Date(endDateVal)) {
      return errorResponse(res, 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu', 400);
    }

    const code = coupon_code ? coupon_code.trim().toUpperCase() : existing[0].coupon_code;
    const type = discount_type || existing[0].discount_type;
    const val = discount_value !== undefined ? Number(discount_value) : existing[0].discount_value;
    const limit = usage_limit !== undefined ? (usage_limit === '' || usage_limit === null ? null : Number(usage_limit)) : existing[0].usage_limit;

    await pool.query(
      `UPDATE coupons 
       SET coupon_code = ?, discount_type = ?, discount_value = ?, usage_limit = ?, start_date = ?, end_date = ?
       WHERE coupon_id = ?`,
      [code, type, val, limit, startDateVal, endDateVal, id]
    );

    return successResponse(res, null, 'Cập nhật mã giảm giá thành công');
  } catch (error) {
    next(error);
  }
}

// [POST] /api/coupons/:id/use (Internal - tăng used_count sau khi đặt hàng)
async function incrementCouponUsage(couponId) {
  await pool.query(
    'UPDATE coupons SET used_count = used_count + 1 WHERE coupon_id = ?',
    [couponId]
  );
}

// [DELETE] /api/coupons/:id (Admin only)
async function deleteCoupon(req, res, next) {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM coupons WHERE coupon_id = ?', [id]);
    if (result.affectedRows === 0) {
      return errorResponse(res, 'Mã giảm giá không tồn tại', 404);
    }
    return successResponse(res, null, 'Xóa mã giảm giá thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCoupons,
  validateCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  incrementCouponUsage
};
