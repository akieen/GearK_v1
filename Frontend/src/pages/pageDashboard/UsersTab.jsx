import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Radio from '@mui/material/Radio';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import ManageAccountsOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import SearchIcon from '@mui/icons-material/Search';

import { authApi } from '../../api/authApi';
import { formatDate } from '../../utils/formatters';
import AdminPagination from '../../components/common/AdminPagination';

const ROLE_OPTIONS = [
  { value: 'staff', title: '👔 Nhân viên (Staff)', desc: 'Quản lý đơn hàng, thêm sửa sản phẩm, kiểm kho; không có quyền xóa và quản lý nhân sự.', color: '#4F46E5', bg: '#EEF2FF' },
  { value: 'customer', title: '🛒 Khách hàng (Customer)', desc: 'Tài khoản người dùng thông thường, mua sắm và theo dõi đơn cá nhân.', color: '#059669', bg: '#ECFDF5' },
  { value: 'admin', title: '👑 Quản trị viên (Admin)', desc: 'Toàn quyền tối cao với hệ thống, xóa dữ liệu và phân quyền nhân sự.', color: '#DC2626', bg: '#FEF2F2' },
];

export default function UsersTab({ user, isAdmin = true, toast }) {
  const canManage = isAdmin ?? true;
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState({ total_users: 0, total_admins: 0, total_staff: 0, total_customers: 0 });
  const [loading, setLoading] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total_pages: 1, total_items: 0 });

  const [showAddModal, setShowAddModal] = useState(false);
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [submittingStaff, setSubmittingStaff] = useState(false);

  const [editingUser, setEditingUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState('staff');
  const [submittingRole, setSubmittingRole] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await authApi.getUsers({
        page: page + 1,
        limit,
        role: roleFilter !== 'all' ? roleFilter : undefined,
        search: searchTerm.trim() || undefined,
      });
      if (res.success && res.data) {
        setUsers(res.data.items || []);
        if (res.data.pagination) setPagination(res.data.pagination);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      toast?.error?.(err.message || 'Lỗi nạp danh sách người dùng');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, roleFilter, searchTerm]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim() || !staffPassword.trim()) {
      return toast.warning('Vui lòng nhập đầy đủ thông tin nhân viên');
    }
    if (staffPassword.length < 6) {
      return toast.warning('Mật khẩu nhân viên phải chứa ít nhất 6 ký tự');
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
        setStaffName(''); setStaffEmail(''); setStaffPassword('');
        setShowAddModal(false);
        fetchUsers();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tạo nhân viên');
    } finally {
      setSubmittingStaff(false);
    }
  };

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

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.user_id === user?.user_id) {
      return toast.warning('Bạn không thể tự xóa tài khoản của chính mình!');
    }
    if (!window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${targetUser.full_name}" (${targetUser.email})?`)) return;
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
        return { label: '👑 Admin', bg: '#FEE2E2', color: '#DC2626' };
      case 'staff':
        return { label: '👔 Nhân viên', bg: '#E0E7FF', color: '#4F46E5' };
      default:
        return { label: '🛒 Khách hàng', bg: '#F1F5F9', color: '#475569' };
    }
  };

  const kpis = [
    { label: 'Tổng người dùng hệ thống', val: summary.total_users, color: '#1E293B' },
    { label: 'Nhân viên (Staff)', val: summary.total_staff, color: '#4F46E5', badge: 'Vận hành', badgeBg: '#E0E7FF', badgeColor: '#4F46E5' },
    { label: 'Khách hàng thành viên', val: summary.total_customers, color: '#059669' },
    { label: 'Quản trị viên (Admin)', val: summary.total_admins, color: '#DC2626', badge: 'Tối cao', badgeBg: '#FEE2E2', badgeColor: '#EF4444' },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800 }}>Quản Lý Nhân Viên & Khách Hàng</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>
            Phân quyền tài khoản, thêm nhân viên vận hành và kiểm soát quyền hạn hệ thống
          </Typography>
        </Box>
        {canManage && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddModal(true)}>
            Thêm Nhân Viên (Staff)
          </Button>
        )}
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2, mb: 2.5 }}>
        {kpis.map((k, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2.25, borderRadius: 3, border: '1px solid #EEF2F6' }}>
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography sx={{ fontSize: 26, fontWeight: 800, color: k.color }}>{k.val}</Typography>
              {k.badge && <Chip label={k.badge} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 800, bgcolor: k.badgeBg, color: k.badgeColor }} />}
            </Stack>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', mt: 0.5 }}>{k.label}</Typography>
          </Paper>
        ))}
      </Box>

      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 3, border: '1px solid #EEF2F6', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          {[
            { id: 'all', label: 'Tất cả' },
            { id: 'staff', label: `Nhân viên (${summary.total_staff})` },
            { id: 'customer', label: `Khách hàng (${summary.total_customers})` },
            { id: 'admin', label: `Admin (${summary.total_admins})` },
          ].map((tab) => {
            const active = roleFilter === tab.id;
            return (
              <Button
                key={tab.id}
                size="small"
                variant={active ? 'contained' : 'outlined'}
                onClick={() => { setRoleFilter(tab.id); setPage(0); }}
                sx={{ borderRadius: 5, px: 2, py: 0.5, fontSize: 13, borderColor: active ? 'primary.main' : '#E2E8F0', color: active ? '#FFF' : 'text.secondary' }}
              >
                {tab.label}
              </Button>
            );
          })}
        </Stack>

        <TextField
          size="small"
          placeholder="Tìm theo tên hoặc email..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          InputProps={{ endAdornment: <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} /> }}
          sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: 5, bgcolor: '#F8FAFC' }, '& input': { fontSize: 13, py: 0.85 } }}
        />
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #EEF2F6', overflow: 'hidden', mb: 4 }}>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Người dùng</TableCell>
                <TableCell>Vai trò</TableCell>
                <TableCell>Phạm vi quyền</TableCell>
                <TableCell>Ngày tạo</TableCell>
                <TableCell align="right" sx={{ minWidth: 210 }}>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4.5, color: 'text.secondary' }}>Đang tải danh sách người dùng...</TableCell></TableRow>
              ) : users.length === 0 ? (
                <TableRow><TableCell colSpan={5} align="center" sx={{ py: 4.5, color: 'text.secondary' }}>Không tìm thấy người dùng nào phù hợp</TableCell></TableRow>
              ) : (
                users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  const isCurrentUser = u.user_id === user?.user_id;
                  const permissionText = u.role === 'admin' ? 'Toàn quyền quản trị & nhân sự' : u.role === 'staff' ? 'Xử lý đơn, kho hàng, sản phẩm' : 'Mua hàng & Đánh giá';

                  return (
                    <TableRow key={u.user_id} hover>
                      <TableCell sx={{ py: 1.5 }}>
                        <Stack direction="row" alignItems="center" spacing={1.25}>
                          <Avatar sx={{ width: 36, height: 36, fontSize: 13.5, fontWeight: 800, bgcolor: badge.bg, color: badge.color }}>
                            {u.full_name?.charAt(0).toUpperCase() || 'U'}
                          </Avatar>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: '#1E293B' }}>
                              {u.full_name}{' '}
                              {isCurrentUser && <Box component="span" sx={{ fontSize: 11, fontWeight: 800, color: 'primary.main' }}>(Bạn)</Box>}
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{u.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        <Chip label={badge.label} size="small" sx={{ bgcolor: badge.bg, color: badge.color, fontWeight: 700, fontSize: 12 }} />
                      </TableCell>

                      <TableCell>
                        <Typography sx={{ fontSize: 12.5, color: '#475569', fontWeight: 500 }}>
                          {permissionText}
                        </Typography>
                      </TableCell>

                      <TableCell sx={{ color: 'text.secondary', fontSize: 12.5, whiteSpace: 'nowrap' }}>
                        {formatDate(u.created_at)}
                      </TableCell>

                      <TableCell align="right" sx={{ whiteSpace: 'nowrap' }}>
                        <Stack direction="row" justifyContent="flex-end" alignItems="center" spacing={1}>
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => { setEditingUser(u); setSelectedRole(u.role); }}
                            startIcon={<ManageAccountsOutlinedIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              py: 0.5,
                              px: 1.25,
                              fontSize: 12,
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              color: '#4F46E5',
                              borderColor: '#C7D2FE',
                              bgcolor: '#EEF2FF',
                              '&:hover': { bgcolor: '#E0E7FF', borderColor: '#818CF8' },
                            }}
                          >
                            Phân quyền
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            disabled={isCurrentUser}
                            onClick={() => handleDeleteUser(u)}
                            startIcon={<DeleteOutlineIcon sx={{ fontSize: 16 }} />}
                            sx={{
                              py: 0.5,
                              px: 1.25,
                              fontSize: 12,
                              fontWeight: 700,
                              whiteSpace: 'nowrap',
                              color: '#DC2626',
                              borderColor: '#FECACA',
                              bgcolor: '#FEE2E2',
                              '&:hover': { bgcolor: '#FECACA', borderColor: '#F87171' },
                            }}
                          >
                            Xóa
                          </Button>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <AdminPagination
          count={pagination.total_items || 0}
          page={page}
          rowsPerPage={limit}
          onPageChange={(e, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setLimit(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[5, 10, 20, 50]}
        />
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 4, border: '1px solid #EEF2F6' }}>
        <Typography sx={{ fontSize: 16, fontWeight: 800, mb: 0.5 }}>Bảng Phân Quyền Vai Trò Hệ Thống (Permissions Matrix)</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mb: 2 }}>
          Quy định rõ ràng quyền hạn của từng cấp tài khoản nhằm bảo đảm tính toàn vẹn và bảo mật dữ liệu của GearK
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Hành động / Phân hệ</TableCell>
                <TableCell sx={{ color: '#DC2626 !important' }}>👑 Admin (Quản trị viên)</TableCell>
                <TableCell sx={{ color: '#4F46E5 !important' }}>👔 Staff (Nhân viên)</TableCell>
                <TableCell sx={{ color: '#059669 !important' }}>🛒 Customer (Khách hàng)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[
                ['Xem Dashboard thống kê & KPI', '✔ Toàn quyền xem', '✔ Được xem', '✖ Không có quyền'],
                ['Quản lý Đơn hàng & Cập nhật giao hàng', '✔ Toàn quyền', '✔ Được xem & cập nhật trạng thái', 'Chỉ xem đơn của mình'],
                ['Thêm mới & Chỉnh sửa sản phẩm, Tồn kho', '✔ Toàn quyền', '✔ Được thêm & sửa', '✖ Không có quyền'],
                ['Xóa sản phẩm, xóa biến thể, xóa voucher', '✔ Có quyền xóa', '✖ BỊ CHẶN (Không được xóa)', '✖ Không có quyền'],
                ['Quản lý Nhân sự, Thêm Staff, Phân quyền', '✔ Độc quyền Admin', '✖ BỊ CHẶN (Ẩn menu)', '✖ Không có quyền'],
              ].map(([act, adm, stf, cus], i) => (
                <TableRow key={i}>
                  <TableCell sx={{ fontWeight: 600 }}>{act}</TableCell>
                  <TableCell sx={{ color: '#059669' }}>{adm}</TableCell>
                  <TableCell sx={{ color: stf.startsWith('✖') ? '#DC2626' : '#059669', fontWeight: stf.startsWith('✖') ? 700 : 400 }}>{stf}</TableCell>
                  <TableCell sx={{ color: cus.startsWith('✖') ? '#DC2626' : 'text.secondary' }}>{cus}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Modal: Thêm Nhân Viên Mới */}
      <Dialog open={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: 17 }}>
          Thêm Nhân Viên Vận Hành (Staff)
          <IconButton size="small" onClick={() => setShowAddModal(false)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleCreateStaff}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.75 }}>
            <Typography sx={{ fontSize: 12.5, color: 'text.secondary' }}>
              Nhân viên sẽ được cấp quyền xử lý đơn hàng, kho và sản phẩm. Nhân viên không được phép xóa sản phẩm hoặc quản lý nhân sự.
            </Typography>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Họ và tên nhân viên *</Typography>
              <TextField fullWidth size="small" required placeholder="Ví dụ: Nguyễn Văn Hỗ Trợ" value={staffName} onChange={(e) => setStaffName(e.target.value)} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Email tài khoản *</Typography>
              <TextField fullWidth size="small" type="email" required placeholder="staff@geark.vn" value={staffEmail} onChange={(e) => setStaffEmail(e.target.value)} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Mật khẩu đăng nhập *</Typography>
              <TextField fullWidth size="small" type="password" required inputProps={{ minLength: 6 }} placeholder="Tối thiểu 6 ký tự" value={staffPassword} onChange={(e) => setStaffPassword(e.target.value)} />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => setShowAddModal(false)}>Hủy bỏ</Button>
            <Button type="submit" variant="contained" disabled={submittingStaff}>{submittingStaff ? 'Đang tạo...' : 'Tạo Tài Khoản Staff'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Modal: Đổi Vai Trò / Phân Quyền */}
      <Dialog open={Boolean(editingUser)} onClose={() => setEditingUser(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: 17 }}>
          Phân Quyền Cho "{editingUser?.full_name}"
          <IconButton size="small" onClick={() => setEditingUser(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleUpdateRole}>
          <DialogContent dividers>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 1 }}>Chọn vai trò mới:</Typography>
            <Stack spacing={1.25}>
              {ROLE_OPTIONS.map((r) => {
                const selected = selectedRole === r.value;
                return (
                  <Paper
                    key={r.value}
                    elevation={0}
                    onClick={() => setSelectedRole(r.value)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2.5,
                      cursor: 'pointer',
                      border: '1px solid',
                      borderColor: selected ? r.color : '#E2E8F0',
                      bgcolor: selected ? r.bg : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 1,
                    }}
                  >
                    <Radio checked={selected} size="small" sx={{ p: 0, mt: 0.25 }} />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>{r.title}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{r.desc}</Typography>
                    </Box>
                  </Paper>
                );
              })}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => setEditingUser(null)}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={submittingRole}>{submittingRole ? 'Đang lưu...' : 'Lưu Thay Đổi'}</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
