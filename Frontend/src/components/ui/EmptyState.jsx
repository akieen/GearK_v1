import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppButton from './AppButton';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';

export const EmptyState = ({
  icon,
  title = 'Chưa có dữ liệu',
  description = 'Hiện tại không tìm thấy thông tin nào phù hợp.',
  actionText,
  onAction,
  actionButton,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        textAlign: 'center',
        py: { xs: 5, md: 8 },
        px: 3,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 3,
        border: '1px dashed #D1D5DB',
        ...sx,
      }}
    >
      <Box
        sx={{
          color: 'text.disabled',
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
          borderRadius: '50%',
          backgroundColor: '#F8FAFC',
          '& svg': {
            fontSize: 54,
            opacity: 0.6,
          },
        }}
      >
        {icon || <SentimentDissatisfiedIcon />}
      </Box>

      <Typography
        variant="h6"
        sx={{
          fontWeight: 800,
          color: 'text.primary',
          mb: 0.75,
        }}
      >
        {title}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            maxWidth: 440,
            mb: actionText || actionButton ? 3 : 0,
            lineHeight: 1.6,
          }}
        >
          {description}
        </Typography>
      )}

      {actionButton ? (
        actionButton
      ) : actionText && onAction ? (
        <AppButton variant="primary" onClick={onAction}>
          {actionText}
        </AppButton>
      ) : null}
    </Box>
  );
};

export default EmptyState;
