import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';

import { HeroBanner } from '../components/home/HeroBanner';
import { TrustFeatures, FlashSaleSection } from '../components/home/HomeSections';
import { BrandShowcase } from '../components/home/BrandShowcase';
import ProductCard from '../components/common/ProductCard';
import { SectionTitle } from '../components/ui/SectionTitle';
import { AppButton } from '../components/ui/AppButton';

export const HomePage = ({
  products = [],
  categories = [],
  brands = [],
  onNavigate,
}) => {
  const [selectedCatTab, setSelectedCatTab] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts =
    selectedCatTab === 'all'
      ? products
      : products.filter((p) => p.category_slug === selectedCatTab);

  return (
    <Box sx={{ pb: 6 }}>
      {/* Hero Section */}
      <HeroBanner onNavigate={onNavigate} categories={categories} />

      {/* Trust & Guarantee Bar */}
      <TrustFeatures />

      {/* Flash Sale Deal Sốc */}
      <FlashSaleSection products={products} onNavigate={onNavigate} />

      {/* Gaming Gear by Category Showcase */}
      <Box component="section" sx={{ mb: 6 }}>
        <Container maxWidth="lg">
          <SectionTitle
            title="GAMING GEAR NỔI BẬT"
            subtitle="Trang thiết bị tuyển chọn từ các giải đấu eSports hàng đầu"
            actionText="Xem tất cả"
            onAction={() => onNavigate('products')}
          />

          {/* Category Filter Tabs */}
          <Box sx={{ mb: 3, borderBottom: '1px solid #E5E7EB' }}>
            <Tabs
              value={selectedCatTab}
              onChange={(e, val) => setSelectedCatTab(val)}
              variant="scrollable"
              scrollButtons="auto"
              textColor="primary"
              indicatorColor="primary"
              sx={{
                '& .MuiTab-root': {
                  fontWeight: 700,
                  fontSize: '0.875rem',
                  textTransform: 'none',
                  minHeight: 44,
                  px: 2,
                },
              }}
            >
              <Tab value="all" label="Tất cả sản phẩm" />
              {categories.map((cat) => (
                <Tab key={cat.category_id} value={cat.slug} label={cat.category_name} />
              ))}
            </Tabs>
          </Box>

          {/* Products Grid (CSS Grid: 4 columns on desktop, 2 on tablet, 1 on mobile) */}
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
            {filteredProducts.map((prod) => (
              <ProductCard key={prod.product_id} product={prod} onNavigate={onNavigate} />
            ))}
          </Box>
        </Container>
      </Box>

      {/* Mid Promotional Graphic Banner (Lube switch & Workshop) */}
      <Container maxWidth="lg" sx={{ mb: 6 }}>
        <Box
          sx={{
            background: 'linear-gradient(135deg, #7F1D1D 0%, #18181B 100%)',
            borderRadius: 4,
            p: { xs: 3, sm: 5 },
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 3,
            border: '1px solid #991B1B',
            boxShadow: '0 12px 32px rgba(127, 29, 29, 0.25)',
          }}
        >
          <Box sx={{ maxWidth: 640 }}>
            <Chip
              label="GEARK WORKSHOP & MODDING"
              size="small"
              sx={{
                backgroundColor: 'primary.main',
                color: '#FFF',
                fontWeight: 900,
                fontSize: '0.6875rem',
                letterSpacing: '0.04em',
                mb: 1.5,
              }}
            />
            <Typography variant="h4" sx={{ fontWeight: 900, mb: 1, lineHeight: 1.25 }}>
              Dịch Vụ Lube Switch, Cân Wire & Mod Phím Cơ Chuyên Nghiệp
            </Typography>
            <Typography variant="body2" sx={{ color: '#E5E7EB', lineHeight: 1.6 }}>
              Nâng tầm trải nghiệm gõ phím với dàn kỹ thuật viên nhiều năm kinh nghiệm tại các showroom GearK. Lấy ngay trong ngày.
            </Typography>
          </Box>

          <AppButton
            variant="ghost"
            size="large"
            onClick={() => onNavigate('products?category=ban-phim-co')}
            sx={{
              backgroundColor: '#FFFFFF',
              color: 'primary.main',
              fontWeight: 800,
              px: 3.5,
              py: 1.5,
              '&:hover': {
                backgroundColor: '#F8FAFC',
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              },
            }}
          >
            Khám phá dịch vụ & Gear
          </AppButton>
        </Box>
      </Container>

      {/* Brand Partners Showcase */}
      <BrandShowcase brands={brands} onNavigate={onNavigate} />
    </Box>
  );
};

export default HomePage;
