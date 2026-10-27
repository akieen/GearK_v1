import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import KeyboardIcon from '@mui/icons-material/Keyboard';
import MouseIcon from '@mui/icons-material/Mouse';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import MonitorIcon from '@mui/icons-material/Tv';

import { AppButton } from '../ui/AppButton';

const slides = [
  {
    id: 1,
    tag: 'SIÊU PHẨM ESPORTS 2026',
    title: 'Chuột Siêu Nhẹ Razer Viper V3 Pro',
    desc: 'Trọng lượng chỉ 54g, cảm biến Focus Pro 35K Gen-2 & tần số gửi tín hiệu 8000Hz không dây siêu tốc.',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80',
    link: 'product/razer-viper-v3-pro',
    btnText: 'Xem chi tiết ngay',
  },
  {
    id: 2,
    tag: 'ĐỈNH CAO HI-END DISPLAY',
    title: 'Màn Hình Asus ROG Swift OLED PG27AQDM',
    desc: 'Tấm nền OLED 2K 240Hz, phản hồi 0.03ms GTG, tản nhiệt buồng hơi tùy chỉnh chống burn-in độc quyền.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    link: 'product/asus-rog-swift-oled-pg27aqdm',
    btnText: 'Khám phá ngay',
  },
  {
    id: 3,
    tag: 'BÀN PHÍM CƠ TỪ TÍNH RAPID TRIGGER',
    title: 'Corsair K70 MAX RGB Magnetic-Mechanical',
    desc: 'Switch CORSAIR MGX từ tính tùy biến điểm nhận phím từ 0.4mm đến 3.6mm, tần số đáp ứng 8000Hz.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    link: 'product/corsair-k70-max-rgb',
    btnText: 'Mua với giá ưu đãi',
  },
];

export const HeroBanner = ({ onNavigate, categories = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  const getCategoryIcon = (slug) => {
    if (slug.includes('chuot')) return <MouseIcon fontSize="small" sx={{ color: 'primary.main' }} />;
    if (slug.includes('phim')) return <KeyboardIcon fontSize="small" sx={{ color: 'primary.main' }} />;
    if (slug.includes('tai-nghe')) return <HeadphonesIcon fontSize="small" sx={{ color: 'primary.main' }} />;
    return <MonitorIcon fontSize="small" sx={{ color: 'primary.main' }} />;
  };

  return (
    <Box component="section" sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Grid container spacing={3}>
          {/* Left Category Sidebar */}
          <Grid item xs={12} md={3.2} sx={{ display: { xs: 'none', md: 'block' } }}>
            <Paper
              elevation={1}
              sx={{
                borderRadius: 3,
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Box
                sx={{
                  p: 1.75,
                  px: 2,
                  backgroundColor: 'primary.main',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1.25,
                  letterSpacing: '0.03em',
                }}
              >
                <MenuIcon fontSize="small" />
                DANH MỤC SẢN PHẨM
              </Box>

              <Box sx={{ flex: 1, py: 0.5 }}>
                {categories.slice(0, 7).map((cat) => (
                  <Box
                    key={cat.category_id}
                    onClick={() => onNavigate(`products?category=${cat.slug}`)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      px: 2,
                      py: 1.25,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      '&:hover': {
                        backgroundColor: '#FEF2F2',
                        color: 'primary.main',
                        '& .cat-arrow': { transform: 'translateX(3px)' },
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      {getCategoryIcon(cat.slug)}
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {cat.category_name}
                      </Typography>
                    </Box>
                    <ChevronRightIcon
                      className="cat-arrow"
                      sx={{ fontSize: 16, color: 'text.disabled', transition: 'transform 0.2s' }}
                    />
                  </Box>
                ))}

                <Box
                  onClick={() => onNavigate('products')}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.25,
                    cursor: 'pointer',
                    color: 'primary.main',
                    fontWeight: 800,
                    borderTop: '1px solid #F1F5F9',
                    '&:hover': { backgroundColor: '#FEF2F2' },
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                    <SparklesIcon fontSize="small" />
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      Xem tất cả Gaming Gear
                    </Typography>
                  </Box>
                  <ChevronRightIcon sx={{ fontSize: 16 }} />
                </Box>
              </Box>
            </Paper>
          </Grid>

          {/* Right Slide Banner */}
          <Grid item xs={12} md={8.8}>
            <Paper
              elevation={2}
              sx={{
                position: 'relative',
                borderRadius: 3.5,
                overflow: 'hidden',
                height: { xs: 360, sm: 420 },
                border: '1px solid #E5E7EB',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: { xs: 3, sm: 4.5 },
                backgroundImage: `linear-gradient(180deg, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.88) 100%), url(${slide.image})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                transition: 'background-image 0.5s ease-in-out',
              }}
            >
              <Box sx={{ maxWidth: 580, position: 'relative', zIndex: 2 }}>
                <Chip
                  label={slide.tag}
                  size="small"
                  sx={{
                    backgroundColor: 'primary.main',
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: '0.75rem',
                    letterSpacing: '0.04em',
                    mb: 1.5,
                  }}
                />

                <Typography
                  variant="h3"
                  sx={{
                    color: '#FFFFFF',
                    fontWeight: 900,
                    fontSize: { xs: '1.5rem', sm: '2rem' },
                    lineHeight: 1.2,
                    mb: 1.25,
                    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
                  }}
                >
                  {slide.title}
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: '#E2E8F0',
                    lineHeight: 1.6,
                    mb: 2.5,
                    display: { xs: 'none', sm: 'block' },
                    textShadow: '0 1px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {slide.desc}
                </Typography>

                <AppButton
                  variant="primary"
                  size="large"
                  glow
                  onClick={() => onNavigate(slide.link)}
                >
                  {slide.btnText}
                </AppButton>
              </Box>

              {/* Slider Dots */}
              <Stack
                direction="row"
                spacing={1}
                sx={{
                  position: 'absolute',
                  bottom: 18,
                  right: 24,
                  zIndex: 2,
                }}
              >
                {slides.map((s, idx) => (
                  <Box
                    key={s.id}
                    onClick={() => setCurrentSlide(idx)}
                    sx={{
                      width: currentSlide === idx ? 28 : 8,
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: currentSlide === idx ? 'primary.main' : 'rgba(255, 255, 255, 0.4)',
                      cursor: 'pointer',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    }}
                  />
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default HeroBanner;
