import React from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/common/ProductCard';
import Icons from '../components/common/Icons';

export const WishlistPage = ({ onNavigate }) => {
  const { wishlistItems, wishlistCount } = useCart();
  const { user, openAuthModal } = useAuth();

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Vui lòng đăng nhập để xem danh sách yêu thích.</p>
        <button
          onClick={() => openAuthModal('login')}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 700,
            marginTop: 14,
          }}
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 0 48px 0' }}>
      <div style={{ paddingBottom: 16, borderBottom: '2px solid var(--border-light)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>
          DANH SÁCH YÊU THÍCH ({wishlistCount})
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          Những món Gaming Gear bạn đã lưu lại để săn sale và mua sắm sau.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="empty-state">
          <Icons.Heart size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">Danh sách yêu thích đang trống</h3>
          <p className="empty-state-desc">
            Nhấp vào biểu tượng trái tim ở các sản phẩm để lưu lại những món bạn ưng ý nhất!
          </p>
          <button
            onClick={() => onNavigate('products')}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '10px 24px',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            Khám phá Gaming Gear ngay
          </button>
        </div>
      ) : (
        <div className="products-grid">
          {wishlistItems.map((prod) => (
            <ProductCard key={prod.product_id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      )}
    </div>
  );
};
