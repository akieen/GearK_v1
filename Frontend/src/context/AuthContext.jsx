import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api/authApi';
import { useToast } from './ToastContext';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('geark_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('geark_token') || null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const toast = useToast();

  const fetchProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await authApi.getProfile();
      if (res.success && res.data) {
        setUser(res.data);
        localStorage.setItem('geark_user', JSON.stringify(res.data));
      }
    } catch (err) {
      console.warn('Phiên đăng nhập đã hết hạn hoặc không hợp lệ');
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.success && res.data) {
        const { user: userData, token: userToken } = res.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('geark_token', userToken);
        localStorage.setItem('geark_user', JSON.stringify(userData));
        toast.success(`Chào mừng ${userData.full_name} quay trở lại!`);
        setAuthModalOpen(false);
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toast.error(err.message || 'Đăng nhập không thành công');
      return { success: false, message: err.message };
    }
  };

  const register = async (full_name, email, password) => {
    try {
      const res = await authApi.register(full_name, email, password);
      if (res.success) {
        toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
        setAuthModalMode('login');
        return { success: true };
      }
      return { success: false, message: res.message };
    } catch (err) {
      toast.error(err.message || 'Đăng ký không thành công');
      return { success: false, message: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('geark_token');
    localStorage.removeItem('geark_user');
    toast.info('Bạn đã đăng xuất tài khoản.');
  };

  // Quick 1-click login for grading/demo
  const quickLogin = async (role = 'customer') => {
    const creds = {
      admin: { email: 'admin@geark.vn', pass: 'admin123' },
      staff: { email: 'staff@geark.vn', pass: 'staff123' },
      customer: { email: 'customer@geark.vn', pass: 'customer123' },
    };
    const cred = creds[role] || creds.customer;
    return await login(cred.email, cred.pass);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  const isAdmin = user?.role === 'admin';
  const isStaff = user?.role === 'staff' || user?.role === 'admin';
  const isCustomer = user?.role === 'customer';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAdmin,
        isStaff,
        isCustomer,
        login,
        register,
        logout,
        quickLogin,
        authModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        refreshProfile: fetchProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
