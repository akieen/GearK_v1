import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';

import InventoryIcon from '@mui/icons-material/Inventory';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { orderApi } from '../api/cartApi';
import { warrantyApi } from '../api/warrantyApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, formatDate, getOrderStatusText, getWarrantyStatusText } from '../utils/formatters';
import { StatusBadge } from '../components/ui/AppBadge';
import { AppButton } from '../components/ui/AppButton';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import WarrantyClaimModal from '../components/warranty/WarrantyClaimModal';

export const MyOrdersPage = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'warranties'
  const [orders, setOrders] = useState([]);
  const [claims, setClaims] = useState([]);
  const [eligibleItems, setEligibleItems] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [cancellingId, setCancellingId] = useState(null);

  // Modal claim
  const [selectedWarrantyItem, setSelectedWarrantyItem] = useState(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [showItemPickerModal, setShowItemPickerModal] = useState(false);

  // Zoom image
  const [zoomImage, setZoomImage] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoadingOrders(true);
    try {
      const res = await orderApi.getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy đơn hàng:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [user]);

  const loadClaims = useCallback(async () => {
    if (!user) return;
    setLoadingClaims(true);
    try {
      const res = await warrantyApi.getMyClaims();
      if (res.success && res.data) {
        setClaims(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy yêu cầu bảo hành:', err);
    } finally {
      setLoadingClaims(false);
    }
  }, [user]);

  const loadEligibleItems = useCallback(async () => {
    if (!user) return;
    try {
      const res = await warrantyApi.getEligibleItems();
      if (res.success && res.data) {
        setEligibleItems(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy sản phẩm bảo hành:', err);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    loadOrders();
    loadClaims();
  }, [user, loadOrders, loadClaims]);

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) return;
    try {
      setCancellingId(orderId);
      const res = await orderApi.cancelOrder(orderId);
      if (res.success) {
        toast.info('Đã hủy đơn hàng thành công');
        loadOrders();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi hủy đơn hàng');
    } finally {
      setCancellingId(null);
    }
  };

  const handleOpenWarrantyForItem = (order, item) => {
    setSelectedWarrantyItem({
      order_id: order.order_id,
      order_code: order.order_code,
      order_date: order.created_at,
      order_item_id: item.order_item_id,
      product_name: item.product_name,
      variant_name: item.variant_name,
      thumbnail_url: item.thumbnail_url,
      warranty_months: item.warranty_months || 12,
    });
    setShowClaimModal(true);
  };

  const handleOpenItemPicker = async () => {
    await loadEligibleItems();
    setShowItemPickerModal(true);
  };

  const parseImages = (imgs) => {
    if (!imgs) return [];
    if (Array.isArray(imgs)) return imgs;
    try {
      const parsed = JSON.parse(imgs);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // not json
    }
    return [imgs];
  };

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <EmptyState
          icon={<InventoryIcon />}
          title="Vui lòng đăng nhập"
          description="Đăng nhập để theo dõi lịch sử đơn hàng và tiến độ bảo hành thiết bị của bạn."
          actionText="Đăng nhập ngay"
          onAction={() => openAuthModal('login')}
        />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header with Navigation Pills */}
        <Box sx={{ mb: 4, pb: 2, borderBottom: '2px solid #E5E7EB' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.primary' }}>
                Quản lý mua sắm & Bảo hành
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                Theo dõi tiến độ vận chuyển đơn hàng và gửi yêu cầu bảo hành nhanh chóng tại GearK.
              </Typography>
            </Box>

            {/* Sub-tab Switcher */}
            <Stack direction="row" spacing={1} sx={{ bgcolor: '#F1F5F9', p: 0.6, borderRadius: 3 }}>
              <Button
                variant={activeTab === 'orders' ? 'contained' : 'text'}
                size="small"
                onClick={() => setActiveTab('orders')}
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: 'none',
                  borderRadius: 2.5,
                  px: 2,
                  py: 0.75,
                  bgcolor: activeTab === 'orders' ? '#DC2626' : 'transparent',
                  color: activeTab === 'orders' ? '#FFFFFF' : '#475569',
                  boxShadow: activeTab === 'orders' ? '0 2px 6px rgba(220, 38, 38, 0.3)' : 'none',
                  '&:hover': {
                    bgcolor: activeTab === 'orders' ? '#B91C1C' : '#E2E8F0',
                  },
                }}
              >
                Đơn hàng ({orders.length})
              </Button>

              <Button
                variant={activeTab === 'warranties' ? 'contained' : 'text'}
                size="small"
                onClick={() => setActiveTab('warranties')}
                sx={{
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: 'none',
                  borderRadius: 2.5,
                  px: 2,
                  py: 0.75,
                  bgcolor: activeTab === 'warranties' ? '#DC2626' : 'transparent',
                  color: activeTab === 'warranties' ? '#FFFFFF' : '#475569',
                  boxShadow: activeTab === 'warranties' ? '0 2px 6px rgba(220, 38, 38, 0.3)' : 'none',
                  '&:hover': {
                    bgcolor: activeTab === 'warranties' ? '#B91C1C' : '#E2E8F0',
                  },
                }}
              >
                Bảo hành sản phẩm ({claims.length})
              </Button>
            </Stack>
          </Stack>
        </Box>

        {/* TAB 1: ORDERS */}
        {activeTab === 'orders' && (
          <>
            {loadingOrders ? (
              <LoadingSpinner minHeight={320} message="Đang tải lịch sử đơn hàng..." />
            ) : orders.length === 0 ? (
              <EmptyState
                icon={<InventoryIcon />}
                title="Bạn chưa có đơn hàng nào"
                description="Hãy dạo quanh cửa hàng và chọn cho mình bộ Gaming Gear ưng ý nhất!"
                actionText="Khám phá Gaming Gear ngay"
                onAction={() => onNavigate('products')}
              />
            ) : (
              <Stack spacing={3}>
                {orders.map((order) => {
                  const statusInfo = getOrderStatusText(order.order_status);
                  const isCompleted = order.order_status === 'completed';

                  return (
                    <Paper
                      key={order.order_id}
                      elevation={1}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid #E5E7EB',
                        backgroundColor: '#FFFFFF',
                      }}
                    >
                      {/* Order Top Bar */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #F1F5F9',
                          pb: 2,
                          mb: 2.5,
                          flexWrap: 'wrap',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                            Mã đơn: <span style={{ color: '#E30019' }}>#{order.order_code}</span>
                          </Typography>
                          <span>•</span>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Ngày đặt: {formatDate(order.created_at)}
                          </Typography>
                          {order.tracking_code && (
                            <Chip
                              label={`Vận đơn GHN: ${order.tracking_code}`}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: 11,
                                height: 22,
                                bgcolor: '#FEF2F2',
                                color: '#E30019',
                                border: '1px solid #FECACA',
                              }}
                            />
                          )}
                        </Box>

                        <StatusBadge status={statusInfo.label} />
                      </Box>

                      {/* Items List */}
                      <Stack spacing={2} divider={<Divider />}>
                        {order.items?.map((item) => (
                          <Box key={item.order_item_id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box
                              component="img"
                              src={item.thumbnail_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=150&q=80'}
                              alt={item.product_name}
                              sx={{
                                width: 60,
                                height: 60,
                                objectFit: 'contain',
                                borderRadius: 2,
                                border: '1px solid #E5E7EB',
                                p: 0.5,
                                backgroundColor: '#FFFFFF',
                                flexShrink: 0,
                              }}
                            />

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography
                                variant="subtitle2"
                                onClick={() => item.product_slug && onNavigate(`product/${item.product_slug}`)}
                                sx={{
                                  fontWeight: 700,
                                  cursor: item.product_slug ? 'pointer' : 'default',
                                  '&:hover': item.product_slug ? { color: 'primary.main' } : {},
                                }}
                              >
                                {item.product_name}
                              </Typography>
                              {item.variant_name && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                  Bản: {item.variant_name}
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                SL: {item.quantity} × {formatPrice(item.unit_price)}
                              </Typography>
                              {item.warranty_months && (
                                <Typography variant="caption" sx={{ color: '#047857', display: 'block', fontWeight: 600 }}>
                                  Bảo hành chính hãng: {item.warranty_months} tháng
                                </Typography>
                              )}
                            </Box>

                            <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1.25, flexWrap: 'wrap' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                                {formatPrice(parseFloat(item.unit_price) * item.quantity)}
                              </Typography>

                              {isCompleted && (
                                <Stack direction="row" spacing={1}>
                                  {item.product_slug && (
                                    <AppButton
                                      variant="soft"
                                      size="small"
                                      onClick={() => onNavigate(`product/${item.product_slug}`)}
                                    >
                                      Đánh giá
                                    </AppButton>
                                  )}
                                  <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<VerifiedUserOutlinedIcon sx={{ fontSize: 16 }} />}
                                    onClick={() => handleOpenWarrantyForItem(order, item)}
                                    sx={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      textTransform: 'none',
                                      color: '#047857',
                                      borderColor: '#A7F3D0',
                                      bgcolor: '#ECFDF5',
                                      '&:hover': {
                                        borderColor: '#059669',
                                        bgcolor: '#D1FAE5',
                                      },
                                    }}
                                  >
                                    Bảo hành
                                  </Button>
                                </Stack>
                              )}
                            </Box>
                          </Box>
                        ))}
                      </Stack>

                      <Divider sx={{ my: 2.5 }} />

                      {/* Order Footer & Actions */}
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            Tổng thanh toán:
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                            {formatPrice(order.total_amount)}
                          </Typography>
                          {order.shipping_fee > 0 && (
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                              (Gồm {formatPrice(order.shipping_fee)} phí ship GHN)
                            </Typography>
                          )}
                        </Box>

                        <Stack direction="row" spacing={1.5}>
                          {['pending', 'processing'].includes(order.order_status) && (
                            <AppButton
                              variant="ghost"
                              size="small"
                              loading={cancellingId === order.order_id}
                              onClick={() => handleCancelOrder(order.order_id)}
                              sx={{ color: 'error.main' }}
                            >
                              Hủy đơn
                            </AppButton>
                          )}
                          <AppButton
                            variant="primary"
                            size="small"
                            onClick={() => onNavigate(`order-success/${order.order_code}`)}
                          >
                            Chi tiết đơn
                          </AppButton>
                        </Stack>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </>
        )}

        {/* TAB 2: WARRANTIES */}
        {activeTab === 'warranties' && (
          <Box>
            {/* Action Bar */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B' }}>
                Danh sách yêu cầu bảo hành đã gửi
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddCircleOutlineOutlinedIcon />}
                onClick={handleOpenItemPicker}
                sx={{
                  bgcolor: '#DC2626',
                  fontWeight: 700,
                  fontSize: 13,
                  textTransform: 'none',
                  borderRadius: 2,
                  px: 2,
                  '&:hover': { bgcolor: '#B91C1C' },
                }}
              >
                Gửi yêu cầu bảo hành mới
              </Button>
            </Stack>

            {loadingClaims ? (
              <LoadingSpinner minHeight={280} message="Đang tải danh sách bảo hành..." />
            ) : claims.length === 0 ? (
              <EmptyState
                icon={<VerifiedUserIcon />}
                title="Chưa có yêu cầu bảo hành nào"
                description="Khi sản phẩm gặp sự cố kỹ thuật trong thời hạn bảo hành, bạn có thể tạo yêu cầu bảo hành tại đây hoặc bấm nút Bảo hành ở chi tiết đơn hàng."
                actionText="Chọn sản phẩm bảo hành"
                onAction={handleOpenItemPicker}
              />
            ) : (
              <Stack spacing={2.5}>
                {claims.map((claim) => {
                  const statusInfo = getWarrantyStatusText(claim.status);
                  const images = parseImages(claim.image_urls);

                  return (
                    <Paper
                      key={claim.claim_id}
                      elevation={0}
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: '1px solid #E2E8F0',
                        bgcolor: '#FFFFFF',
                        transition: '0.2s',
                        '&:hover': { borderColor: '#CBD5E1', boxShadow: '0 4px 12px rgba(0,0,0,0.04)' },
                      }}
                    >
                      {/* Top Bar */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderBottom: '1px solid #F1F5F9',
                          pb: 1.75,
                          mb: 2,
                          flexWrap: 'wrap',
                          gap: 1.5,
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#DC2626' }}>
                            Mã bảo hành: #WC-{claim.claim_id}
                          </Typography>
                          <span>•</span>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Ngày gửi: {formatDate(claim.created_at)}
                          </Typography>
                          {claim.order?.order_code && (
                            <>
                              <span>•</span>
                              <Typography variant="caption" sx={{ color: '#475569', fontWeight: 600 }}>
                                Đơn hàng: #{claim.order.order_code}
                              </Typography>
                            </>
                          )}
                        </Box>

                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            bgcolor: statusInfo.bg,
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color}40`,
                          }}
                        />
                      </Box>

                      {/* Content Body */}
                      <Box sx={{ display: 'flex', gap: 2.5, flexDirection: { xs: 'column', sm: 'row' } }}>
                        {/* Thumbnail */}
                        <Box
                          component="img"
                          src={
                            claim.order_item?.thumbnail_url ||
                            'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=150&q=80'
                          }
                          alt={claim.product_name}
                          sx={{
                            width: 80,
                            height: 80,
                            objectFit: 'contain',
                            borderRadius: 2,
                            border: '1px solid #E2E8F0',
                            bgcolor: '#FFFFFF',
                            p: 0.5,
                            flexShrink: 0,
                          }}
                        />

                        {/* Details */}
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#1E293B', lineHeight: 1.3 }}>
                            {claim.product_name}
                          </Typography>

                          {claim.serial_number && (
                            <Typography variant="caption" sx={{ color: '#1D4ED8', display: 'block', mt: 0.25, fontWeight: 700 }}>
                              Số Serial / S/N: {claim.serial_number}
                            </Typography>
                          )}

                          {/* Issue description */}
                          <Box sx={{ mt: 1.25, p: 1.5, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #EEF2F6' }}>
                            <Typography variant="caption" sx={{ color: '#64748B', fontWeight: 700, display: 'block', mb: 0.25 }}>
                              Mô tả lỗi sản phẩm:
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.5 }}>
                              {claim.issue_description}
                            </Typography>
                          </Box>

                          {/* Customer uploaded images */}
                          {images.length > 0 && (
                            <Stack direction="row" spacing={1} sx={{ mt: 1.5, flexWrap: 'wrap', gap: 1 }}>
                              {images.map((img, i) => (
                                <Box
                                  key={i}
                                  component="img"
                                  src={img}
                                  alt="Minh chứng"
                                  onClick={() => setZoomImage(img)}
                                  sx={{
                                    width: 50,
                                    height: 50,
                                    objectFit: 'cover',
                                    borderRadius: 1.5,
                                    border: '1px solid #CBD5E1',
                                    cursor: 'pointer',
                                    '&:hover': { transform: 'scale(1.05)', transition: '0.15s' },
                                  }}
                                />
                              ))}
                            </Stack>
                          )}

                          {/* Admin Note / Response */}
                          {claim.admin_note && (
                            <Alert
                              severity={claim.status === 'rejected' ? 'error' : 'info'}
                              sx={{
                                mt: 2,
                                borderRadius: 2,
                                fontSize: 13,
                                '& .MuiAlert-message': { fontSize: 13, width: '100%' },
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', mb: 0.25 }}>
                                Phản hồi từ Trung tâm kỹ thuật GearK:
                              </Typography>
                              <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                                {claim.admin_note}
                              </Typography>
                            </Alert>
                          )}
                        </Box>
                      </Box>
                    </Paper>
                  );
                })}
              </Stack>
            )}
          </Box>
        )}
      </Container>

      {/* MODAL 1: SELECT PRODUCT FOR WARRANTY */}
      <Dialog
        open={showItemPickerModal}
        onClose={() => setShowItemPickerModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <VerifiedUserIcon sx={{ color: '#DC2626', fontSize: 24 }} />
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Chọn sản phẩm cần bảo hành
            </Typography>
          </Box>
          <IconButton onClick={() => setShowItemPickerModal(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 2.5 }}>
          {eligibleItems.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <InventoryIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
              <Typography sx={{ fontWeight: 700, color: '#64748B' }}>
                Không có sản phẩm nào đủ điều kiện bảo hành
              </Typography>
              <Typography sx={{ fontSize: 12, color: '#94A3B8', mt: 0.5 }}>
                Bạn chỉ có thể tạo yêu cầu bảo hành cho các đơn hàng đã được giao thành công.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={2}>
              <Typography variant="caption" sx={{ color: '#64748B' }}>
                Danh sách các sản phẩm từ các đơn hàng đã hoàn tất của bạn:
              </Typography>
              {eligibleItems.map((item) => (
                <Paper
                  key={`${item.order_id}-${item.order_item_id}`}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 2,
                    flexWrap: 'wrap',
                    bgcolor: item.has_active_claim ? '#F8FAFC' : '#FFFFFF',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, minWidth: 240 }}>
                    <Box
                      component="img"
                      src={item.thumbnail_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=150&q=80'}
                      alt={item.product_name}
                      sx={{
                        width: 54,
                        height: 54,
                        objectFit: 'contain',
                        borderRadius: 1.5,
                        border: '1px solid #E2E8F0',
                        p: 0.5,
                        flexShrink: 0,
                      }}
                    />
                    <Box>
                      <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#1E293B', lineHeight: 1.3 }}>
                        {item.product_name}
                      </Typography>
                      {item.variant_name && (
                        <Typography sx={{ fontSize: 11, color: '#64748B' }}>
                          Phiên bản: {item.variant_name}
                        </Typography>
                      )}
                      <Typography sx={{ fontSize: 11, color: '#94A3B8', mt: 0.25 }}>
                        Đơn #{item.order_code} • Mua ngày {formatDate(item.order_date)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ textAlign: 'right' }}>
                    {item.has_active_claim ? (
                      <Chip
                        label="Đang xử lý bảo hành"
                        size="small"
                        sx={{ bgcolor: '#FEF3C7', color: '#D97706', fontWeight: 700, fontSize: 11 }}
                      />
                    ) : (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => {
                          setShowItemPickerModal(false);
                          setSelectedWarrantyItem(item);
                          setShowClaimModal(true);
                        }}
                        sx={{
                          bgcolor: '#DC2626',
                          fontWeight: 700,
                          fontSize: 12,
                          textTransform: 'none',
                          borderRadius: 2,
                          '&:hover': { bgcolor: '#B91C1C' },
                        }}
                      >
                        Yêu cầu bảo hành
                      </Button>
                    )}
                  </Box>
                </Paper>
              ))}
            </Stack>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL 2: WARRANTY CLAIM FORM MODAL */}
      <WarrantyClaimModal
        open={showClaimModal}
        onClose={() => {
          setShowClaimModal(false);
          setSelectedWarrantyItem(null);
        }}
        item={selectedWarrantyItem}
        onSuccess={() => {
          loadClaims();
          setActiveTab('warranties');
        }}
      />

      {/* MODAL 3: ZOOM IMAGE */}
      <Dialog open={!!zoomImage} onClose={() => setZoomImage(null)} maxWidth="md">
        <Box sx={{ position: 'relative', bgcolor: '#000000', p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={() => setZoomImage(null)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#FFFFFF', bgcolor: 'rgba(0,0,0,0.5)' }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={zoomImage}
            alt="Phóng to"
            sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 1 }}
          />
        </Box>
      </Dialog>
    </Box>
  );
};

export default MyOrdersPage;
