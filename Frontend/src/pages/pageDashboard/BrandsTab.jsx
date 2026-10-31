import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { brandApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';

export default function BrandsTab({ brands, fetchBrands, isAdmin }) {
  const toast = useToast();
  const [newBrandName, setNewBrandName] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) return toast.warning('Vui lòng nhập tên thương hiệu');
    setSubmitting(true);
    try {
      const res = await brandApi.createBrand({
        brand_name: newBrandName.trim(),
        logo_url: newLogoUrl.trim() || null,
      });
      if (res.success) {
        toast.success(`Đã thêm thương hiệu "${newBrandName.trim()}"!`);
        setNewBrandName('');
        setNewLogoUrl('');
        fetchBrands();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm thương hiệu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${name}"?`)) return;
    try {
      const res = await brandApi.deleteBrand(id);
      if (res.success) {
        toast.success(`Đã xóa thương hiệu "${name}"`);
        fetchBrands();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa thương hiệu');
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 2, border: '1px solid #E5E7EB' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          <LocalOfferIcon sx={{ fontSize: 18, color: 'primary.main' }} />
          <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Thêm thương hiệu mới (Brands)</Typography>
        </Stack>

        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Tên thương hiệu *</Typography>
            <TextField
              fullWidth
              size="small"
              required
              placeholder="VD: Logitech G, Razer, Corsair, Asus ROG..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
            />
          </Box>

          <Box sx={{ flex: 1, minWidth: 240 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Logo URL (Tùy chọn)</Typography>
            <TextField
              fullWidth
              size="small"
              type="url"
              placeholder="https://..."
              value={newLogoUrl}
              onChange={(e) => setNewLogoUrl(e.target.value)}
            />
          </Box>

          <Button type="submit" variant="contained" disabled={submitting} startIcon={<AddIcon />} sx={{ height: 40 }}>
            {submitting ? 'Đang tạo...' : 'Thêm thương hiệu'}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E5E7EB' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 15 }}>Danh sách thương hiệu ({brands.length})</Typography>
          <Button size="small" onClick={fetchBrands} sx={{ fontSize: 12.5, fontWeight: 700 }}>Làm mới</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Logo</TableCell>
              <TableCell>Tên thương hiệu</TableCell>
              <TableCell>Slug</TableCell>
              <TableCell>Số sản phẩm</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {brands.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có thương hiệu nào</TableCell>
              </TableRow>
            ) : (
              brands.map((b) => (
                <TableRow key={b.brand_id} hover>
                  <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>#{b.brand_id}</TableCell>
                  <TableCell>
                    {b.logo_url ? (
                      <Box component="img" src={b.logo_url} alt={b.brand_name} sx={{ height: 28, maxWidth: 60, objectFit: 'contain' }} />
                    ) : (
                      <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>Không có</Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>{b.brand_name}</TableCell>
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary', fontFamily: 'monospace' }}>{b.slug}</TableCell>
                  <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{b.product_count ?? 0}</TableCell>
                  <TableCell>
                    {isAdmin && (
                      <IconButton size="small" color="error" onClick={() => handleDelete(b.brand_id, b.brand_name)}>
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
