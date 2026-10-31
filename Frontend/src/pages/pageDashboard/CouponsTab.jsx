import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
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

import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/Delete';

export default function CouponsTab({
  coupons = [],
  newCouponCode,
  setNewCouponCode,
  newDiscountType,
  setNewDiscountType,
  newDiscountVal,
  setNewDiscountVal,
  newUsageLimit,
  setNewUsageLimit,
  newStartDate,
  setNewStartDate,
  newEndDate,
  setNewEndDate,
  handleCreateCoupon,
  handleUpdateCoupon,
  formatPrice,
  formatDate,
  handleDeleteCoupon,
  Icons,
}) {
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editType, setEditType] = useState('percent');
  const [editValue, setEditValue] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [updating, setUpdating] = useState(false);

  const toInputDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const startEdit = (cpn) => {
    setEditingCoupon(cpn);
    setEditCode(cpn.coupon_code || '');
    setEditType(cpn.discount_type || 'percent');
    setEditValue(cpn.discount_value || '');
    setEditLimit(cpn.usage_limit ?? '');
    setEditStart(toInputDate(cpn.start_date));
    setEditEnd(toInputDate(cpn.end_date));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;
    setUpdating(true);
    const success = await handleUpdateCoupon(editingCoupon.coupon_id, {
      coupon_code: editCode.trim().toUpperCase(),
      discount_type: editType,
      discount_value: parseFloat(editValue),
      usage_limit: editLimit !== '' ? parseInt(editLimit) : null,
      start_date: editStart || null,
      end_date: editEnd || null,
    });
    setUpdating(false);
    if (success) setEditingCoupon(null);
  };

  const getCouponStatus = (cpn) => {
    const now = new Date();
    if (cpn.end_date && new Date(cpn.end_date) < now) return { label: 'Đã hết hạn', bg: '#FEE2E2', color: '#EF4444' };
    if (cpn.start_date && new Date(cpn.start_date) > now) return { label: 'Chưa bắt đầu', bg: '#FEF3C7', color: '#D97706' };
    if (cpn.usage_limit !== null && cpn.used_count >= cpn.usage_limit) return { label: 'Hết lượt dùng', bg: '#F3F4F6', color: '#6B7280' };
    return { label: 'Đang hiệu lực', bg: '#D1FAE5', color: '#065F46' };
  };

  const formatShortDate = (dateVal) => (dateVal ? new Date(dateVal).toLocaleDateString('vi-VN') : null);

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 2, border: '1px solid #E5E7EB' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.75 }}>
          <LocalOfferIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Tạo mã giảm giá mới</Typography>
        </Stack>

        <Box component="form" onSubmit={handleCreateCoupon}>
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 1.75, mb: 1.75 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Mã Voucher *</Typography>
              <TextField fullWidth size="small" required placeholder="VD: GAMING2026" value={newCouponCode} onChange={(e) => setNewCouponCode(e.target.value)} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Loại giảm giá</Typography>
              <Select fullWidth size="small" value={newDiscountType} onChange={(e) => setNewDiscountType(e.target.value)}>
                <MenuItem value="percent">Phần trăm (%)</MenuItem>
                <MenuItem value="fixed">Số tiền cố định (₫)</MenuItem>
              </Select>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Giá trị giảm *</Typography>
              <TextField
                fullWidth size="small" type="number" required inputProps={{ min: 1 }}
                placeholder={newDiscountType === 'percent' ? 'VD: 10 (%)' : 'VD: 100000 (₫)'}
                value={newDiscountVal} onChange={(e) => setNewDiscountVal(e.target.value)}
              />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Giới hạn lượt dùng</Typography>
              <TextField fullWidth size="small" type="number" inputProps={{ min: 1 }} placeholder="Để trống = Không giới hạn" value={newUsageLimit} onChange={(e) => setNewUsageLimit(e.target.value)} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Ngày bắt đầu</Typography>
              <TextField fullWidth size="small" type="date" value={newStartDate} onChange={(e) => setNewStartDate(e.target.value)} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Ngày kết thúc / Hết hạn</Typography>
              <TextField fullWidth size="small" type="date" value={newEndDate} onChange={(e) => setNewEndDate(e.target.value)} />
            </Box>
          </Box>
          <Stack direction="row" justifyContent="flex-end">
            <Button type="submit" variant="contained">Tạo mã giảm giá</Button>
          </Stack>
        </Box>
      </Paper>

      <Dialog open={Boolean(editingCoupon)} onClose={() => setEditingCoupon(null)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: 16 }}>
          Chỉnh sửa mã: {editingCoupon?.coupon_code}
          <IconButton size="small" onClick={() => setEditingCoupon(null)}><CloseIcon fontSize="small" /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleSaveEdit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Mã Code</Typography>
              <TextField fullWidth size="small" required value={editCode} onChange={(e) => setEditCode(e.target.value)} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Loại</Typography>
                <Select fullWidth size="small" value={editType} onChange={(e) => setEditType(e.target.value)}>
                  <MenuItem value="percent">Phần trăm (%)</MenuItem>
                  <MenuItem value="fixed">Số tiền cố định (₫)</MenuItem>
                </Select>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Giá trị</Typography>
                <TextField fullWidth size="small" type="number" required inputProps={{ min: 1 }} value={editValue} onChange={(e) => setEditValue(e.target.value)} />
              </Box>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Giới hạn lượt dùng</Typography>
              <TextField fullWidth size="small" type="number" inputProps={{ min: 1 }} placeholder="Không giới hạn" value={editLimit} onChange={(e) => setEditLimit(e.target.value)} />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Ngày bắt đầu</Typography>
                <TextField fullWidth size="small" type="date" value={editStart} onChange={(e) => setEditStart(e.target.value)} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Ngày kết thúc</Typography>
                <TextField fullWidth size="small" type="date" value={editEnd} onChange={(e) => setEditEnd(e.target.value)} />
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => setEditingCoupon(null)}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={updating}>{updating ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mã giảm giá</TableCell>
              <TableCell>Loại & Giá trị</TableCell>
              <TableCell>Lượt sử dụng</TableCell>
              <TableCell>Thời gian hiệu lực</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {coupons.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có mã giảm giá nào</TableCell>
              </TableRow>
            ) : (
              coupons.map((cpn) => {
                const status = getCouponStatus(cpn);
                const startDateStr = formatShortDate(cpn.start_date);
                const endDateStr = formatShortDate(cpn.end_date);
                return (
                  <TableRow key={cpn.coupon_id} hover>
                    <TableCell sx={{ py: 1.5 }}>
                      <Chip label={cpn.coupon_code} size="small" sx={{ bgcolor: '#FEE2E2', color: 'primary.main', fontWeight: 800, letterSpacing: 0.5 }} />
                    </TableCell>
                    <TableCell>
                      <Typography sx={{ fontWeight: 700, fontSize: 13.5 }}>
                        {cpn.discount_type === 'percent' ? `${parseFloat(cpn.discount_value)}%` : formatPrice(cpn.discount_value)}
                      </Typography>
                      <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
                        {cpn.discount_type === 'percent' ? 'Phần trăm' : 'Cố định'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>
                      <Box component="span" sx={{ color: '#6366F1' }}>{cpn.used_count ?? 0}</Box>
                      <Box component="span" sx={{ color: 'text.disabled', mx: 0.5 }}>/</Box>
                      <Box component="span" sx={{ color: cpn.usage_limit ? 'text.primary' : 'text.disabled' }}>{cpn.usage_limit ?? '∞'}</Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 12 }}>
                      {startDateStr || endDateStr ? (
                        <Box>
                          <Box><Box component="span" sx={{ color: 'text.secondary' }}>Từ:</Box> <strong>{startDateStr || 'Tức thì'}</strong></Box>
                          <Box sx={{ mt: 0.25 }}><Box component="span" sx={{ color: 'text.secondary' }}>Đến:</Box> <strong>{endDateStr || 'Vô thời hạn'}</strong></Box>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: 12, color: 'text.disabled', fontStyle: 'italic' }}>Không giới hạn thời gian</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip label={`● ${status.label}`} size="small" sx={{ bgcolor: status.bg, color: status.color, fontSize: 11.5, fontWeight: 700 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{formatDate(cpn.created_at)}</TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={0.75}>
                        <IconButton size="small" onClick={() => startEdit(cpn)} sx={{ color: '#3B82F6', bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: 1 }}>
                          {Icons?.Sliders ? <Icons.Sliders size={14} /> : null}
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDeleteCoupon(cpn.coupon_id)} sx={{ color: '#EF4444', bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 1 }}>
                          <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
