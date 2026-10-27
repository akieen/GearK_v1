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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (authModalMode === 'login') {
        await login(email, password);
      } else {
        await register(fullName, email, password);
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
      maxWidth={460}
      title={authModalMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới'}
      headerIcon={<LockOutlinedIcon />}
    >
      {/* Tabs */}
      <Tabs
        value={authModalMode}
        onChange={(e, val) => setAuthModalMode(val)}
        variant="fullWidth"
        textColor="primary"
        indicatorColor="primary"
        sx={{
          mb: 3,
          borderBottom: '1px solid #E5E7EB',
          '& .MuiTab-root': {
            fontWeight: 700,
            fontSize: '0.9375rem',
            textTransform: 'none',
          },
        }}
      >
        <Tab value="login" label="Đăng nhập" />
        <Tab value="register" label="Đăng ký tài khoản" />
      </Tabs>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        {authModalMode === 'register' && (
          <AppInput
            topLabel="Họ và tên của bạn"
            placeholder="Ví dụ: Nguyễn Văn Khách"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            startAdornment={<PersonOutlineIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
          />
        )}

        <AppInput
          topLabel="Địa chỉ Email"
          type="email"
          placeholder="name@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          startAdornment={<MailOutlineIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
        />

        <AppInput
          topLabel="Mật khẩu"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          startAdornment={<LockOutlinedIcon fontSize="small" sx={{ color: 'text.disabled' }} />}
          sx={{ mb: 2.5 }}
        />

        <AppButton
          type="submit"
          variant="primary"
          fullWidth
          size="large"
          loading={submitting}
          glow
          sx={{ mb: 2.5 }}
        >
          {authModalMode === 'login' ? 'Đăng nhập ngay' : 'Tạo tài khoản'}
        </AppButton>
      </Box>

      {/* Quick Test Login */}
      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.disabled', fontWeight: 600, px: 1 }}>
          HOẶC ĐĂNG NHẬP NHANH (TEST DEMO)
        </Typography>
      </Divider>

      <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
        <AppButton
          variant="soft"
          size="small"
          fullWidth
          onClick={() => handleQuick('customer')}
          disabled={submitting}
        >
          Khách hàng
        </AppButton>
        <AppButton
          variant="secondary"
          size="small"
          fullWidth
          onClick={() => handleQuick('staff')}
          disabled={submitting}
        >
          Nhân viên
        </AppButton>
        <AppButton
          variant="primary"
          size="small"
          fullWidth
          onClick={() => handleQuick('admin')}
          disabled={submitting}
        >
          Quản trị viên
        </AppButton>
      </Stack>
    </AppDialog>
  );
};

export default AuthModal;
