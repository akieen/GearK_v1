import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import DeleteOutlineIcon from '@mui/icons-material/Delete';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { addressApi } from '../api/extraApi';
import { AppButton } from '../components/ui/AppButton';
import { AppInput } from '../components/ui/AppInput';
import { EmptyState } from '../components/ui/EmptyState';
import VietnamAddressFields from '../components/common/VietnamAddressFields';
import vietnamAddressService from '../services/vietnamAddressService';

export const ProfilePage = ({ onNavigate }) => {
  const { user, openAuthModal, refreshProfile } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);
  const [detailAddress, setDetailAddress] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    setFullName(user.full_name || '');
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    try {
      const res = await addressApi.getAddresses();
      if (res.success && res.data) {
        setAddresses(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải địa chỉ:', err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    if (!fullName.trim()) {
      return toast.warning('Họ và tên không được để trống!');
    }

    setUpdatingProfile(true);
    try {
      const res = await authApi.updateProfile({ full_name: fullName.trim() });
      if (res.success) {
        toast.success('Cập nhật thông tin tài khoản thành công!');
        refreshProfile();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật hồ sơ');
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!recipientName || !recipientPhone || !selectedProvince || !selectedWard || !detailAddress) {
      toast.warning('Vui lòng chọn Tỉnh/Thành, Phường/Xã và nhập địa chỉ chi tiết!');
      return;
    }

    const fullStreetAddress = vietnamAddressService.formatAddress(
      detailAddress,
      selectedWard,
      selectedProvince
    );

    setAddingAddress(true);
    try {
      const res = await addressApi.createAddress({
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        street_address: fullStreetAddress,
        is_default: addresses.length === 0,
      });
      if (res.success) {
        toast.success('Đã thêm địa chỉ mới!');
        setRecipientName('');
        setRecipientPhone('');
        setSelectedProvince(null);
        setSelectedWard(null);
        setDetailAddress('');
        loadAddresses();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm địa chỉ');
    } finally {
      setAddingAddress(false);
    }
  };

  const handleDeleteAddress = async (id) => {
    try {
      const res = await addressApi.deleteAddress(id);
      if (res.success) {
        toast.info('Đã xóa địa chỉ');
        loadAddresses();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa địa chỉ');
    }
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <EmptyState
          icon={<PersonIcon />}
          title="Vui lòng đăng nhập"
          description="Đăng nhập để xem và quản lý thông tin hồ sơ của bạn."
          actionText="Đăng nhập ngay"
          onAction={() => openAuthModal('login')}
        />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, pb: 2, borderBottom: '2px solid #E5E7EB' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.primary' }}>
            Thông tin tài khoản
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Quản lý thông tin cá nhân và sổ địa chỉ giao hàng.
          </Typography>
        </Box>

        <Grid container spacing={3.5}>
          {/* Left: 1 khung duy nhất cho User Profile Form */}
          <Grid item xs={12} md={5}>
            <Paper elevation={1} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Avatar
                  sx={{
                    width: 64,
                    height: 64,
                    backgroundColor: 'primary.main',
                    fontWeight: 900,
                    fontSize: '1.5rem',
                  }}
                >
                  {user.full_name?.charAt(0) || 'G'}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 900 }}>
                    {user.full_name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {user.email}
                  </Typography>
                  <Chip
                    label={`Vai trò: ${user.role}`}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      backgroundColor: '#FEE2E2',
                      color: 'primary.main',
                      mt: 0.5,
                    }}
                  />
                </Box>
              </Box>

              <Box component="form" onSubmit={handleUpdateProfile}>
                <AppInput
                  topLabel="Họ và tên *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  placeholder="Nhập họ và tên..."
                />

                <AppInput
                  topLabel="Địa chỉ Email (Cố định theo tài khoản)"
                  value={user.email}
                  disabled
                  sx={{ mb: 2.5 }}
                />

                <AppButton
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={updatingProfile}
                >
                  Lưu thay đổi hồ sơ
                </AppButton>
              </Box>
            </Paper>
          </Grid>

          {/* Right: Address Book */}
          <Grid item xs={12} md={7}>
            <Paper elevation={1} sx={{ p: 3.5, borderRadius: 3, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
                <LocationOnIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 900 }}>
                  Sổ địa chỉ giao hàng ({addresses.length})
                </Typography>
              </Box>

              {/* Existing Addresses List */}
              <Stack spacing={1.5} sx={{ mb: 3 }}>
                {addresses.length === 0 ? (
                  <Typography variant="body2" sx={{ color: 'text.secondary', py: 1 }}>
                    Bạn chưa có địa chỉ giao hàng nào trong sổ. Hãy thêm bên dưới:
                  </Typography>
                ) : (
                  addresses.map((addr) => (
                    <Paper
                      key={addr.address_id}
                      variant="outlined"
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        backgroundColor: '#F8FAFC',
                      }}
                    >
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {addr.recipient_name} • {addr.recipient_phone}
                          </Typography>
                          {addr.is_default ? (
                            <Chip
                              label="Mặc định"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.625rem',
                                fontWeight: 800,
                                backgroundColor: '#D1FAE5',
                                color: '#065F46',
                              }}
                            />
                          ) : null}
                        </Box>
                        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
                          {addr.street_address}
                        </Typography>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => handleDeleteAddress(addr.address_id)}
                        sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Paper>
                  ))
                )}
              </Stack>

              <Divider sx={{ mb: 2.5 }} />

              {/* Add New Address Form */}
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2 }}>
                + Thêm địa chỉ mới
              </Typography>

              <Box component="form" onSubmit={handleAddAddress}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <AppInput
                      topLabel="Họ tên người nhận *"
                      placeholder="Nguyễn Văn Khách"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      required
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <AppInput
                      topLabel="Số điện thoại *"
                      placeholder="0987654321"
                      type="tel"
                      value={recipientPhone}
                      onChange={(e) => setRecipientPhone(e.target.value)}
                      required
                    />
                  </Grid>
                  <VietnamAddressFields
                    selectedProvince={selectedProvince}
                    setSelectedProvince={setSelectedProvince}
                    selectedWard={selectedWard}
                    setSelectedWard={setSelectedWard}
                    detailAddress={detailAddress}
                    setDetailAddress={setDetailAddress}
                    disabled={addingAddress}
                  />
                </Grid>

                <AppButton
                  type="submit"
                  variant="outline"
                  loading={addingAddress}
                  sx={{ mt: 2 }}
                >
                  Thêm địa chỉ vào sổ
                </AppButton>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProfilePage;
