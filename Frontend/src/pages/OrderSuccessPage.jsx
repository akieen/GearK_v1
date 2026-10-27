import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { formatPrice } from '../utils/formatters';
import { AppButton } from '../components/ui/AppButton';

export const OrderSuccessPage = ({ orderData, orderCode, onNavigate }) => {
  const code = orderData?.order_code || orderCode || 'ORD-2026';
  const total = orderData?.total_amount || 0;

  return (
    <Box sx={{ py: 6, pb: 10 }}>
      <Container maxWidth="sm">
        <Paper
          elevation={2}
          sx={{
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            border: '1px solid #E5E7EB',
            textAlign: 'center',
            backgroundColor: '#FFFFFF',
          }}
        >
          {/* Check icon */}
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              backgroundColor: '#D1FAE5',
              color: 'success.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px auto',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 48 }} />
          </Box>

          <Chip
            label="ĐẶT HÀNG THÀNH CÔNG"
            size="small"
            sx={{
              backgroundColor: '#FEE2E2',
              color: 'primary.main',
              fontWeight: 900,
              fontSize: '0.75rem',
              letterSpacing: '0.04em',
              mb: 1.5,
            }}
          />

          <Typography variant="h4" sx={{ fontWeight: 900, mb: 1.25 }}>
            Cảm ơn bạn đã mua sắm tại GearK!
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, lineHeight: 1.6 }}>
            Đơn hàng của bạn đã được tiếp nhận và nhân viên hỗ trợ GearK sẽ gọi điện xác nhận trong ít phút.
          </Typography>

          {/* Order Details Card */}
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
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Mã đơn hàng:
                </Typography>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  #{code}
                </Typography>
              </Box>

              {total > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tổng thanh toán:
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    {formatPrice(total)}
                  </Typography>
                </Box>
              )}

              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Trạng thái đơn:
                </Typography>
                <Chip
                  label="Chờ xác nhận"
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: '0.6875rem',
                    fontWeight: 800,
                    backgroundColor: '#FEF3C7',
                    color: '#92400E',
                  }}
                />
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
              Theo dõi đơn hàng
            </AppButton>
            <AppButton
              variant="outline"
              size="large"
              onClick={() => onNavigate('home')}
            >
              Tiếp tục mua sắm
            </AppButton>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
};

export default OrderSuccessPage;
