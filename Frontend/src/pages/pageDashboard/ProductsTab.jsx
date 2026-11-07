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
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import PublishIcon from '@mui/icons-material/Publish';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

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
  onUpdateStatus,
  onGoToInventory,
  Icons,
}) {
  const [statusFilter, setStatusFilter] = useState('active');
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
    const counts = { all: products.length, draft: 0, active: 0, inactive: 0, archived: 0 };
    products.forEach((p) => {
      const s = (p.status || 'draft').toLowerCase();
      if (counts[s] !== undefined) counts[s] += 1;
      else counts.draft += 1;
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return products.filter((p) => {
      const pStatus = (p.status || 'draft').toLowerCase();
      const matchStatus = statusFilter === 'all' || pStatus === statusFilter;
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
    const s = (status || 'draft').toLowerCase();
    switch (s) {
      case 'active':
        return { label: 'Đang kinh doanh', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      case 'draft':
        return { label: 'Bản nháp', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
      case 'inactive':
        return { label: 'Tạm ngưng bán', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
      case 'archived':
        return { label: 'Lưu trữ / Đã dừng', bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
      default:
        return { label: status || 'Bản nháp', bg: '#EFF6FF', color: '#2563EB', border: '#BFDBFE' };
    }
  };

  const statusPills = [
    { id: 'all', label: 'Tất cả', count: statusCounts.all, color: '#334155', bg: '#F1F5F9' },
    { id: 'draft', label: 'Bản nháp', count: statusCounts.draft, color: '#2563EB', bg: '#EFF6FF' },
    { id: 'active', label: 'Đang kinh doanh', count: statusCounts.active, color: '#059669', bg: '#ECFDF5' },
    { id: 'inactive', label: 'Tạm ngưng', count: statusCounts.inactive, color: '#D97706', bg: '#FFFBEB' },
    { id: 'archived', label: 'Lưu trữ', count: statusCounts.archived, color: '#6B7280', bg: '#F3F4F6' },
  ];

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
            Sản phẩm tạo mới mặc định ở trạng thái <strong>Bản nháp</strong> và tồn kho = 0 cho tới khi lập phiếu nhập kho
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

      {/* THANH LỌC TRẠNG THÁI NHANH VÀ TÌM KIẾM */}
      <Paper elevation={0} sx={{ p: 1.75, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {/* Hàng tabs trạng thái */}
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
          <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#475569', mr: 0.5 }}>Trạng thái:</Typography>
          {statusPills.map((pill) => {
            const isSelected = statusFilter === pill.id;
            return (
              <Chip
                key={pill.id}
                label={`${pill.label} (${pill.count})`}
                onClick={() => setStatusFilter(pill.id)}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 700,
                  fontSize: 12.5,
                  cursor: 'pointer',
                  borderColor: isSelected ? pill.color : '#E2E8F0',
                  bgcolor: isSelected ? pill.bg : 'transparent',
                  color: isSelected ? pill.color : '#64748B',
                  '&:hover': { bgcolor: pill.bg, color: pill.color },
                  transition: 'all 0.15s ease',
                }}
              />
            );
          })}
        </Stack>

        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ pt: 0.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Lọc danh sách:</Typography>
            <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ fontSize: 13, fontWeight: 600, minWidth: 160 }}>
              <MenuItem value="all">Tất cả ({statusCounts.all})</MenuItem>
              <MenuItem value="draft">Bản nháp ({statusCounts.draft})</MenuItem>
              <MenuItem value="active">Đang kinh doanh ({statusCounts.active})</MenuItem>
              <MenuItem value="inactive">Tạm ngưng bán ({statusCounts.inactive})</MenuItem>
              <MenuItem value="archived">Lưu trữ ({statusCounts.archived})</MenuItem>
            </Select>
          </Stack>
          <TextField
            size="small"
            placeholder="Tìm theo tên, hãng hoặc danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ width: { xs: '100%', sm: 300 } }}
          />
        </Stack>
      </Paper>

      {/* BẢNG DANH SÁCH SẢN PHẨM */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #E5E7EB' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, width: 64 }}>Ảnh</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tên sản phẩm</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Danh mục</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Thương hiệu</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Giá niêm yết</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Tồn kho</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Trạng thái</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, minWidth: 170 }}>Duyệt & Nhập kho</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, minWidth: 150 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center" sx={{ py: 4.5, color: 'text.secondary' }}>
                  Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                </TableCell>
              </TableRow>
            ) : (
              paginatedProducts.map((prod) => {
                const badge = getStatusBadge(prod.status);
                const isDraft = (prod.status || 'draft').toLowerCase() === 'draft';
                const hasZeroStock = (prod.total_stock ?? 0) === 0;

                return (
                  <TableRow key={prod.product_id} hover>
                    <TableCell>
                      <Box
                        component="img"
                        src={prod.thumbnail_url || 'https://placehold.co/60x60?text=GearK'}
                        alt={prod.product_name}
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
                    <TableCell>{prod.category_name || '—'}</TableCell>
                    <TableCell>{prod.brand_name || '—'}</TableCell>
                    <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {formatPrice(prod.min_sale_price || prod.min_price || 0)}
                    </TableCell>
                    <TableCell>
                      {hasZeroStock ? (
                        <Tooltip title="Chưa có hàng trong kho. Bấm để tạo phiếu Nhập kho">
                          <Chip
                            label="0 chiếc (Chưa nhập kho)"
                            size="small"
                            onClick={() => onGoToInventory && onGoToInventory(prod)}
                            sx={{
                              fontWeight: 800,
                              fontSize: 11,
                              bgcolor: '#FEF2F2',
                              color: '#DC2626',
                              border: '1px dashed #FCA5A5',
                              cursor: onGoToInventory ? 'pointer' : 'default',
                              '&:hover': onGoToInventory ? { bgcolor: '#FEE2E2' } : {},
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Chip
                          label={`${prod.total_stock} chiếc`}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 12,
                            bgcolor: prod.total_stock < 5 ? '#FEE2E2' : '#ECFDF5',
                            color: prod.total_stock < 5 ? '#DC2626' : '#059669',
                          }}
                        />
                      )}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={badge.label}
                        size="small"
                        sx={{
                          bgcolor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          fontSize: 11.5,
                          fontWeight: 700,
                        }}
                      />
                    </TableCell>

                    {/* CỘT RIÊNG: DUYỆT BÁN & NHẬP KHO */}
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" alignItems="center" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {/* Nút thao tác nhanh duyệt bán cho Bản nháp */}
                        {isDraft && onUpdateStatus && (
                          <Tooltip title="Duyệt mở bán sản phẩm này ngay ra website">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => onUpdateStatus(prod.product_id, 'active')}
                              startIcon={<PublishIcon sx={{ fontSize: 13 }} />}
                              sx={{
                                py: 0.35,
                                px: 1,
                                fontSize: 11.5,
                                fontWeight: 700,
                                bgcolor: '#059669',
                                '&:hover': { bgcolor: '#047857' },
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Duyệt bán
                            </Button>
                          </Tooltip>
                        )}

                        {/* Nút thao tác nhanh lập phiếu nhập kho */}
                        {onGoToInventory && (
                          <Tooltip title={hasZeroStock ? "Sản phẩm chưa có hàng. Lập phiếu nhập kho ngay" : "Lập phiếu nhập thêm hàng vào kho"}>
                            <Button
                              size="small"
                              variant={hasZeroStock ? "contained" : "outlined"}
                              onClick={() => onGoToInventory(prod)}
                              startIcon={<AddIcon sx={{ fontSize: 13 }} />}
                              sx={{
                                py: 0.35,
                                px: 1,
                                fontSize: 11.5,
                                fontWeight: 700,
                                whiteSpace: 'nowrap',
                                ...(hasZeroStock ? {
                                  bgcolor: '#2563EB',
                                  color: '#FFFFFF',
                                  '&:hover': { bgcolor: '#1D4ED8' },
                                } : {
                                  borderColor: '#CBD5E1',
                                  color: '#334155',
                                  bgcolor: '#F8FAFC',
                                  '&:hover': { bgcolor: '#F1F5F9', borderColor: '#94A3B8' },
                                }),
                              }}
                            >
                              {hasZeroStock ? 'Nhập kho' : '+ Nhập thêm'}
                            </Button>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>

                    {/* CỘT THAO TÁC CƠ BẢN: CHI TIẾT, SỬA, XÓA */}
                    <TableCell align="center">
                      <Stack direction="row" justifyContent="center" spacing={0.75} flexWrap="wrap" useFlexGap>
                        {/* Nút xem chi tiết popup */}
                        <Tooltip title="Xem chi tiết (popup)">
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => handleOpenDetail(prod.product_id)}
                            startIcon={<VisibilityOutlinedIcon sx={{ fontSize: 15 }} />}
                            sx={{
                              py: 0.35,
                              px: 1,
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

                        {/* Nút sửa sản phẩm */}
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => onEditProduct && onEditProduct(prod)}
                          startIcon={Icons?.Edit ? <Icons.Edit size={14} /> : null}
                          sx={{ py: 0.35, px: 1.1, fontSize: 12, bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB' }}
                        >
                          Sửa
                        </Button>

                        {/* Nút lưu trữ (soft delete / ẩn) - Hiển thị khi sản phẩm chưa lưu trữ */}
                        {isAdmin && prod.status !== 'archived' && (
                          <Tooltip title="Lưu trữ (Ẩn sản phẩm khỏi kinh doanh)">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProduct(prod.product_id, false)}
                              sx={{
                                bgcolor: '#FFFBEB',
                                border: '1px solid #FDE68A',
                                color: '#D97706',
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: '#FEF3C7' },
                              }}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}

                        {/* Nút xóa cứng - Chỉ hiển thị ở mục lưu trữ */}
                        {isAdmin && prod.status === 'archived' && (
                          <Tooltip title="Xóa cứng">
                            <IconButton
                              size="small"
                              onClick={() => handleDeleteProduct(prod.product_id, true)}
                              sx={{
                                bgcolor: '#FEF2F2',
                                border: '1px solid #FECACA',
                                color: '#DC2626',
                                borderRadius: 1.5,
                                '&:hover': { bgcolor: '#FEE2E2' },
                              }}
                            >
                              <DeleteForeverIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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

      {/* Modal chi tiết sản phẩm dạng popup */}
      <ProductDetailModal
        open={showDetailModal}
        productId={selectedProductId}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedProductId(null);
        }}
        onEditProduct={(p) => {
          setShowDetailModal(false);
          onEditProduct && onEditProduct(p);
        }}
        onManageVariants={onManageVariants}
        formatPrice={formatPrice}
      />
    </Box>
  );
}
