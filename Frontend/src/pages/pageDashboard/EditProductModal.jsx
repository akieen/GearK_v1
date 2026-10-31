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

import CloseIcon from '@mui/icons-material/Close';

import ImageUploadField from '../../components/common/ImageUploadField';

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
      setStatus(editingProduct.status || 'active');
    }
  }, [editingProduct]);

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
            <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Chỉnh sửa thông tin sản phẩm</Typography>
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

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Trạng thái kinh doanh</Typography>
            <Select fullWidth size="small" value={status} onChange={(e) => setStatus(e.target.value)}>
              <MenuItem value="active">Đang kinh doanh (Hiển thị cho khách)</MenuItem>
              <MenuItem value="inactive">Tạm ngưng bán (Ẩn khỏi trang chủ)</MenuItem>
              <MenuItem value="archived">Lưu trữ / Đã ngừng kinh doanh</MenuItem>
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
