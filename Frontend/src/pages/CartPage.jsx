import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';

import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import SecurityIcon from '@mui/icons-material/Security';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';

import { useCart } from '../context/CartContext';
import { couponApi } from '../api/extraApi';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatters';
import { EmptyState } from '../components/ui/EmptyState';
import { AppButton } from '../components/ui/AppButton';

export const CartPage = ({ onNavigate }) => {
  const { cart, updateQuantity, removeItem, clearCart, cartTotal } = useCart();
  const toast = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  const itemsSubtotal = (cart.items || []).reduce((sum, item) => {
    const itemPrice = parseFloat(item.sale_price ?? item.price ?? 0);
    return sum + itemPrice * (Number(item.quantity) || 1);
  }, 0);

  const subtotal = (cartTotal && cartTotal > 0)
    ? cartTotal
    : (Number(cart.total_amount ?? cart.subtotal) || itemsSubtotal);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) {
      toast.warning('Vui lòng nhập mã giảm giá!');
      return;
    }
    setValidatingCoupon(true);
    try {
      const res = await couponApi.validateCoupon(couponCode.trim(), subtotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        toast.success(`Áp dụng mã ${couponCode.toUpperCase()} thành công!`);
      } else {
        toast.error(res.message || 'Mã giảm giá không hợp lệ');
      }
    } catch (err) {
      toast.error(err.message || 'Mã giảm giá không tồn tại hoặc đã hết hạn');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount || 0) : 0;
  const finalTotal = Math.max(0, subtotal - discountAmount);

  if (!cart.items || cart.items.length === 0) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <EmptyState
          icon={<ShoppingCartIcon />}
          title="Giỏ hàng của bạn đang trống"
          description="Hãy khám phá các thiết bị Gaming Gear đỉnh cao và thêm vào giỏ hàng nhé!"
          actionText="Tiếp tục mua sắm"
          onAction={() => onNavigate('products')}
        />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Page Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, pb: 2, borderBottom: '2px solid #E5E7EB' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase' }}>
            Giỏ hàng của bạn ({cart.items.length} món)
          </Typography>
          <Button
            size="small"
            startIcon={<DeleteOutlineIcon fontSize="small" />}
            onClick={clearCart}
            sx={{ color: 'error.main', fontWeight: 700 }}
          >
            Xóa toàn bộ giỏ
          </Button>
        </Box>

        <Grid container spacing={3.5}>
          {/* Cart Items List */}
          <Grid item xs={12} md={8}>
            <Paper elevation={1} sx={{ borderRadius: 3, border: '1px solid #E5E7EB', overflow: 'hidden' }}>
              <Stack divider={<Divider />}>
                {cart.items.map((item) => {
                  const unitPrice = parseFloat(item.sale_price || item.price || 0);
                  const originalUnitPrice = parseFloat(item.price || unitPrice);
                  const hasDiscount = originalUnitPrice > unitPrice;

                  return (
                    <Box
                      key={item.cart_item_id}
                      sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        flexWrap: { xs: 'wrap', sm: 'nowrap' },
                      }}
                    >
                      {/* Product Thumbnail */}
                      <Box
                        component="img"
                        src={item.thumbnail_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=200&q=80'}
                        alt={item.product_name}
                        onClick={() => onNavigate(`product/${item.slug}`)}
                        sx={{
                          width: 80,
                          height: 80,
                          objectFit: 'contain',
                          p: 0.5,
                          borderRadius: 2,
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#FFFFFF',
                          cursor: 'pointer',
                          flexShrink: 0,
                        }}
                      />

                      {/* Info */}
                      <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 0 } }}>
                        <Typography
                          variant="subtitle1"
                          onClick={() => onNavigate(`product/${item.slug}`)}
                          sx={{
                            fontWeight: 800,
                            cursor: 'pointer',
                            '&:hover': { color: 'primary.main' },
                          }}
                        >
                          {item.product_name}
                        </Typography>

                        {item.variant_name && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                            Phiên bản: {item.variant_name}
                          </Typography>
                        )}

                        <Chip
                          label="✓ Có sẵn tại kho GearK"
                          size="small"
                          sx={{
                            height: 20,
                            fontSize: '0.6875rem',
                            fontWeight: 700,
                            backgroundColor: '#D1FAE5',
                            color: '#065F46',
                            mt: 0.75,
                          }}
                        />
                      </Box>

                      {/* Quantity Stepper */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          border: '1px solid #E5E7EB',
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                          sx={{ p: 0.5, borderRadius: 0 }}
                        >
                          <RemoveIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="body2" sx={{ px: 1.5, fontWeight: 800, minWidth: 32, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                          sx={{ p: 0.5, borderRadius: 0 }}
                        >
                          <AddIcon fontSize="small" />
                        </IconButton>
                      </Box>

                      {/* Price Column */}
                      <Box sx={{ textAlign: 'right', minWidth: 110 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.main' }}>
                          {formatPrice(unitPrice * item.quantity)}
                        </Typography>
                        {hasDiscount && (
                          <Typography variant="caption" sx={{ color: 'text.disabled', textDecoration: 'line-through', display: 'block' }}>
                            {formatPrice(originalUnitPrice * item.quantity)}
                          </Typography>
                        )}
                      </Box>

                      {/* Delete */}
                      <IconButton
                        onClick={() => removeItem(item.cart_item_id)}
                        sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                        title="Xóa món này"
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  );
                })}
              </Stack>
            </Paper>

            <Box sx={{ mt: 2 }}>
              <Button
                variant="text"
                onClick={() => onNavigate('products')}
                sx={{ fontWeight: 700, color: 'text.secondary' }}
              >
                ← Tiếp tục lựa chọn sản phẩm khác
              </Button>
            </Box>
          </Grid>

          {/* Right Summary Box */}
          <Grid item xs={12} md={4}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                Tóm tắt đơn hàng
              </Typography>

              {/* Coupon Form */}
              <Box component="form" onSubmit={handleApplyCoupon} sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Mã Voucher (GEARK10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <AppButton
                  type="submit"
                  variant="primary"
                  size="small"
                  loading={validatingCoupon}
                  sx={{ flexShrink: 0 }}
                >
                  Áp dụng
                </AppButton>
              </Box>

              {/* Applied Coupon Display */}
              {appliedCoupon && (
                <Box
                  sx={{
                    p: 1.25,
                    px: 1.5,
                    borderRadius: 2,
                    backgroundColor: '#D1FAE5',
                    color: '#065F46',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocalOfferIcon fontSize="small" />
                    <Typography variant="caption" sx={{ fontWeight: 800 }}>
                      Đã áp dụng mã: {appliedCoupon.coupon_code}
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => setAppliedCoupon(null)}
                    sx={{ color: 'error.main', fontWeight: 800, minWidth: 'auto', p: 0 }}
                  >
                    Gỡ
                  </Button>
                </Box>
              )}

              {/* Summary Rows */}
              <Stack spacing={1.5} sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tạm tính:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {formatPrice(subtotal)}
                  </Typography>
                </Box>

                {appliedCoupon && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Giảm giá Voucher:
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      -{formatPrice(discountAmount)}
                    </Typography>
                  </Box>
                )}

                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Phí vận chuyển:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                    MIỄN PHÍ
                  </Typography>
                </Box>

                <Divider />

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    Tổng thanh toán:
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {formatPrice(finalTotal)}
                  </Typography>
                </Box>
              </Stack>

              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 3 }}>
                (Đã bao gồm thuế VAT 10% & miễn phí vận chuyển tận nơi)
              </Typography>

              <AppButton
                variant="primary"
                size="large"
                fullWidth
                glow
                onClick={() => onNavigate(appliedCoupon ? `checkout?coupon=${appliedCoupon.coupon_code}` : 'checkout')}
                sx={{ py: 1.5 }}
              >
                Tiến hành đặt hàng
              </AppButton>

              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mt: 2, color: 'text.secondary' }}>
                <SecurityIcon sx={{ fontSize: 18, color: 'success.main' }} />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  Thanh toán an toàn, bảo mật dữ liệu 100%
                </Typography>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default CartPage;
