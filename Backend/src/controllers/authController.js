const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { successResponse, errorResponse } = require('../utils/helpers');

function generateToken(userId, role) {
  return jwt.sign(
    { userId: userId.toString(), role },
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

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return errorResponse(res, 'Email này đã được sử dụng', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Only allow customer role on public registration (admin can create staff/admin)
    const assignedRole = role === 'admin' ? 'customer' : role;

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          full_name: full_name.trim(),
          email: cleanEmail,
          password_hash,
          role: assignedRole,
        },
      });

      // Automatically initialize cart and wishlist for user
      await tx.cart.create({ data: { user_id: user.user_id } });
      await tx.wishlist.create({ data: { user_id: user.user_id } });

      return user;
    });

    const token = generateToken(newUser.user_id, assignedRole);

    return successResponse(
      res,
      {
        user: {
          user_id: newUser.user_id,
          full_name: newUser.full_name,
          email: newUser.email,
          role: assignedRole,
        },
        token,
      },
      'Đăng ký tài khoản thành công',
      201
    );
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

    const cleanEmail = email.trim().toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return errorResponse(res, 'Email hoặc mật khẩu không chính xác', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Email hoặc mật khẩu không chính xác', 401);
    }

    const token = generateToken(user.user_id, user.role);

    return successResponse(
      res,
      {
        user: {
          user_id: user.user_id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
        },
        token,
      },
      'Đăng nhập thành công'
    );
  } catch (error) {
    next(error);
  }
}

// [GET] /api/auth/profile
async function getProfile(req, res, next) {
  try {
    const userId = BigInt(req.user.user_id);
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
      select: {
        user_id: true,
        full_name: true,
        email: true,
        role: true,
        created_at: true,
        updated_at: true,
      },
    });

    if (!user) {
      return errorResponse(res, 'Không tìm thấy thông tin tài khoản', 404);
    }

    return successResponse(res, user, 'Lấy thông tin người dùng thành công');
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/auth/profile
async function updateProfile(req, res, next) {
  try {
    const { full_name, old_password, new_password } = req.body;
    const userId = BigInt(req.user.user_id);

    if (!full_name && !new_password) {
      return errorResponse(res, 'Không có dữ liệu cần cập nhật', 400);
    }

    const updateData = {};

    if (new_password) {
      if (!old_password) {
        return errorResponse(res, 'Vui lòng nhập mật khẩu hiện tại để đổi mật khẩu', 400);
      }
      const user = await prisma.user.findUnique({
        where: { user_id: userId },
      });
      if (!user) {
        return errorResponse(res, 'Người dùng không tồn tại', 404);
      }
      const isMatch = await bcrypt.compare(old_password, user.password_hash);
      if (!isMatch) {
        return errorResponse(res, 'Mật khẩu hiện tại không đúng', 400);
      }
      const salt = await bcrypt.genSalt(10);
      updateData.password_hash = await bcrypt.hash(new_password, salt);
    }

    if (full_name) {
      updateData.full_name = full_name.trim();
    }

    const updated = await prisma.user.update({
      where: { user_id: userId },
      data: updateData,
      select: {
        user_id: true,
        full_name: true,
        email: true,
        role: true,
        updated_at: true,
      },
    });

    return successResponse(res, updated, 'Cập nhật thông tin thành công');
  } catch (error) {
    next(error);
  }
}

// [GET] /api/auth/users (Admin only)
async function getAllUsers(req, res, next) {
  try {
    const { role, search, page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offset = (pageNum - 1) * limitNum;

    const whereConditions = {};

    if (role && role !== 'all') {
      whereConditions.role = role;
    }

    if (search && search.trim() !== '') {
      const kw = search.trim();
      whereConditions.OR = [
        { full_name: { contains: kw } },
        { email: { contains: kw } },
      ];
    }

    const [totalItems, users, total_users, total_admins, total_staff, total_customers] =
      await Promise.all([
        prisma.user.count({ where: whereConditions }),
        prisma.user.findMany({
          where: whereConditions,
          orderBy: { user_id: 'desc' },
          skip: offset,
          take: limitNum,
          select: {
            user_id: true,
            full_name: true,
            email: true,
            role: true,
            created_at: true,
            updated_at: true,
          },
        }),
        prisma.user.count(),
        prisma.user.count({ where: { role: 'admin' } }),
        prisma.user.count({ where: { role: 'staff' } }),
        prisma.user.count({ where: { role: 'customer' } }),
      ]);

    const totalPages = Math.ceil(totalItems / limitNum) || 1;

    return successResponse(
      res,
      {
        items: users,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total_items: totalItems,
          total_pages: totalPages,
        },
        summary: {
          total_users,
          total_admins,
          total_staff,
          total_customers,
        },
      },
      'Danh sách người dùng và nhân viên'
    );
  } catch (error) {
    next(error);
  }
}

