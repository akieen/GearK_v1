import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Modal } from '../common/ToastContainer';
import Icons from '../common/Icons';

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
    if (authModalMode === 'login') {
      await login(email, password);
    } else {
      await register(fullName, email, password);
    }
    setSubmitting(false);
  };

  const handleQuick = async (role) => {
    setSubmitting(true);
    await quickLogin(role);
    setSubmitting(false);
  };

  return (
    <Modal
      isOpen={authModalOpen}
      onClose={closeAuthModal}
      title={authModalMode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Tài Khoản Mới'}
      maxWidth={440}
    >
      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-light)',
          marginBottom: 20,
        }}
      >
        <button
          onClick={() => setAuthModalMode('login')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontWeight: 700,
            fontSize: 14,
            borderBottom: authModalMode === 'login' ? '2.5px solid var(--primary)' : 'none',
            color: authModalMode === 'login' ? 'var(--primary)' : '#6B7280',
          }}
        >
          Đăng nhập
        </button>
        <button
          onClick={() => setAuthModalMode('register')}
          style={{
            flex: 1,
            padding: '10px 0',
            fontWeight: 700,
            fontSize: 14,
            borderBottom: authModalMode === 'register' ? '2.5px solid var(--primary)' : 'none',
            color: authModalMode === 'register' ? 'var(--primary)' : '#6B7280',
          }}
        >
          Đăng ký
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {authModalMode === 'register' && (
          <div className="form-group">
            <label className="form-label">Họ và tên của bạn</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="Ví dụ: Nguyễn Văn Khách"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">Địa chỉ Email</label>
          <input
            type="email"
            required
            className="form-input"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Mật khẩu</label>
          <input
            type="password"
            required
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          style={{
            width: '100%',
            background: 'linear-gradient(135deg, var(--primary) 0%, #B91C1C 100%)',
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 14,
            padding: '12px',
            borderRadius: 'var(--radius-sm)',
            boxShadow: 'var(--shadow-primary)',
            marginTop: 8,
          }}
        >
          {submitting
            ? 'Đang xử lý...'
            : authModalMode === 'login'
            ? 'ĐĂNG NHẬP'
            : 'TẠO TÀI KHOẢN'}
        </button>
      </form>

      {/* 1-Click Fast Demo Testing Accounts */}
      <div
        style={{
          marginTop: 24,
          paddingTop: 16,
          borderTop: '1px dashed var(--border-light)',
          backgroundColor: '#F9FAFB',
          padding: 14,
          borderRadius: 8,
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: '#374151',
            marginBottom: 8,
            textTransform: 'uppercase',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Icons.Sparkles size={14} style={{ color: 'var(--primary)' }} />
          Tài khoản dùng thử (1 Click Test):
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          <button
            type="button"
            onClick={() => handleQuick('admin')}
            style={{
              padding: '6px 8px',
              fontSize: 11.5,
              fontWeight: 700,
              backgroundColor: '#FEE2E2',
              color: 'var(--primary)',
              borderRadius: 6,
              border: '1px solid #FECACA',
            }}
          >
            👑 Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuick('staff')}
            style={{
              padding: '6px 8px',
              fontSize: 11.5,
              fontWeight: 700,
              backgroundColor: '#DBEAFE',
              color: '#1D4ED8',
              borderRadius: 6,
              border: '1px solid #BFDBFE',
            }}
          >
            👔 Staff
          </button>
          <button
            type="button"
            onClick={() => handleQuick('customer')}
            style={{
              padding: '6px 8px',
              fontSize: 11.5,
              fontWeight: 700,
              backgroundColor: '#D1FAE5',
              color: '#065F46',
              borderRadius: 6,
              border: '1px solid #A7F3D0',
            }}
          >
            🛒 Customer
          </button>
        </div>
      </div>
    </Modal>
  );
};
