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
  const [eligibility, setEligibility] = useState(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Check review eligibility
  const fetchEligibility = useCallback(async (productId) => {
    if (!user || !productId) {
      setEligibility(null);
      return;
    }
    setCheckingEligibility(true);
    try {
      const res = await reviewApi.checkEligibility(productId);
      if (res && res.data) {
        setEligibility(res.data);
      }
    } catch (err) {
      console.error('Lỗi kiểm tra quyền đánh giá:', err);
    } finally {
      setCheckingEligibility(false);
    }
  }, [user]);

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

        // Fetch reviews & eligibility
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
  }, [slug, fetchEligibility]);

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

  useEffect(() => {
    if (product?.product_id) {
      fetchEligibility(product.product_id);
    }
  }, [user, product?.product_id, fetchEligibility]);

  // Handle Review submission
  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.info('Vui lòng đăng nhập để gửi đánh giá sản phẩm!');
      openAuthModal('login');
      return;
    }
    if (eligibility && !eligibility.can_review) {
      toast.warning(eligibility.message || 'Bạn chưa đủ điều kiện gửi đánh giá cho sản phẩm này.');
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
        reviewContent.trim(),
        eligibility?.order_item_id
      );
      if (res.success) {
        toast.success('Cảm ơn bạn! Đánh giá đã được ghi nhận.');
        setReviewContent('');
        fetchReviews(product.product_id);
        fetchEligibility(product.product_id);
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

          {/* Thumbnails Row (Combining Variant Images & Product Images) */}
          {(() => {
            const allGalleryImages = [];
            const seenUrls = new Set();

            if (selectedVariant?.images && selectedVariant.images.length > 0) {
              selectedVariant.images.forEach((img) => {
                const url = typeof img === 'string' ? img : img.image_url;
                if (url && !seenUrls.has(url)) {
                  seenUrls.add(url);
                  allGalleryImages.push({
                    image_url: url,
                    alt_text: selectedVariant.variant_name,
                    is_variant_img: true,
                  });
                }
              });
            }

            if (product.images && product.images.length > 0) {
              product.images.forEach((img) => {
                const url = typeof img === 'string' ? img : img.image_url;
                if (url && !seenUrls.has(url)) {
                  seenUrls.add(url);
                  allGalleryImages.push({
                    image_url: url,
                    alt_text: img.alt_text || product.product_name,
                  });
                }
              });
            }

            if (allGalleryImages.length === 0 && product.thumbnail_url) {
              allGalleryImages.push({ image_url: product.thumbnail_url, alt_text: product.product_name });
            }

            return allGalleryImages.length > 1 ? (
              <div className="detail-thumbs-row">
                {allGalleryImages.map((img, i) => (
                  <div
                    key={i}
                    className={`detail-thumb-item ${selectedImage === img.image_url ? 'active' : ''}`}
                    onClick={() => setSelectedImage(img.image_url)}
                  >
                    <img src={img.image_url} alt={img.alt_text || 'gear thumb'} />
                  </div>
                ))}
              </div>
            ) : null;
          })()}
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
              onClick={() => toggleWishlist(product.product_id, selectedVariant?.variant_id)}
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
                    onClick={() => {
                      setSelectedVariant(v);
                      if (v.images && v.images.length > 0) {
                        const primaryVarImg = v.images.find((img) => img.is_primary === 1)?.image_url || v.images[0]?.image_url;
                        if (primaryVarImg) setSelectedImage(primaryVarImg);
                      }
                    }}
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
            {!user ? (
              <div
                style={{
                  backgroundColor: '#F9FAFB',
                  border: '1.5px dashed var(--border-light)',
                  borderRadius: 8,
                  padding: '20px 24px',
                  textAlign: 'center',
                }}
              >
                <Icons.ShieldCheck size={28} style={{ color: 'var(--primary)', margin: '0 auto 8px auto' }} />
                <h4 style={{ fontSize: 14, fontWeight: 800, marginBottom: 4 }}>
                  Đăng nhập để đánh giá sản phẩm
                </h4>
                <p style={{ fontSize: 12.5, color: '#6B7280', marginBottom: 12 }}>
                  Theo chính sách đánh giá thực tế của GearK, chỉ khách hàng đã mua và nhận hàng thành công mới có thể gửi nhận xét.
                </p>
                <button
                  type="button"
                  onClick={() => openAuthModal('login')}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : checkingEligibility ? (
              <div style={{ padding: 20, textAlign: 'center', color: '#6B7280', fontSize: 13 }}>
                Đang kiểm tra trạng thái đơn mua của bạn...
              </div>
            ) : eligibility?.already_reviewed ? (
              <div
                style={{
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  borderRadius: 8,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#10B981', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icons.Check size={20} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, color: '#065F46', fontSize: 13.5 }}>
                    Bạn đã đánh giá sản phẩm này!
                  </div>
                  <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                    Cảm ơn bạn đã đóng góp trải nghiệm thực tế để giúp cộng đồng game thủ GearK lựa chọn sản phẩm phù hợp.
                  </div>
                </div>
              </div>
            ) : eligibility && !eligibility.can_review ? (
              <div
                style={{
                  backgroundColor: '#FEF3C7',
                  border: '1px solid #FCD34D',
                  borderRadius: 8,
                  padding: '16px 20px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <Icons.AlertCircle size={22} style={{ color: '#D97706', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontWeight: 800, color: '#92400E', fontSize: 13.5 }}>
                    Điều kiện gửi đánh giá sản phẩm
                  </div>
                  <div style={{ fontSize: 12.5, color: '#78350F', marginTop: 4, lineHeight: 1.4 }}>
                    {eligibility.message || 'Chỉ khách hàng đã mua và nhận hàng thành công tại GearK mới có thể gửi nhận xét.'}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>
                    Gửi nhận xét của bạn về sản phẩm này
                  </h4>
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: '#059669',
                      backgroundColor: '#ECFDF5',
                      padding: '3px 8px',
                      borderRadius: 4,
                    }}
                  >
                    ✓ Đã mua hàng thành công
                  </span>
                </div>
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
                      placeholder="Cảm nhận thực tế của bạn về độ mượt, switch, cảm biến...?"
                      value={reviewContent}
                      onChange={(e) => setReviewContent(e.target.value)}
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
            )}
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
