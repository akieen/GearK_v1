import React, { useState } from 'react';
import Typography from '@mui/material/Typography';
import AppDialog from './AppDialog';
import AppButton from './AppButton';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export const ConfirmDialog = ({
  open,
  title = 'Xác nhận thao tác',
  message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  confirmVariant = 'danger', // 'danger' | 'primary'
  onConfirm,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!onConfirm) return;
    try {
      setLoading(true);
      await onConfirm();
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <AppDialog
      open={open}
      onClose={loading ? undefined : onClose}
      title={title}
      maxWidth="xs"
      headerIcon={<WarningAmberIcon color={confirmVariant === 'danger' ? 'error' : 'warning'} />}
      actions={
        <>
          <AppButton
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </AppButton>
          <AppButton
            variant={confirmVariant}
            onClick={handleConfirm}
            loading={loading}
          >
            {confirmText}
          </AppButton>
        </>
      }
    >
      <Typography variant="body1" sx={{ color: 'text.secondary' }}>
        {message}
      </Typography>
    </AppDialog>
  );
};

export default ConfirmDialog;
