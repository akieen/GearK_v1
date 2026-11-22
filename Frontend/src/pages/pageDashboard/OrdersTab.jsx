import React, { useState, useMemo, useEffect } from 'react';
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
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PrintIcon from '@mui/icons-material/Print';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import TimelineIcon from '@mui/icons-material/Timeline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BoltIcon from '@mui/icons-material/Bolt';

import AdminPagination from '../../components/common/AdminPagination';
import shippingApi from '../../api/shippingApi';
import { useToast } from '../../context/ToastContext';

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'confirmed', label: 'Đã xác nhận' },
  { value: 'processing', label: 'Đang xử lý' },
  { value: 'shipping', label: 'Đang giao hàng' },
  { value: 'completed', label: 'Đã hoàn thành' },
  { value: 'cancelled', label: 'Đã hủy' },
  { value: 'refunded', label: 'Đã hoàn tiền' },
];

const SHIPPING_STATUS_MAP = {
  PENDING: { label: 'Chờ tạo vận đơn', bg: '#F1F5F9', color: '#475569' },
  WAITING_PICKUP: { label: 'Chờ GHN lấy hàng', bg: '#FEF3C7', color: '#B45309' },
  PICKING: { label: 'GHN đang lấy hàng', bg: '#E0F2FE', color: '#0369A1' },
  IN_TRANSIT: { label: 'Đang luân chuyển', bg: '#E0E7FF', color: '#4338CA' },
  DELIVERING: { label: 'Đang giao hàng', bg: '#FCE7F3', color: '#BE185D' },
  DELIVERED: { label: 'Giao thành công', bg: '#DCFCE7', color: '#15803D' },
  DELIVERY_FAILED: { label: 'Giao thất bại', bg: '#FEE2E2', color: '#B91C1C' },
  RETURNING: { label: 'Đang chuyển hoàn', bg: '#FFEDD5', color: '#C2410C' },
  RETURNED: { label: 'Đã hoàn trả', bg: '#F3F4F6', color: '#374151' },
  CANCELLED: { label: 'Đã hủy vận đơn', bg: '#FEE2E2', color: '#991B1B' },
};

