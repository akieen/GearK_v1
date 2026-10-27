import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';

import FilterListIcon from '@mui/icons-material/FilterList';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { AppButton } from '../ui/AppButton';

const PRICE_PRESETS = [
  { label: '< 3 triệu', min: '0', max: '3000000' },
  { label: '3 - 5 triệu', min: '3000000', max: '5000000' },
  { label: '5 - 15 triệu', min: '5000000', max: '15000000' },
  { label: '> 15 triệu', min: '15000000', max: '' },
];

export const ProductFilterSidebar = ({
  categories = [],
  categorySlug = '',
  onSelectCategory,
  brands = [],
  brandSlug = '',
  onSelectBrand,
  minPrice = '',
  maxPrice = '',
  onChangeMinPrice,
  onChangeMaxPrice,
  onApplyPrice,
  onPricePreset,
  onResetFilters,
  hasActiveFilters = false,
}) => {
  return (
    <Box
      component="aside"
      sx={{
        width: { xs: '100%', md: 250 },
        flexShrink: 0,
        position: { md: 'sticky' },
        top: { md: 168 },
        alignSelf: 'flex-start',
        zIndex: 10,
      }}
    >
      <Paper
        elevation={1}
        sx={{
          p: 2,
          borderRadius: 2.5,
          border: '1px solid #E5E7EB',
          backgroundColor: '#FFFFFF',
          maxHeight: { md: 'calc(100vh - 185px)' },
          overflowY: { md: 'auto' },
          '&::-webkit-scrollbar': { width: 4 },
          '&::-webkit-scrollbar-thumb': { backgroundColor: '#E2E8F0', borderRadius: 2 },
        }}
      >
        {/* Filter Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
            <FilterListIcon sx={{ color: 'primary.main', fontSize: 18 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.8125rem', letterSpacing: '0.02em' }}>
              BỘ LỌC TÌM KIẾM
            </Typography>
          </Box>
          {hasActiveFilters && (
            <Button
              size="small"
              onClick={onResetFilters}
              startIcon={<RestartAltIcon sx={{ fontSize: '0.875rem !important' }} />}
              sx={{
                color: 'error.main',
                fontSize: '0.72rem',
                p: 0.25,
                minWidth: 'auto',
                textTransform: 'none',
                fontWeight: 700,
              }}
            >
              Đặt lại
            </Button>
          )}
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Categories Section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              mb: 1,
              display: 'block',
              fontSize: '0.7rem',
            }}
          >
            Danh mục sản phẩm
          </Typography>
          <Box
            sx={{
              maxHeight: 180,
              overflowY: 'auto',
              pr: 0.5,
              display: 'flex',
              flexDirection: 'column',
              gap: 0.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#E2E8F0', borderRadius: 2 },
            }}
          >
            <Box
              onClick={() => onSelectCategory('')}
              sx={{
                py: 0.6,
                px: 1.25,
                borderRadius: 1.5,
                cursor: 'pointer',
                fontSize: '0.8125rem',
                fontWeight: !categorySlug ? 800 : 500,
                backgroundColor: !categorySlug ? '#FEE2E2' : 'transparent',
                color: !categorySlug ? 'primary.main' : 'text.primary',
                transition: 'all 0.15s ease',
                '&:hover': { backgroundColor: '#FEE2E2', color: 'primary.main' },
              }}
            >
              Tất cả danh mục
            </Box>
            {categories.map((c) => {
              const isSelected = categorySlug === c.slug;
              return (
                <Box
                  key={c.category_id}
                  onClick={() => onSelectCategory(c.slug)}
                  sx={{
                    py: 0.6,
                    px: 1.25,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    fontSize: '0.8125rem',
                    fontWeight: isSelected ? 800 : 500,
                    backgroundColor: isSelected ? '#FEE2E2' : 'transparent',
                    color: isSelected ? 'primary.main' : 'text.primary',
                    transition: 'all 0.15s ease',
                    '&:hover': { backgroundColor: '#FEE2E2', color: 'primary.main' },
                  }}
                >
                  {c.category_name}
                </Box>
              );
            })}
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Brands Section */}
        <Box sx={{ mb: 2 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              mb: 1,
              display: 'block',
              fontSize: '0.7rem',
            }}
          >
            Thương hiệu
          </Typography>
          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 0.75,
              maxHeight: 120,
              overflowY: 'auto',
              pr: 0.5,
              '&::-webkit-scrollbar': { width: 4 },
              '&::-webkit-scrollbar-thumb': { backgroundColor: '#E2E8F0', borderRadius: 2 },
            }}
          >
            <Chip
              label="Tất cả"
              size="small"
              onClick={() => onSelectBrand('')}
              sx={{
                height: 26,
                fontSize: '0.72rem',
                fontWeight: 700,
                backgroundColor: !brandSlug ? 'primary.main' : '#F1F5F9',
                color: !brandSlug ? '#FFFFFF' : 'text.primary',
                cursor: 'pointer',
              }}
            />
            {brands.map((b) => {
              const isSelected = brandSlug === b.slug;
              return (
                <Chip
                  key={b.brand_id}
                  label={b.brand_name}
                  size="small"
                  onClick={() => onSelectBrand(b.slug)}
                  sx={{
                    height: 26,
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    backgroundColor: isSelected ? 'primary.main' : '#F1F5F9',
                    color: isSelected ? '#FFFFFF' : 'text.primary',
                    cursor: 'pointer',
                  }}
                />
              );
            })}
          </Box>
        </Box>

        <Divider sx={{ mb: 1.5 }} />

        {/* Price Presets & Inputs */}
        <Box>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              mb: 1,
              display: 'block',
              fontSize: '0.7rem',
            }}
          >
            Khoảng giá (VNĐ)
          </Typography>

          {/* 2-column compact grid presets */}
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0.75, mb: 1.5 }}>
            {PRICE_PRESETS.map((range, idx) => {
              const isSelected = minPrice === range.min && maxPrice === range.max;
              return (
                <Box
                  key={idx}
                  onClick={() => onPricePreset(range.min, range.max)}
                  sx={{
                    py: 0.6,
                    px: 0.75,
                    borderRadius: 1.5,
                    cursor: 'pointer',
                    fontSize: '0.72rem',
                    fontWeight: isSelected ? 800 : 600,
                    textAlign: 'center',
                    backgroundColor: isSelected ? '#FEE2E2' : '#F8FAFC',
                    color: isSelected ? 'primary.main' : 'text.primary',
                    border: '1px solid',
                    borderColor: isSelected ? 'primary.main' : '#E5E7EB',
                    transition: 'all 0.15s ease',
                    '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                  }}
                >
                  {range.label}
                </Box>
              );
            })}
          </Box>

          {/* Custom price inputs */}
          <Box sx={{ display: 'flex', gap: 0.75, alignItems: 'center', mb: 1.25 }}>
            <TextField
              size="small"
              placeholder="Từ (₫)"
              type="number"
              value={minPrice}
              onChange={(e) => onChangeMinPrice(e.target.value)}
              inputProps={{ style: { padding: '6px 8px', fontSize: '0.75rem' } }}
              sx={{ width: '50%' }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
              -
            </Typography>
            <TextField
              size="small"
              placeholder="Đến (₫)"
              type="number"
              value={maxPrice}
              onChange={(e) => onChangeMaxPrice(e.target.value)}
              inputProps={{ style: { padding: '6px 8px', fontSize: '0.75rem' } }}
              sx={{ width: '50%' }}
            />
          </Box>

          <AppButton
            variant="primary"
            fullWidth
            size="small"
            onClick={onApplyPrice}
            sx={{ py: 0.6, fontSize: '0.75rem' }}
          >
            Áp dụng giá
          </AppButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ProductFilterSidebar;
