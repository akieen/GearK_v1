import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';

import { AppButton } from '../ui/AppButton';
import ImageUploadField from '../common/ImageUploadField';
import { warrantyApi } from '../../api/warrantyApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';

export default function WarrantyClaimModal({ open, onClose, item, onSuccess }) {
  const toast = useToast();
  const [serialNumber, setSerialNumber] = useState('');
  const [issueDescription, setIssueDescription] = useState('');
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSerialNumber('');
      setIssueDescription('');
      setImages([]);
    }
  }, [open, item]);

  if (!item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issueDescription.trim()) {
      return toast.warning('Vui lòng mô tả chi tiết lỗi sản phẩm đang gặp phải!');
    }

    setSubmitting(true);
    try {
      const payload = {
        order_id: item.order_id,
        order_item_id: item.order_item_id,
        product_name: item.variant_name
          ? `${item.product_name} - ${item.variant_name}`
          : item.product_name,
        serial_number: serialNumber.trim() || null,
        issue_description: issueDescription.trim(),
        image_urls: images.length > 0 ? images : null,
      };

      const res = await warrantyApi.createClaim(payload);
      if (res.success) {
        toast.success(res.message || 'Gửi yêu cầu bảo hành thành công!');
        if (onSuccess) onSuccess();
        onClose();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi gửi yêu cầu bảo hành. Vui lòng thử lại!');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <VerifiedUserIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Tạo yêu cầu bảo hành
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small" sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <form onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ p: 2.5 }}>
          <Stack spacing={2.5}>
            {/* Item Card */}
            <Box
              sx={{
                display: 'flex',
                gap: 2,
                p: 1.75,
                bgcolor: '#F8FAFC',
                borderRadius: 2.5,
                border: '1px solid #E2E8F0',
                alignItems: 'center',
              }}
            >
              <Box
                component="img"
                src={item.thumbnail_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=150&q=80'}
                alt={item.product_name}
                sx={{
                  width: 64,
                  height: 64,
                  objectFit: 'contain',
                  borderRadius: 2,
                  bgcolor: '#FFFFFF',
                  p: 0.5,
                  border: '1px solid #E2E8F0',
                  flexShrink: 0,
                }}
              />
              <Box sx={{ minWidth: 0, flex: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary', lineHeight: 1.3 }}>
                  {item.product_name}
                </Typography>
                {item.variant_name && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Phiên bản: <strong>{item.variant_name}</strong>
                  </Typography>
                )}
                <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                  <Chip
                    label={`Đơn #${item.order_code}`}
                    size="small"
                    sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: '#FEE2E2', color: '#DC2626' }}
                  />
                  <Chip
                    label={`Bảo hành: ${item.warranty_months || 12} tháng`}
                    size="small"
                    sx={{ height: 20, fontSize: 11, fontWeight: 700, bgcolor: '#ECFDF5', color: '#047857' }}
                  />
                </Stack>
              </Box>
            </Box>

            {/* Serial Number */}
            <TextField
              label="Số Serial / S/N / Service Tag (Nếu có)"
              placeholder="Ví dụ: SN-982348271 (In trên tem sản phẩm hoặc vỏ hộp)"
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              fullWidth
              size="small"
            />

            {/* Issue Description */}
            <TextField
              label="Mô tả sự cố & hiện tượng lỗi *"
              placeholder="Mô tả chi tiết tình trạng gặp phải (ví dụ: Chuột bị double-click chuột trái sau 2 tuần dùng; bàn phím liệt hàng phím số; tai nghe rè bên phải khi tăng âm lượng...)"
              value={issueDescription}
              onChange={(e) => setIssueDescription(e.target.value)}
              multiline
              rows={3.5}
              fullWidth
              required
            />

            {/* Upload Images */}
            <Box>
              <ImageUploadField
                label="Hình ảnh / Video minh chứng lỗi (Không bắt buộc)"
                value={images}
                onChange={setImages}
                multiple={true}
                placeholder="Tải lên ảnh chụp thực tế vị trí lỗi hoặc tem sản phẩm..."
                hint="Tải ảnh rõ nét tem serial hoặc tình trạng lỗi để kỹ thuật viên duyệt nhanh hơn"
              />
            </Box>

            <Alert severity="info" sx={{ fontSize: 12, '& .MuiAlert-message': { fontSize: 12 } }}>
              GearK cam kết tiếp nhận và kiểm tra trong 24h - 48h làm việc. Quý khách vui lòng giữ lại tem bảo hành và phụ kiện đi kèm thiết bị.
            </Alert>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2, gap: 1 }}>
          <AppButton variant="ghost" onClick={onClose} disabled={submitting}>
            Hủy
          </AppButton>
          <AppButton variant="primary" type="submit" loading={submitting}>
            Gửi yêu cầu bảo hành
          </AppButton>
        </DialogActions>
      </form>
    </Dialog>
  );
}
