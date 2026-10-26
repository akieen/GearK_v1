import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { authApi } from '../../api/authApi';
import { formatDate } from '../../utils/formatters';
import Icons from '../../components/common/Icons';

export default function UsersTab({ user, isAdmin, toast }) {
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total_users: 0, total_admins: 0, total_staff: 0, total_customers: 0 });
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total_pages: 1, total_items: 0 });

  // Add staff modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [submittingStaff, setSubmittingStaff] = useState(false);

  // Edit role modal state
  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('staff');
  const [submittingRole, setSubmittingRole] = useState(false);

  // Fetch users list
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.getUsers({
        page,
        limit,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: searchTerm.trim() || undefined,
      });
      if (res.success && res.data) {
        setUsers(res.data.items || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
      toast.error(err.message || 'Lỗi nạp danh sách người dùng');
    } finally {
      setLoading(false);
    }
  }, [page, limit, roleFilter, searchTerm, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle Add Staff
  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || !staffPassword.trim()) {
      toast.warning('Vui lòng nhập đầy đủ thông tin nhân viên');
      return;
    }
    if (staffPassword.length < 6) {
      toast.warning('Mật khẩu nhân viên phải chứa ít nhất 6 ký tự');
      return;
    }

    try {
      setSubmittingStaff(true);
      const res = await authApi.createStaff({
        full_name: staffName.trim(),
        email: staffEmail.trim(),
        password: staffPassword,
      });

      if (res.success) {
        toast.success(`Đã tạo tài khoản nhân viên cho "${staffName.trim()}" thành công!`);
        setStaffName('');
        setStaffEmail('');
        setStaffPassword('');
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tạo nhân viên');
    } finally {
      setSubmittingStaff(false);
    }
  };

  // Handle Update User Role
  const handleUpdateRole = async (e) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      setSubmittingRole(true);
      const res = await authApi.updateUserRole(editingUser.user_id, selectedRole);
      if (res.success) {
        toast.success(`Đã cập nhật vai trò cho "${editingUser.full_name}" sang ${selectedRole.toUpperCase()}`);
        setEditingUser(null);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật vai trò');
    } finally {
      setSubmittingRole(false);
    }
  };

  // Handle Delete User
  const handleDeleteUser = async (targetUser) => {
    if (targetUser.user_id === user.user_id) {
      toast.warning('Bạn không thể tự xóa tài khoản của chính mình!');
      return;
    }

    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${targetUser.full_name}" (${targetUser.email})?`)) {
      return;
    }

    try {
      const res = await authApi.deleteUser(targetUser.user_id);
      if (res.success) {
        toast.success(`Đã xóa tài khoản "${targetUser.full_name}"`);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa tài khoản');
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'Quản trị viên (Admin)',
          bg: '#FEE2E2',
          color: '#DC2626',
          border: '#FECACA',
          icon: '👑',
        };
      case 'staff':
        return {
          label: 'Nhân viên (Staff)',
          bg: '#E0E7FF',
          color: '#4F46E5',
          border: '#C7D2FE',
          icon: '👔',
        };
      default:
        return {
          label: 'Khách hàng (Customer)',
          bg: '#F1F5F9',
          color: '#475569',
          border: '#E2E8F0',
          icon: '🛒',
        };
    }
  };

  return (
    <div>
      {/* Top Header & Metrics */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 800, color: '#1E293B', margin: 0 }}>
            Quản Lý Nhân Viên & Khách Hàng
          </h2>
          <p style={{ fontSize: 13, color: '#64748B', margin: '4px 0 0 0' }}>
            Phân quyền tài khoản, thêm nhân viên vận hành và kiểm soát quyền hạn hệ thống
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              border: 'none',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 13.5,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.25)',
              transition: 'all 0.15s ease',
            }}
          >
            <Icons.Plus size={16} />
            <span>Thêm Nhân Viên (Staff)</span>
          </button>
        )}
      </div>

      {/* KPI Cards Summary */}
      <div className="freedash-metrics-grid" style={{ marginBottom: 20 }}>
        <div className="freedash-metric-card" style={{ minHeight: 90 }}>
          <div className="freedash-metric-top">
            <span className="freedash-metric-number">{summary.total_users}</span>
          </div>
          <div className="freedash-metric-label">Tổng người dùng hệ thống</div>
        </div>

        <div className="freedash-metric-card" style={{ minHeight: 90 }}>
          <div className="freedash-metric-top">
            <span className="freedash-metric-number" style={{ color: '#4F46E5' }}>{summary.total_staff}</span>
            <span className="freedash-metric-badge freedash-badge-up">Vận hành</span>
          </div>
          <div className="freedash-metric-label">Nhân viên (Staff)</div>
        </div>

        <div className="freedash-metric-card" style={{ minHeight: 90 }}>
          <div className="freedash-metric-top">
            <span className="freedash-metric-number" style={{ color: '#059669' }}>{summary.total_customers}</span>
          </div>
          <div className="freedash-metric-label">Khách hàng thành viên</div>
        </div>

        <div className="freedash-metric-card" style={{ minHeight: 90 }}>
          <div className="freedash-metric-top">
            <span className="freedash-metric-number" style={{ color: '#DC2626' }}>{summary.total_admins}</span>
            <span className="freedash-metric-badge freedash-badge-down">Tối cao</span>
          </div>
          <div className="freedash-metric-label">Quản trị viên (Admin)</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#FFFFFF',
          padding: '14px 20px',
          borderRadius: 14,
          border: '1px solid #EEF2F6',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.02)',
          marginBottom: 20,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        {/* Role Tabs */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'staff', label: `Nhân viên (${summary.total_staff})` },
            { id: 'customer', label: `Khách hàng (${summary.total_customers})` },
            { id: 'admin', label: `Admin (${summary.total_admins})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setRoleFilter(tab.id);
                setPage(1);
              }}
              style={{
                padding: '6px 14px',
                borderRadius: 20,
                fontSize: 13,
                fontWeight: 700,
                border: '1px solid',
                borderColor: roleFilter === tab.id ? '#DC2626' : '#E2E8F0',
                backgroundColor: roleFilter === tab.id ? '#DC2626' : '#FFFFFF',
                color: roleFilter === tab.id ? '#FFFFFF' : '#64748B',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Box */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: 20,
            padding: '6px 14px',
            width: 260,
          }}
        >
          <input
            type="text"
            placeholder="Tìm theo tên hoặc email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPage(1);
            }}
            style={{
              border: 'none',
              background: 'transparent',
              outline: 'none',
              fontSize: 13,
              width: '100%',
              color: '#1E293B',
            }}
          />
          <Icons.Search size={14} style={{ color: '#94A3B8' }} />
        </div>
      </div>

      {/* User Table */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
          marginBottom: 32,
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #EEF2F6', color: '#64748B', textAlign: 'left' }}>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Họ và tên</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Email đăng nhập</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Vai trò</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Ngày tạo</th>
              <th style={{ padding: '14px 20px', fontWeight: 700 }}>Phạm vi quyền</th>
              {isAdmin && <th style={{ padding: '14px 20px', fontWeight: 700, textAlign: 'right' }}>Thao tác</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#64748B' }}>
                  Đang tải danh sách người dùng...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '36px 0', color: '#94A3B8' }}>
                  Không tìm thấy người dùng nào phù hợp
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const badge = getRoleBadge(u.role);
                const isCurrentUser = u.user_id === user.user_id;

                let permissionText = 'Mua hàng & Đánh giá';
                if (u.role === 'admin') {
                  permissionText = 'Toàn quyền quản trị & nhân sự';
                } else if (u.role === 'staff') {
                  permissionText = 'Xử lý đơn, kho hàng, sản phẩm';
                }

                return (
                  <tr key={u.user_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: '50%',
                            backgroundColor: u.role === 'admin' ? '#FEE2E2' : u.role === 'staff' ? '#E0E7FF' : '#F1F5F9',
                            color: u.role === 'admin' ? '#DC2626' : u.role === 'staff' ? '#4F46E5' : '#475569',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 800,
                            fontSize: 13,
                          }}
                        >
                          {u.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: '#1E293B' }}>
                            {u.full_name} {isCurrentUser && <span style={{ fontSize: 11, color: '#DC2626' }}>(Bạn)</span>}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td style={{ padding: '14px 20px', color: '#475569' }}>
                      {u.email}
                    </td>

                    <td style={{ padding: '14px 20px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 4,
                        }}
                      >
                        <span>{badge.icon}</span>
                        <span>{badge.label}</span>
                      </span>
                    </td>

                    <td style={{ padding: '14px 20px', color: '#64748B', fontSize: 13 }}>
                      {formatDate(u.created_at)}
                    </td>

                    <td style={{ padding: '14px 20px', color: '#64748B', fontSize: 12.5 }}>
                      <span style={{ backgroundColor: '#F8FAFC', padding: '3px 8px', borderRadius: 6, border: '1px solid #E2E8F0' }}>
                        {permissionText}
                      </span>
                    </td>

                    {isAdmin && (
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: 6 }}>
                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setSelectedRole(u.role);
                            }}
                            title="Phân quyền / Đổi vai trò"
                            style={{
                              padding: '6px 10px',
                              backgroundColor: '#F8FAFC',
                              border: '1px solid #E2E8F0',
                              borderRadius: 6,
                              fontSize: 12,
                              fontWeight: 700,
                              color: '#475569',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                            }}
                          >
                            <Icons.Sliders size={13} />
                            <span>Đổi quyền</span>
                          </button>

                          {!isCurrentUser && (
                            <button
                              onClick={() => handleDeleteUser(u)}
                              title="Xóa tài khoản"
                              style={{
                                padding: '6px 10px',
                                backgroundColor: '#FEE2E2',
                                border: '1px solid #FECACA',
                                borderRadius: 6,
                                fontSize: 12,
                                fontWeight: 700,
                                color: '#DC2626',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                              }}
                            >
                              <Icons.Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Footer Bar */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '14px 20px',
            backgroundColor: '#FAFAFA',
            borderTop: '1px solid #EEF2F6',
            flexWrap: 'wrap',
            gap: 12,
            fontSize: 13,
            color: '#64748B',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span>
              Hiển thị{' '}
              <strong style={{ color: '#1E293B' }}>
                {pagination.total_items === 0 ? 0 : (page - 1) * limit + 1}
              </strong>{' '}
              -{' '}
              <strong style={{ color: '#1E293B' }}>
                {Math.min(page * limit, pagination.total_items)}
              </strong>{' '}
              trên tổng số{' '}
              <strong style={{ color: '#1E293B' }}>{pagination.total_items}</strong> người dùng
            </span>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span>| Mỗi trang:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(parseInt(e.target.value, 10));
                  setPage(1);
                }}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  fontSize: 12.5,
                  fontWeight: 600,
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value={5}>5 dòng</option>
                <option value={10}>10 dòng</option>
                <option value={20}>20 dòng</option>
                <option value={50}>50 dòng</option>
              </select>
            </div>
          </div>

          {/* Page numbers */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                backgroundColor: page <= 1 ? '#F1F5F9' : '#FFFFFF',
                color: page <= 1 ? '#94A3B8' : '#1E293B',
                cursor: page <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 12.5,
              }}
            >
              Trước
            </button>

            {Array.from({ length: pagination.total_pages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === pagination.total_pages || Math.abs(p - page) <= 1)
              .map((p, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && p - prev > 1;
                return (
                  <React.Fragment key={p}>
                    {showEllipsis && <span style={{ padding: '0 4px', color: '#94A3B8' }}>...</span>}
                    <button
                      onClick={() => setPage(p)}
                      style={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: 8,
                        border: '1px solid',
                        borderColor: page === p ? '#DC2626' : '#E2E8F0',
                        backgroundColor: page === p ? '#DC2626' : '#FFFFFF',
                        color: page === p ? '#FFFFFF' : '#475569',
                        fontWeight: 700,
                        fontSize: 12.5,
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  </React.Fragment>
                );
              })}

            <button
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={page >= pagination.total_pages}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid #E2E8F0',
                backgroundColor: page >= pagination.total_pages ? '#F1F5F9' : '#FFFFFF',
                color: page >= pagination.total_pages ? '#94A3B8' : '#1E293B',
                cursor: page >= pagination.total_pages ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: 12.5,
              }}
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Permissions Matrix Box */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)',
          padding: 24,
        }}
      >
        <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B', marginBottom: 6 }}>
          Bảng Phân Quyền Vai Trò Hệ Thống (Permissions Matrix)
        </div>
        <p style={{ fontSize: 13, color: '#64748B', marginBottom: 16 }}>
          Quy định rõ ràng quyền hạn của từng cấp tài khoản nhằm bảo đảm tính toàn vẹn và bảo mật dữ liệu của GearK
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0', color: '#475569', textAlign: 'left' }}>
                <th style={{ padding: '10px 16px', fontWeight: 700 }}>Hành động / Phân hệ</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#DC2626' }}>👑 Admin (Quản trị viên)</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#4F46E5' }}>👔 Staff (Nhân viên)</th>
                <th style={{ padding: '10px 16px', fontWeight: 700, color: '#059669' }}>🛒 Customer (Khách hàng)</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>Xem Dashboard thống kê & KPI</td>
                <td style={{ padding: '10px 16px', color: '#059669' }}>✔ Toàn quyền xem</td>
                <td style={{ padding: '10px 16px', color: '#059669' }}>✔ Được xem</td>
                <td style={{ padding: '10px 16px', color: '#DC2626' }}>✖ Không có quyền</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>Quản lý Đơn hàng & Cập nhật giao hàng</td>
                <td style={{ padding: '10px 16px', color: '#059669' }}>✔ Toàn quyền</td>
                <td style={{ padding: '10px 16px', color: '#059669' }}>✔ Được xem & cập nhật trạng thái</td>
                <td style={{ padding: '10px 16px', color: '#475569' }}>Chỉ xem đơn của mình</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>Thêm mới & Chỉnh sửa sản phẩm, Tồn kho</td>
                <td style={{ padding: '10px 16px', color: '#059669' }}>✔ Toàn quyền</td>
                <td style={{ padding: '10px 16px', color: '#059669' }}>✔ Được thêm & sửa</td>
                <td style={{ padding: '10px 16px', color: '#DC2626' }}>✖ Không có quyền</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #F1F5F9' }}>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>Xóa sản phẩm, xóa biến thể, xóa voucher</td>
                <td style={{ padding: '10px 16px', color: '#059669' }}>✔ Có quyền xóa</td>
                <td style={{ padding: '10px 16px', color: '#DC2626', fontWeight: 700 }}>✖ BỊ CHẶN (Không được xóa)</td>
                <td style={{ padding: '10px 16px', color: '#DC2626' }}>✖ Không có quyền</td>
              </tr>
              <tr>
                <td style={{ padding: '10px 16px', fontWeight: 600 }}>Quản lý Nhân sự, Thêm Staff, Phân quyền</td>
                <td style={{ padding: '10px 16px', color: '#059669' }}>✔ Độc quyền Admin</td>
                <td style={{ padding: '10px 16px', color: '#DC2626', fontWeight: 700 }}>✖ BỊ CHẶN (Ẩn menu)</td>
                <td style={{ padding: '10px 16px', color: '#DC2626' }}>✖ Không có quyền</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Thêm Nhân Viên Mới */}
      {showAddModal && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 460 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#1E293B' }}>
                Thêm Nhân Viên Vận Hành (Staff)
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <p style={{ fontSize: 12.5, color: '#64748B', marginBottom: 16 }}>
              Nhân viên sẽ được cấp quyền xử lý đơn hàng, kho và sản phẩm. Nhân viên không được phép xóa sản phẩm hoặc quản lý nhân sự.
            </p>

            <form onSubmit={handleCreateStaff}>
              <div className="form-group">
                <label className="form-label">Họ và tên nhân viên *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn Hỗ Trợ"
                  className="form-input"
                  value={staffName}
                  onChange={(e) => setStaffName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email tài khoản *</label>
                <input
                  type="email"
                  required
                  placeholder="staff@geark.vn"
                  className="form-input"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mật khẩu đăng nhập *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  placeholder="Tối thiểu 6 ký tự"
                  className="form-input"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={submittingStaff}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: submittingStaff ? 0.7 : 1,
                  }}
                >
                  {submittingStaff ? 'Đang tạo...' : 'Tạo Tài Khoản Staff'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Đổi Vai Trò / Phân Quyền */}
      {editingUser && (
        <div className="modal-backdrop">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, margin: 0, color: '#1E293B' }}>
                Phân Quyền Cho "{editingUser.full_name}"
              </h3>
              <button
                onClick={() => setEditingUser(null)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdateRole}>
              <div style={{ marginBottom: 16 }}>
                <label className="form-label">Chọn vai trò mới:</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: 12,
                      borderRadius: 10,
                      border: '1px solid',
                      borderColor: selectedRole === 'staff' ? '#4F46E5' : '#E2E8F0',
                      backgroundColor: selectedRole === 'staff' ? '#EEF2FF' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="staff"
                      checked={selectedRole === 'staff'}
                      onChange={() => setSelectedRole('staff')}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>👔 Nhân viên (Staff)</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        Quản lý đơn hàng, thêm sửa sản phẩm, kiểm kho; không có quyền xóa và quản lý nhân sự.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: 12,
                      borderRadius: 10,
                      border: '1px solid',
                      borderColor: selectedRole === 'customer' ? '#059669' : '#E2E8F0',
                      backgroundColor: selectedRole === 'customer' ? '#ECFDF5' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="customer"
                      checked={selectedRole === 'customer'}
                      onChange={() => setSelectedRole('customer')}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>🛒 Khách hàng (Customer)</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        Tài khoản người dùng thông thường, mua sắm và theo dõi đơn cá nhân.
                      </div>
                    </div>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: 12,
                      borderRadius: 10,
                      border: '1px solid',
                      borderColor: selectedRole === 'admin' ? '#DC2626' : '#E2E8F0',
                      backgroundColor: selectedRole === 'admin' ? '#FEF2F2' : '#FFFFFF',
                      cursor: 'pointer',
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="admin"
                      checked={selectedRole === 'admin'}
                      onChange={() => setSelectedRole('admin')}
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontWeight: 700, color: '#1E293B' }}>👑 Quản trị viên (Admin)</div>
                      <div style={{ fontSize: 12, color: '#64748B' }}>
                        Toàn quyền tối cao với hệ thống, xóa dữ liệu và phân quyền nhân sự.
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  style={{
                    padding: '9px 18px',
                    borderRadius: 8,
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#FFFFFF',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submittingRole}
                  style={{
                    padding: '9px 20px',
                    borderRadius: 8,
                    border: 'none',
                    backgroundColor: '#DC2626',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    cursor: 'pointer',
                    opacity: submittingRole ? 0.7 : 1,
                  }}
                >
                  {submittingRole ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
