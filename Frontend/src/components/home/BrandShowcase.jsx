import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import VerifiedIcon from '@mui/icons-material/Verified';
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
                  p: 2.25,
                  minHeight: 80,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 0.75,
                  cursor: 'pointer',
                  borderRadius: 2.5,
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#FFFFFF',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: '0 8px 20px rgba(227, 0, 25, 0.12)',
                    borderColor: 'primary.main',
                    bgcolor: '#FEF2F2',
                  },
                }}
              >
                <VerifiedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontWeight: 900,
                    fontSize: 13.5,
                    color: 'text.primary',
                    textAlign: 'center',
                    letterSpacing: 0.2,
                  }}
                >
                  {brand.brand_name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: 10.5,
                    fontWeight: 700,
                    color: 'text.secondary',
                    bgcolor: '#F1F5F9',
                    px: 1,
                    py: 0.2,
                    borderRadius: 1,
                  }}
                >
                  Chính hãng
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
