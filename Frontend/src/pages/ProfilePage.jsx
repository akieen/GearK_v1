import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { authApi } from '../api/authApi';
import { addressApi } from '../api/extraApi';
import Icons from '../components/common/Icons';

export const ProfilePage = ({ onNavigate }) => {
  const { user, openAuthModal, refreshProfile } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [password, setPassword] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const [addresses, setAddresses] = useState([]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientPhone, setRecipientPhone] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
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
    setUpdatingProfile(true);
    try {
      const payload = { full_name: fullName };
      if (password.trim()) {
        payload.password = password.trim();
      }
      const res = await authApi.updateProfile(payload);
      if (res.success) {
        toast.success('Cập nhật thông tin tài khoản thành công!');
        setPassword('');
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
    if (!recipientName || !recipientPhone || !streetAddress) {
      toast.warning('Vui lòng nhập đủ thông tin địa chỉ!');
      return;
    }
    setAddingAddress(true);
    try {
      const res = await addressApi.createAddress({
        recipient_name: recipientName.trim(),
        recipient_phone: recipientPhone.trim(),
        street_address: streetAddress.trim(),
        is_default: addresses.length === 0,
      });
      if (res.success) {
        toast.success('Đã thêm địa chỉ mới!');
        setRecipientName('');
        setRecipientPhone('');
        setStreetAddress('');
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
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Vui lòng đăng nhập để xem thông tin tài khoản.</p>
        <button
          onClick={() => openAuthModal('login')}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 700,
            marginTop: 14,
          }}
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 0 48px 0' }}>
      <div style={{ paddingBottom: 16, borderBottom: '2px solid var(--border-light)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>
          TÀI KHOẢN CỦA TÔI
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          Quản lý thông tin cá nhân và sổ địa chỉ giao hàng.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: 28 }}>
        {/* Left: User Profile */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid var(--border-light)',
            padding: 24,
            boxShadow: 'var(--shadow-xs)',
            height: 'fit-content',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 22,
                fontWeight: 900,
              }}
            >
              {user.full_name?.charAt(0) || 'G'}
            </div>
            <div>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: '#111827' }}>{user.full_name}</h3>
              <p style={{ fontSize: 13, color: '#6B7280' }}>{user.email}</p>
              <span
                style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  backgroundColor: '#FEE2E2',
                  color: 'var(--primary)',
                  borderRadius: 4,
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  display: 'inline-block',
                  marginTop: 4,
                }}
              >
                Vai trò: {user.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label">Họ và tên</label>
              <input
                type="text"
                required
                className="form-input"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Đổi mật khẩu mới (Bỏ trống nếu không đổi)</label>
              <input
                type="password"
                className="form-input"
                placeholder="Nhập mật khẩu mới..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={updatingProfile}
              style={{
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                padding: '10px 20px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                width: '100%',
                marginTop: 8,
              }}
            >
              {updatingProfile ? 'Đang cập nhật...' : 'Lưu thay đổi'}
            </button>
          </form>
        </div>

        {/* Right: Address Book */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid var(--border-light)',
            padding: 24,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, color: '#111827' }}>
            Sổ địa chỉ nhận hàng ({addresses.length})
          </h3>

          {/* Existing Addresses */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
            {addresses.map((addr) => (
              <div
                key={addr.address_id}
                style={{
                  border: '1px solid var(--border-light)',
                  borderRadius: 8,
                  padding: 14,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: '#111827' }}>
                    {addr.recipient_name} • {addr.recipient_phone}
                  </div>
                  <div style={{ fontSize: 13, color: '#4B5563', marginTop: 4 }}>
                    {addr.street_address}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteAddress(addr.address_id)}
                  style={{ color: '#EF4444', padding: 6 }}
                  title="Xóa địa chỉ này"
                >
                  <Icons.Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add new address */}
          <div style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: '#111827' }}>
              + Thêm địa chỉ mới
            </h4>
            <form onSubmit={handleAddAddress}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Tên người nhận</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Nguyễn Văn Khách"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Số điện thoại</label>
                  <input
                    type="tel"
                    required
                    className="form-input"
                    placeholder="0987654321"
                    value={recipientPhone}
                    onChange={(e) => setRecipientPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Địa chỉ chi tiết</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/TP"
                  value={streetAddress}
                  onChange={(e) => setStreetAddress(e.target.value)}
                />
              </div>
              <button
                type="submit"
                disabled={addingAddress}
                style={{
                  backgroundColor: '#1F2937',
                  color: '#FFFFFF',
                  padding: '8px 18px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                {addingAddress ? 'Đang thêm...' : 'Thêm địa chỉ'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
