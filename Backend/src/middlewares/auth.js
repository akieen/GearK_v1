const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng cung cấp mã xác thực Bearer token (Unauthorized)'
      });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'geark_jwt_secret_token_secure_key_2026');

    // Check if user still exists
    const [rows] = await pool.query(
      'SELECT user_id, full_name, email, role FROM users WHERE user_id = ? LIMIT 1',
      [decoded.userId]
    );

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại hoặc tài khoản đã bị khóa'
      });
    }

    req.user = rows[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token không hợp lệ hoặc đã hết hạn',
      error: error.message
    });
  }
}

async function optionalToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'geark_jwt_secret_token_secure_key_2026');
      const [rows] = await pool.query(
        'SELECT user_id, full_name, email, role FROM users WHERE user_id = ? LIMIT 1',
        [decoded.userId]
      );
      if (rows.length > 0) {
        req.user = rows[0];
      }
    }
  } catch (err) {
    // Ignore invalid optional token
  }
  next();
}

function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Bạn chưa đăng nhập'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền thực hiện thao tác này (Forbidden)'
      });
    }
    next();
  };
}

module.exports = {
  verifyToken,
  optionalToken,
  requireRoles
};
