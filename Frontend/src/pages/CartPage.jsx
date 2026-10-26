import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { couponApi } from '../api/extraApi';
import { useToast } from '../context/ToastContext';
import { formatPrice } from '../utils/formatters';
import Icons from '../components/common/Icons';

export const CartPage = ({ onNavigate }) => {
  const { cart, updateQuantity, removeItem, clearCart, cartTotal } = useCart();
  const toast = useToast();

  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Compute subtotal with fallback to items calculation
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
      <div className="container" style={{ padding: '60px 0' }}>
        <div className="empty-state">
          <Icons.ShoppingCart size={64} className="empty-state-icon" />
          <h2 className="empty-state-title">Giỏ hàng của bạn đang trống</h2>
          <p className="empty-state-desc">
            Hãy khám phá các thiết bị Gaming Gear đỉnh cao và thêm vào giỏ hàng nhé!
          </p>
          <button
            onClick={() => onNavigate('products')}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '12px 28px',
              borderRadius: 8,
              fontWeight: 800,
              fontSize: 14,
            }}
          >
            TIẾP TỤC MUA SẮM
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 0 16px 0',
          borderBottom: '2px solid var(--border-light)',
        }}
      >
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>
          GIỎ HÀNG CỦA BẠN ({cart.items.length} món)
        </h2>
        <button
          onClick={clearCart}
          style={{
            fontSize: 12.5,
            color: '#EF4444',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <Icons.Trash2 size={14} />
          Xóa toàn bộ giỏ
        </button>
      </div>

      <div className="cart-layout">
        {/* Cart Items List */}
        <div className="cart-card">
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {cart.items.map((item) => (
              <div key={item.cart_item_id} className="cart-item">
                <img
                  src={item.thumbnail_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=200&q=80'}
                  alt={item.product_name}
                  className="cart-item-thumb"
                />

                <div>
                  <h4
                    className="cart-item-title"
                    style={{ cursor: 'pointer' }}
                    onClick={() => onNavigate(`product/${item.slug}`)}
                  >
                    {item.product_name}
                  </h4>
                  {item.variant_name && (
                    <div className="cart-item-variant">Bản: {item.variant_name}</div>
                  )}
                  <div style={{ fontSize: 11.5, color: '#10B981', fontWeight: 600, marginTop: 4 }}>
                    ✓ Có sẵn tại kho GearK
                  </div>
                </div>

                <div className="quantity-control">
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity - 1)}
                  >
                    <Icons.Minus size={14} />
                  </button>
                  <input className="quantity-input" readOnly value={item.quantity} />
                  <button
                    className="quantity-btn"
                    onClick={() => updateQuantity(item.cart_item_id, item.quantity + 1)}
                  >
                    <Icons.Plus size={14} />
                  </button>
                </div>

                <div className="cart-item-price" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
                  <span>{formatPrice((parseFloat(item.sale_price || item.price) || 0) * item.quantity)}</span>
                  {item.sale_price && parseFloat(item.sale_price) < parseFloat(item.price) && (
                    <span style={{ fontSize: 11.5, color: '#9CA3AF', textDecoration: 'line-through', fontWeight: 500 }}>
                      {formatPrice((parseFloat(item.price) || 0) * item.quantity)}
                    </span>
                  )}
                </div>

                <button
                  onClick={() => removeItem(item.cart_item_id)}
                  style={{ color: '#9CA3AF', padding: 6 }}
                  title="Xóa món này"
                >
                  <Icons.Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary & Coupon */}
        <div className="cart-summary-box">
          <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 16, color: '#111827' }}>
            Tóm tắt đơn hàng
          </h3>

          {/* Coupon Input Form */}
          <form className="coupon-form" onSubmit={handleApplyCoupon}>
            <input
              type="text"
              className="coupon-input"
              placeholder="Mã giảm giá (VD: GEARK10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
            <button
              type="submit"
              className="coupon-btn"
              disabled={validatingCoupon}
            >
              {validatingCoupon ? 'Kiểm tra...' : 'Áp dụng'}
            </button>
          </form>

          {appliedCoupon && (
            <div
              style={{
                backgroundColor: '#D1FAE5',
                color: '#065F46',
                padding: '8px 12px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 14,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <span>✓ Đã áp dụng mã: {appliedCoupon.coupon_code}</span>
              <button
                onClick={() => setAppliedCoupon(null)}
                style={{ color: '#EF4444', fontWeight: 800 }}
              >
                Gỡ
              </button>
            </div>
          )}

          <div className="summary-row">
            <span>Tạm tính:</span>
            <span style={{ fontWeight: 700 }}>{formatPrice(subtotal)}</span>
          </div>

          {appliedCoupon && (
            <div className="summary-row" style={{ color: '#10B981' }}>
              <span>Giảm giá Voucher:</span>
              <span style={{ fontWeight: 700 }}>-{formatPrice(discountAmount)}</span>
            </div>
          )}

          <div className="summary-row">
            <span>Phí vận chuyển:</span>
            <span style={{ color: '#10B981', fontWeight: 700 }}>MIỄN PHÍ</span>
          </div>

          <div className="summary-row total">
            <span>Tổng thanh toán:</span>
            <span>{formatPrice(finalTotal)}</span>
          </div>

          <p style={{ fontSize: 11.5, color: '#6B7280', marginTop: 10 }}>
            (Đã bao gồm thuế VAT 10% & phí giao hàng tận nhà)
          </p>

          <button
            className="btn-checkout"
            onClick={() => onNavigate(appliedCoupon ? `checkout?coupon=${appliedCoupon.coupon_code}` : 'checkout')}
          >
            TIẾN HÀNH ĐẶT HÀNG
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              marginTop: 14,
              fontSize: 12,
              color: '#6B7280',
            }}
          >
            <Icons.ShieldCheck size={16} style={{ color: '#10B981' }} />
            <span>Thanh toán an toàn, bảo mật 100%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
