import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';
import KeyIcon from '@mui/icons-material/Key';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LockResetIcon from '@mui/icons-material/LockReset';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';

import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { AppDialog } from '../ui/AppDialog';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';
import GoogleLoginButton from './GoogleLoginButton';

const QUICK_ROLES = [
  { role: 'customer', label: 'Khách hàng', variant: 'soft' },
  { role: 'staff', label: 'Nhân viên', variant: 'secondary' },
  { role: 'admin', label: 'Quản trị', variant: 'primary' },
];

export const AuthModal = () => {
  const {
    authModalOpen,
    authModalMode,
    setAuthModalMode,
    closeAuthModal,
    login,
    loginWithGoogle,
    register,
    verifyOtp,
    resendOtp,
    forgotPassword,
    resendResetOtp,
    resetPassword,
    quickLogin,
  } = useAuth();
  const toast = useToast();

  const [form, setForm] = useState({ fullName: '', email: '', password: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // State cho luồng Quên mật khẩu
  const [forgotStep, setForgotStep] = useState('email'); // 'email' | 'reset'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isForgot = authModalMode === 'forgot' || authModalMode === 'forgot_password';
  const isLogin = authModalMode === 'login';

  // Đếm ngược gửi lại OTP
  useEffect(() => {
    let timer;
    const isWaitingOtp = (!isForgot && step === 'otp') || (isForgot && forgotStep === 'reset');
    if (isWaitingOtp && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, isForgot, forgotStep, countdown]);

  // Reset step khi đổi mode hoặc đóng modal
  useEffect(() => {
    if (!authModalOpen) {
      setStep('input');
      setOtp('');
      setForgotStep('email');
      setForgotOtp('');
      setNewPassword('');
      setConfirmPassword('');
      setCountdown(60);
      setCanResend(false);
    }
  }, [authModalOpen]);

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleTabChange = (e, val) => {
    setAuthModalMode(val);
    setStep('input');
    setOtp('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin && step === 'input') {
      // Validate phone: 10-11 số, không có chữ
      const cleanPhone = (form.phone || '').trim();
      if (!cleanPhone) {
        return toast.warning('Vui lòng nhập số điện thoại');
      }
      if (!/^[0-9]{10,11}$/.test(cleanPhone)) {
        return toast.warning('Số điện thoại phải từ 10-11 số và không chứa chữ hoặc ký tự khác');
      }

      // Validate password: tối thiểu 9 ký tự, gồm chữ hoa, thường, số, ký tự đặc biệt
      const pwd = form.password || '';
      if (pwd.length < 9) {
        return toast.warning('Mật khẩu phải có tối thiểu 9 ký tự');
      }
      if (!/[A-Z]/.test(pwd)) {
        return toast.warning('Mật khẩu phải chứa ít nhất 1 chữ hoa');
      }
      if (!/[a-z]/.test(pwd)) {
        return toast.warning('Mật khẩu phải chứa ít nhất 1 chữ thường');
      }
      if (!/[0-9]/.test(pwd)) {
        return toast.warning('Mật khẩu phải chứa ít nhất 1 số');
      }
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd)) {
        return toast.warning('Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (!@#$%...)');
      }
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (step === 'input') {
          // Bấm Đăng ký -> Gửi OTP về mail
          const res = await register(form.fullName, form.email, form.password, form.phone.trim());
          if (res?.success && res?.requires_otp) {
            setStep('otp');
            setCountdown(60);
            setCanResend(false);
          }
        } else {
          // Bấm Xác thực OTP -> Kích hoạt tài khoản
          await verifyOtp(form.email, otp);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setSubmitting(true);
    try {
      const res = await resendOtp(form.email);
      if (res?.success) {
        setCountdown(60);
        setCanResend(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Bước 1 Quên mật khẩu: Nhập email kiểm tra và gửi OTP
  const handleForgotEmailSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      return toast.warning('Vui lòng nhập địa chỉ email của bạn!');
    }
    setSubmitting(true);
    try {
      const res = await forgotPassword(forgotEmail.trim());
      if (res?.success) {
        setForgotStep('reset');
        setCountdown(60);
        setCanResend(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Gửi lại mã OTP quên mật khẩu
  const handleForgotResend = async () => {
    if (!canResend) return;
    setSubmitting(true);
    try {
      const res = await resendResetOtp(forgotEmail.trim());
      if (res?.success) {
        setCountdown(60);
        setCanResend(false);
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Bước 2 Quên mật khẩu: Xác nhận OTP và đặt lại mật khẩu mới
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!forgotOtp.trim() || forgotOtp.trim().length < 6) {
      return toast.warning('Vui lòng nhập đầy đủ mã OTP 6 số!');
    }
    if (!newPassword.trim()) {
      return toast.warning('Vui lòng nhập mật khẩu mới!');
    }

    const pwd = newPassword.trim();
    if (pwd.length < 9) {
      return toast.warning('Mật khẩu mới phải có tối thiểu 9 ký tự!');
    }
    if (!/[A-Z]/.test(pwd)) {
      return toast.warning('Mật khẩu mới phải chứa ít nhất 1 chữ hoa!');
    }
    if (!/[a-z]/.test(pwd)) {
      return toast.warning('Mật khẩu mới phải chứa ít nhất 1 chữ thường!');
    }
    if (!/[0-9]/.test(pwd)) {
      return toast.warning('Mật khẩu mới phải chứa ít nhất 1 số!');
    }
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(pwd)) {
      return toast.warning('Mật khẩu mới phải chứa ít nhất 1 ký tự đặc biệt!');
    }

    if (newPassword !== confirmPassword) {
      return toast.warning('Mật khẩu xác nhận không khớp với mật khẩu mới!');
    }

    setSubmitting(true);
    try {
      const res = await resetPassword(forgotEmail.trim(), forgotOtp.trim(), newPassword.trim());
      if (res?.success) {
        // Tự động điền email vào form đăng nhập để user đăng nhập ngay
        setForm((prev) => ({ ...prev, email: forgotEmail.trim(), password: '' }));
        setAuthModalMode('login');
        setForgotStep('email');
        setForgotOtp('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuick = async (role) => {
    setSubmitting(true);
    try {
      await quickLogin(role);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSuccess = async (credential) => {
    setSubmitting(true);
    try {
      await loginWithGoogle(credential);
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle = isForgot
    ? forgotStep === 'email'
      ? 'Quên Mật Khẩu'
      : 'Thiết Lập Mật Khẩu Mới'
    : isLogin
    ? 'Đăng Nhập Tài Khoản'
    : step === 'otp'
    ? 'Xác Thực Mã OTP'
    : 'Đăng Ký Tài Khoản';

  const dialogHeaderIcon = isForgot
    ? <LockResetIcon />
    : step === 'otp'
    ? <KeyIcon />
    : <LockOutlinedIcon />;

  return (
    <AppDialog
      open={authModalOpen}
      onClose={closeAuthModal}
      maxWidth="xs"
      PaperProps={{ sx: { maxWidth: 440, width: '100%' } }}
      sx={{ '& .MuiDialog-paper': { maxWidth: 440, width: '100%' } }}
      title={dialogTitle}
      headerIcon={dialogHeaderIcon}
    >
      {!isForgot && step === 'input' && (
        <Tabs
          value={authModalMode}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
          sx={{
            mb: 2.5,
            borderBottom: '1px solid #E5E7EB',
            '& .MuiTab-root': { fontWeight: 700, textTransform: 'none' },
          }}
        >
          <Tab value="login" label="Đăng nhập" />
          <Tab value="register" label="Đăng ký" />
        </Tabs>
      )}

      {/* ---------------------------------------------------- */}
      {/* TRƯỜNG HỢP 1: GIAO DIỆN QUÊN MẬT KHẨU               */}
      {/* ---------------------------------------------------- */}
      {isForgot ? (
        forgotStep === 'email' ? (
          /* BƯỚC 1: NHẬP EMAIL ĐỂ KIỂM TRA & NHẬN OTP */
          <Box component="form" onSubmit={handleForgotEmailSubmit}>
            <Alert severity="info" sx={{ mb: 2.5, fontSize: '13px' }}>
              Nhập địa chỉ email tài khoản GearK của bạn. Hệ thống sẽ kiểm tra tài khoản và gửi mã xác thực OTP về email để bạn đặt lại mật khẩu.
            </Alert>

            <AppInput
              topLabel="Địa chỉ Email"
              type="email"
              placeholder="name@example.com"
              value={forgotEmail}
              onChange={(e) => setForgotEmail(e.target.value)}
              required
              autoFocus
              startAdornment={<MailOutlineIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
              sx={{ mb: 2.5 }}
            />

            <Stack spacing={1.5}>
              <AppButton
                type="submit"
                variant="primary"
                fullWidth
                size="large"
                loading={submitting}
                glow
              >
                Gửi mã xác thực OTP
              </AppButton>

              <AppButton
                variant="soft"
                fullWidth
                size="small"
                startIcon={<ArrowBackIcon fontSize="small" />}
                onClick={() => {
                  setAuthModalMode('login');
                  setForgotStep('email');
                }}
              >
                Quay lại đăng nhập
              </AppButton>
            </Stack>
          </Box>
        ) : (
          /* BƯỚC 2: NHẬP OTP VÀ THIẾT LẬP MẬT KHẨU MỚI */
          <Box component="form" onSubmit={handleResetPasswordSubmit}>
            <Alert severity="info" sx={{ mb: 2, fontSize: '13px' }}>
              Mã OTP 6 số đã được gửi tới <strong>{forgotEmail}</strong>. Vui lòng kiểm tra hộp thư và nhập mã cùng mật khẩu mới.
            </Alert>

            <AppInput
              topLabel="Mã xác thực OTP (6 chữ số)"
              placeholder="Ví dụ: 123456"
              value={forgotOtp}
              onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  letterSpacing: '6px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                },
              }}
              startAdornment={<KeyIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
              sx={{ mb: 1.5 }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12.5px' }}>
                Chưa nhận được mã?
              </Typography>
              <AppButton
                variant="text"
                size="small"
                disabled={!canResend || submitting}
                onClick={handleForgotResend}
                sx={{ fontSize: '12.5px', textTransform: 'none', fontWeight: 600 }}
              >
                {canResend ? 'Gửi lại mã OTP' : `Gửi lại sau (${countdown}s)`}
              </AppButton>
            </Stack>

            <AppInput
              topLabel="Mật khẩu mới"
              type="password"
              placeholder="Tối thiểu 9 ký tự (gồm hoa, thường, số, ký tự đặc biệt)"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              startAdornment={<LockOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
              sx={{ mb: 1.5 }}
            />

            <AppInput
              topLabel="Xác nhận mật khẩu mới"
              type="password"
              placeholder="Nhập lại mật khẩu mới"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              startAdornment={<LockOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
              sx={{ mb: 2.5 }}
            />

            <Stack spacing={1.5}>
              <AppButton
                type="submit"
                variant="primary"
                fullWidth
                size="large"
                loading={submitting}
                disabled={forgotOtp.trim().length < 6 || !newPassword || !confirmPassword}
                glow
              >
                Xác nhận đặt lại mật khẩu
              </AppButton>

              <AppButton
                variant="soft"
                fullWidth
                size="small"
                startIcon={<ArrowBackIcon fontSize="small" />}
                onClick={() => {
                  setForgotStep('email');
                  setForgotOtp('');
                }}
              >
                Đổi địa chỉ email khác
              </AppButton>
            </Stack>
          </Box>
        )
      ) : (
        /* ---------------------------------------------------- */
        /* TRƯỜNG HỢP 2: ĐĂNG NHẬP HOẶC ĐĂNG KÝ                */
        /* ---------------------------------------------------- */
        !isLogin && step === 'otp' ? (
          /* GIAO DIỆN NHẬP MÃ OTP ĐĂNG KÝ */
          <Box component="form" onSubmit={handleSubmit}>
            <Alert severity="info" sx={{ mb: 2.5, fontSize: '13px' }}>
              Mã OTP 6 số đã được gửi tới email <strong>{form.email}</strong>. Vui lòng kiểm tra hộp thư (bao gồm mục Spam/Quảng cáo).
            </Alert>

            <AppInput
              topLabel="Mã xác thực OTP (6 chữ số)"
              placeholder="Ví dụ: 123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required
              autoFocus
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: 'center',
                  letterSpacing: '6px',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  fontFamily: 'monospace',
                },
              }}
              startAdornment={<KeyIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
              sx={{ mb: 2 }}
            />

            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '12.5px' }}>
                Chưa nhận được mã?
              </Typography>
              <AppButton
                variant="text"
                size="small"
                disabled={!canResend || submitting}
                onClick={handleResend}
                sx={{ fontSize: '12.5px', textTransform: 'none', fontWeight: 600 }}
              >
                {canResend ? 'Gửi lại mã OTP' : `Gửi lại sau (${countdown}s)`}
              </AppButton>
            </Stack>

            <Stack spacing={1.5}>
              <AppButton
                type="submit"
                variant="primary"
                fullWidth
                size="large"
                loading={submitting}
                disabled={otp.trim().length < 6}
                glow
              >
                Xác nhận & Hoàn tất đăng ký
              </AppButton>

              <AppButton
                variant="soft"
                fullWidth
                size="small"
                startIcon={<ArrowBackIcon fontSize="small" />}
                onClick={() => {
                  setStep('input');
                  setOtp('');
                }}
              >
                Quay lại chỉnh sửa email
              </AppButton>
            </Stack>
          </Box>
        ) : (
          /* GIAO DIỆN NHẬP FORM ĐĂNG NHẬP / ĐĂNG KÝ BAN ĐẦU */
          <Box component="form" onSubmit={handleSubmit}>
            {!isLogin && (
              <>
                <AppInput
                  topLabel="Họ và tên"
                  placeholder="Ví dụ: Nguyễn Văn Khách"
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  required
                  startAdornment={<PersonOutlineIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
                />
                <AppInput
                  topLabel="Số điện thoại (10 - 11 chữ số)"
                  placeholder="Ví dụ: 0912345678"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, '').slice(0, 11) })}
                  required
                  startAdornment={<PhoneIphoneIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
                  helperText="10-11 số, không có chữ cái, mỗi tài khoản gắn với 1 số điện thoại"
                />
              </>
            )}

            <AppInput
              topLabel="Địa chỉ Email"
              type="email"
              placeholder="name@example.com"
              value={form.email}
              onChange={handleChange('email')}
              required
              startAdornment={<MailOutlineIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
            />

            <AppInput
              topLabel="Mật khẩu"
              type="password"
              placeholder={isLogin ? "••••••••" : "Tối thiểu 9 ký tự (gồm hoa, thường, số, ký tự đặc biệt)"}
              value={form.password}
              onChange={handleChange('password')}
              required
              startAdornment={<LockOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
              helperText={!isLogin ? "Mật khẩu tối thiểu 9 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt" : undefined}
              sx={{ mb: isLogin ? 1 : 2.5 }}
            />

            {/* Nút Quên mật khẩu trong form Đăng nhập */}
            {isLogin && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <Typography
                  variant="body2"
                  sx={{
                    color: '#0284C7',
                    cursor: 'pointer',
                    fontWeight: 600,
                    fontSize: '12.5px',
                    '&:hover': { textDecoration: 'underline', color: '#0369A1' },
                  }}
                  onClick={() => {
                    setAuthModalMode('forgot');
                    setForgotStep('email');
                    setForgotEmail(form.email || '');
                    setForgotOtp('');
                    setNewPassword('');
                    setConfirmPassword('');
                    setCountdown(60);
                    setCanResend(false);
                  }}
                >
                  Quên mật khẩu?
                </Typography>
              </Box>
            )}

            <AppButton type="submit" variant="primary" fullWidth size="large" loading={submitting} glow>
              {isLogin ? 'Đăng nhập ngay' : 'Gửi mã OTP xác thực'}
            </AppButton>
          </Box>
        )
      )}

      {/* ĐĂNG NHẬP BẰNG GOOGLE (CHỈ HIỂN THỊ KHI Ở FORM ĐĂNG NHẬP / ĐĂNG KÝ) */}
      {!isForgot && step === 'input' && (
        <Box sx={{ mt: 2 }}>
          <Divider sx={{ mb: 1.5 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, px: 1 }}>
              HOẶC
            </Typography>
          </Divider>

          <GoogleLoginButton onGoogleSuccess={handleGoogleSuccess} disabled={submitting} />
        </Box>
      )}

      {/* QUICK LOGIN (DEMO) */}
      {!isForgot && step === 'input' && (
        <>
          <Divider sx={{ my: 2.5 }}>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600 }}>
              ĐĂNG NHẬP NHANH (DEMO)
            </Typography>
          </Divider>

          <Stack direction="row" spacing={1}>
            {QUICK_ROLES.map(({ role, label, variant }) => (
              <AppButton
                key={role}
                variant={variant}
                size="small"
                fullWidth
                disabled={submitting}
                onClick={() => handleQuick(role)}
              >
                {label}
              </AppButton>
            ))}
          </Stack>
        </>
      )}
    </AppDialog>
  );
};

export default AuthModal;
