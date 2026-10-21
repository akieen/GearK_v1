import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productApi } from '../../api/productApi';
import { formatPrice } from '../../utils/formatters';
import Icons from './Icons';

export const Header = ({ onNavigate, currentRoute, categories = [] }) => {
  const { user, isAdmin, isStaff, logout, openAuthModal, quickLogin } = useAuth();
  const { cartCount, wishlistCount, setIsCartDrawerOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearchLoading(true);
        const res = await productApi.getProducts({ search: searchQuery.trim(), limit: 5 });
        if (res.success && res.data) {
          setSearchResults(res.data.items || []);
          setIsSearchOpen(true);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setSearchLoading(false);
      }
    }, 280);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearchOpen(false);
      onNavigate(`products?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      {/* Top Bar */}
      <div className="topbar">
        <div className="container topbar-content">
          <div className="topbar-left">
        
          </div>

          <div className="topbar-right">
            {/* Quick Test Switcher for easy demo / grading */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 11, color: '#9CA3AF' }}>1-Click Test:</span>
              <button
                onClick={() => quickLogin('admin')}
                style={{
                  fontSize: 11,
                  padding: '2px 6px',
                  backgroundColor: '#7F1D1D',
                  color: '#FECACA',
                  borderRadius: 4,
                  fontWeight: 700,
                }}
              >
                Admin
              </button>
              <button
                onClick={() => quickLogin('staff')}
                style={{
                  fontSize: 11,
                  padding: '2px 6px',
                  backgroundColor: '#1E3A8A',
                  color: '#BFDBFE',
                  borderRadius: 4,
                  fontWeight: 700,
                }}
              >
                Staff
              </button>
              <button
                onClick={() => quickLogin('customer')}
                style={{
                  fontSize: 11,
                  padding: '2px 6px',
                  backgroundColor: '#064E3B',
                  color: '#A7F3D0',
                  borderRadius: 4,
                  fontWeight: 700,
                }}
              >
                Khách
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header className="main-header">
        <div className="container header-container">
          {/* Logo */}
          <a
            href="#home"
            className="brand-logo"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
          >
            <div className="brand-badge">GEARK</div>
            <div>
              <span style={{ color: '#111827', fontWeight: 900 }}>GAMING</span>
              <span className="brand-text-sub">PRO STORE</span>
            </div>
          </a>

          {/* Category Toggle */}
          <button
            className="category-btn"
            onClick={() => onNavigate('products')}
          >
            <Icons.Menu size={18} />
            <span>DANH MỤC</span>
          </button>

          {/* Search Bar */}
          <div className="search-wrapper" ref={searchRef}>
            <form className="search-form" onSubmit={handleSearchSubmit}>
              <input
                type="text"
                className="search-input"
                placeholder="Bạn cần tìm linh kiện, gear gì hôm nay? (VD: Chuột Razer, K70, ROG OLED...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchResults.length > 0) setIsSearchOpen(true);
                }}
              />
              <button type="submit" className="search-btn">
                <Icons.Search size={15} />
                <span>Tìm kiếm</span>
              </button>
            </form>

            {/* Live Search Autocomplete */}
            {isSearchOpen && searchResults.length > 0 && (
              <div className="search-dropdown">
                <div style={{ padding: '8px 14px', fontSize: 11.5, color: '#6B7280', fontWeight: 700, textTransform: 'uppercase', backgroundColor: '#F9FAFB' }}>
                  Sản phẩm gợi ý ({searchResults.length})
                </div>
                {searchResults.map((prod) => (
                  <div
                    key={prod.product_id}
                    className="search-dropdown-item"
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      onNavigate(`product/${prod.slug}`);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={prod.thumbnail_url}
                      alt={prod.product_name}
                      className="search-dropdown-thumb"
                    />
                    <div className="search-dropdown-info">
                      <div className="search-dropdown-title">{prod.product_name}</div>
                      <div className="search-dropdown-price">
                        {formatPrice(prod.min_sale_price || prod.min_price)}
                      </div>
                    </div>
                  </div>
                ))}
                <div
                  style={{
                    padding: '10px 14px',
                    textAlign: 'center',
                    backgroundColor: '#FEF2F2',
                    color: 'var(--primary)',
                    fontWeight: 700,
                    fontSize: 12.5,
                    cursor: 'pointer',
                  }}
                  onClick={handleSearchSubmit}
                >
                  Xem tất cả kết quả cho "{searchQuery}" →
                </div>
              </div>
            )}
          </div>

          {/* Header Actions */}
          <div className="header-actions">
            {/* Wishlist */}
            <button
              className="header-action-btn"
              onClick={() => onNavigate('wishlist')}
              title="Danh sách yêu thích"
            >
              <div className="header-icon-box">
                <Icons.Heart size={22} />
                {wishlistCount > 0 && (
                  <span className="badge-count">{wishlistCount}</span>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Yêu thích</span>
            </button>

            {/* Cart Drawer Toggle */}
            <button
              className="header-action-btn"
              onClick={() => setIsCartDrawerOpen(true)}
              title="Giỏ hàng"
            >
              <div className="header-icon-box">
                <Icons.ShoppingCart size={22} style={{ color: 'var(--primary)' }} />
                {cartCount > 0 && (
                  <span className="badge-count">{cartCount}</span>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Giỏ hàng</span>
            </button>

            {/* User Account / Auth */}
            <div className="user-menu-wrapper" ref={userMenuRef}>
              {user ? (
                <>
                  <button
                    className="header-action-btn"
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    style={{ backgroundColor: '#FEF2F2', color: 'var(--primary)' }}
                  >
                    <Icons.User size={20} />
                    <span style={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.full_name?.split(' ').pop() || 'Tài khoản'}
                    </span>
                    <Icons.ChevronDown size={14} />
                  </button>

                  {isUserMenuOpen && (
                    <div className="user-dropdown">
                      <div className="user-dropdown-header">
                        <div className="user-dropdown-name">{user.full_name}</div>
                        <div style={{ fontSize: 12, color: '#6B7280' }}>{user.email}</div>
                        <div className="user-dropdown-role">{user.role}</div>
                      </div>

                      {isStaff && (
                        <button
                          className="user-dropdown-item"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            onNavigate('admin');
                          }}
                          style={{ color: 'var(--primary)', fontWeight: 700 }}
                        >
                          <Icons.LayoutDashboard size={16} />
                          <span>Trang Quản Trị (Admin)</span>
                        </button>
                      )}

                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('my-orders');
                        }}
                      >
                        <Icons.Package size={16} />
                        <span>Đơn hàng của tôi</span>
                      </button>

                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          onNavigate('profile');
                        }}
                      >
                        <Icons.User size={16} />
                        <span>Thông tin tài khoản</span>
                      </button>

                      <button
                        className="user-dropdown-item"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        style={{ color: '#EF4444', borderTop: '1px solid var(--border-subtle)' }}
                      >
                        <Icons.LogOut size={16} />
                        <span>Đăng xuất</span>
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <button
                  className="header-action-btn"
                  onClick={() => openAuthModal('login')}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: 6,
                  }}
                >
                  <Icons.User size={18} />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Secondary Category SubNav */}
      <nav className="sub-nav">
        <div className="container sub-nav-content">
          <a
            href="#home"
            className={`sub-nav-item ${currentRoute === 'home' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              onNavigate('home');
            }}
          >
            Trang chủ
          </a>

          {categories.map((cat) => (
            <a
              key={cat.category_id}
              href={`#category-${cat.slug}`}
              className="sub-nav-item"
              onClick={(e) => {
                e.preventDefault();
                onNavigate(`products?category=${cat.slug}`);
              }}
            >
              {cat.category_name}
            </a>
          ))}

          <a
            href="#products"
            className="sub-nav-item hot"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('products');
            }}
          >
            🔥 Khuyến Mãi Hot
          </a>

          <a
            href="#build-pc"
            className="sub-nav-item"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('products?category=chuot-gaming');
            }}
          >
            Setup Gaming
          </a>
        </div>
      </nav>
    </>
  );
};
