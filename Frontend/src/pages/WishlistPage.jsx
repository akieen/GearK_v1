import React from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import FavoriteIcon from '@mui/icons-material/Favorite';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { AppButton } from '../components/ui/AppButton';

export const WishlistPage = ({ onNavigate }) => {
  const { wishlistItems, wishlistCount } = useCart();
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <EmptyState
          icon={<FavoriteIcon />}
          title="Vui lòng đăng nhập"
          description="Đăng nhập tài khoản để xem và quản lý danh sách Gaming Gear yêu thích của bạn."
          actionText="Đăng nhập ngay"
          onAction={() => openAuthModal('login')}
        />
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Header */}
        <Box sx={{ mb: 4, pb: 2, borderBottom: '2px solid #E5E7EB' }}>
          <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', color: 'text.primary' }}>
            Danh sách yêu thích ({wishlistCount})
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Những món Gaming Gear bạn đã lưu lại để săn sale và mua sắm sau.
          </Typography>
        </Box>

        {wishlistItems.length === 0 ? (
          <EmptyState
            icon={<FavoriteIcon />}
            title="Danh sách yêu thích đang trống"
            description="Nhấp vào biểu tượng trái tim ở các sản phẩm để lưu lại những món bạn ưng ý nhất!"
            actionText="Khám phá Gaming Gear ngay"
            onAction={() => onNavigate('products')}
          />
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
              },
              gap: 2.5,
            }}
          >
            {wishlistItems.map((prod) => (
              <ProductCard key={prod.product_id} product={prod} onNavigate={onNavigate} />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default WishlistPage;
