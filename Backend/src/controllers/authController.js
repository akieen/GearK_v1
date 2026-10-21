const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');
const { successResponse, errorResponse } = require('../utils/helpers');

function generateToken(userId, role) {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'geark_jwt_secret_token_secure_key_2026',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
}

// [POST] /api/auth/register
async function register(req, res, next) {
  try {
    const { full_name, email, password, role = 'customer' } = req.body;

    if (!full_name || !email || !password) {
      return errorResponse(res, 'Vui lòng cung cấp họ tên, email và mật khẩu', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Mật khẩu phải chứa ít nhất 6 ký tự', 400);
    }

    // Check if email already exists
    const [existing] = await pool.query('SELECT user_id FROM users WHERE email = ? LIMIT 1', [email]);
    if (existing.length > 0) {
      return errorResponse(res, 'Email này đã được sử dụng', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Only allow customer role on public registration (admin can create staff/admin)
    const assignedRole = role === 'admin' ? 'customer' : role;

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [userResult] = await connection.query(
        'INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, ?)',
        [full_name, email, password_hash, assignedRole]
      );
      const userId = userResult.insertId;

      // Automatically initialize cart and wishlist for user
      await connection.query('INSERT INTO carts (user_id) VALUES (?)', [userId]);
      await connection.query('INSERT INTO wishlists (user_id) VALUES (?)', [userId]);

      await connection.commit();

      const token = generateToken(userId, assignedRole);

      return successResponse(
        res,
        {
          user: {
            user_id: userId,
            full_name,
            email,
            role: assignedRole
          },
          token
        },
        'Đăng ký tài khoản thành công',
        201
      );
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (error) {
    next(error);
  }
}

// [POST] /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Vui lòng nhập email và mật khẩu', 400);
    }

    const [users] = await pool.query(
      'SELECT user_id, full_name, email, password_hash, role FROM users WHERE email = ? LIMIT 1',
      [email]
    );

    if (users.length === 0) {
      return errorResponse(res, 'Email hoặc mật khẩu không chính xác', 401);
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Email hoặc mật khẩu không chính xác', 401);
    }

    const token = generateToken(user.user_id, user.role);

    return successResponse(res, {
      user: {
        user_id: user.user_id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      },
      token
    }, 'Đăng nhập thành công');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/auth/profile
async function getProfile(req, res, next) {
  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, role, created_at, updated_at FROM users WHERE user_id = ? LIMIT 1',
      [req.user.user_id]
    );

    if (users.length === 0) {
      return errorResponse(res, 'Không tìm thấy thông tin tài khoản', 404);
    }

    return successResponse(res, users[0], 'Lấy thông tin người dùng thành công');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { full_name, old_password, new_password } = req.body;
    const userId = req.user.user_id;

    if (!full_name && !new_password) {
      return errorResponse(res, 'Không có dữ liệu cần cập nhật', 400);
    }

    if (new_password) {
      if (!old_password) {
        return errorResponse(res, 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu', 400);
      }
      const [rows] = await pool.query('SELECT password_hash FROM users WHERE user_id = ?', [userId]);
      const isMatch = await bcrypt.compare(old_password, rows[0].password_hash);
      if (!isMatch) {
        return errorResponse(res, 'Mật khẩu hiện tại không đúng', 400);
      }
      const salt = await bcrypt.genSalt(10);
      const newHash = await bcrypt.hash(new_password, salt);
      await pool.query('UPDATE users SET password_hash = ? WHERE user_id = ?', [newHash, userId]);
    }

    if (full_name) {
      await pool.query('UPDATE users SET full_name = ? WHERE user_id = ?', [full_name, userId]);
    }

    const [updated] = await pool.query(
      'SELECT user_id, full_name, email, role, updated_at FROM users WHERE user_id = ?',
      [userId]
    );

    return successResponse(res, updated[0], 'Cập nhật thông tin thành công');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/auth/users (Admin only)
async function getAllUsers(req, res, next) {
  try {
    const [users] = await pool.query(
      'SELECT user_id, full_name, email, role, created_at, updated_at FROM users ORDER BY user_id DESC'
    );
    return successResponse(res, users, 'Danh sách người dùng');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/auth/users/:id/role (Admin only)
async function updateUserRole(req, res, next) {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['customer', 'staff', 'admin'].includes(role)) {
      return errorResponse(res, 'Vai trò không hợp lệ (customer, staff, admin)', 400);
    }

    await pool.query('UPDATE users SET role = ? WHERE user_id = ?', [role, id]);
    return successResponse(res, null, 'Cập nhật quyền người dùng thành công');
  } catch (error) {
    next(error);
  }
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getAllUsers,
  updateUserRole
};
