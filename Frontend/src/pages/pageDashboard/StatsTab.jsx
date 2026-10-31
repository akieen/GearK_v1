import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import PersonOutlineIcon from '@mui/icons-material/PersonOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import CreditCardIcon from '@mui/icons-material/CreditCard';

export default function StatsTab({ stats, formatPrice, formatDate, getOrderStatusText }) {
  const totalRevenue = stats?.summary?.total_revenue ?? stats?.total_revenue ?? 18306000;
  const totalOrders = stats?.summary?.total_orders ?? stats?.total_orders ?? 1538;
  const totalCustomers = stats?.summary?.total_users ?? stats?.total_customers ?? 236;
  const totalProducts = stats?.total_products ?? 864;

  const metrics = [
    { label: 'Khách hàng mới (Clients)', value: totalCustomers, badge: '+18.33%', up: true, icon: <PersonOutlineIcon sx={{ fontSize: 28 }} /> },
    { label: 'Doanh thu tháng (Earnings)', value: formatPrice(totalRevenue) },
    { label: 'Tổng đơn hàng (Orders)', value: totalOrders, badge: '-5.2%', up: false, icon: <DescriptionOutlinedIcon sx={{ fontSize: 28 }} /> },
    { label: 'Sản phẩm trong kho (Catalog)', value: totalProducts, icon: <Inventory2Icon sx={{ fontSize: 28 }} /> },
  ];

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' }, gap: 2.5, mb: 3 }}>
        {metrics.map((m, idx) => (
          <Paper key={idx} elevation={0} sx={{ p: 2.75, borderRadius: 4, border: '1px solid #EEF2F6', position: 'relative', minHeight: 115, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="baseline" spacing={1.25}>
              <Typography sx={{ fontSize: 26, fontWeight: 800, color: '#1E293B', lineHeight: 1.1 }}>{m.value}</Typography>
              {m.badge && (
                <Chip
                  label={m.badge}
                  size="small"
                  sx={{
                    height: 20,
                    fontSize: 11,
                    fontWeight: 800,
                    bgcolor: m.up ? '#E0E7FF' : '#FEE2E2',
                    color: m.up ? '#4F46E5' : '#EF4444',
                  }}
                />
              )}
            </Stack>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', mt: 0.75 }}>{m.label}</Typography>
            <Box sx={{ position: 'absolute', top: 20, right: 20, color: '#CBD5E1', opacity: 0.7 }}>{m.icon}</Box>
          </Paper>
        ))}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #EEF2F6', overflow: 'hidden' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 3, py: 2.25, borderBottom: '1px solid #EEF2F6' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>Đơn hàng gần đây (Recent Orders)</Typography>
          <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'primary.main' }}>Dữ liệu hệ thống GearK</Typography>
        </Stack>

        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Mã đơn</TableCell>
                <TableCell>Khách hàng</TableCell>
                <TableCell>Ngày đặt</TableCell>
                <TableCell>Tổng tiền</TableCell>
                <TableCell>Trạng thái</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!stats?.recent_orders?.length ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4.5, color: 'text.secondary' }}>Chưa có đơn hàng nào</TableCell>
                </TableRow>
              ) : (
                stats.recent_orders.map((ord) => {
                  const statusInfo = getOrderStatusText(ord.order_status);
                  return (
                    <TableRow key={ord.order_id} hover>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main', py: 1.75 }}>{ord.order_code}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{ord.customer_name || ord.full_name || ord.recipient_name || 'Khách hàng'}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{formatDate(ord.created_at)}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{formatPrice(ord.total_amount)}</TableCell>
                      <TableCell>
                        <Chip label={statusInfo.label} size="small" sx={{ bgcolor: statusInfo.bg, color: statusInfo.color, fontWeight: 700, fontSize: 12 }} />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
