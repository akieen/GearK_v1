import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Chip from '@mui/material/Chip';

import CloseIcon from '@mui/icons-material/Close';

import ImageUploadField from '../../components/common/ImageUploadField';

const STATUS_OPTIONS = [
  {
    value: 'active',
    label: 'Đang kinh doanh',
    desc: 'Hiển thị công khai cho khách hàng mua sắm',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    dot: '#10B981',
  },
  {
    value: 'draft',
    label: 'Bản nháp',
    desc: 'Đang soạn thảo nội dung, chưa hiển thị ra ngoài web',
    color: '#2563EB',
    bg: '#EFF6FF',
    border: '#BFDBFE',
    dot: '#3B82F6',
  },
  {
    value: 'inactive',
    label: 'Tạm ngưng bán',
    desc: 'Tạm ẩn khỏi trang chủ và danh sách tìm kiếm',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    dot: '#F59E0B',
  },
  {
    value: 'archived',
    label: 'Lưu trữ / Đã ngưng',
    desc: 'Ngừng kinh doanh hoàn toàn (Lưu trữ lịch sử)',
    color: '#4B5563',
    bg: '#F3F4F6',
    border: '#E5E7EB',
    dot: '#9CA3AF',
  },
];

export default function EditProductModal({
  editingProduct,
  setEditingProduct,
  categories,
  brands,
  handleUpdateProduct,
  onManageVariants,
  Icons,
}) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.product_name || '');
      setCategoryId(editingProduct.category_id ? String(editingProduct.category_id) : '');
      setBrandId(editingProduct.brand_id ? String(editingProduct.brand_id) : '');
      setDescription(editingProduct.description || '');
      setThumbnailUrl(editingProduct.thumbnail_url || '');

      const rawStatus = editingProduct.status ? String(editingProduct.status).toLowerCase().trim() : 'active';
      const validStatus = STATUS_OPTIONS.some((opt) => opt.value === rawStatus) ? rawStatus : 'active';
      setStatus(validStatus);
    }
  }, [editingProduct]);

  const currentStatusConfig = STATUS_OPTIONS.find((opt) => opt.value === status) || STATUS_OPTIONS[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !editingProduct) return;
    setSubmitting(true);
    try {
      await handleUpdateProduct(editingProduct.product_id, {
        product_name: name.trim(),
        category_id: categoryId ? parseInt(categoryId) : null,
        brand_id: brandId ? parseInt(brandId) : null,
        description: description.trim(),
        thumbnail_url: thumbnailUrl.trim(),
        status,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={Boolean(editingProduct)} onClose={() => setEditingProduct(null)} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box sx={{ width: 34, height: 34, borderRadius: 2, bgcolor: '#EFF6FF', color: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icons?.Edit && <Icons.Edit size={18} />}
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Chỉnh sửa thông tin sản phẩm</Typography>
              <Chip
                size="small"
                label={currentStatusConfig.label}
                sx={{
                  bgcolor: currentStatusConfig.bg,
                  color: currentStatusConfig.color,
                  border: `1px solid ${currentStatusConfig.border}`,
                  fontWeight: 700,
                  fontSize: 11,
                  height: 22,
                }}
              />
            </Stack>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              ID: #{editingProduct?.product_id} • {editingProduct?.product_name}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={() => setEditingProduct(null)}><CloseIcon /></IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Tên sản phẩm *</Typography>
            <TextField fullWidth size="small" required placeholder="VD: Chuột Razer DeathAdder V3 Pro" value={name} onChange={(e) => setName(e.target.value)} />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Danh mục *</Typography>
              <Select fullWidth size="small" required displayEmpty value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                <MenuItem value="">-- Chọn danh mục --</MenuItem>
                {categories.map((c) => <MenuItem key={c.category_id} value={String(c.category_id)}>{c.category_name}</MenuItem>)}
              </Select>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Thương hiệu *</Typography>
              <Select fullWidth size="small" required displayEmpty value={brandId} onChange={(e) => setBrandId(e.target.value)}>
                <MenuItem value="">-- Chọn thương hiệu --</MenuItem>
                {brands.map((b) => <MenuItem key={b.brand_id} value={String(b.brand_id)}>{b.brand_name}</MenuItem>)}
              </Select>
            </Box>
          </Box>

          {/* TRẠNG THÁI KINH DOANH SẢN PHẨM */}
          <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: currentStatusConfig.bg, border: `1px solid ${currentStatusConfig.border}` }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700, color: currentStatusConfig.color, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: currentStatusConfig.dot }} />
                Trạng thái kinh doanh sản phẩm *
              </Typography>
              <Chip
                size="small"
                label={currentStatusConfig.label}
                sx={{
                  bgcolor: '#FFFFFF',
                  color: currentStatusConfig.color,
                  border: `1px solid ${currentStatusConfig.border}`,
                  fontWeight: 700,
                  fontSize: 11,
                  height: 20,
                }}
              />
            </Stack>
            <Select
              fullWidth
              size="small"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              sx={{ bgcolor: '#FFFFFF' }}
              renderValue={(selectedVal) => {
                const opt = STATUS_OPTIONS.find((o) => o.value === selectedVal) || STATUS_OPTIONS[0];
                return (
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.dot }} />
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: opt.color }}>
                      {opt.label}
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                      — {opt.desc}
                    </Typography>
                  </Stack>
                );
              }}
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value} sx={{ py: 1 }}>
                  <Stack spacing={0.25} sx={{ width: '100%' }}>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: opt.dot }} />
                      <Typography sx={{ fontSize: 13, fontWeight: 700, color: opt.color }}>
                        {opt.label}
                      </Typography>
                    </Stack>
                    <Typography sx={{ fontSize: 11.5, color: 'text.secondary', pl: 2 }}>
                      {opt.desc}
                    </Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </Box>

          <ImageUploadField
            label="Ảnh đại diện (Thumbnail - Multer File Upload)"
            value={thumbnailUrl}
            onChange={setThumbnailUrl}
            multiple={false}
            hint="Chọn ảnh từ máy tính (Multer) hoặc nhập URL"
          />

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Mô tả sản phẩm</Typography>
            <TextField
              fullWidth size="small" multiline rows={4}
              placeholder="Tính năng nổi bật, thông số kỹ thuật, bảo hành..."
              value={description} onChange={(e) => setDescription(e.target.value)}
            />
          </Box>

          <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={1.5} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Giá bán & Kho hàng (Biến thể)</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>
                Giá bán và tồn kho được quản lý chi tiết trong tab "Biến thể sản phẩm".
              </Typography>
            </Box>
            {onManageVariants && (
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  const id = editingProduct.product_id;
                  setEditingProduct(null);
                  onManageVariants(id);
                }}
                sx={{ whiteSpace: 'nowrap', bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' }}
              >
                Sửa giá & kho →
              </Button>
            )}
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => setEditingProduct(null)}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Đang lưu thay đổi...' : 'Lưu thay đổi'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
