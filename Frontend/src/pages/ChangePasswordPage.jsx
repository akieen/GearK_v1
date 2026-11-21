import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { AppButton } from '../components/ui/AppButton';
import { AppInput } from '../components/ui/AppInput';
import { EmptyState } from '../components/ui/EmptyState';

export const ChangePasswordPage = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const toast = useToast();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      openAuthModal('login');
    }
  }, [user]);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!oldPassword.trim()) {
      return toast.warning('Vui lòng nhập mật khẩu hiện tại!');
    }
    if (!newPassword.trim()) {
      return toast.warning('Vui lòng nhập mật khẩu mới!');
    }
    if (newPassword.length < 6) {
      return toast.warning('Mật khẩu mới phải có ít nhất 6 ký tự!');
    }
    if (newPassword !== confirmPassword) {
      return toast.warning('Mật khẩu mới và xác nhận mật khẩu không khớp!');
    }

    setLoading(true);
    try {
      const res = await authApi.updateProfile({
        old_password: oldPassword.trim(),
        new_password: newPassword.trim(),
      });
      if (res.success) {
        toast.success('Đổi mật khẩu thành công! Vui lòng ghi nhớ mật khẩu mới.');
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      toast.error(err.message || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra lại mật khẩu hiện tại!');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <EmptyState
          icon={<LockOutlinedIcon />}
          title="Vui lòng đăng nhập"
          description="Đăng nhập để thực hiện đổi mật khẩu tài khoản."
          actionText="Đăng nhập ngay"
          onAction={() => openAuthModal('login')}
        />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 5, pb: 10, bgcolor: '#F8FAFC', minHeight: '80vh' }}>
      <Container maxWidth="sm">
        {/* Back button */}
        <Button
          startIcon={<ChevronLeftIcon />}
          onClick={() => onNavigate('profile')}
          sx={{ mb: 2.5, textTransform: 'none', color: '#64748B', fontWeight: 700 }}
        >
          Quay lại thông tin tài khoản
        </Button>

        <Paper
          elevation={1}
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: 3.5,
            border: '1px solid #E2E8F0',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: '#FEE2E2',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#1E293B', letterSpacing: '-0.3px' }}>
                Đổi mật khẩu
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                Tài khoản: <strong>{user.email}</strong>
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 3 }} />

          <Box component="form" onSubmit={handleChangePassword}>
            <AppInput
              topLabel="Mật khẩu hiện tại *"
              type="password"
              placeholder="Nhập mật khẩu hiện tại của bạn..."
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
            />

            <AppInput
              topLabel="Mật khẩu mới *"
              type="password"
              placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)..."
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />

            <AppInput
              topLabel="Xác nhận lại mật khẩu mới *"
              type="password"
              placeholder="Nhập lại mật khẩu mới..."
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              sx={{ mb: 3 }}
            />

            <Alert
              severity="info"
              icon={<SecurityIcon fontSize="inherit" />}
              sx={{ mb: 3, fontSize: 13, '& .MuiAlert-message': { fontSize: 13 } }}
            >
              Để bảo mật tài khoản tốt nhất, hãy dùng mật khẩu tối thiểu 6 ký tự kết hợp chữ hoa, chữ thường và số.
            </Alert>

            <Stack direction="row" spacing={1.5} justifyContent="flex-end">
              <Button
                variant="outlined"
                onClick={() => onNavigate('profile')}
                sx={{ textTransform: 'none', borderRadius: 2, fontWeight: 700, px: 2.5 }}
              >
                Hủy bỏ
              </Button>
              <AppButton
                type="submit"
                variant="primary"
                loading={loading}
                sx={{ px: 3 }}
              >
                Cập nhật mật khẩu
              </AppButton>
            </Stack>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default ChangePasswordPage;
