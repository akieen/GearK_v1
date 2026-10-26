import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productApi } from '../../api/productApi';
import { categoryApi, brandApi } from '../../api/categoryApi';
import { formatPrice } from '../../utils/formatters';
import Icons from './Icons';

// Helper: map category slug / name to appropriate Icon
const getCategoryIcon = (slug = '', name = '') => {
  const text = `${slug} ${name}`.toLowerCase();
  if (text.includes('phim') || text.includes('key')) return <Icons.Keyboard size={18} />;
  if (text.includes('chuot') || text.includes('mouse')) return <Icons.Mouse size={18} />;
  if (text.includes('tai-nghe') || text.includes('tai nghe') || text.includes('headphone') || text.includes('audio') || text.includes('loa')) {
    return <Icons.Headphones size={18} />;
  }
  if (text.includes('man-hinh') || text.includes('man hinh') || text.includes('monitor') || text.includes('display')) {
    return <Icons.Monitor size={18} />;
  }
  if (text.includes('laptop')) return <Icons.Laptop size={18} />;
  if (text.includes('pc') || text.includes('cpu') || text.includes('vga') || text.includes('main') || text.includes('case')) {
    return <Icons.Cpu size={18} />;
  }
  return <Icons.Package size={18} />;
};

const priceFilters = [
  { label: 'Dưới 1 triệu', max: 1000000 },
  { label: 'Từ 1 - 2 triệu', min: 1000000, max: 2000000 },
  { label: 'Từ 2 - 4 triệu', min: 2000000, max: 4000000 },
  { label: 'Trên 4 triệu', min: 4000000 },
];

