import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import PaymentIcon from '@mui/icons-material/Payment';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useCart } from '../context/CartContext';
import { paymentApi } from '../api/paymentApi';
import { formatPrice } from '../utils/formatters';
import { AppButton } from '../components/ui/AppButton';

// Map VNPay response codes to human-friendly Vietnamese messages
const getVNPayErrorMessage = (code, defaultMsg) => {
  switch (code) {
    case '00':
      return 'Giao dịch thành công';
    case '07':
      return 'Trừ tiền thành công. Giao dịch bị nghi ngờ (liên quan tới lừa đảo, giao dịch bất thường).';
    case '09':
      return 'Thẻ/Tài khoản chưa đăng ký dịch vụ InternetBanking tại ngân hàng.';
    case '10':
      return 'Khách hàng xác thực thông tin thẻ/tài khoản không đúng quá 3 lần.';
    case '11':
      return 'Đã hết hạn chờ thanh toán. Xin vui lòng thực hiện lại giao dịch.';
    case '12':
      return 'Thẻ/Tài khoản của bạn đang bị khóa.';
    case '13':
      return 'Quý khách nhập sai mật khẩu xác thực giao dịch (OTP).';
    case '24':
      return 'Khách hàng đã hủy giao dịch thanh toán.';
    case '51':
      return 'Tài khoản của quý khách không đủ số dư để thực hiện giao dịch.';
    case '65':
      return 'Tài khoản của quý khách đã vượt quá hạn mức giao dịch trong ngày.';
    case '75':
      return 'Ngân hàng thanh toán đang bảo trì.';
    case '79':
      return 'Khách hàng nhập sai mật khẩu thanh toán quá số lần quy định.';
    case '97':
      return 'Chữ ký không hợp lệ (Dữ liệu giao dịch có thể bị can thiệp).';
    default:
      return defaultMsg || `Giao dịch không thành công (Mã lỗi: ${code || 'Unknown'})`;
  }
};

