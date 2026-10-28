import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlined';

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
    quickLogin,
  } = useAuth();

  const [form, setForm] = useState({ fullName: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const isLogin = authModalMode === 'login';
  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isLogin) {
        await login(form.email, form.password);
      } else {
        await register(form.fullName, form.email, form.password);
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

  return (
    <AppDialog
      open={authModalOpen}
      onClose={closeAuthModal}
      maxWidth="xs" // SỬA TẠI ĐÂY: Dùng "xs" (~444px) chuẩn của MUI để thu gọn khung trắng ngoài cùng
      PaperProps={{ sx: { maxWidth: 440, width: '100%' } }} // Dự phòng nếu AppDialog có nhận PaperProps
      sx={{ '& .MuiDialog-paper': { maxWidth: 440, width: '100%' } }} // Ép cứng khung trắng chỉ rộng 440px
      title={isLogin ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản'}
      headerIcon={<LockOutlinedIcon />}
    >
      <Tabs
        value={authModalMode}
        onChange={(e, val) => setAuthModalMode(val)}
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
          {isLogin ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
        </AppButton>
      </Box>

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
    </AppDialog>
  );
};

export default AuthModal;