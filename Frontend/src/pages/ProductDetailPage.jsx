import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Rating from '@mui/material/Rating';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Alert from '@mui/material/Alert';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { productApi } from '../api/productApi';
import { reviewApi } from '../api/extraApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../utils/formatters';
import { PriceDisplay } from '../components/ui/PriceDisplay';
import { AppButton } from '../components/ui/AppButton';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProductDetailPage = ({ slug, onNavigate }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();
  const { user, openAuthModal } = useAuth();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);

  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [ratingInput, setRatingInput] = useState(5);
  const [reviewContent, setReviewContent] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [eligibility, setEligibility] = useState(null);

  const fetchReviews = useCallback(async (productId) => {
    try {
      const res = await reviewApi.getProductReviews(productId);
      if (res?.success) setReviews(res.data || []);
    } catch (err) {
      console.error('Lỗi tải đánh giá:', err);
    }
  }, []);

  const fetchEligibility = useCallback(async (productId) => {
    if (!user || !productId) return setEligibility(null);
    try {
      const res = await reviewApi.checkEligibility(productId);
      if (res?.data) setEligibility(res.data);
    } catch (err) {
      console.error('Lỗi kiểm tra quyền đánh giá:', err);
    }
  }, [user]);

  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await productApi.getProductBySlug(slug);
      if (res?.success && res.data) {
        const prod = res.data;
        setProduct(prod);
        setSelectedImage(
          prod.images?.find((i) => i.is_primary)?.image_url ||
          prod.images?.[0]?.image_url ||
          prod.thumbnail_url
        );
        if (prod.variants?.length > 0) setSelectedVariant(prod.variants[0]);
        if (prod.product_id) {
          fetchReviews(prod.product_id);
          fetchEligibility(prod.product_id);
        }
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  }, [slug, fetchEligibility, fetchReviews]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (product?.product_id) fetchEligibility(product.product_id);
  }, [user, product, fetchEligibility]);

  // Gallery images deduplication
  const gallery = useMemo(() => {
    if (!product) return [];
    const list = [
      ...(selectedVariant?.images || []).map((img) => (typeof img === 'string' ? img : img.image_url)),
      ...(product.images || []).map((img) => (typeof img === 'string' ? img : img.image_url)),
      product.thumbnail_url,
    ].filter(Boolean);
    return [...new Set(list)];
  }, [product, selectedVariant]);

  // Specifications parser
  const specifications = useMemo(() => {
    try {
      if (!selectedVariant?.specifications) return {};
      return typeof selectedVariant.specifications === 'string'
        ? JSON.parse(selectedVariant.specifications)
        : selectedVariant.specifications;
    } catch {
      return {};
    }
  }, [selectedVariant]);

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    const added = await addToCart(selectedVariant.variant_id, quantity, false);
    if (added) onNavigate('checkout');
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewContent.trim()) return toast.warning('Vui lòng nhập nội dung đánh giá!');
    setSubmittingReview(true);
    try {
      const res = await reviewApi.createReview(
        product.product_id,
        ratingInput,
        reviewContent.trim(),
        eligibility?.order_item_id
      );
      if (res?.success) {
        toast.success('Gửi đánh giá thành công! Cảm ơn bạn.');
        setReviewContent('');
        fetchReviews(product.product_id);
        fetchEligibility(product.product_id);
      } else {
        toast.error(res?.message || 'Không thể gửi đánh giá');
      }
    } catch (err) {
      toast.error(err?.message || 'Lỗi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <LoadingSpinner minHeight={450} message="Đang tải sản phẩm..." />;

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Không tìm thấy sản phẩm</Typography>
        <AppButton variant="primary" onClick={() => onNavigate('products')}>Quay lại danh mục</AppButton>
      </Container>
    );
  }

  const isWish = isInWishlist(product.product_id);
  const currentPrice = parseFloat(selectedVariant?.price || product.min_price || 0);
  const currentSalePrice = parseFloat(selectedVariant?.sale_price || product.min_sale_price || currentPrice);
  const currentStock = selectedVariant?.stock !== undefined ? selectedVariant.stock : 20;

  return (
    <Box sx={{ py: 3, pb: 6 }}>
      <Container maxWidth="lg">
        {/* Breadcrumb */}
        <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />} sx={{ mb: 2.5, fontSize: '0.875rem' }}>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate('home')}>Trang chủ</Link>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer', fontWeight: 600 }} onClick={() => onNavigate(`products?category=${product.category_slug}`)}>{product.category_name}</Link>
          <Typography color="text.primary" sx={{ fontWeight: 700 }}>{product.product_name}</Typography>
        </Breadcrumbs>

        {/* Main Showcase */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '5fr 7fr' },
            gap: 3.5,
            mb: 4,
          }}
        >
          {/* Left: Gallery */}
          <Box>
            <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF', position: 'relative', mb: 2 }}>
              <IconButton
                onClick={() => toggleWishlist(product.product_id, selectedVariant?.variant_id)}
                sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#FFF', boxShadow: 1, '&:hover': { bgcolor: '#FEE2E2' } }}
              >
                {isWish ? <FavoriteIcon sx={{ color: 'primary.main' }} /> : <FavoriteBorderIcon />}
              </IconButton>
              <Box sx={{ width: '100%', height: { xs: 260, sm: 360 }, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Box component="img" src={selectedImage || product.thumbnail_url} alt={product.product_name} sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </Box>
            </Paper>

            {gallery.length > 1 && (
              <Stack direction="row" spacing={1} sx={{ overflowX: 'auto', pb: 0.5 }}>
                {gallery.map((img, idx) => (
                  <Box
                    key={idx}
                    component="img"
                    src={img}
                    alt="thumbnail"
                    onClick={() => setSelectedImage(img)}
                    sx={{
                      width: 64,
                      height: 64,
                      p: 0.5,
                      borderRadius: 1.5,
                      cursor: 'pointer',
                      objectFit: 'contain',
                      bgcolor: '#FFF',
                      border: selectedImage === img ? '2px solid #E30019' : '1px solid #E2E8F0',
                    }}
                  />
                ))}
              </Stack>
            )}
          </Box>

          {/* Right: Info & Actions */}
          <Box>
            <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3.5 }, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                <Chip label={product.brand_name} size="small" sx={{ fontWeight: 800, bgcolor: '#FEE2E2', color: 'primary.main', height: 22 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>SKU: {selectedVariant?.sku || 'GEARK-PRO'}</Typography>
                <Chip
                  label={currentStock > 0 ? `Còn hàng (${currentStock})` : 'Hết hàng'}
                  size="small"
                  sx={{ height: 22, fontWeight: 700, bgcolor: currentStock > 0 ? '#D1FAE5' : '#FEE2E2', color: currentStock > 0 ? '#065F46' : '#991B1B' }}
                />
              </Box>

              <Typography variant="h5" component="h1" sx={{ fontWeight: 800, mb: 1.5, lineHeight: 1.3 }}>
                {product.product_name}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Rating value={parseFloat(product.avg_rating || 5.0)} precision={0.5} readOnly size="small" />
                <Typography variant="body2" sx={{ fontWeight: 800 }}>{parseFloat(product.avg_rating || 5.0).toFixed(1)}</Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>({reviews.length} đánh giá)</Typography>
              </Box>

              {/* Price */}
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FEF2F2', border: '1px solid #FECACA', mb: 2.5 }}>
                <PriceDisplay price={currentPrice} salePrice={currentSalePrice} size="large" />
              </Box>

              {/* Variants */}
              {product.variants?.length > 0 && (
                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>Phiên bản:</Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {product.variants.map((v) => {
                      const isSelected = selectedVariant?.variant_id === v.variant_id;
                      return (
                        <Chip
                          key={v.variant_id}
                          label={v.variant_name}
                          clickable
                          onClick={() => {
                            setSelectedVariant(v);
                            const pImg = v.images?.find((i) => i.is_primary === 1)?.image_url || v.images?.[0]?.image_url;
                            if (pImg) setSelectedImage(pImg);
                          }}
                          sx={{
                            fontWeight: 700,
                            borderRadius: 1.5,
                            border: isSelected ? '2px solid #E30019' : '1px solid #E2E8F0',
                            bgcolor: isSelected ? '#FEE2E2' : '#FFF',
                            color: isSelected ? 'primary.main' : 'text.primary',
                          }}
                        />
                      );
                    })}
                  </Stack>
                </Box>
              )}

              {/* Quantity */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Số lượng:</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: 1.5 }}>
                  <IconButton size="small" onClick={() => setQuantity((q) => Math.max(1, q - 1))} sx={{ p: 0.5 }}><RemoveIcon fontSize="small" /></IconButton>
                  <Typography variant="body2" sx={{ minWidth: 36, textAlign: 'center', fontWeight: 800 }}>{quantity}</Typography>
                  <IconButton size="small" onClick={() => setQuantity((q) => Math.min(currentStock || 99, q + 1))} sx={{ p: 0.5 }}><AddIcon fontSize="small" /></IconButton>
                </Box>
              </Box>

              {/* CTA Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                <AppButton variant="outline" size="large" fullWidth startIcon={<ShoppingCartIcon />} onClick={() => addToCart(selectedVariant?.variant_id, quantity)}>
                  Thêm vào giỏ
                </AppButton>
                <AppButton variant="primary" size="large" fullWidth glow startIcon={<FlashOnIcon />} onClick={handleBuyNow}>
                  Mua ngay
                </AppButton>
              </Stack>
            </Paper>
          </Box>
        </Box>

        {/* Specs & Description: Mô tả , Thông số kỹ thuật */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 3,
            mb: 4,
            alignItems: 'stretch',
          }}
        >
          {/* Cột trái: Mô tả sản phẩm */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Mô tả sản phẩm</Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8, whiteSpace: 'pre-line', flex: 1 }}>
              {product.description || 'Chưa có thông tin mô tả chi tiết.'}
            </Typography>
          </Paper>

          {/* Cột phải: Thông số kỹ thuật */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>Thông số kỹ thuật</Typography>
            <Table size="small">
              <TableBody>
                <TableRow><TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: '40%' }}>Thương hiệu</TableCell><TableCell>{product.brand_name}</TableCell></TableRow>
                <TableRow><TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Danh mục</TableCell><TableCell>{product.category_name}</TableCell></TableRow>
                <TableRow><TableCell sx={{ fontWeight: 700, color: 'text.secondary' }}>Bảo hành</TableCell><TableCell>{selectedVariant?.warranty_months || 24} tháng</TableCell></TableRow>
                {Object.entries(specifications).map(([key, val]) => (
                  <TableRow key={key}>
                    <TableCell sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'capitalize' }}>{key.replace('_', ' ')}</TableCell>
                    <TableCell>{String(val)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>

        {/* Reviews Section */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid #E2E8F0', bgcolor: '#FFF' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 2.5 }}>Đánh giá từ khách hàng ({reviews.length})</Typography>

          <Box sx={{ mb: 3 }}>
            {!user ? (
              <Alert severity="info" action={<AppButton variant="primary" size="small" onClick={() => openAuthModal('login')}>Đăng nhập</AppButton>}>
                Đăng nhập để đánh giá sản phẩm sau khi đã nhận hàng.
              </Alert>
            ) : eligibility?.already_reviewed ? (
              <Alert severity="success">Bạn đã đánh giá sản phẩm này. Cảm ơn phản hồi của bạn!</Alert>
            ) : eligibility && !eligibility.can_review ? (
              <Alert severity="warning">{eligibility.message || 'Chỉ khách hàng đã nhận hàng thành công mới có thể gửi nhận xét.'}</Alert>
            ) : (
              <Box component="form" onSubmit={handleSubmitReview} sx={{ bgcolor: '#F8FAFC', p: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>Đánh giá của bạn:</Typography>
                  <Rating value={ratingInput} onChange={(_, val) => setRatingInput(val)} />
                </Box>
                <Box sx={{ display: 'flex', gap: 1.5 }}>
                  <TextField fullWidth size="small" placeholder="Chia sẻ cảm nhận về sản phẩm..." value={reviewContent} onChange={(e) => setReviewContent(e.target.value)} />
                  <AppButton type="submit" variant="primary" loading={submittingReview} sx={{ flexShrink: 0 }}>Gửi</AppButton>
                </Box>
              </Box>
            )}
          </Box>

          <Divider sx={{ mb: 2 }} />

          {reviews.length === 0 ? (
            <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', py: 2 }}>
              Chưa có đánh giá nào cho sản phẩm này.
            </Typography>
          ) : (
            <Stack spacing={2} divider={<Divider />}>
              {reviews.map((rev) => (
                <Box key={rev.review_id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>{rev.full_name || 'Khách hàng'}</Typography>
                      <Chip icon={<CheckCircleIcon sx={{ fontSize: '13px !important', color: '#10B981 !important' }} />} label="Đã mua hàng" size="small" sx={{ height: 18, fontSize: '0.625rem', bgcolor: '#D1FAE5', color: '#065F46' }} />
                    </Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{formatDate(rev.created_at)}</Typography>
                  </Box>
                  <Rating value={rev.rating} readOnly size="small" sx={{ mb: 0.5 }} />
                  <Typography variant="body2" sx={{ color: 'text.primary' }}>{rev.content}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Paper>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;
