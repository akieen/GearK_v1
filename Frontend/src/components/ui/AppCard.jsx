import React from 'react';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';

export const AppCard = ({
  children,
  title,
  subtitle,
  action,
  headerIcon,
  hoverable = false,
  padding = 'normal', // 'none' | 'compact' | 'normal' | 'spacious'
  footer,
  sx = {},
  ...props
}) => {
  const paddingMap = {
    none: 0,
    compact: 1.5,
    normal: 2.5,
    spacious: 3.5,
  };

  const pVal = paddingMap[padding] ?? 2.5;

  return (
    <Paper
      elevation={1}
      sx={{
        borderRadius: 3,
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        ...(hoverable && {
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 10px 24px rgba(0, 0, 0, 0.08)',
            borderColor: '#D1D5DB',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {(title || subtitle || action) && (
        <>
          <Box
            sx={{
              p: 2,
              px: pVal,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
              {headerIcon && (
                <Box sx={{ display: 'flex', color: 'primary.main' }}>
                  {headerIcon}
                </Box>
              )}
              <Box>
                {title && (
                  <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {subtitle}
                  </Typography>
                )}
              </Box>
            </Box>
            {action && <Box>{action}</Box>}
          </Box>
          <Divider />
        </>
      )}

      <Box sx={{ p: pVal }}>{children}</Box>

      {footer && (
        <>
          <Divider />
          <Box sx={{ p: 1.5, px: pVal, backgroundColor: '#FAFAFA' }}>
            {footer}
          </Box>
        </>
      )}
    </Paper>
  );
};

export default AppCard;
