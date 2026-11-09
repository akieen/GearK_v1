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

import { useAuth } from '../../context/AuthContext';
import { AppDialog } from '../ui/AppDialog';
import { AppInput } from '../ui/AppInput';
import { AppButton } from '../ui/AppButton';

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
    register,
    verifyOtp,
    resendOtp,
    quickLogin,
  } = useAuth();

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('input'); // 'input' | 'otp'
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  // Đếm ngược gửi lại OTP
  useEffect(() => {
    let timer;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Reset step khi đổi mode hoặc đóng modal
  useEffect(() => {
    if (!authModalOpen) {
      setStep('input');
      setOtp('');
      setCountdown(60);
      setCanResend(false);
    }
  }, [authModalOpen]);

  const isLogin = authModalMode === 'login';
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleTabChange = (e, val) => {
    setAuthModalMode(val);
    setStep('input');
    setOtp('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        if (step === 'input') {
          // Bấm Đăng ký -> Gửi OTP về mail
          const res = await register(form.fullName, form.email, form.password);
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

  const handleQuick = async (role) => {
    setSubmitting(true);
    try {
      await quickLogin(role);
    } finally {
      setSubmitting(false);
    }
  };

  const dialogTitle = isLogin
    ? 'Đăng Nhập Tài Khoản'
    : step === 'otp'
    ? 'Xác Thực Mã OTP'
    : 'Đăng Ký Tài Khoản';

  return (
    <AppDialog
      open={authModalOpen}
      onClose={closeAuthModal}
      maxWidth="xs"
      PaperProps={{ sx: { maxWidth: 440, width: '100%' } }}
      sx={{ '& .MuiDialog-paper': { maxWidth: 440, width: '100%' } }}
      title={dialogTitle}
      headerIcon={step === 'otp' ? <KeyIcon /> : <LockOutlinedIcon />}
    >
      {step === 'input' && (
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

      {/* GIAO DIỆN NHẬP MÃ OTP */}
      {!isLogin && step === 'otp' ? (
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
            <AppInput
              topLabel="Họ và tên"
              placeholder="Ví dụ: Nguyễn Văn Khách"
              value={form.fullName}
              onChange={handleChange('fullName')}
              required
              startAdornment={<PersonOutlineIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
            />
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
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange('password')}
            required
            startAdornment={<LockOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
            sx={{ mb: 2.5 }}
          />

          <AppButton type="submit" variant="primary" fullWidth size="large" loading={submitting} glow>
            {isLogin ? 'Đăng nhập ngay' : 'Gửi mã OTP xác thực'}
          </AppButton>
        </Box>
      )}

      {/* QUICK LOGIN (DEMO) */}
      {step === 'input' && (
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
