import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PhoneIcon from '@mui/icons-material/Phone';

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: '#0F1012',
        color: '#D1D5DB',
        pt: 6,
        pb: 4,
        mt: 'auto',
        borderTop: '1px solid #27272A',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          {/* Col 1: About & Showrooms */}
          <Grid item xs={12} md={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, mb: 2 }}>
              <Box
                sx={{
                  backgroundColor: 'primary.main',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.125rem',
                  px: 1.25,
                  py: 0.4,
                  borderRadius: 1.5,
                  letterSpacing: '0.04em',
                }}
              >
                GEARK
              </Box>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 900, fontSize: '1.125rem' }}>
                GAMING PRO STORE
              </Typography>
            </Box>

            <Typography variant="body2" sx={{ color: '#9CA3AF', lineHeight: 1.7, mb: 2.5 }}>
              Hệ thống bán lẻ thiết bị chơi game Hi-End, linh kiện PC và phụ kiện công nghệ hàng đầu Việt Nam. Đối tác chiến lược phân phối chính hãng của Razer, Logitech G, Corsair, Asus ROG, SteelSeries.
            </Typography>

            <Stack spacing={1.25}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, fontSize: '0.84375rem' }}>
                <LocationOnIcon sx={{ color: 'primary.main', fontSize: 18, mt: 0.2 }} />
                <span>Showroom HCM: 78-80 Hoàng Hoa Thám, P.12, Q. Tân Bình, TP.HCM</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25, fontSize: '0.84375rem' }}>
                <LocationOnIcon sx={{ color: 'primary.main', fontSize: 18, mt: 0.2 }} />
                <span>Showroom HN: 162 Thái Hà, P. Trung Liệt, Q. Đống Đa, Hà Nội</span>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, fontSize: '0.84375rem' }}>
                <PhoneIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <span>Tổng đài miễn phí: <strong style={{ color: '#FFFFFF' }}>1800 6975</strong> (8:00 - 21:00)</span>
              </Box>
            </Stack>
          </Grid>

          {/* Col 2: Policies */}
          <Grid item xs={6} md={2.5}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
              Chính sách & Hỗ trợ
            </Typography>
            <Stack spacing={1.25}>
              {[
                'Chính sách bảo hành 1 đổi 1',
                'Giao hàng siêu tốc 2h',
                'Đổi trả trong 30 ngày',
                'Mua hàng trả góp 0%',
                'Câu hỏi thường gặp (FAQ)',
              ].map((text, idx) => (
                <Link
                  key={idx}
                  href="#"
                  underline="hover"
                  sx={{ color: '#9CA3AF', fontSize: '0.84375rem', '&:hover': { color: '#FFFFFF' } }}
                >
                  {text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Col 3: About GearK */}
          <Grid item xs={6} md={2.5}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
              Về GearK
            </Typography>
            <Stack spacing={1.25}>
              {[
                'Giới thiệu công ty',
                'Tuyển dụng nhân tài',
                'Hợp tác kinh doanh (B2B)',
                'Tin tức công nghệ & eSports',
                'Chính sách bảo mật',
              ].map((text, idx) => (
                <Link
                  key={idx}
                  href="#"
                  underline="hover"
                  sx={{ color: '#9CA3AF', fontSize: '0.84375rem', '&:hover': { color: '#FFFFFF' } }}
                >
                  {text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* Col 4: Payment & Connect */}
          <Grid item xs={12} md={3}>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 800, textTransform: 'uppercase', mb: 2, letterSpacing: '0.05em' }}>
              Thanh toán & Chứng nhận
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {['COD Tiền mặt', 'VietQR', 'VNPay', 'Visa/Master', 'Trả góp 0%'].map((method, idx) => (
                <Chip
                  key={idx}
                  label={method}
                  size="small"
                  sx={{
                    backgroundColor: '#1E293B',
                    color: '#E2E8F0',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    border: '1px solid #334155',
                  }}
                />
              ))}
            </Box>

            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 800, textTransform: 'uppercase', mb: 1.5, letterSpacing: '0.05em' }}>
              Kết nối cộng đồng
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {['Facebook', 'YouTube', 'TikTok', 'Discord'].map((social, idx) => (
                <Chip
                  key={idx}
                  label={social}
                  size="small"
                  clickable
                  sx={{
                    backgroundColor: '#27272A',
                    color: '#D1D5DB',
                    fontWeight: 700,
                    borderRadius: 1.5,
                    '&:hover': { backgroundColor: '#3F3F46', color: '#FFFFFF' },
                  }}
                />
              ))}
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4, borderColor: '#27272A' }} />

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            © 2026 GearK Gaming E-Commerce. Bản quyền thuộc về GearK Store.
          </Typography>
          <Typography variant="caption" sx={{ color: '#6B7280' }}>
            Designed with Material UI & High Performance
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
