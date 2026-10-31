import React from 'react';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import CloseIcon from '@mui/icons-material/Close';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DeleteOutlineIcon from '@mui/icons-material/Delete';

import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import { AppButton } from '../ui/AppButton';

export const CartDrawer = ({ onNavigate }) => {
  const {
    cart,
    isCartDrawerOpen,
    setIsCartDrawerOpen,
    updateQuantity,
    removeItem,
    cartTotal,
    cartCount,
  } = useCart();

  const handleGoToCart = () => {
    setIsCartDrawerOpen(false);
    onNavigate('cart');
  };

  const handleGoToCheckout = () => {
    setIsCartDrawerOpen(false);
    onNavigate('checkout');
  };

  return (
    <Drawer
      anchor="right"
      open={isCartDrawerOpen}
      onClose={() => setIsCartDrawerOpen(false)}
      restoreFocus={false}
      disableRestoreFocus
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #E5E7EB',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
          <ShoppingCartIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Giỏ hàng của bạn ({cartCount})
          </Typography>
        </Box>
        <IconButton
          onClick={() => setIsCartDrawerOpen(false)}
          size="small"
          sx={{ color: 'text.secondary' }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* Body */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {!cart.items || cart.items.length === 0 ? (
          <Box
            sx={{
              py: 8,
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <ShoppingCartIcon sx={{ fontSize: 64, color: 'text.disabled', opacity: 0.5 }} />
            <Typography variant="h6" sx={{ fontWeight: 700 }}>
              Giỏ hàng chưa có sản phẩm
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Hãy chọn những món Gaming Gear đỉnh cao nhé!
            </Typography>
            <AppButton
              variant="primary"
              size="small"
              onClick={() => {
                setIsCartDrawerOpen(false);
                onNavigate('products');
              }}
              sx={{ mt: 2 }}
            >
              Khám phá sản phẩm
            </AppButton>
          </Box>
        ) : (
          <Stack spacing={2} divider={<Divider />}>
            {cart.items.map((item) => (
              <Box
                key={item.cart_item_id}
                sx={{
                  display: 'flex',
                  gap: 1.5,
                  alignItems: 'flex-start',
                }}
              >
                {/* Thumbnail */}
                <Box
                  component="img"
                  src={
                    item.thumbnail_url ||
                    'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=200&q=80'
                  }
                  alt={item.product_name}
                  sx={{
                    width: 70,
                    height: 70,
                    objectFit: 'contain',
                    borderRadius: 2,
                    border: '1px solid #E5E7EB',
                    p: 0.5,
                    backgroundColor: '#FFFFFF',
                    flexShrink: 0,
                  }}
                />

                {/* Details */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.product_name}
                  >
                    {item.product_name}
                  </Typography>

                  {item.variant_name && (
                    <Typography
                      variant="caption"
                      sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}
                    >
                      Bản: {item.variant_name}
                    </Typography>
                  )}

                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 800,
                      color: 'primary.main',
                      mt: 0.5,
                    }}
                  >
                    {formatPrice(item.sale_price || item.price)}
                  </Typography>

                  {/* Quantity and Remove */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mt: 1,
                    }}
                  >
                    {/* Stepper */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #E5E7EB',
                        borderRadius: 1.5,
                        overflow: 'hidden',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                        sx={{ p: 0.5, borderRadius: 0 }}
                      >
                        <RemoveIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography
                        variant="caption"
                        sx={{
                          px: 1.5,
                          fontWeight: 700,
                          minWidth: 28,
                          textAlign: 'center',
                        }}
                      >
                        {item.quantity}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                        sx={{ p: 0.5, borderRadius: 0 }}
                      >
                        <AddIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    </Box>

                    {/* Remove */}
                    <IconButton
                      size="small"
                      onClick={() => removeItem(item.cart_item_id)}
                      sx={{ color: 'text.disabled', '&:hover': { color: 'error.main' } }}
                      title="Xóa khỏi giỏ"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      {cart.items && cart.items.length > 0 && (
        <Box
          sx={{
            p: 2.5,
            borderTop: '1px solid #E5E7EB',
            backgroundColor: '#FAFAFA',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Tạm tính:
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
              {formatPrice(cartTotal)}
            </Typography>
          </Box>

          <Stack spacing={1.25}>
            <AppButton
              variant="primary"
              fullWidth
              size="large"
              glow
              onClick={handleGoToCheckout}
            >
              Tiến hành thanh toán
            </AppButton>
            <AppButton
              variant="outline"
              fullWidth
              size="medium"
              onClick={handleGoToCart}
            >
              Xem chi tiết giỏ hàng
            </AppButton>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
};

export default CartDrawer;
