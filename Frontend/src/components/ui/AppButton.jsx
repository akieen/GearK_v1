import React from 'react';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import { styled } from '@mui/material/styles';

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => !['customVariant', 'glow'].includes(prop),
})(({ theme, customVariant, glow }) => {
  let styles = {
    position: 'relative',
    fontWeight: 700,
    textTransform: 'none',
    borderRadius: 8,
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  if (customVariant === 'primary') {
    styles = {
      ...styles,
      backgroundColor: theme.palette.primary.main,
      color: '#FFFFFF',
      boxShadow: glow ? '0 4px 14px rgba(227, 0, 25, 0.35)' : 'none',
      '&:hover': {
        backgroundColor: theme.palette.primary.hover || '#C40015',
        boxShadow: '0 6px 20px rgba(227, 0, 25, 0.45)',
        transform: 'translateY(-1px)',
      },
      '&:active': {
        transform: 'translateY(0)',
      },
    };
  } else if (customVariant === 'secondary') {
    styles = {
      ...styles,
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      '&:hover': {
        backgroundColor: '#1E293B',
        boxShadow: '0 4px 14px rgba(15, 23, 42, 0.25)',
        transform: 'translateY(-1px)',
      },
    };
  } else if (customVariant === 'soft') {
    styles = {
      ...styles,
      backgroundColor: '#FEE2E2',
      color: theme.palette.primary.main,
      '&:hover': {
        backgroundColor: '#FECACA',
      },
    };
  } else if (customVariant === 'outline') {
    styles = {
      ...styles,
      border: `1.5px solid ${theme.palette.primary.main}`,
      color: theme.palette.primary.main,
      backgroundColor: 'transparent',
      '&:hover': {
        backgroundColor: 'rgba(227, 0, 25, 0.06)',
        borderColor: theme.palette.primary.hover || '#C40015',
      },
    };
  } else if (customVariant === 'ghost') {
    styles = {
      ...styles,
      backgroundColor: 'transparent',
      color: theme.palette.text.primary,
      '&:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.05)',
      },
    };
  } else if (customVariant === 'danger') {
    styles = {
      ...styles,
      backgroundColor: theme.palette.error.main,
      color: '#FFFFFF',
      '&:hover': {
        backgroundColor: theme.palette.error.dark,
        boxShadow: '0 4px 14px rgba(239, 68, 68, 0.35)',
      },
    };
  }

  return styles;
});

export const AppButton = React.forwardRef(function AppButton(
  {
    children,
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'soft' | 'ghost' | 'danger'
    loading = false,
    disabled = false,
    glow = false,
    startIcon,
    endIcon,
    size = 'medium',
    sx = {},
    ...props
  },
  ref
) {
  return (
    <StyledButton
      ref={ref}
      customVariant={variant}
      glow={glow}
      disabled={disabled || loading}
      size={size}
      startIcon={!loading ? startIcon : null}
      endIcon={!loading ? endIcon : null}
      sx={sx}
      {...props}
    >
      {loading ? (
        <>
          <CircularProgress size={18} color="inherit" sx={{ mr: 1 }} />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </StyledButton>
  );
});

export default AppButton;