export const Header = ({ onNavigate, currentRoute, categories = [] }) => {
  const { user, isStaff, logout, openAuthModal, quickLogin } = useAuth();
  const { cartCount, wishlistCount, setIsCartDrawerOpen } = useCart();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Category Mega Menu State
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [treeCategories, setTreeCategories] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [loadingCategories, setLoadingCategories] = useState(false);

  const searchRef = useRef(null);
  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setIsCategoryMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCategoryMenuOpen(false);
        setIsSearchOpen(false);
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch hierarchical categories and brands from database
  useEffect(() => {
    let isMounted = true;
    const fetchDropdownData = async () => {
      try {
        setLoadingCategories(true);
        const [catRes, brandRes] = await Promise.all([
          categoryApi.getCategories(true),
          brandApi.getBrands(),
        ]);

        if (isMounted) {
          if (catRes.success && Array.isArray(catRes.data) && catRes.data.length > 0) {
            setTreeCategories(catRes.data);
            setActiveCategoryId((prev) => prev || catRes.data[0].category_id);
          } else if (categories && categories.length > 0) {
            setTreeCategories(categories);
            setActiveCategoryId((prev) => prev || categories[0].category_id);
          }

          if (brandRes.success && Array.isArray(brandRes.data)) {
            setBrandsList(brandRes.data);
          }
        }
      } catch (err) {
        console.error('Lỗi nạp dữ liệu danh mục cho dropdown:', err);
        if (isMounted && categories && categories.length > 0) {
          setTreeCategories(categories);
          setActiveCategoryId((prev) => prev || categories[0].category_id);
        }
      } finally {
        if (isMounted) setLoadingCategories(false);
      }
    };

    fetchDropdownData();
    return () => {
      isMounted = false;
    };
  }, [categories]);

  // Keep activeCategoryId pointing to a valid category
  useEffect(() => {
    if (treeCategories.length > 0) {
      const exists = treeCategories.some((c) => c.category_id === activeCategoryId);
      if (!exists) {
        setActiveCategoryId(treeCategories[0].category_id);
      }
    }
  }, [treeCategories, activeCategoryId]);

  const activeCategory =
    treeCategories.find((c) => c.category_id === activeCategoryId) || treeCategories[0];

  const handleCategoryClick = (slug) => {
    setIsCategoryMenuOpen(false);
    onNavigate(`products?category=${slug}`);
  };

  const handleBrandClick = (catSlug, brandSlug) => {
    setIsCategoryMenuOpen(false);
    onNavigate(`products?category=${catSlug}&brand=${brandSlug}`);
  };

  const handlePriceFilter = (catSlug, min, max) => {
    setIsCategoryMenuOpen(false);
    let url = `products?category=${catSlug}`;
    if (min) url += `&min_price=${min}`;
    if (max) url += `&max_price=${max}`;
    onNavigate(url);
  };

  // Live search debounce
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {

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

          {/* Category Dropdown (GEARVN Mega Menu Style) */}
          <div className="category-dropdown-wrapper" ref={categoryMenuRef}>
            <button
              type="button"
              className={`category-btn ${isCategoryMenuOpen ? 'active' : ''}`}
              onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
              aria-expanded={isCategoryMenuOpen}
              aria-label="Danh mục sản phẩm"
            >
              {isCategoryMenuOpen ? <Icons.X size={18} /> : <Icons.Menu size={18} />}
              <span>DANH MỤC</span>
              <Icons.ChevronDown
                size={14}
                className={`category-btn-arrow ${isCategoryMenuOpen ? 'rotated' : ''}`}
              />
            </button>

            {/* Mega Dropdown Panel */}
            {isCategoryMenuOpen && (
              <div className="category-mega-dropdown">
                {/* Left Panel: List of Categories */}
                <div className="category-mega-sidebar">
                  {loadingCategories && treeCategories.length === 0 ? (
                    <div className="category-loading-placeholder">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="category-skeleton-item" />
                      ))}
                    </div>
                  ) : treeCategories.length === 0 ? (
                    <div className="category-empty-text">Đang tải danh mục...</div>
                  ) : (
                    <div className="category-sidebar-list">
                      {treeCategories.map((cat) => {
                        const isActive =
                          activeCategory && activeCategory.category_id === cat.category_id;
                        return (
                          <div
                            key={cat.category_id}
                            className={`category-sidebar-item ${isActive ? 'active' : ''}`}
                            onMouseEnter={() => setActiveCategoryId(cat.category_id)}
                            onClick={() => handleCategoryClick(cat.slug)}
                          >
                            <span className="category-sidebar-icon">
                              {getCategoryIcon(cat.slug, cat.category_name)}
                            </span>
                            <span className="category-sidebar-name">{cat.category_name}</span>
                            <Icons.ChevronRight size={14} className="category-sidebar-arrow" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div
                    className="category-sidebar-footer"
                    onClick={() => {
                      setIsCategoryMenuOpen(false);
                      onNavigate('products');
                    }}
                  >
                    <span>Xem tất cả sản phẩm</span>
                    <Icons.ChevronRight size={14} />
                  </div>
                </div>

                {/* Right Panel: Active Category Details & Sub-filters */}
                {activeCategory ? (
                  <div className="category-mega-content">
                    <div className="category-mega-header">
                      <h3 className="category-mega-title">
                        {getCategoryIcon(activeCategory.slug, activeCategory.category_name)}
                        <span>{activeCategory.category_name}</span>
                      </h3>
                      <button
                        type="button"
                        className="category-mega-view-all"
                        onClick={() => handleCategoryClick(activeCategory.slug)}
                      >
                        <span>Xem tất cả</span>
                        <Icons.ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="category-mega-grid">
                      {/* Subcategories (if children exist in DB tree) */}
                      {activeCategory.children && activeCategory.children.length > 0 && (
                        <div className="category-mega-group">
                          <h4 className="category-group-title">
                            Danh mục con
                            <Icons.ChevronRight size={13} />
                          </h4>
                          <div className="category-group-links">
                            {activeCategory.children.map((sub) => (
                              <div
                                key={sub.category_id}
                                className="category-link-item"
                                onClick={() => handleCategoryClick(sub.slug)}
                              >
                                <span>{sub.category_name}</span>

                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Brands List from DB */}
                      {brandsList.length > 0 && (
                        <div className="category-mega-group">
                          <h4 className="category-group-title">
                            Thương hiệu hàng đầu
                            <Icons.ChevronRight size={13} />
                          </h4>
                          <div className="category-group-links">
                            {brandsList.map((brand) => (
                              <div
                                key={brand.brand_id}
                                className="category-link-item brand-badge-link"
                                onClick={() =>
                                  handleBrandClick(activeCategory.slug, brand.slug)
                                }
                              >
                                <span>{brand.brand_name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Price Range Filters */}
                      <div className="category-mega-group">
                        <h4 className="category-group-title">
                          Mức giá phổ biến
                          <Icons.ChevronRight size={13} />
                        </h4>
                        <div className="category-group-links">
                          {priceFilters.map((p, idx) => (
                            <div
                              key={idx}
                              className="category-link-item"
                              onClick={() =>
                                handlePriceFilter(activeCategory.slug, p.min, p.max)
                              }
                            >
                              <span>{p.label}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Fast Tag Highlights */}
                      <div className="category-mega-group">
                        <h4 className="category-group-title">
                          Lựa chọn nhanh
                          <Icons.Sparkles size={13} />
                        </h4>
                        <div className="category-group-tags">
                          <span
                            className="category-quick-tag"
                            onClick={() => handleCategoryClick(activeCategory.slug)}
                          >
                            Hàng mới về 🔥
                          </span>
                          <span
                            className="category-quick-tag"
                            onClick={() => handleCategoryClick(activeCategory.slug)}
                          >
                            Bán chạy nhất
                          </span>
                          <span
                            className="category-quick-tag"
                            onClick={() => handleCategoryClick(activeCategory.slug)}
                          >
                            Gaming Esports
                          </span>
                          <span
                            className="category-quick-tag"
                            onClick={() => handleCategoryClick(activeCategory.slug)}
                          >
                            Chính hãng 100%
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="category-mega-content empty">
                    <p style={{ color: '#9CA3AF' }}>Chọn danh mục bên trái để xem chi tiết</p>
                  </div>
                )}
              </div>
            )}
          </div>

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
        </div>
      </nav>
    </>
  );
};
