import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';
import { reviewApi } from '../api/extraApi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatPrice, calculateDiscount, formatDate } from '../utils/formatters';
import Icons from '../components/common/Icons';

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

  // Fetch product detail by slug
  const fetchProduct = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    try {
      const res = await productApi.getProductBySlug(slug);
      if (res.success && res.data) {
        const prod = res.data;
        setProduct(prod);

        // Set default primary image
        const primaryImg =
          prod.images?.find((img) => img.is_primary)?.image_url ||
          prod.images?.[0]?.image_url ||
          prod.thumbnail_url;
        setSelectedImage(primaryImg);

        // Set default variant
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }

        // Fetch reviews
        if (prod.product_id) {
          fetchReviews(prod.product_id);
        }
      }
    } catch (err) {
      console.error('Lỗi tải chi tiết sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  }, [slug]);

  const fetchReviews = async (productId) => {
    try {
      const res = await reviewApi.getProductReviews(productId);
      if (res.success && res.data) {
        setReviews(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi tải reviews:', err);
    }
  };

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  // Handle Review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Vui lòng đăng nhập để gửi đánh giá sản phẩm!');
      openAuthModal('login');
      return;
    }
    if (!reviewContent.trim()) {
      toast.warning('Vui lòng nhập nội dung đánh giá!');
      return;
    }

    try {
      setSubmittingReview(true);
      const res = await reviewApi.createReview(
        product.product_id,
        ratingInput,
        reviewContent.trim()
      );
      if (res.success) {
        toast.success('Cảm ơn bạn! Đánh giá đã được ghi nhận.');
        setReviewContent('');
        fetchReviews(product.product_id);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi gửi đánh giá');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 16, color: '#6B7280' }}>
          Đang tải thông tin sản phẩm...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '80px 0' }}>
        <div className="empty-state">
          <Icons.Search size={54} className="empty-state-icon" />
          <h3 className="empty-state-title">Không tìm thấy sản phẩm</h3>
          <p className="empty-state-desc">Sản phẩm có thể đã ngừng kinh doanh hoặc đường dẫn không đúng.</p>
          <button
            onClick={() => onNavigate('products')}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            Quay lại trang sản phẩm
          </button>
        </div>
      </div>
    );
  }

  const currentPrice = selectedVariant
    ? parseFloat(selectedVariant.price)
    : parseFloat(product.min_price || 0);

  const currentSalePrice = selectedVariant
    ? parseFloat(selectedVariant.sale_price || selectedVariant.price)
    : parseFloat(product.min_sale_price || currentPrice);

  const discountPercent = calculateDiscount(currentPrice, currentSalePrice);
  const currentStock = selectedVariant ? selectedVariant.stock : product.total_stock;
  const isWish = isInWishlist(product.product_id);

  // Parse specifications
  let specificationsObj = {};
  if (selectedVariant?.specifications) {
    try {
      specificationsObj =
        typeof selectedVariant.specifications === 'string'
          ? JSON.parse(selectedVariant.specifications)
          : selectedVariant.specifications;
    } catch (e) {
      specificationsObj = { 'Thông tin': selectedVariant.specifications };
    }
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    await addToCart(selectedVariant.variant_id, quantity);
  };

  const handleBuyNow = async () => {
    if (!selectedVariant) return;
    const added = await addToCart(selectedVariant.variant_id, quantity, false);
    if (added) {
      onNavigate('checkout');
    }
  };

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          fontSize: 12.5,
          color: '#6B7280',
          padding: '16px 0 8px 0',
        }}
      >
        <span
          style={{ cursor: 'pointer', color: '#111827', fontWeight: 600 }}
          onClick={() => onNavigate('home')}
        >
          Trang chủ
        </span>
        <Icons.ChevronRight size={12} />
        <span
          style={{ cursor: 'pointer' }}
          onClick={() => onNavigate(`products?category=${product.category_slug}`)}
        >
          {product.category_name}
        </span>
        <Icons.ChevronRight size={12} />
        <span style={{ color: '#111827', fontWeight: 700 }}>{product.product_name}</span>
      </div>

      {/* Main Product Detail Grid */}
      <div className="product-detail-layout">
        {/* Left Gallery */}
        <div className="detail-gallery">
          <img
            src={selectedImage || product.thumbnail_url}
            alt={product.product_name}
            className="detail-main-img"
          />

          {/* Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="detail-thumbs-row">
              {product.images.map((img) => (
                <div
                  key={img.image_id}
                  className={`detail-thumb-item ${selectedImage === img.image_url ? 'active' : ''}`}
                  onClick={() => setSelectedImage(img.image_url)}
                >
                  <img src={img.image_url} alt={img.alt_text || 'gear thumb'} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Information */}
        <div className="detail-info">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <span
              style={{
                fontSize: 12,
                color: 'var(--primary)',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Thương hiệu: {product.brand_name}
            </span>

            <button
              onClick={() => toggleWishlist(product.product_id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12.5,
                fontWeight: 700,
                color: isWish ? 'var(--primary)' : '#6B7280',
                backgroundColor: isWish ? '#FEE2E2' : '#F3F4F6',
                padding: '6px 12px',
                borderRadius: 20,
              }}
            >
              <Icons.Heart size={16} filled={isWish} />
              <span>{isWish ? 'Đã yêu thích' : 'Yêu thích'}</span>
            </button>
          </div>

          <h1 className="detail-title">{product.product_name}</h1>

          <div className="detail-meta-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div className="star-rating">
                <Icons.Star size={14} filled={true} />
              </div>
              <span style={{ fontWeight: 800, color: '#111827' }}>
                {parseFloat(product.avg_rating || 5.0).toFixed(1)}
              </span>
              <span>({reviews.length} đánh giá)</span>
            </div>
            <span>•</span>
            <span>Mã SKU: <strong>{selectedVariant?.sku || 'GEARK-PRO'}</strong></span>
            <span>•</span>
            <span style={{ color: currentStock > 0 ? '#10B981' : '#EF4444', fontWeight: 700 }}>
              {currentStock > 0 ? `Còn hàng (${currentStock} sản phẩm)` : 'Hết hàng'}
            </span>
          </div>

          {/* Pricing Box */}
          <div className="detail-price-box">
            <span className="detail-sale-price">{formatPrice(currentSalePrice)}</span>
            {discountPercent > 0 && (
              <>
                <span className="detail-orig-price">{formatPrice(currentPrice)}</span>
                <span className="detail-discount-tag">Tiết kiệm {discountPercent}%</span>
              </>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="variant-group">
              <label className="variant-label">
                Chọn phiên bản / cấu hình:
              </label>
              <div className="variant-options">
                {product.variants.map((v) => (
                  <button
                    key={v.variant_id}
                    className={`variant-pill ${selectedVariant?.variant_id === v.variant_id ? 'active' : ''}`}
                    onClick={() => setSelectedVariant(v)}
                  >
                    {v.variant_name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#374151' }}>Số lượng:</span>
            <div className="quantity-control">
              <button
                className="quantity-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                <Icons.Minus size={14} />
              </button>
              <input
                className="quantity-input"
                readOnly
                value={quantity}
              />
              <button
                className="quantity-btn"
                onClick={() => setQuantity((q) => Math.min(currentStock || 99, q + 1))}
              >
                <Icons.Plus size={14} />
              </button>
            </div>
          </div>

          {/* Promotions Box */}
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 8,
              padding: 14,
              marginTop: 20,
              fontSize: 12.5,
              color: '#92400E',
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Icons.Tag size={16} />
              KHUYẾN MÃI & QUÀ TẶNG KÈM THEO:
            </div>
            <ul style={{ paddingLeft: 18, lineHeight: 1.6 }}>
              <li>Nhập mã <strong>GEARK10</strong> giảm ngay 10% cho đơn hàng</li>
              <li>Tặng gói bảo dưỡng, vệ sinh switch miễn phí trọn đời</li>
              <li>Hỗ trợ trả góp lãi suất 0% qua thẻ tín dụng và CCCD</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="detail-actions">
            <button
              className="btn-add-detail"
              onClick={handleAddToCart}
            >
              <Icons.ShoppingCart size={18} />
              THÊM VÀO GIỎ
            </button>
            <button
              className="btn-buy-now"
              onClick={handleBuyNow}
            >
              MUA NGAY (GIAO TẬN NƠI)
            </button>
          </div>
        </div>
      </div>

      {/* Product Description & Tech Specs */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 28,
          marginBottom: 36,
        }}
      >
        {/* Description */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid var(--border-light)',
            padding: 24,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, color: '#111827' }}>
            Đặc điểm nổi bật & Mô tả sản phẩm
          </h3>
          <p style={{ fontSize: 14, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-line' }}>
            {product.description}
          </p>
        </div>

        {/* Specifications Table */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px solid var(--border-light)',
            padding: 24,
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <h3 style={{ fontSize: 18, fontWeight: 800, marginBottom: 14, color: '#111827' }}>
            Thông số kỹ thuật chi tiết
          </h3>
          <table className="spec-table">
            <tbody>
              <tr>
                <td>Thương hiệu</td>
                <td>{product.brand_name}</td>
              </tr>
              <tr>
                <td>Danh mục</td>
                <td>{product.category_name}</td>
              </tr>
              <tr>
                <td>Bảo hành</td>
                <td>{selectedVariant?.warranty_months || 24} tháng (Chính hãng)</td>
              </tr>
              {Object.entries(specificationsObj).map(([key, val]) => (
                <tr key={key}>
                  <td style={{ textTransform: 'capitalize' }}>{key.replace('_', ' ')}</td>
                  <td>{String(val)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section className="reviews-section">
        <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 20 }}>
          Đánh giá từ khách hàng ({reviews.length})
        </h3>

        <div className="reviews-summary">
          <div className="reviews-score">
            <div className="score-num">{parseFloat(product.avg_rating || 5.0).toFixed(1)}</div>
            <div className="star-rating" style={{ justifyContent: 'center', margin: '4px 0' }}>
              {[1, 2, 3, 4, 5].map((s) => (
                <Icons.Star key={s} size={18} filled={true} />
              ))}
            </div>
            <div style={{ fontSize: 12, color: '#6B7280' }}>Dựa trên {reviews.length} đánh giá thực tế</div>
          </div>

          {/* Write a review form */}
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, marginBottom: 8 }}>
              Gửi nhận xét của bạn về sản phẩm này
            </h4>
            <form onSubmit={handleSubmitReview}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 13, color: '#4B5563' }}>Chọn số sao:</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingInput(star)}
                      style={{ color: star <= ratingInput ? '#F59E0B' : '#D1D5DB' }}
                    >
                      <Icons.Star size={20} filled={star <= ratingInput} />
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 10 }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={user ? "Cảm nhận của bạn về độ mượt, switch, sensor...?" : "Vui lòng đăng nhập để đánh giá..."}
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  disabled={!user}
                />
                <button
                  type="submit"
                  disabled={submittingReview}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    padding: '0 20px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 13,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {submittingReview ? 'Đang gửi...' : 'Gửi nhận xét'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Reviews List */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {reviews.length === 0 ? (
            <p style={{ color: '#6B7280', fontSize: 13.5, textAlign: 'center', padding: '20px 0' }}>
              Chưa có nhận xét nào. Hãy là người đầu tiên chia sẻ cảm nhận về chiếc gear này nhé!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.review_id} className="review-item">
                <div className="review-author">
                  <span>{rev.full_name || 'Khách hàng GearK'}</span>
                  <span className="review-badge">✓ Đã mua hàng tại GearK</span>
                  <span style={{ fontSize: 11.5, color: '#9CA3AF', fontWeight: 400, marginLeft: 'auto' }}>
                    {formatDate(rev.created_at)}
                  </span>
                </div>
                <div className="star-rating" style={{ margin: '4px 0' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icons.Star key={s} size={13} filled={s <= rev.rating} />
                  ))}
                </div>
                <p className="review-text">{rev.content}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
