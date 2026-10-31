import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';

import { categoryApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';

export default function CategoriesTab({ categories, fetchCategories, isAdmin, Icons }) {
  const toast = useToast();
  const [newCatName, setNewCatName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return toast.warning('Vui lòng nhập tên danh mục');
    setSubmitting(true);
    try {
      const res = await categoryApi.createCategory({
        category_name: newCatName.trim(),
        parent_id: newParentId ? parseInt(newParentId) : null,
      });
      if (res.success) {
        toast.success(`Đã thêm danh mục "${newCatName.trim()}"!`);
        setNewCatName('');
        setNewParentId('');
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;
    try {
      const res = await categoryApi.deleteCategory(id);
      if (res.success) {
        toast.success(`Đã xóa danh mục "${name}"`);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa danh mục');
    }
  };

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 2, border: '1px solid #E5E7EB' }}>
        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
          {Icons?.Folder && <Icons.Folder size={18} style={{ color: '#E30019' }} />}
          <Typography sx={{ fontSize: 15, fontWeight: 800 }}>Thêm danh mục sản phẩm mới</Typography>
        </Stack>

        <Box component="form" onSubmit={handleCreate} sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Tên danh mục *</Typography>
            <TextField
              fullWidth
              size="small"
              required
              placeholder="VD: Màn hình Gaming, Ghế công thái học..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
          </Box>

          <Box sx={{ width: 220 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Danh mục cha (Tùy chọn)</Typography>
            <Select fullWidth size="small" displayEmpty value={newParentId} onChange={(e) => setNewParentId(e.target.value)}>
              <MenuItem value="">-- Là danh mục gốc --</MenuItem>
              {categories.filter((c) => !c.parent_id).map((c) => (
                <MenuItem key={c.category_id} value={c.category_id}>{c.category_name}</MenuItem>
              ))}
            </Select>
          </Box>

          <Button type="submit" variant="contained" disabled={submitting} startIcon={<AddIcon />} sx={{ height: 40 }}>
            {submitting ? 'Đang tạo...' : 'Thêm danh mục'}
          </Button>
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2, borderBottom: '1px solid #E5E7EB' }}>
          <Typography sx={{ fontWeight: 800, fontSize: 15 }}>Danh sách danh mục ({categories.length})</Typography>
          <Button size="small" onClick={fetchCategories} sx={{ fontSize: 12.5, fontWeight: 700 }}>Làm mới</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Tên danh mục</TableCell>
              <TableCell>Slug / Đường dẫn</TableCell>
              <TableCell>Danh mục cha</TableCell>
              <TableCell>Số sản phẩm</TableCell>
              <TableCell>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có danh mục nào</TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => {
                const parent = categories.find((c) => c.category_id === cat.parent_id);
                return (
                  <TableRow key={cat.category_id} hover>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', py: 1.5 }}>#{cat.category_id}</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>{cat.category_name}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary', fontFamily: 'monospace' }}>/{cat.slug}</TableCell>
                    <TableCell>
                      {parent ? (
                        <Chip label={parent.category_name} size="small" sx={{ fontSize: 12, bgcolor: '#F3F4F6' }} />
                      ) : (
                        <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>Gốc</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: 'primary.main' }}>{cat.product_count ?? 0}</TableCell>
                    <TableCell>
                      {isAdmin && (
                        <IconButton size="small" color="error" onClick={() => handleDelete(cat.category_id, cat.category_name)}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
