import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

import ProductCard from '../common/ProductCard';

export const TrustFeatures = () => {
  const features = [
    {
      icon: <VerifiedUserIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      title: 'Chính Hãng 100%',
      desc: 'Bảo hành 1 đổi 1 tận nơi',
    },
    {
      icon: <LocalShippingIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      title: 'Giao Nhanh Siêu Tốc 2H',
      desc: 'Miễn phí đơn từ 500.000₫',
    },
    {
      icon: <ChangeCircleIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      title: 'Đổi Trả Dễ Dàng 30 Ngày',
      desc: 'Thủ tục nhanh chóng, tiện lợi',
    },
    {
      icon: <CreditCardIcon sx={{ fontSize: 28, color: 'primary.main' }} />,
      title: 'Hỗ Trợ Trả Góp 0%',
      desc: 'Duyệt hồ sơ nhanh qua CCCD/Thẻ',
    },
  ];

  return (
    <Box sx={{ mb: 4 }}>
      <Container maxWidth="lg">
        <Paper
          elevation={1}
          sx={{
            p: 2.5,
            borderRadius: 3,
            border: '1px solid #E5E7EB',
            backgroundColor: '#FFFFFF',
          }}
        >
          <Grid container spacing={3}>
            {features.map((feat, idx) => (
              <Grid item xs={12} sm={6} md={3} key={idx}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.75 }}>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      backgroundColor: 'rgba(227, 0, 25, 0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {feat.icon}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                      {feat.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                      {feat.desc}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export const FlashSaleSection = ({ products = [], onNavigate }) => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (num) => String(num).padStart(2, '0');

  const saleProducts = products.filter(
    (p) => parseFloat(p.min_sale_price) < parseFloat(p.min_price)
  );
  const displayProducts = saleProducts.length > 0 ? saleProducts.slice(0, 4) : products.slice(0, 4);

  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Container maxWidth="lg">
        <Paper
          elevation={2}
          sx={{
            borderRadius: 3.5,
            border: '2px solid #FEE2E2',
            backgroundColor: '#FFF5F5',
            p: 3,
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 2,
              mb: 3,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocalFireDepartmentIcon sx={{ color: '#EF4444', fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#991B1B', textTransform: 'uppercase' }}>
                GIÁ SỐC HÔM NAY
              </Typography>
              <Chip
                label="GIỚI HẠN SỐ LƯỢNG"
                size="small"
                sx={{
                  backgroundColor: '#FEE2E2',
                  color: 'primary.main',
                  fontWeight: 900,
                  fontSize: '0.6875rem',
                  border: '1px solid #FECACA',
                }}
              />
            </Box>

            {/* Countdown timer */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#7F1D1D' }}>
                KẾT THÚC TRONG:
              </Typography>
              {[timeLeft.hours, timeLeft.minutes, timeLeft.seconds].map((unit, idx) => (
                <React.Fragment key={idx}>
                  <Box
                    sx={{
                      backgroundColor: '#111827',
                      color: '#FFFFFF',
                      fontWeight: 900,
                      fontSize: '0.875rem',
                      px: 1,
                      py: 0.5,
                      borderRadius: 1.5,
                      minWidth: 28,
                      textAlign: 'center',
                    }}
                  >
                    {formatDigits(unit)}
                  </Box>
                  {idx < 2 && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 900, color: '#991B1B' }}>
                      :
                    </Typography>
                  )}
                </React.Fragment>
              ))}
            </Box>
          </Box>

          {/* Flash Sale Product Grid (CSS Grid: 4 columns on desktop, 2 on tablet, 1 on mobile) */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {displayProducts.map((prod) => (
              <ProductCard key={prod.product_id} product={prod} onNavigate={onNavigate} />
            ))}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};
