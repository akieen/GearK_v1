import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import { SectionTitle } from '../ui/SectionTitle';

export const BrandShowcase = ({ brands = [], onNavigate }) => {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Container maxWidth="lg">
        <SectionTitle
          title="THƯƠNG HIỆU GAMING NỔI TIẾNG"
          subtitle="Đối tác phân phối chiến lược chính hãng 100%"
        />

        <Box sx={{ borderBottom: '1px solid #E5E7EB' }}>
          <Tabs
            value={false}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                fontSize: '0.875rem',
                textTransform: 'none',
                minHeight: 44,
                px: 2.5,
                color: 'text.secondary',
                '&:hover': { color: 'primary.main' },
              },
            }}
          >
            {brands.map((brand) => (
              <Tab
                key={brand.brand_id}
                label={brand.brand_name}
                onClick={() => onNavigate(`products?brand=${brand.slug}`)}
              />
            ))}
          </Tabs>
        </Box>
      </Container>
    </Box>
  );
};

export default BrandShowcase;