export default function OrdersTab({
  orders = [],
  orderFilter,
  setOrderFilter,
  fetchOrders,
  handleUpdateStatus,
  formatPrice,
  getOrderStatusText,
}) {
  const toast = useToast();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Modal tạo vận đơn GHN
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [packageWeight, setPackageWeight] = useState(500);
  const [requiredNote, setRequiredNote] = useState('CHOXEMHANGKHONGTHU');
  const [orderNote, setOrderNote] = useState('');
  const [creatingShipment, setCreatingShipment] = useState(false);

  // Modal tra cứu hành trình GHN
  const [trackingModalOpen, setTrackingModalOpen] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingData, setTrackingData] = useState(null);

  // Modal mô phỏng Webhook GHN (Test)
  const [webhookModalOpen, setWebhookModalOpen] = useState(false);
  const [webhookOrder, setWebhookOrder] = useState(null);
  const [webhookStatus, setWebhookStatus] = useState('delivering');
  const [webhookWarehouse, setWebhookWarehouse] = useState('Kho GHN Tân Bình - TP.HCM');
  const [webhookNote, setWebhookNote] = useState('Bưu tá đang trên đường giao hàng đến người nhận');
  const [sendingWebhook, setSendingWebhook] = useState(false);

  const displayedOrders = useMemo(() => {
    return orderFilter ? orders.filter((ord) => ord.order_status === orderFilter) : orders;
  }, [orders, orderFilter]);

  useEffect(() => {
    setPage(0);
  }, [orderFilter]);

  const paginatedOrders = useMemo(() => {
    const start = page * rowsPerPage;
    return displayedOrders.slice(start, start + rowsPerPage);
  }, [displayedOrders, page, rowsPerPage]);

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setOrderFilter(val);
    setPage(0);
    if (typeof fetchOrders === 'function') fetchOrders(val);
  };

  // Mở modal tạo vận đơn GHN
  const handleOpenCreateModal = (ord) => {
    setSelectedOrder(ord);
    setPackageWeight(500);
    setRequiredNote('CHOXEMHANGKHONGTHU');
    setOrderNote(`Đơn hàng #${ord.order_code}`);
    setCreateModalOpen(true);
  };

  // Thực thi tạo vận đơn GHN
  const handleConfirmCreateShipment = async () => {
    if (!selectedOrder) return;
    setCreatingShipment(true);
    try {
      const payload = {
        weight: parseInt(packageWeight, 10) || 500,
        required_note: requiredNote,
        note: orderNote.trim(),
      };
      const res = await shippingApi.createShipment(selectedOrder.order_id, payload);
      if (res.success) {
        toast.success(res.message || 'Tạo vận đơn GHN thành công!');
        setCreateModalOpen(false);
        if (typeof fetchOrders === 'function') fetchOrders(orderFilter);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tạo vận đơn GHN');
    } finally {
      setCreatingShipment(false);
    }
  };

  // In vận đơn GHN (A5)
  const handlePrintShipment = async (trackingCode) => {
    try {
      toast.info('Đang lấy phiếu in vận đơn từ GHN...');
      const res = await shippingApi.getPrintToken(trackingCode);
      if (res.data?.print_url) {
        window.open(res.data.print_url, '_blank');
      } else {
        throw new Error('Không nhận được đường dẫn in');
      }
    } catch (err) {
      toast.error(err.message || 'Không thể in phiếu vận đơn');
    }
  };

  // Hủy vận đơn GHN
  const handleCancelShipment = async (ord) => {
    if (!window.confirm(`Bạn có chắc chắn muốn hủy vận đơn GHN (${ord.tracking_code}) của đơn #${ord.order_code}?`)) {
      return;
    }
    try {
      toast.info('Đang xử lý hủy vận đơn trên GHN...');
      const res = await shippingApi.cancelShipment(ord.order_id);
      if (res.success) {
        toast.success(res.message || 'Đã hủy vận đơn GHN thành công!');
        if (typeof fetchOrders === 'function') fetchOrders(orderFilter);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi hủy vận đơn GHN');
    }
  };

  // Tra cứu hành trình vận đơn
  const handleViewTracking = async (trackingCode) => {
    setTrackingModalOpen(true);
    setTrackingLoading(true);
    setTrackingData(null);
    try {
      const res = await shippingApi.getTracking(trackingCode);
      if (res.success) {
        setTrackingData(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Không thể lấy thông tin hành trình');
    } finally {
      setTrackingLoading(false);
    }
  };

  // Mở modal Test Webhook GHN
  const handleOpenWebhookModal = (ord) => {
    setWebhookOrder(ord);
    setWebhookStatus('delivering');
    setWebhookWarehouse('Kho GHN Tân Bình - TP.HCM');
    setWebhookNote('Bưu tá đang trên đường giao hàng đến người nhận');
    setWebhookModalOpen(true);
  };

  // Gửi Webhook mô phỏng
  const handleSendWebhook = async () => {
    if (!webhookOrder) return;
    setSendingWebhook(true);
    try {
      const payload = {
        OrderCode: webhookOrder.tracking_code || webhookOrder.order_code,
        Status: webhookStatus,
        Warehouse: webhookWarehouse.trim(),
        Description: webhookNote.trim(),
        Time: new Date().toISOString(),
      };
      const res = await shippingApi.sendWebhook(payload);
      if (res.success) {
        toast.success(`⚡ Bắn Webhook thành công! Đơn hàng đã đồng bộ trạng thái "${webhookStatus}".`);
        setWebhookModalOpen(false);
        if (typeof fetchOrders === 'function') fetchOrders(orderFilter);
      } else {
        toast.error(res.message || 'Không thể gửi Webhook');
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi gửi Webhook mô phỏng');
    } finally {
      setSendingWebhook(false);
    }
  };

  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 1.5,
          mb: 2,
          borderRadius: 2,
          border: '1px solid #E5E7EB',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Lọc theo trạng thái:</Typography>
          <Select
            size="small"
            displayEmpty
            value={orderFilter}
            onChange={handleFilterChange}
            sx={{ fontSize: 13, fontWeight: 600, minWidth: 160, bgcolor: '#F9FAFB' }}
          >
            <MenuItem value="">Tất cả trạng thái</MenuItem>
            {ORDER_STATUS_OPTIONS.map((opt) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <Typography sx={{ fontSize: 12, color: 'text.secondary', fontWeight: 600 }}>
            ({displayedOrders.length} đơn hàng)
          </Typography>
        </Stack>

        <Button
          size="small"
          onClick={() => fetchOrders && fetchOrders(orderFilter)}
          sx={{ fontSize: 12.5, fontWeight: 700 }}
        >
          Làm mới danh sách
        </Button>
      </Paper>

      <TableContainer
        component={Paper}
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}
      >
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Mã đơn</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Khách hàng</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>SĐT / Địa chỉ</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Tổng tiền / Ship</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Vận đơn GHN</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Trạng thái đơn</TableCell>
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
              paginatedOrders.map((ord) => {
                const statusInfo = getOrderStatusText(ord.order_status);
                const shipStatus = ord.shipping_status
                  ? SHIPPING_STATUS_MAP[ord.shipping_status] || {
                      label: ord.shipping_status,
                      bg: '#F3F4F6',
                      color: '#4B5563',
                    }
                  : null;

                const hasActiveShipment =
                  ord.tracking_code && ord.shipping_status !== 'CANCELLED';

                return (
                  <TableRow key={ord.order_id} hover>
                    {/* Mã đơn */}
                    <TableCell sx={{ fontWeight: 800, color: 'primary.main', py: 1.75 }}>
                      {ord.order_code}
                      <Box sx={{ mt: 0.5 }}>
                        <Chip
                          label={ord.payment_method ? ord.payment_method.toUpperCase() : 'COD'}
                          size="small"
                          sx={{
                            fontSize: 10,
                            fontWeight: 700,
                            bgcolor: ord.payment_status === 'paid' ? '#DCFCE7' : '#F3F4F6',
                            color: ord.payment_status === 'paid' ? '#15803D' : '#374151',
                            height: 20,
                          }}
                        />
                      </Box>
                    </TableCell>

                    {/* Khách hàng */}
                    <TableCell>
                      <Typography sx={{ fontSize: 13.5, fontWeight: 700 }}>
                        {ord.recipient_name || ord.customer_name || 'Khách hàng'}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                        {ord.email || ord.customer_email || '—'}
                      </Typography>
                    </TableCell>

                    {/* Địa chỉ */}
                    <TableCell sx={{ maxWidth: 200 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 600 }}>
                        {ord.recipient_phone || '—'}
                      </Typography>
                      <Typography
                        sx={{
                          fontSize: 11.5,
                          color: 'text.secondary',
                          mt: 0.25,
                          lineHeight: 1.3,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {ord.shipping_address || ord.street_address || 'Chưa cập nhật địa chỉ'}
                      </Typography>
                    </TableCell>

                    {/* Tiền hàng & Phí ship */}
                    <TableCell>
                      <Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>
                        {formatPrice(ord.total_amount)}
                      </Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                        Ship: {ord.shipping_fee ? formatPrice(ord.shipping_fee) : '0 đ'}
                      </Typography>
                    </TableCell>

                    {/* Cột Vận đơn GHN */}
                    <TableCell sx={{ minWidth: 190 }}>
                      {hasActiveShipment ? (
                        <Box>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <Chip
                              icon={<LocalShippingIcon sx={{ fontSize: '13px !important' }} />}
                              label={ord.tracking_code}
                              size="small"
                              onClick={() => handleViewTracking(ord.tracking_code)}
                              sx={{
                                fontWeight: 800,
                                fontSize: 11,
                                height: 22,
                                bgcolor: '#FEF2F2',
                                color: '#E30019',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: '#FEE2E2' },
                              }}
                            />
                            <Tooltip title="In phiếu gửi hàng GHN A5">
                              <IconButton
                                size="small"
                                onClick={() => handlePrintShipment(ord.tracking_code)}
                                sx={{ color: '#0284C7', p: 0.5 }}
                              >
                                <PrintIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Mô phỏng Webhook GHN (Test)">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenWebhookModal(ord)}
                                sx={{ color: '#F59E0B', p: 0.5, '&:hover': { bgcolor: '#FEF3C7' } }}
                              >
                                <BoltIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Hủy vận đơn GHN">
                              <IconButton
                                size="small"
                                onClick={() => handleCancelShipment(ord)}
                                sx={{ color: '#EF4444', p: 0.5 }}
                              >
                                <CancelOutlinedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                          {shipStatus && (
                            <Box sx={{ mt: 0.5 }}>
                              <Chip
                                label={shipStatus.label}
                                size="small"
                                sx={{
                                  fontSize: 10.5,
                                  fontWeight: 700,
                                  height: 20,
                                  bgcolor: shipStatus.bg,
                                  color: shipStatus.color,
                                }}
                              />
                            </Box>
                          )}
                        </Box>
                      ) : (
                        <Box>
                          <Button
                            variant="outlined"
                            size="small"
                            color="error"
                            startIcon={<LocalShippingIcon fontSize="small" />}
                            onClick={() => handleOpenCreateModal(ord)}
                            sx={{
                              fontSize: 11.5,
                              fontWeight: 700,
                              textTransform: 'none',
                              py: 0.4,
                              px: 1.25,
                              borderRadius: 1.5,
                            }}
                          >
                            Tạo vận đơn GHN
                          </Button>
                          {ord.shipping_status === 'CANCELLED' && (
                            <Typography sx={{ fontSize: 10.5, color: '#DC2626', mt: 0.25, fontWeight: 600 }}>
                              (Vận đơn trước đã hủy)
                            </Typography>
                          )}
                        </Box>
                      )}
                    </TableCell>

                    {/* Trạng thái đơn hàng nội bộ */}
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
                          '& .MuiOutlinedInput-notchedOutline': {
                            borderColor: `${statusInfo.color}40`,
                          },
                        }}
                      >
                        {ORDER_STATUS_OPTIONS.map((opt) => (
                          <MenuItem key={opt.value} value={opt.value} sx={{ fontSize: 12.5 }}>
                            {opt.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {displayedOrders.length > 0 && (
          <AdminPagination
            count={displayedOrders.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </TableContainer>

      {/* Modal Tạo vận đơn GHN */}
      <Dialog
        open={createModalOpen}
        onClose={() => !creatingShipment && setCreateModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LocalShippingIcon sx={{ color: '#E30019' }} />
          Tạo vận đơn Giao Hàng Nhanh (GHN)
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Stack spacing={2.5}>
              <Alert severity="info" sx={{ fontSize: 13 }}>
                Đơn hàng: <strong>#{selectedOrder.order_code}</strong> — Người nhận:{' '}
                <strong>{selectedOrder.recipient_name}</strong> ({selectedOrder.recipient_phone})
                <br />
                Địa chỉ:{' '}
                {selectedOrder.shipping_address || selectedOrder.street_address}
              </Alert>

              <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                  Thông tin tiền thu hộ (COD) & Khai giá:
                </Typography>
                <Typography variant="body2">
                  • Trạng thái thanh toán:{' '}
                  <strong>{selectedOrder.payment_status === 'paid' ? 'ĐÃ THANH TOÁN (VNPay/Thẻ)' : 'CHƯA THANH TOÁN (COD)'}</strong>
                </Typography>
                <Typography variant="body2" sx={{ color: selectedOrder.payment_status === 'paid' ? '#16A34A' : '#DC2626', fontWeight: 800 }}>
                  • Tiền GHN thu hộ (COD): {selectedOrder.payment_status === 'paid' ? '0 đ' : formatPrice(selectedOrder.total_amount)}
                </Typography>
              </Box>

              <TextField
                label="Tổng khối lượng kiện hàng (gram) *"
                type="number"
                size="small"
                fullWidth
                value={packageWeight}
                onChange={(e) => setPackageWeight(e.target.value)}
                helperText="Mặc định: 500g. Sản phẩm gaming gear thông thường từ 300g - 2000g."
              />

              <FormControl fullWidth size="small">
                <InputLabel>Quy định xem hàng GHN *</InputLabel>
                <Select
                  value={requiredNote}
                  label="Quy định xem hàng GHN *"
                  onChange={(e) => setRequiredNote(e.target.value)}
                >
                  <MenuItem value="CHOXEMHANGKHONGTHU">Cho xem hàng không cho thử (Khuyên dùng)</MenuItem>
                  <MenuItem value="CHOTHUHANG">Cho thử hàng</MenuItem>
                  <MenuItem value="KHONGCHOXEMHANG">Không cho xem hàng</MenuItem>
                </Select>
              </FormControl>

              <TextField
                label="Ghi chú nội dung / Lời dặn bưu tá"
                size="small"
                fullWidth
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Hàng công nghệ cao cấp, xin nhẹ tay..."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={creatingShipment} onClick={() => setCreateModalOpen(false)}>
            Đóng
          </Button>
          <Button
            variant="contained"
            color="error"
            disabled={creatingShipment}
            onClick={handleConfirmCreateShipment}
            startIcon={creatingShipment ? <CircularProgress size={16} color="inherit" /> : <LocalShippingIcon />}
            sx={{ fontWeight: 700 }}
          >
            {creatingShipment ? 'Đang gọi API GHN...' : 'Tạo vận đơn ngay'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Tra cứu hành trình vận đơn GHN */}
      <Dialog
        open={trackingModalOpen}
        onClose={() => setTrackingModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <TimelineIcon sx={{ color: '#0284C7' }} />
          Hành trình vận chuyển GHN
        </DialogTitle>
        <DialogContent dividers>
          {trackingLoading ? (
            <Box sx={{ py: 4, textAlign: 'center' }}>
              <CircularProgress size={32} />
              <Typography sx={{ mt: 1.5, fontSize: 13, color: 'text.secondary' }}>
                Đang lấy thông tin hành trình từ GHN...
              </Typography>
            </Box>
          ) : trackingData ? (
            <Stack spacing={2}>
              <Box sx={{ p: 2, bgcolor: '#F0F9FF', borderRadius: 2, border: '1px solid #BAE6FD' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#0369A1' }}>
                  Mã vận đơn: {trackingData.shipment?.tracking_code}
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  Đơn vị vận chuyển: <strong>GHN (Giao Hàng Nhanh)</strong>
                </Typography>
                <Typography variant="body2">
                  Trạng thái hiện tại:{' '}
                  <strong>
                    {SHIPPING_STATUS_MAP[trackingData.shipment?.status]?.label || trackingData.shipment?.status}
                  </strong>
                </Typography>
                {trackingData.shipment?.expected_delivery_at && (
                  <Typography variant="body2" sx={{ color: '#0284C7', fontWeight: 700 }}>
                    Dự kiến giao:{' '}
                    {new Date(trackingData.shipment.expected_delivery_at).toLocaleString('vi-VN')}
                  </Typography>
                )}
              </Box>

              <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1 }}>
                Lịch sử hành trình:
              </Typography>

              {(!trackingData.shipment?.histories || trackingData.shipment.histories.length === 0) ? (
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Chưa có lịch sử cập nhật trạng thái chi tiết.
                </Typography>
              ) : (
                <Stack spacing={1.5}>
                  {trackingData.shipment.histories.map((hist, idx) => (
                    <Paper
                      key={hist.history_id || idx}
                      variant="outlined"
                      sx={{ p: 1.5, borderRadius: 2, borderLeft: '4px solid #0284C7' }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography sx={{ fontWeight: 800, fontSize: 13 }}>
                          {SHIPPING_STATUS_MAP[hist.status]?.label || hist.status}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                          {new Date(hist.created_at).toLocaleString('vi-VN')}
                        </Typography>
                      </Box>
                      {hist.location && (
                        <Typography sx={{ fontSize: 12, color: '#0369A1', mt: 0.25 }}>
                          Vị trí / Kho: {hist.location}
                        </Typography>
                      )}
                      {hist.note && (
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
                          {hist.note}
                        </Typography>
                      )}
                    </Paper>
                  ))}
                </Stack>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Không tìm thấy thông tin vận đơn này.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTrackingModalOpen(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>

      {/* Modal Test Webhook GHN */}
      <Dialog
        open={webhookModalOpen}
        onClose={() => setWebhookModalOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BoltIcon sx={{ color: '#F59E0B' }} />
          Mô phỏng Webhook GHN (Test)
        </DialogTitle>
        <DialogContent dividers>
          <Alert severity="info" sx={{ mb: 2, fontSize: 12.5 }}>
            GHN sẽ tự động gọi Webhook này mỗi khi bưu tá quét mã kiện hàng tại bưu cục hoặc giao thành công cho khách hàng.
          </Alert>

          <Stack spacing={2} sx={{ mt: 1 }}>
            <Box sx={{ p: 1.5, bgcolor: '#F8FAFC', borderRadius: 1.5, border: '1px solid #E2E8F0' }}>
              <Typography variant="body2" sx={{ fontSize: 12.5 }}>
                Đơn hàng: <strong>#{webhookOrder?.order_code}</strong>
              </Typography>
              <Typography variant="body2" sx={{ fontSize: 12.5, color: '#DC2626', fontWeight: 700 }}>
                Mã vận đơn: {webhookOrder?.tracking_code}
              </Typography>
            </Box>

            <FormControl fullWidth size="small">
              <InputLabel>Trạng thái cập nhật từ GHN</InputLabel>
              <Select
                value={webhookStatus}
                label="Trạng thái cập nhật từ GHN"
                onChange={(e) => setWebhookStatus(e.target.value)}
              >
                <MenuItem value="picking">1. Đang lấy hàng (picking)</MenuItem>
                <MenuItem value="transporting">2. Đang luân chuyển bưu cục (transporting)</MenuItem>
                <MenuItem value="delivering">3. Đang đi giao (delivering)</MenuItem>
                <MenuItem value="delivered">4. Giao thành công (delivered ➔ Hoàn tất đơn)</MenuItem>
                <MenuItem value="delivery_fail">5. Giao thất bại (delivery_fail)</MenuItem>
                <MenuItem value="cancel">6. Hủy đơn (cancel ➔ Hủy đơn hàng)</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Kho / Vị trí hiện tại"
              size="small"
              fullWidth
              value={webhookWarehouse}
              onChange={(e) => setWebhookWarehouse(e.target.value)}
            />

            <TextField
              label="Ghi chú / Mô tả bưu tá"
              size="small"
              fullWidth
              multiline
              rows={2}
              value={webhookNote}
              onChange={(e) => setWebhookNote(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button disabled={sendingWebhook} onClick={() => setWebhookModalOpen(false)}>
            Hủy
          </Button>
          <Button
            variant="contained"
            color="warning"
            disabled={sendingWebhook}
            onClick={handleSendWebhook}
            startIcon={sendingWebhook ? <CircularProgress size={16} color="inherit" /> : <BoltIcon />}
            sx={{ fontWeight: 700 }}
          >
            {sendingWebhook ? 'Đang gửi...' : 'Bắn Webhook ngay'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
