import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { useToastState } from '../../context/ToastContext';
import { AppDialog } from '../ui/AppDialog';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToastState();

  if (!toasts.length) return null;

  return (
    <Stack
      spacing={1}
      sx={{
        position: 'fixed',
        top: 24,
        right: 24,
        zIndex: 2000,
        maxWidth: 380,
        width: '100%',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const severity = ['success', 'info', 'warning', 'error'].includes(toast.type)
          ? toast.type
          : 'info';

        return (
          <Alert
            key={toast.id}
            severity={severity}
            onClose={() => removeToast(toast.id)}
            sx={{
              pointerEvents: 'auto',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
              borderRadius: 2,
              fontWeight: 600,
              fontSize: '0.875rem',
              alignItems: 'center',
            }}
          >
            {toast.message}
          </Alert>
        );
      })}
    </Stack>
  );
};

// Backwards-compatible Modal export delegating to AppDialog
export const Modal = ({ isOpen, onClose, title, children, maxWidth = 480 }) => {
  return (
    <AppDialog
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      maxWidth={maxWidth}
    >
      {children}
    </AppDialog>
  );
};

export default ToastContainer;
