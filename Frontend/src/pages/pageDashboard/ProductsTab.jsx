import React, { useState, useMemo, useEffect } from 'react';
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
import Tooltip from '@mui/material/Tooltip';

import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';

import AdminPagination from '../../components/common/AdminPagination';
import ProductDetailModal from './ProductDetailModal';

export default function ProductsTab({
  products = [],
  setShowAddProductModal,
  onNavigate,
  formatPrice,
  isAdmin,
  handleDeleteProduct,
  onEditProduct,
  onManageVariants,
  Icons,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Detail Modal state
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Reset trang về 0 khi lọc hoặc tìm kiếm
  useEffect(() => {
    setPage(0);
  }, [statusFilter, searchTerm]);

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
        p.product_name?.toLowerCase().includes(term) ||
        p.brand_name?.toLowerCase().includes(term) ||
        p.category_name?.toLowerCase().includes(term);
      return matchStatus && matchSearch;
    });
  }, [products, statusFilter, searchTerm]);

  // Phân trang dữ liệu
  const paginatedProducts = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredProducts.slice(start, start + rowsPerPage);
  }, [filteredProducts, page, rowsPerPage]);

  const handleOpenDetail = (prodId) => {
    setSelectedProductId(prodId);
    setShowDetailModal(true);
  };

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
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 2.5 }}
      >
        <Box sx={{ pr: 2 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 18 }}>Quản lý sản phẩm ({products.length})</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.5 }}>
            Bao gồm cả sản phẩm đang bán, tạm ngưng và lưu trữ
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddProductModal(true)}
          sx={{ whiteSpace: 'nowrap', px: 2.5, py: 1, minHeight: 40, mt: { xs: 1.5, sm: 0 } }}
        >
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

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Ảnh</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Tên sản phẩm</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Danh mục</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Thương hiệu</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Giá bán</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Tồn kho</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12.5 }}>Hành động</TableCell>
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
              paginatedProducts.map((prod) => {
                const badge = getStatusBadge(prod.status);
                return (
                  <TableRow key={prod.product_id} hover>
                    <TableCell sx={{ py: 1.25 }}>
                      <Box
                        component="img"
                        src={prod.thumbnail_url}
                        alt=""
                        onClick={() => handleOpenDetail(prod.product_id)}
                        sx={{
                          width: 44,
                          height: 44,
                          objectFit: 'contain',
                          borderRadius: 1.5,
                          border: '1px solid #E5E7EB',
                          bgcolor: '#F9FAFB',
                          cursor: 'pointer',
                          transition: 'transform 0.15s ease',
                          '&:hover': { transform: 'scale(1.06)' },
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, maxWidth: 220 }}>
                      <Typography
                        component="span"
                        onClick={() => handleOpenDetail(prod.product_id)}
                        title="Xem chi tiết sản phẩm (popup)"
                        sx={{
                          fontSize: 13.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          color: '#0F172A',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                        }}
                      >
                        {prod.product_name}
                      </Typography>
                    </TableCell>
                    <TableCell>{prod.category_name}</TableCell>
                    <TableCell>{prod.brand_name}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {formatPrice(prod.min_sale_price || prod.min_price || 0)}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: prod.total_stock < 10 ? 'error.main' : 'success.main' }}>
                      {prod.total_stock ?? 0}
                    </TableCell>
                    <TableCell>
                      <Chip label={badge.label} size="small" sx={{ bgcolor: badge.bg, color: badge.color, fontSize: 11.5, fontWeight: 700 }} />
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={0.75}>
                        <Tooltip title="Xem chi tiết (popup)">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDetail(prod.product_id)}
                            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{
                              py: 0.4,
                              px: 1.1,
                              fontSize: 12,
                              bgcolor: '#F8FAFC',
                              borderColor: '#CBD5E1',
                              color: '#334155',
                              '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                            }}
                          >
                            Chi tiết
                          </Button>
                        </Tooltip>
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

        {filteredProducts.length > 0 && (
          <AdminPagination
            count={filteredProducts.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </TableContainer>

      {/* Modal Popup Xem Chi Tiết Sản Phẩm */}
      <ProductDetailModal
        open={showDetailModal}
        productId={selectedProductId}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProductId(null);
        }}
        onEditProduct={onEditProduct}
        onManageVariants={onManageVariants}
        formatPrice={formatPrice}
      />
    </Box>
  );
}
