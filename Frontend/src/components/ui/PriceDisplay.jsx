import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { formatPrice, calculateDiscount } from '../../utils/formatters';
import { DiscountBadge } from './AppBadge';

export const PriceDisplay = ({
  price,
  salePrice,
  size = 'medium', // 'small' | 'medium' | 'large'
  showBadge = true,
  direction = 'row', // 'row' | 'column'
  sx = {},
}) => {
  const original = parseFloat(price || 0);
  const current = parseFloat(salePrice ?? original);
  const hasDiscount = original > current && current > 0;
  const discountPercent = hasDiscount ? calculateDiscount(original, current) : 0;

  const fontSizes = {
    small: {
      current: '0.9375rem',
      original: '0.75rem',
    },
    medium: {
      current: '1.125rem',
      original: '0.8125rem',
    },
    large: {
      current: '1.625rem',
      original: '0.9375rem',
    },
  };

  const currentSize = fontSizes[size]?.current || fontSizes.medium.current;
  const originalSize = fontSizes[size]?.original || fontSizes.medium.original;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: direction,
        alignItems: direction === 'row' ? 'baseline' : 'flex-start',
        flexWrap: 'wrap',
        gap: direction === 'row' ? 1 : 0.25,
        ...sx,
      }}
    >
      <Typography
        component="span"
        sx={{
          fontWeight: 900,
          color: 'primary.main',
          fontSize: currentSize,
          lineHeight: 1.2,
          letterSpacing: '-0.01em',
        }}
      >
        {formatPrice(current)}
      </Typography>

      {hasDiscount && (
        <Typography
          component="span"
          sx={{
            fontWeight: 500,
            color: 'text.disabled',
            fontSize: originalSize,
            textDecoration: 'line-through',
          }}
        >
          {formatPrice(original)}
        </Typography>
      )}

      {hasDiscount && showBadge && (
        <DiscountBadge percent={discountPercent} />
      )}
    </Box>
  );
};

export default PriceDisplay;