// [POST] /api/auth/staff (Admin only)
async function createStaff(req, res, next) {
  try {
    const { full_name, email, password } = req.body;

    if (!full_name || !email || !password) {
      return errorResponse(res, 'Vui lòng cung cấp đầy đủ họ tên, email và mật khẩu cho nhân viên', 400);
    }

    if (password.length < 6) {
      return errorResponse(res, 'Mật khẩu phải chứa ít nhất 6 ký tự', 400);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check existing email
    const existing = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });
    if (existing) {
      return errorResponse(res, 'Email này đã tồn tại trên hệ thống', 409);
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const newUser = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          full_name: full_name.trim(),
          email: cleanEmail,
          password_hash,
          role: 'staff',
        },
      });

      // Initialize cart and wishlist
      await tx.cart.create({ data: { user_id: user.user_id } });
      await tx.wishlist.create({ data: { user_id: user.user_id } });

      return user;
    });

    return successResponse(
      res,
      {
        user_id: newUser.user_id,
        full_name: newUser.full_name,
        email: newUser.email,
        role: 'staff',
      },
      'Tạo tài khoản nhân viên (Staff) thành công',
      201
    );
  } catch (error) {
    next(error);
  }
}

// [PUT] /api/auth/users/:id/role (Admin only)
async function updateUserRole(req, res, next) {
  try {
    const targetId = BigInt(req.params.id);
    const currentUserId = BigInt(req.user.user_id);
    const { role } = req.body;

    if (!['customer', 'staff', 'admin'].includes(role)) {
      return errorResponse(res, 'Vai trò không hợp lệ (customer, staff, admin)', 400);
    }

    const existing = await prisma.user.findUnique({
      where: { user_id: targetId },
    });
    if (!existing) {
      return errorResponse(res, 'Người dùng không tồn tại', 404);
    }

    if (currentUserId === targetId && role !== 'admin') {
      return errorResponse(res, 'Bạn không thể tự hạ quyền Admin của chính mình', 400);
    }

    if (existing.role === 'admin' && role !== 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return errorResponse(res, 'Hệ thống cần ít nhất 1 Admin, không thể hạ quyền Admin duy nhất', 400);
      }
    }

    await prisma.user.update({
      where: { user_id: targetId },
      data: { role },
    });

    return successResponse(
      res,
      { user_id: targetId, role },
      `Cập nhật vai trò thành công cho "${existing.full_name}" sang ${role}`
    );
  } catch (error) {
    next(error);
  }
}

// [DELETE] /api/auth/users/:id (Admin only)
async function deleteUser(req, res, next) {
  try {
    const targetId = BigInt(req.params.id);
    const currentUserId = BigInt(req.user.user_id);

    if (currentUserId === targetId) {
      return errorResponse(res, 'Bạn không thể tự xóa tài khoản của chính mình', 400);
    }

    const existing = await prisma.user.findUnique({
      where: { user_id: targetId },
    });
    if (!existing) {
      return errorResponse(res, 'Người dùng không tồn tại', 404);
    }

    if (existing.role === 'admin') {
      const adminCount = await prisma.user.count({ where: { role: 'admin' } });
      if (adminCount <= 1) {
        return errorResponse(res, 'Không thể xóa Admin duy nhất của hệ thống', 400);
      }
    }

    await prisma.user.delete({
      where: { user_id: targetId },
    });

    return successResponse(res, null, `Đã xóa tài khoản "${existing.full_name}" thành công`);
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
  createStaff,
  updateUserRole,
  deleteUser,
};
