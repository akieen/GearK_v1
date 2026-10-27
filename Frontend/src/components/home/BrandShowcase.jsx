import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { SectionTitle } from '../ui/SectionTitle';

export const BrandShowcase = ({ brands = [], onNavigate }) => {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Container maxWidth="lg">
        <SectionTitle
          title="THƯƠNG HIỆU GAMING NỔI TIẾNG"
          subtitle="Đối tác phân phối chiến lược chính hãng 100%"
        />

        <Grid container spacing={2}>
          {brands.map((brand) => (
            <Grid item xs={6} sm={4} md={2} key={brand.brand_id}>
              <Paper
                elevation={1}
                onClick={() => onNavigate(`products?brand=${brand.slug}`)}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 1.25,
                  cursor: 'pointer',
                  borderRadius: 2.5,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)',
                    borderColor: 'primary.main',
                  },
                }}
              >
                <Box
                  component="img"
                  src={
                    brand.logo_url ||
                    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80'
                  }
                  alt={brand.brand_name}
                  sx={{
                    width: '100%',
                    height: 48,
                    objectFit: 'contain',
                  }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 800,
                    color: 'text.primary',
                    textAlign: 'center',
                  }}
                >
                  {brand.brand_name}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default BrandShowcase;
