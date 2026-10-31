import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping', label: 'Đang giao hàng' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

export default function OrdersTab({ orders, orderFilter, setOrderFilter, fetchOrders, handleUpdateStatus, formatPrice, getOrderStatusText }) {
  const displayedOrders = orderFilter ? orders.filter((ord) => ord.order_status === orderFilter) : orders;

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setOrderFilter(val);
    if (typeof fetchOrders === 'function') fetchOrders(val);
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Lọc theo trạng thái:</Typography>
          <Select size="small" displayEmpty value={orderFilter} onChange={handleFilterChange} sx={{ fontSize: 13, fontWeight: 600, minWidth: 160, bgcolor: '#F9FAFB' }}>
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
            ))}
          </Select>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
            ({displayedOrders.length} đơn hàng)
          </Typography>
        </Stack>

        <Button size="small" onClick={() => fetchOrders && fetchOrders(orderFilter)} sx={{ fontSize: 12.5, fontWeight: 700 }}>
          Làm mới danh sách
        </Button>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Mã đơn</TableCell>
              <TableCell>Khách hàng</TableCell>
              <TableCell>SĐT / Địa chỉ</TableCell>
              <TableCell>Tổng tiền</TableCell>
              <TableCell>PT Thanh toán</TableCell>
              <TableCell>Cập nhật trạng thái</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {displayedOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                  {orderFilter ? 'Không có đơn hàng nào ở trạng thái này' : 'Không có đơn hàng nào'}
                </TableCell>
              </TableRow>
            ) : (
              displayedOrders.map((ord) => {
                const statusInfo = getOrderStatusText(ord.order_status);
                return (
                  <TableRow key={ord.order_id} hover>
                    <TableCell sx={{ fontWeight: 800, color: 'primary.main', py: 1.75 }}>{ord.order_code}</TableCell>
                    <TableCell>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>{ord.recipient_name || ord.customer_name || 'Khách hàng'}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{ord.email || ord.customer_email || '—'}</Typography>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 220 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{ord.recipient_phone || '—'}</Typography>
                      <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25, lineHeight: 1.3 }}>
                        {ord.shipping_address || ord.street_address || 'Chưa cập nhật địa chỉ'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{formatPrice(ord.total_amount)}</TableCell>
                    <TableCell>
                      <Chip label={ord.payment_method ? ord.payment_method.toUpperCase() : 'COD'} size="small" sx={{ fontSize: 11, fontWeight: 700, bgcolor: '#F3F4F6', height: 22 }} />
                    </TableCell>
                    <TableCell>
                      <Select
                        size="small"
                        value={ord.order_status}
                        onChange={(e) => handleUpdateStatus(ord.order_id, e.target.value)}
                        sx={{
                          fontSize: 12,
                          fontWeight: 700,
                          bgcolor: statusInfo.bg,
                          color: statusInfo.color,
                          '& .MuiSelect-select': { py: 0.6, px: 1.25 },
                          '& .MuiOutlinedInput-notchedOutline': { borderColor: `${statusInfo.color}40` },
                        }}
                      >
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12.5 }}>{opt.label}</MenuItem>
                        ))}
                      </Select>
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
