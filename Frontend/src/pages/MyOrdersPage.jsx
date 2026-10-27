import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import InventoryIcon from '@mui/icons-material/Inventory';

import { orderApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, formatDate, getOrderStatusText } from '../utils/formatters';
import { StatusBadge } from '../components/ui/AppBadge';
import { AppButton } from '../components/ui/AppButton';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const MyOrdersPage = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const loadOrders = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await orderApi.getMyOrders();
      if (res.success && res.data) {
        setOrders(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    loadOrders();
  }, [user, loadOrders]);

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

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <EmptyState
          icon={<InventoryIcon />}
          title="Vui lòng đăng nhập"
          description="Đăng nhập để theo dõi lịch sử đơn hàng và tiến độ vận chuyển của bạn."
          actionText="Đăng nhập ngay"
          onAction={() => openAuthModal('login')}
        />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, pb: 2, borderBottom: '2px solid #E5E7EB' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.primary' }}>
            Đơn hàng của tôi ({orders.length})
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Theo dõi tiến độ vận chuyển và lịch sử mua sắm thiết bị tại GearK.
          </Typography>
        </Box>

        {loading ? (
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
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                        Mã đơn: <span style={{ color: '#E30019' }}>#{order.order_code}</span>
                      </Typography>
                      <span>•</span>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Ngày đặt: {formatDate(order.created_at)}
                      </Typography>
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
                        </Box>

                        <Box sx={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Typography variant="subtitle2" sx={{ fontWeight: 900 }}>
                            {formatPrice(parseFloat(item.unit_price) * item.quantity)}
                          </Typography>
                          {order.order_status === 'completed' && item.product_slug && (
                            <AppButton
                              variant="soft"
                              size="small"
                              onClick={() => onNavigate(`product/${item.product_slug}`)}
                            >
                              Đánh giá
                            </AppButton>
                          )}
                        </Box>
                      </Box>
                    ))}
                  </Stack>

                  <Divider sx={{ my: 2.5 }} />

                  {/* Order Footer & Actions */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Tổng thanh toán:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                        {formatPrice(order.total_amount)}
                      </Typography>
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
      </Container>
    </Box>
  );
};

export default MyOrdersPage;
