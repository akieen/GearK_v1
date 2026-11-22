import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import PaymentOutlinedIcon from '@mui/icons-material/PaymentOutlined';

import { orderApi } from '../api/cartApi';
import { formatPrice, formatDate, getOrderStatusText } from '../utils/formatters';
import { AppButton } from '../components/ui/AppButton';

export const OrderSuccessPage = ({ orderData, orderCode, onNavigate }) => {
  const code = orderData?.order_code || orderCode || 'ORD-2026';
  const [order, setOrder] = useState(orderData || null);
  const [loading, setLoading] = useState(!orderData);

  useEffect(() => {
    let isMounted = true;
    const fetchDetail = async () => {
      if (!code) return;
      try {
        setLoading(true);
        const res = await orderApi.getOrderDetail(code);
        if (isMounted && res.success && res.data) {
          setOrder(res.data);
        }
      } catch (err) {
        console.warn('Lỗi lấy chi tiết đơn hàng:', err.message);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchDetail();
    return () => { isMounted = false; };
  }, [code]);

  const activeOrder = order || orderData;
  const currentStatus = activeOrder?.order_status || 'pending';
  const statusInfo = getOrderStatusText(currentStatus);
  const total = activeOrder?.total_amount || orderData?.total_amount || 0;

  // Icon & Badge Header
  const isCompleted = currentStatus === 'completed';
  const isCancelled = currentStatus === 'cancelled';
  const isShipping = currentStatus === 'shipping';

  const HeaderIcon = isCancelled ? CancelOutlinedIcon : isShipping ? LocalShippingOutlinedIcon : CheckCircleIcon;
  const headerIconColor = isCancelled ? '#EF4444' : isCompleted ? '#10B981' : '#3B82F6';
  const headerIconBg = isCancelled ? '#FEE2E2' : isCompleted ? '#D1FAE5' : '#DBEAFE';

  const headerBadgeLabel = isCompleted
    ? 'ĐƠN HÀNG ĐÃ HOÀN THÀNH'
    : isCancelled
    ? 'ĐƠN HÀNG ĐÃ HỦY'
    : isShipping
    ? 'ĐƠN HÀNG ĐANG GIAO'
    : 'CHI TIẾT ĐƠN HÀNG';

  return (
    <Box sx={{ py: 6, pb: 10 }}>
      <Container maxWidth="md">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 2.5, sm: 4.5 },
            borderRadius: 4,
            border: '1px solid #E5E7EB',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CircularProgress size={36} color="primary" />
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Đang tải chi tiết đơn hàng #{code}...
              </Typography>
            </Box>
          ) : (
            <>
              {/* Status Header Icon */}
              <Box
                sx={{
                  width: 76,
                  height: 76,
                  borderRadius: '50%',
                  backgroundColor: headerIconBg,
                  color: headerIconColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 18px auto',
                }}
              >
                <HeaderIcon sx={{ fontSize: 44 }} />
              </Box>

              <Chip
                label={headerBadgeLabel}
                size="small"
                sx={{
                  backgroundColor: headerIconBg,
                  color: headerIconColor,
                  fontWeight: 900,
                  fontSize: '0.75rem',
                  letterSpacing: '0.04em',
                  mb: 1.5,
                }}
              />

              <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.25, fontSize: { xs: '1.4rem', sm: '1.85rem' } }}>
                {isCompleted
                  ? `Đơn hàng #${code} đã hoàn thành`
                  : isCancelled
                  ? `Đơn hàng #${code} đã bị hủy`
                  : `Cảm ơn bạn đã mua sắm tại GearK!`}
              </Typography>

              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5, lineHeight: 1.6 }}>
                {isCompleted
                  ? 'Đơn hàng đã được giao thành công tới quý khách. Chúc bạn có trải nghiệm tuyệt vời cùng Gaming Gear!'
                  : isCancelled
                  ? 'Đơn hàng này đã bị hủy. Quý khách có thể lựa chọn các sản phẩm khác tại cửa hàng.'
                  : 'Đơn hàng của bạn đã được tiếp nhận và nhân viên hỗ trợ GearK sẽ gọi điện xác nhận trong ít phút.'}
              </Typography>

              {/* Order Info Details Card */}
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  mb: 3.5,
                  borderRadius: 2.5,
                  backgroundColor: '#F8FAFC',
                  textAlign: 'left',
                }}
              >
                <Stack spacing={1.5} divider={<Divider />}>
                  {/* Mã đơn & Ngày đặt */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>Mã đơn hàng</Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', fontSize: 16 }}>
                        #{code}
                      </Typography>
                    </Box>
                    {activeOrder?.created_at && (
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Ngày đặt: {formatDate(activeOrder.created_at)}
                      </Typography>
                    )}
                  </Box>

                  {/* Trạng thái đơn hàng */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Trạng thái đơn hàng:
                    </Typography>
                    <Chip
                      label={statusInfo.label}
                      size="small"
                      sx={{
                        height: 24,
                        fontSize: '0.75rem',
                        fontWeight: 800,
                        backgroundColor: statusInfo.bg,
                        color: statusInfo.color,
                        border: `1px solid ${statusInfo.color}30`,
                      }}
                    />
                  </Box>

                  {/* Trạng thái thanh toán */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Thanh toán:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={
                          activeOrder?.payment_status === 'paid'
                            ? 'ĐÃ THANH TOÁN'
                            : 'CHƯA THANH TOÁN'
                        }
                        size="small"
                        sx={{
                          height: 22,
                          fontSize: '0.6875rem',
                          fontWeight: 800,
                          backgroundColor: activeOrder?.payment_status === 'paid' ? '#D1FAE5' : '#FEF3C7',
                          color: activeOrder?.payment_status === 'paid' ? '#065F46' : '#92400E',
                        }}
                      />
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        ({activeOrder?.payment_method ? activeOrder.payment_method.toUpperCase() : 'COD'})
                      </Typography>
                    </Box>
                  </Box>

                  {/* Vận chuyển GHN & Mã vận đơn */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                      Vận chuyển (GHN):
                    </Typography>
                    <Box sx={{ textAlign: 'right' }}>
                      {activeOrder?.tracking_code ? (
                        <Chip
                          icon={<LocalShippingOutlinedIcon sx={{ fontSize: '13px !important' }} />}
                          label={`Mã vận đơn: ${activeOrder.tracking_code}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: 11,
                            bgcolor: '#FEF2F2',
                            color: '#E30019',
                          }}
                        />
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                          Giao Hàng Nhanh (Đang xử lý xuất kho)
                        </Typography>
                      )}
                    </Box>
                  </Box>

                  {/* Thông tin người nhận & Địa chỉ */}
                  {(activeOrder?.recipient_name || activeOrder?.street_address) && (
                    <Box sx={{ pt: 0.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
                        <PersonOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {activeOrder.recipient_name} {activeOrder.recipient_phone ? `• ${activeOrder.recipient_phone}` : ''}
                        </Typography>
                      </Box>
                      {activeOrder.street_address && (
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75 }}>
                          <LocationOnOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary', mt: 0.2 }} />
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: 13 }}>
                            {activeOrder.street_address}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  )}

                  {/* Danh sách sản phẩm (nếu có) */}
                  {activeOrder?.items && activeOrder.items.length > 0 && (
                    <Box sx={{ pt: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1, display: 'block', textTransform: 'uppercase' }}>
                        Sản phẩm đã đặt ({activeOrder.items.length})
                      </Typography>
                      <Stack spacing={1.5}>
                        {activeOrder.items.map((it) => (
                          <Box key={it.order_item_id || it.variant_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            {it.thumbnail_url && (
                              <Box
                                component="img"
                                src={it.thumbnail_url}
                                alt={it.product_name}
                                sx={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 1.5, border: '1px solid #E5E7EB', p: 0.25, bgcolor: '#FFF' }}
                              />
                            )}
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, fontSize: 13, lineHeight: 1.3 }}>
                                {it.product_name}
                              </Typography>
                              {it.variant_name && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                                  Phiên bản: {it.variant_name}
                                </Typography>
                              )}
                              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                SL: {it.quantity} × {formatPrice(it.unit_price)}
                              </Typography>
                            </Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, flexShrink: 0 }}>
                              {formatPrice(parseFloat(it.unit_price || 0) * (it.quantity || 1))}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  )}

                  {/* Phí vận chuyển */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Phí vận chuyển (GHN):
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      {activeOrder?.shipping_fee ? formatPrice(activeOrder.shipping_fee) : '0 ₫ (Miễn phí)'}
                    </Typography>
                  </Box>

                  {/* Tổng thanh toán */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 0.5 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                      Tổng thanh toán:
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {formatPrice(total)}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>

              {/* Action buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
                <AppButton
                  variant="primary"
                  size="large"
                  glow
                  onClick={() => onNavigate('my-orders')}
                >
                  Danh sách đơn hàng của tôi
                </AppButton>
                <AppButton
                  variant="outline"
                  size="large"
                  onClick={() => onNavigate('home')}
                >
                  Tiếp tục mua sắm
                </AppButton>
              </Stack>
            </>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default OrderSuccessPage;
