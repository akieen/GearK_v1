import React from 'react';
import { formatPrice, calculateDiscount } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import Icons from './Icons';

export const ProductCard = ({ product, onNavigate }) => {
  const { addToCart, isInWishlist, toggleWishlist } = useCart();

  const originalPrice = parseFloat(product.min_price || product.price || 0);
  const salePrice = parseFloat(product.min_sale_price || product.sale_price || originalPrice);
  const discountPercent = calculateDiscount(originalPrice, salePrice);
  const isWish = isInWishlist(product.product_id);

  const handleQuickAdd = async (e) => {
    e.stopPropagation();
    // If the product has multiple variants or no variant info, open product detail
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
    <div
      className="product-card"
      onClick={() => onNavigate(`product/${product.slug}`)}
      style={{ cursor: 'pointer' }}
    >
      <div className="product-thumb-wrapper">
        <img
          src={product.thumbnail_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=400&q=80'}
          alt={product.product_name}
          className="product-thumb"
          loading="lazy"
        />

        {discountPercent > 0 && (
          <span className="product-badge-discount">-{discountPercent}%</span>
        )}

        <button
          className={`product-wishlist-btn ${isWish ? 'active' : ''}`}
          onClick={handleWishlistClick}
          title={isWish ? 'Bỏ thích' : 'Yêu thích'}
        >
          <Icons.Heart size={16} filled={isWish} />
        </button>
      </div>

      <div className="product-info">
        {product.brand_name && (
          <span className="product-brand">{product.brand_name}</span>
        )}

        <h4 className="product-title" title={product.product_name}>
          {product.product_name}
        </h4>

        <div className="product-pricing">
          <span className="product-sale-price">{formatPrice(salePrice)}</span>
          {discountPercent > 0 && (
            <span className="product-original-price">{formatPrice(originalPrice)}</span>
          )}
        </div>

        <div className="product-rating-row">
          <div className="star-rating">
            <Icons.Star size={13} filled={true} />
          </div>
          <span>{parseFloat(product.avg_rating || 5.0).toFixed(1)}</span>
       </div>

        <div className="product-card-actions">
          <button
            className="btn-add-cart"
            onClick={handleQuickAdd}
          >
            <Icons.ShoppingCart size={14} />
            Thêm vào giỏ
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
