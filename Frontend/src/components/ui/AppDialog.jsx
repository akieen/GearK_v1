import React from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

export const AppDialog = ({
  open,
  isOpen, // for backwards compatibility
  onClose,
  title,
  headerIcon,
  children,
  actions,
  maxWidth = 'sm', // 'xs' | 'sm' | 'md' | 'lg' | 'xl' or number
  fullWidth = true,
  sx = {},
  ...props
}) => {
  const isModalOpen = open !== undefined ? open : Boolean(isOpen);
  const isCustomWidth = typeof maxWidth === 'number';

  return (
    <Dialog
      open={isModalOpen}
      onClose={onClose}
      fullWidth={fullWidth}
      maxWidth={!isCustomWidth ? maxWidth : false}
      PaperProps={{
        sx: {
          borderRadius: 3.5,
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.16)',
          overflow: 'hidden',
          ...(isCustomWidth && { maxWidth: `${maxWidth}px`, width: '100%' }),
          ...sx,
        },
      }}
      {...props}
    >
      {title && (
        <DialogTitle
          sx={{
            m: 0,
            p: 2.5,
            pb: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #F1F5F9',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            {headerIcon && (
              <Box sx={{ display: 'flex', color: 'primary.main' }}>
                {headerIcon}
              </Box>
            )}
            <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
              {title}
            </Typography>
          </Box>
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              color: 'text.secondary',
              p: 0.75,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                color: 'text.primary',
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
      )}

      <DialogContent sx={{ p: 3 }}>
        {children}
      </DialogContent>

      {actions && (
        <DialogActions
          sx={{
            p: 2.5,
            pt: 1.5,
            borderTop: '1px solid #F1F5F9',
            backgroundColor: '#FAFAFA',
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AppDialog;
