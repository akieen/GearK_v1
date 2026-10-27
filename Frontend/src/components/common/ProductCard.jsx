import React from 'react';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Rating from '@mui/material/Rating';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';

import { useCart } from '../../context/CartContext';
import { PriceDisplay } from '../ui/PriceDisplay';
import { AppButton } from '../ui/AppButton';

export const ProductCard = ({ product, onNavigate }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();

  const originalPrice = parseFloat(product.min_price || product.price || 0);
  const salePrice = parseFloat(product.min_sale_price || product.sale_price || originalPrice);
  const isWish = isInWishlist(product.product_id);

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    if (product.variant_id) {
      await addToCart(product.variant_id, 1);
    } else {
      onNavigate(`product/${product.slug}`);
    }
  };

  const handleWishlistClick = (e) => {
    e.stopPropagation();
    toggleWishlist(product.product_id);
  };

  return (
    <Card
      onClick={() => onNavigate(`product/${product.slug}`)}
      sx={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        cursor: 'pointer',
        borderRadius: 2.5,
        border: '1px solid #E5E7EB',
        backgroundColor: '#FFFFFF',
        transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        overflow: 'hidden',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 24px rgba(0, 0, 0, 0.08)',
          borderColor: 'rgba(227, 0, 25, 0.3)',
          '& .product-thumb-img': {
            transform: 'scale(1.05)',
          },
        },
      }}
    >
      {/* Thumbnail Container (Fixed 190px Height) */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: 190,
          backgroundColor: '#FAFAFA',
          overflow: 'hidden',
          borderBottom: '1px solid #F3F4F6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 1.5,
        }}
      >
        <CardMedia
          component="img"
          className="product-thumb-img"
          image={
            product.thumbnail_url ||
            'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80'
          }
          alt={product.product_name}
          loading="lazy"
          sx={{
            maxHeight: '100%',
            maxWidth: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            transition: 'transform 0.35s ease',
          }}
        />

        {/* Wishlist Button */}
        <IconButton
          onClick={handleWishlistClick}
          size="small"
          aria-label={isWish ? 'Bỏ thích' : 'Yêu thích'}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(4px)',
            color: isWish ? '#E30019' : '#9CA3AF',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.08)',
            '&:hover': {
              backgroundColor: '#FFFFFF',
              color: '#E30019',
              transform: 'scale(1.1)',
            },
          }}
        >
          {isWish ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
        </IconButton>
      </Box>

      {/* Product Content (Uniform Height Flex Container) */}
      <CardContent
        sx={{
          p: 2,
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          '&:last-child': { pb: 2 },
        }}
      >
        {/* Top Info: Brand, Title, Price */}
        <Box>
          {/* Brand slot (Fixed height to prevent misalignment when brand is absent) */}
          <Typography
            variant="caption"
            sx={{
              fontWeight: 800,
              color: 'text.secondary',
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              mb: 0.5,
              fontSize: '0.7rem',
              display: 'block',
              minHeight: '1.25em',
              lineHeight: '1.25em',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
            }}
          >
            {product.brand_name || '\u00A0'}
          </Typography>

          {/* Product Title (Strict 2-line clamp with exact fixed height) */}
          <Typography
            variant="subtitle2"
            component="h4"
            sx={{
              fontWeight: 700,
              color: 'text.primary',
              lineHeight: 1.35,
              fontSize: '0.84375rem',
              mb: 1,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              height: '2.7em',
              '&:hover': {
                color: 'primary.main',
              },
            }}
            title={product.product_name}
          >
            {product.product_name}
          </Typography>

          {/* Price Container (Consistent height whether there is a discount or not) */}
          <Box
            sx={{
              minHeight: 46,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              mb: 1,
            }}
          >
            <PriceDisplay
              price={originalPrice}
              salePrice={salePrice}
              size="medium"
            />
          </Box>
        </Box>

        {/* Bottom Info: Rating and Add-to-cart button */}
        <Box sx={{ mt: 'auto', pt: 0.5 }}>
          {/* Rating */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 0.75,
              mb: 1.5,
              minHeight: 20,
            }}
          >
            <Rating
              value={parseFloat(product.avg_rating || 5.0)}
              precision={0.5}
              readOnly
              size="small"
              sx={{ fontSize: '0.875rem' }}
            />
            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              {parseFloat(product.avg_rating || 5.0).toFixed(1)}
            </Typography>
            {product.review_count > 0 && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                ({product.review_count})
              </Typography>
            )}
          </Box>

          {/* Action Button */}
          <AppButton
            variant="outline"
            fullWidth
            size="small"
            startIcon={<ShoppingCartIcon sx={{ fontSize: '0.9375rem' }} />}
            onClick={handleQuickAdd}
            sx={{
              py: 0.75,
              fontSize: '0.8125rem',
            }}
          >
            Thêm vào giỏ
          </AppButton>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
