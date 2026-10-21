import React from 'react';
import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatters';
import Icons from './Icons';

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

  if (!isCartDrawerOpen) return null;

  return (
    <div className="drawer-overlay" onClick={() => setIsCartDrawerOpen(false)}>
      <div className="drawer-content" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Icons.ShoppingCart size={22} style={{ color: 'var(--primary)' }} />
            <h3 style={{ fontSize: 17, fontWeight: 800 }}>
              Giỏ hàng của bạn ({cartCount})
            </h3>
          </div>
          <button
            onClick={() => setIsCartDrawerOpen(false)}
            style={{ color: '#6B7280', padding: 4 }}
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="drawer-body">
          {(!cart.items || cart.items.length === 0) ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: '#6B7280' }}>
              <Icons.ShoppingCart size={48} style={{ margin: '0 auto 12px auto', opacity: 0.4 }} />
              <p style={{ fontWeight: 700, fontSize: 15, color: '#111827' }}>Giỏ hàng chưa có sản phẩm</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Hãy chọn những món Gaming Gear yêu thích nhé!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {cart.items.map((item) => (
                <div
                  key={item.cart_item_id}
                  style={{
                    display: 'flex',
                    gap: 12,
                    paddingBottom: 14,
                    borderBottom: '1px solid var(--border-subtle)',
                    alignItems: 'center',
                  }}
                >
                  <img
                    src={item.thumbnail_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=200&q=80'}
                    alt={item.product_name}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: 'contain',
                      borderRadius: 6,
                      border: '1px solid var(--border-light)',
                      backgroundColor: '#fff',
                      padding: 4,
                    }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                      title={item.product_name}
                    >
                      {item.product_name}
                    </div>
                    {item.variant_name && (
                      <div style={{ fontSize: 11.5, color: '#6B7280', marginTop: 2 }}>
                        Bản: {item.variant_name}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
                      <span style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 13.5 }}>
                        {formatPrice(item.price)}
                      </span>
                      <div className="quantity-control" style={{ transform: 'scale(0.85)', transformOrigin: 'right center' }}>
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
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.cart_item_id)}
                    style={{ color: '#9CA3AF', padding: 4 }}
                    title="Xóa sản phẩm"
                  >
                    <Icons.Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items && cart.items.length > 0 && (
          <div className="drawer-footer">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 14, color: '#4B5563', fontWeight: 600 }}>Tạm tính:</span>
              <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>
                {formatPrice(cartTotal)}
              </span>
            </div>
            <p style={{ fontSize: 11.5, color: '#6B7280', marginBottom: 14 }}>
              * Miễn phí giao hàng toàn quốc cho đơn từ 500.000₫
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  onNavigate('cart');
                }}
                style={{
                  flex: 1,
                  padding: '11px',
                  borderRadius: 6,
                  border: '1.5px solid var(--border-light)',
                  fontWeight: 700,
                  fontSize: 13,
                  color: '#111827',
                  backgroundColor: '#FFFFFF',
                }}
              >
                Xem giỏ hàng
              </button>
              <button
                onClick={() => {
                  setIsCartDrawerOpen(false);
                  onNavigate('checkout');
                }}
                style={{
                  flex: 1.2,
                  padding: '11px',
                  borderRadius: 6,
                  backgroundColor: 'var(--primary)',
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#FFFFFF',
                  boxShadow: 'var(--shadow-primary)',
                }}
              >
                Thanh toán ngay
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
