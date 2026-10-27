import React from 'react';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

export const LoadingSpinner = ({
  message = 'Đang tải dữ liệu...',
  minHeight = 240,
  size = 40,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight,
        gap: 2,
        width: '100%',
        ...sx,
      }}
    >
      <CircularProgress size={size} sx={{ color: 'primary.main' }} />
      {message && (
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {message}
        </Typography>
      )}
    </Box>
  );
};

export default LoadingSpinner;
