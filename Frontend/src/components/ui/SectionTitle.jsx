import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const SectionTitle = ({
  title,
  subtitle,
  icon,
  badge,
  actionText = 'Xem tất cả',
  onAction,
  sx = {},
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 1.5,
        mb: 2.5,
        pb: 1.5,
        borderBottom: '2px solid #E5E7EB',
        ...sx,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
        {icon && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'primary.main',
            }}
          >
            {icon}
          </Box>
        )}
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography
              variant="h5"
              component="h2"
              sx={{
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.02em',
                color: 'text.primary',
              }}
            >
              {title}
            </Typography>
            {badge && <Box>{badge}</Box>}
          </Box>
          {subtitle && (
            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.25 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>

      {onAction && (
        <Button
          size="small"
          onClick={onAction}
          endIcon={<ChevronRightIcon fontSize="small" />}
          sx={{
            fontWeight: 700,
            color: 'primary.main',
            p: '4px 8px',
            '&:hover': {
              backgroundColor: 'rgba(227, 0, 25, 0.06)',
            },
          }}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );
};

export default SectionTitle;