export const VNPayReturnPage = ({ params = {}, onNavigate }) => {
  const { fetchCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [transactionData, setTransactionData] = useState(null);

  // Extract query parameters from URL Search & Hash if not fully present in params
  const urlSearch = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const hashSearch = typeof window !== 'undefined' && window.location.hash.includes('?') 
    ? new URLSearchParams(window.location.hash.split('?')[1]) 
    : new URLSearchParams();

  const responseCode = params.vnp_ResponseCode || urlSearch.get('vnp_ResponseCode') || hashSearch.get('vnp_ResponseCode') || '';
  const txnRef = params.vnp_TxnRef || urlSearch.get('vnp_TxnRef') || hashSearch.get('vnp_TxnRef') || '';
  const orderCode = params.order_code || urlSearch.get('order_code') || hashSearch.get('order_code') || '';
  const orderId = params.order_id || urlSearch.get('order_id') || hashSearch.get('order_id') || '';
  const bankCode = params.bank_code || urlSearch.get('vnp_BankCode') || hashSearch.get('vnp_BankCode') || '';
  const rawAmount = params.amount || urlSearch.get('amount') || hashSearch.get('amount') || urlSearch.get('vnp_Amount') || '';
  const parsedAmount = rawAmount ? (Number(rawAmount) > 100000000 ? Number(rawAmount) / 100 : Number(rawAmount)) : 0;
  const rawMessage = params.message || urlSearch.get('message') || hashSearch.get('message') || '';

  const isSuccess = responseCode === '00';

  useEffect(() => {
    // If success, refresh cart so the cart drawer and badge reflect 0 items
    if (isSuccess) {
      fetchCart();
    }
  }, [isSuccess, fetchCart]);

  // Optional: fetch real-time transaction data from backend if txnRef exists
  useEffect(() => {
    if (txnRef && !orderCode) {
      setLoading(true);
      paymentApi
        .checkTransactionStatus(txnRef)
        .then((res) => {
          if (res.success && res.data) {
            setTransactionData(res.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [txnRef, orderCode]);

  const displayOrderCode = orderCode || transactionData?.order_code || (orderId ? `ORD-${orderId}` : '');
  const displayAmount = parsedAmount || transactionData?.total_amount || transactionData?.amount || 0;

  if (loading) {
    return (
      <Container maxWidth="sm" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress color="primary" size={48} sx={{ mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Đang kiểm tra kết quả giao dịch VNPAY...
        </Typography>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 6, pb: 10, minHeight: '70vh', display: 'flex', alignItems: 'center' }}>
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: isSuccess ? '#BBF7D0' : '#FECACA',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top highlight bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              backgroundColor: isSuccess ? '#10B981' : '#EF4444',
            }}
          />

          {/* Status Icon */}
          <Box
            sx={{
              width: 84,
              height: 84,
              borderRadius: '50%',
              backgroundColor: isSuccess ? '#DCFCE7' : '#FEE2E2',
              color: isSuccess ? '#15803D' : '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
              boxShadow: isSuccess ? '0 0 20px rgba(16, 185, 129, 0.25)' : '0 0 20px rgba(239, 68, 68, 0.25)',
            }}
          >
            {isSuccess ? (
              <CheckCircleIcon sx={{ fontSize: 52 }} />
            ) : (
              <HighlightOffIcon sx={{ fontSize: 52 }} />
            )}
          </Box>

          {/* Badge */}
          <Chip
            icon={<PaymentIcon sx={{ fontSize: '1rem !important' }} />}
            label={isSuccess ? 'THANH TOÁN VNPAY THÀNH CÔNG' : 'GIAO DỊCH CHƯA HOÀN TẤT'}
            size="small"
            sx={{
              backgroundColor: isSuccess ? '#ECFDF5' : '#FEF2F2',
              color: isSuccess ? '#065F46' : '#991B1B',
              border: '1px solid',
              borderColor: isSuccess ? '#A7F3D0' : '#FECACA',
              fontWeight: 900,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              mb: 2,
              px: 1,
            }}
          />

          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.5, color: '#111827' }}>
            {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán chưa hoàn tất'}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3.5, lineHeight: 1.6 }}>
            {isSuccess
              ? 'Cảm ơn bạn! Đơn hàng của bạn đã được thanh toán an toàn qua cổng VNPAY và hệ thống đã tự động tạo đơn hàng.'
              : getVNPayErrorMessage(responseCode, rawMessage)}
          </Typography>

          {/* Transaction Summary Card */}
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              mb: 3.5,
              borderRadius: 3,
              backgroundColor: '#F8FAFC',
              textAlign: 'left',
              border: '1px solid #E5E7EB',
            }}
          >
            <Stack spacing={1.5} divider={<Divider />}>
              {displayOrderCode && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Mã đơn hàng:
                  </Typography>
                  <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    #{displayOrderCode}
                  </Typography>
                </Box>
              )}

              {txnRef && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Mã GD VNPAY:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                    {txnRef}
                  </Typography>
                </Box>
              )}

              {displayAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    Số tiền thanh toán:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900, color: isSuccess ? 'success.main' : 'text.primary' }}>
                    {formatPrice(displayAmount)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Phương thức:
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  VNPAY {bankCode ? `(${bankCode})` : 'Online'}
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Trạng thái:
                </Typography>
                {isSuccess ? (
                  <Chip
                    label="Đã thanh toán"
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      backgroundColor: '#DEF7EC',
                      color: '#03543F',
                    }}
                  />
                ) : (
                  <Chip
                    label={responseCode === '24' ? 'Đã hủy' : 'Thất bại'}
                    size="small"
                    sx={{
                      height: 22,
                      fontSize: '0.6875rem',
                      fontWeight: 800,
                      backgroundColor: '#FDE8E8',
                      color: '#9B1C1C',
                    }}
                  />
                )}
              </Box>
            </Stack>
          </Paper>

          {/* Action buttons */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center">
            {isSuccess ? (
              <>
                <AppButton
                  variant="primary"
                  size="large"
                  glow
                  startIcon={<ShoppingBagIcon />}
                  onClick={() => onNavigate('my-orders')}
                >
                  Xem đơn hàng của tôi
                </AppButton>
                <AppButton
                  variant="outline"
                  size="large"
                  onClick={() => onNavigate('home')}
                >
                  Về trang chủ
                </AppButton>
              </>
            ) : (
              <>
                <AppButton
                  variant="primary"
                  size="large"
                  glow
                  startIcon={<PaymentIcon />}
                  onClick={() => onNavigate('checkout')}
                >
                  Thử thanh toán lại
                </AppButton>
                <AppButton
                  variant="outline"
                  size="large"
                  startIcon={<ArrowBackIcon />}
                  onClick={() => onNavigate('cart')}
                >
                  Quay lại giỏ hàng
                </AppButton>
              </>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default VNPayReturnPage;
