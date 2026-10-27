import React from 'react';
import Chip from '@mui/material/Chip';

export const AppBadge = ({
  label,
  variant = 'default', // 'primary' | 'success' | 'warning' | 'error' | 'info' | 'default' | 'dark'
  size = 'small',
  sx = {},
  ...props
}) => {
  const stylesMap = {
    primary: {
      backgroundColor: '#FEE2E2',
      color: '#E30019',
      border: '1px solid #FECACA',
    },
    success: {
      backgroundColor: '#D1FAE5',
      color: '#065F46',
      border: '1px solid #A7F3D0',
    },
    warning: {
      backgroundColor: '#FEF3C7',
      color: '#92400E',
      border: '1px solid #FDE68A',
    },
    error: {
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
      border: '1px solid #FECACA',
    },
    info: {
      backgroundColor: '#DBEAFE',
      color: '#1E40AF',
      border: '1px solid #BFDBFE',
    },
    dark: {
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      border: '1px solid #1E293B',
    },
    default: {
      backgroundColor: '#F1F5F9',
      color: '#475569',
      border: '1px solid #E2E8F0',
    },
  };

  const styleConfig = stylesMap[variant] || stylesMap.default;

  return (
    <Chip
      label={label}
      size={size}
      sx={{
        fontWeight: 700,
        fontSize: size === 'small' ? '0.75rem' : '0.84375rem',
        height: size === 'small' ? 24 : 30,
        borderRadius: '6px',
        ...styleConfig,
        ...sx,
      }}
      {...props}
    />
  );
};

export const StatusBadge = ({ status, ...props }) => {
  const normalized = (status || '').toLowerCase();

  let variant = 'default';
  let label = status;

  if (normalized.includes('completed') || normalized.includes('giao thành công') || normalized.includes('đã giao')) {
    variant = 'success';
    label = 'Đã giao hàng';
  } else if (normalized.includes('shipping') || normalized.includes('đang giao')) {
    variant = 'info';
    label = 'Đang giao hàng';
  } else if (normalized.includes('processing') || normalized.includes('đang xử lý')) {
    variant = 'warning';
    label = 'Đang xử lý';
  } else if (normalized.includes('pending') || normalized.includes('chờ xác nhận')) {
    variant = 'warning';
    label = 'Chờ xác nhận';
  } else if (normalized.includes('cancelled') || normalized.includes('đã hủy')) {
    variant = 'error';
    label = 'Đã hủy';
  } else if (normalized.includes('paid') || normalized.includes('đã thanh toán')) {
    variant = 'success';
    label = 'Đã thanh toán';
  }

  return <AppBadge label={label} variant={variant} {...props} />;
};

export const DiscountBadge = ({ percent, sx = {}, ...props }) => {
  if (!percent || percent <= 0) return null;
  return (
    <Chip
      label={`-${percent}%`}
      size="small"
      sx={{
        backgroundColor: '#E30019',
        color: '#FFFFFF',
        fontWeight: 900,
        fontSize: '0.72rem',
        height: 22,
        borderRadius: '4px',
        letterSpacing: '0.02em',
        boxShadow: '0 2px 6px rgba(227, 0, 25, 0.3)',
        ...sx,
      }}
      {...props}
    />
  );
};

export default AppBadge;
