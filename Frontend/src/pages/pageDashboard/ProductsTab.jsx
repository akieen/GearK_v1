import React, { useState, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';

export default function ProductsTab({
  products,
  setShowAddProductModal,
  onNavigate,
  formatPrice,
  isAdmin,
  handleDeleteProduct,
  onEditProduct,
  Icons,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusCounts = useMemo(() => {
    const counts = { all: products.length, active: 0, inactive: 0, archived: 0 };
    products.forEach((p) => {
      if (counts[p.status] !== undefined) counts[p.status] += 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const matchSearch =
        !term ||
        p.product_name.toLowerCase().includes(term) ||
        p.brand_name?.toLowerCase().includes(term) ||
        p.category_name?.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [products, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Đang kinh doanh', bg: '#ECFDF5', color: '#059669' };
      case 'inactive':
        return { label: 'Tạm ngưng bán', bg: '#FFFBEB', color: '#D97706' };
      case 'archived':
        return { label: 'Lưu trữ / Đã dừng', bg: '#F3F4F6', color: '#6B7280' };
      default:
        return { label: status || 'Không rõ', bg: '#F3F4F6', color: '#6B7280' };
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 2 }}>
        <Box>
          <Typography sx={{ fontWeight: 800, fontSize: 18 }}>Quản lý sản phẩm ({products.length})</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.25 }}>
            Bao gồm cả sản phẩm đang bán, tạm ngưng và lưu trữ
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowAddProductModal(true)}>
          Thêm sản phẩm mới
        </Button>
      </Stack>

      <Paper elevation={0} sx={{ p: 1.5, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Lọc trạng thái:</Typography>
          <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ fontSize: 13, fontWeight: 600 }}>
            <MenuItem value="all">Tất cả ({statusCounts.all})</MenuItem>
            <MenuItem value="active">Đang kinh doanh ({statusCounts.active})</MenuItem>
            <MenuItem value="inactive">Tạm ngưng bán ({statusCounts.inactive})</MenuItem>
            <MenuItem value="archived">Lưu trữ ({statusCounts.archived})</MenuItem>
          </Select>
        </Stack>

        <TextField
          size="small"
          placeholder="Tìm theo tên, hãng, danh mục..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ minWidth: 260, '& .MuiInputBase-input': { fontSize: 13, py: 0.85 } }}
        />
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Ảnh</TableCell>
              <TableCell>Tên sản phẩm</TableCell>
              <TableCell>Danh mục</TableCell>
              <TableCell>Thương hiệu</TableCell>
              <TableCell>Giá bán</TableCell>
              <TableCell>Tồn kho</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center" sx={{ py: 4.5, color: 'text.secondary' }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Không tìm thấy sản phẩm nào phù hợp</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>
                    Hãy thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((prod) => {
                const badge = getStatusBadge(prod.status);
                return (
                  <TableRow key={prod.product_id} hover>
                    <TableCell sx={{ py: 1.25 }}>
                      <Box
                        component="img"
                        src={prod.thumbnail_url}
                        alt=""
                        sx={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 1, border: '1px solid #E5E7EB', bgcolor: '#F9FAFB' }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, maxWidth: 220 }}>
                      <Typography
                        component="span"
                        onClick={() => onNavigate(`product/${prod.slug}`)}
                        sx={{ fontSize: 13.5, fontWeight: 700, cursor: 'pointer', '&:hover': { color: 'primary.main' } }}
                      >
                        {prod.product_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{prod.category_name}</TableCell>
                    <TableCell>{prod.brand_name}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {formatPrice(prod.min_sale_price || prod.min_price)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: prod.total_stock < 10 ? 'error.main' : 'success.main' }}>
                      {prod.total_stock}
                    </TableCell>
                    <TableCell>
                      <Chip label={badge.label} size="small" sx={{ bgcolor: badge.bg, color: badge.color, fontSize: 11.5, fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={0.75}>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onEditProduct && onEditProduct(prod)}
                          startIcon={Icons?.Edit ? <Icons.Edit size={14} /> : null}
                          sx={{ py: 0.4, px: 1.25, fontSize: 12, bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' }}
                        >
                          Sửa
                        </Button>
                        {isAdmin && (
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteProduct(prod.product_id)}
                            sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 1.5 }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        )}
                      </Stack>
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
