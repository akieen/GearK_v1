const prisma = require('../config/prisma');

// Bộ nhớ tạm thời lưu mã OTP: Map<email, { otp, expiresAt, full_name, password_hash, role } >
const otpStore = new Map();

/**
 * Sinh mã OTP ngẫu nhiên 6 chữ số
 */
function generateOtpCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Lưu thông tin đăng ký và mã OTP tạm thời (hiệu lực 10 phút)
 */
function saveRegistrationOtp({ email, full_name, password_hash, role = 'customer' }) {
  const cleanEmail = email.trim().toLowerCase();
  const otp = generateOtpCode();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 phút

  otpStore.set(cleanEmail, {
    otp,
    expiresAt,
    full_name: full_name.trim(),
    password_hash,
    role,
  });

  return { otp, expiresAt };
}

/**
 * Xác minh mã OTP
 */
function verifyOtp(email, inputOtp) {
  const cleanEmail = email.trim().toLowerCase();
  const record = otpStore.get(cleanEmail);

  if (!record) {
    return { valid: false, message: 'Yêu cầu xác thực OTP không tồn tại hoặc đã hết hạn' };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(cleanEmail);
    return { valid: false, message: 'Mã OTP đã hết hạn, vui lòng gửi lại mã mới' };
  }

  if (record.otp !== inputOtp.toString().trim()) {
    return { valid: false, message: 'Mã OTP không chính xác, vui lòng thử lại' };
  }

  // OTP hợp lệ -> trả về dữ liệu và xóa khỏi store để tránh dùng lại
  otpStore.delete(cleanEmail);
  return {
    valid: true,
    data: {
      email: cleanEmail,
      full_name: record.full_name,
      password_hash: record.password_hash,
      role: record.role,
    },
  };
}

/**
 * Lấy thông tin OTP hiện tại (phục vụ resend)
 */
function getOtpRecord(email) {
  const cleanEmail = email.trim().toLowerCase();
  return otpStore.get(cleanEmail) || null;
}

module.exports = {
  generateOtpCode,
  saveRegistrationOtp,
  verifyOtp,
  getOtpRecord,
};

