import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';

import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import TuneIcon from '@mui/icons-material/Tune';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import StarIcon from '@mui/icons-material/Star';
import CategoryIcon from '@mui/icons-material/Category';

import { productApi } from '../../api/productApi';
import { formatDate } from '../../utils/formatters';

export default function ProductDetailModal({
  open,
  productId,
  onClose,
  onEditProduct,
  onManageVariants,
  formatPrice,
}) {
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState('');

  useEffect(() => {
    if (!open || !productId) {
      setProduct(null);
      return;
    }

    let isMounted = true;
    setLoading(true);

    productApi
      .getProductById(productId)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setProduct(res.data);
          setActiveImage(res.data.thumbnail_url || (res.data.images?.[0]?.image_url ?? ''));
        }
      })
      .catch((err) => {
        console.error('Lỗi lấy chi tiết sản phẩm:', err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open, productId]);

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

  const statusBadge = product ? getStatusBadge(product.status) : null;

  // Lấy toàn bộ ảnh từ thumbnail, product images, variant images
  const allImages = React.useMemo(() => {
    if (!product) return [];
    const set = new Set();
    const imgs = [];

    if (product.thumbnail_url) {
      set.add(product.thumbnail_url);
      imgs.push(product.thumbnail_url);
    }
    if (product.images && Array.isArray(product.images)) {
      product.images.forEach((img) => {
        const url = img.image_url || img;
        if (url && !set.has(url)) {
          set.add(url);
          imgs.push(url);
        }
      });
    }
    if (product.variants && Array.isArray(product.variants)) {
      product.variants.forEach((v) => {
        if (v.images && Array.isArray(v.images)) {
          v.images.forEach((img) => {
            const url = img.image_url || img;
            if (url && !set.has(url)) {
              set.add(url);
              imgs.push(url);
            }
          });
        }
      });
    }
    return imgs;
  }, [product]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          px: 3,
          py: 2,
          bgcolor: '#F8FAFC',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: '#EFF6FF',
              color: '#2563EB',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Inventory2OutlinedIcon sx={{ fontSize: 20 }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>
              Chi tiết sản phẩm
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              ID: #{productId} {product?.slug ? `• /${product.slug}` : ''}
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={onClose} sx={{ color: '#64748B' }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress size={36} />
          </Box>
        ) : !product ? (
          <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
            Không tìm thấy thông tin sản phẩm.
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Hàng trên: Ảnh bên trái + Thông tin chính bên phải */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '260px 1fr' },
                gap: 3,
              }}
            >
              {/* Cột ảnh */}
              <Box>
                <Box
                  sx={{
                    width: '100%',
                    height: 240,
                    borderRadius: 2.5,
                    border: '1px solid #E2E8F0',
                    bgcolor: '#FAFAFA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                    mb: 1.5,
                  }}
                >
                  <Box
                    component="img"
                    src={activeImage || product.thumbnail_url || 'https://placehold.co/300x300?text=No+Image'}
                    alt={product.product_name}
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Box>

                {allImages.length > 1 && (
                  <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                    {allImages.slice(0, 5).map((url, idx) => (
                      <Box
                        key={idx}
                        onClick={() => setActiveImage(url)}
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          border: '2px solid',
                          borderColor: activeImage === url ? 'primary.main' : '#E2E8F0',
                          overflow: 'hidden',
                          cursor: 'pointer',
                          flexShrink: 0,
                          bgcolor: '#FFF',
                          transition: 'all 0.15s ease',
                          '&:hover': { borderColor: 'primary.main' },
                        }}
                      >
                        <Box
                          component="img"
                          src={url}
                          alt=""
                          sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                    ))}
                  </Stack>
                )}
              </Box>

              {/* Cột thông tin chính */}
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
                  {statusBadge && (
                    <Chip
                      label={statusBadge.label}
                      size="small"
                      sx={{
                        bgcolor: statusBadge.bg,
                        color: statusBadge.color,
                        fontWeight: 700,
                        fontSize: 11.5,
                      }}
                    />
                  )}
                  {product.category_name && (
                    <Chip
                      icon={<CategoryIcon sx={{ fontSize: '14px !important' }} />}
                      label={product.category_name}
                      size="small"
                      sx={{ bgcolor: '#F1F5F9', color: '#475569', fontSize: 11.5, fontWeight: 600 }}
                    />
                  )}
                  {product.brand_name && (
                    <Chip
                      icon={<StarIcon sx={{ fontSize: '14px !important', color: '#EAB308 !important' }} />}
                      label={product.brand_name}
                      size="small"
                      sx={{ bgcolor: '#FEF3C7', color: '#B45309', fontSize: 11.5, fontWeight: 700 }}
                    />
                  )}
                </Stack>

                <Typography sx={{ fontSize: 18, fontWeight: 800, color: '#0F172A', mb: 1.5 }}>
                  {product.product_name}
                </Typography>

                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>Khoảng giá bán</Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: 'primary.main', mt: 0.25 }}>
                      {product.min_sale_price && product.min_sale_price < product.min_price
                        ? formatPrice(product.min_sale_price)
                        : formatPrice(product.min_price || 0)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>Tổng tồn kho</Typography>
                    <Typography
                      sx={{
                        fontSize: 15,
                        fontWeight: 800,
                        mt: 0.25,
                        color: product.total_stock <= 5 ? 'error.main' : 'success.main',
                      }}
                    >
                      {product.total_stock ?? 0} sản phẩm
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>Biến thể</Typography>
                    <Typography sx={{ fontSize: 15, fontWeight: 800, color: '#1E293B', mt: 0.25 }}>
                      {product.variants?.length || 0} phiên bản
                    </Typography>
                  </Box>

                  <Box>
                    <Typography sx={{ fontSize: 11.5, color: '#64748B', fontWeight: 600 }}>Ngày tạo</Typography>
                    <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#334155', mt: 0.25 }}>
                      {formatDate(product.created_at)}
                    </Typography>
                  </Box>
                </Paper>

                <Box>
                  <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: '#334155', mb: 0.5 }}>
                    Mô tả sản phẩm:
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: 13,
                      color: '#475569',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-line',
                      maxHeight: 120,
                      overflowY: 'auto',
                      p: 1.25,
                      bgcolor: '#FAFAFA',
                      borderRadius: 1.5,
                      border: '1px solid #E5E7EB',
                    }}
                  >
                    {product.description?.trim() || 'Chưa có mô tả chi tiết cho sản phẩm này.'}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider />

            {/* Phần danh sách biến thể */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                <Typography sx={{ fontSize: 14.5, fontWeight: 800, color: '#0F172A' }}>
                  Danh sách phiên bản / Biến thể ({product.variants?.length || 0})
                </Typography>
                {onManageVariants && (
                  <Button
                    size="small"
                    startIcon={<TuneIcon sx={{ fontSize: 15 }} />}
                    onClick={() => {
                      onClose();
                      onManageVariants(product.product_id);
                    }}
                    sx={{ fontSize: 12, fontWeight: 700 }}
                  >
                    Quản lý biến thể & hình ảnh
                  </Button>
                )}
              </Stack>

              <TableContainer
                component={Paper}
                elevation={0}
                sx={{ borderRadius: 2, border: '1px solid #E2E8F0', overflow: 'hidden' }}
              >
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#475569' }}>SKU</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#475569' }}>Tên phiên bản</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#475569' }}>Giá niêm yết</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#475569' }}>Giá khuyến mãi</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#475569' }}>Tồn kho</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#475569' }}>Bảo hành</TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: 12, color: '#475569' }}>Thông số kỹ thuật</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {!product.variants || product.variants.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                          Chưa có biến thể nào được tạo
                        </TableCell>
                      </TableRow>
                    ) : (
                      product.variants.map((v) => {
                        let specsObj = v.specifications;
                        if (typeof specsObj === 'string') {
                          try {
                            specsObj = JSON.parse(specsObj);
                          } catch {
                            specsObj = null;
                          }
                        }
                        const specEntries =
                          specsObj && typeof specsObj === 'object' ? Object.entries(specsObj) : [];

                        return (
                          <TableRow key={v.variant_id} hover>
                            <TableCell sx={{ fontFamily: 'monospace', fontWeight: 800, color: 'primary.main', fontSize: 12 }}>
                              {v.sku}
                            </TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: 13 }}>
                              {v.variant_name}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12.5, fontWeight: 600 }}>
                              {formatPrice(v.price)}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12.5, fontWeight: 700, color: v.sale_price ? 'error.main' : 'text.disabled' }}>
                              {v.sale_price ? formatPrice(v.sale_price) : '—'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${v.stock} chiếc`}
                                size="small"
                                sx={{
                                  fontSize: 11,
                                  fontWeight: 700,
                                  bgcolor: v.stock <= 5 ? '#FEE2E2' : '#ECFDF5',
                                  color: v.stock <= 5 ? '#EF4444' : '#059669',
                                  height: 22,
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              {v.warranty_months ? `${v.warranty_months} tháng` : '—'}
                            </TableCell>
                            <TableCell>
                              {specEntries.length > 0 ? (
                                <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ maxWidth: 220 }}>
                                  {specEntries.map(([k, val], i) => (
                                    <Box
                                      key={i}
                                      component="span"
                                      sx={{
                                        fontSize: 10.5,
                                        bgcolor: '#F1F5F9',
                                        px: 0.6,
                                        py: 0.2,
                                        borderRadius: 1,
                                        border: '1px solid #E2E8F0',
                                        color: '#334155',
                                      }}
                                    >
                                      <strong>{k}:</strong> {String(val)}
                                    </Box>
                                  ))}
                                </Stack>
                              ) : (
                                <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>—</Typography>
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
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0', gap: 1 }}>
        <Button variant="outlined" color="inherit" onClick={onClose} sx={{ fontSize: 13, fontWeight: 600 }}>
          Đóng
        </Button>
        {product && onEditProduct && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon sx={{ fontSize: 16 }} />}
            onClick={() => {
              onClose();
              onEditProduct(product);
            }}
            sx={{ fontSize: 13, fontWeight: 700 }}
          >
            Chỉnh sửa sản phẩm
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}

