import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../api/productApi';
import ProductCard from '../components/common/ProductCard';
import Icons from '../components/common/Icons';

export const ProductsPage = ({
  initialCategory = '',
  initialBrand = '',
  initialSearch = '',
  categories = [],
  brands = [],
  onNavigate,
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });

  // Filters state
  const [categorySlug, setCategorySlug] = useState(initialCategory);
  const [brandSlug, setBrandSlug] = useState(initialBrand);
  const [searchTerm, setSearchTerm] = useState(initialSearch);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortOption, setSortOption] = useState('newest');
  const [currentPage, setCurrentPage] = useState(1);

  // Sync with prop updates
  useEffect(() => {
    if (initialCategory !== undefined) setCategorySlug(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    if (initialBrand !== undefined) setBrandSlug(initialBrand);
  }, [initialBrand]);

  useEffect(() => {
    if (initialSearch !== undefined) setSearchTerm(initialSearch);
  }, [initialSearch]);

  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        limit: 12,
        sort: sortOption,
      };
      if (categorySlug) params.category_slug = categorySlug;
      if (brandSlug) params.brand_slug = brandSlug;
      if (searchTerm) params.search = searchTerm;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const res = await productApi.getProducts(params);
      if (res.success && res.data) {
        setProducts(res.data.items || []);
        if (res.data.pagination) {
          setPagination(res.data.pagination);
        }
      }
    } catch (err) {
      console.error('Lỗi tải danh sách sản phẩm:', err);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, brandSlug, searchTerm, minPrice, maxPrice, sortOption, currentPage]);

  useEffect(() => {
    fetchFilteredProducts();
  }, [fetchFilteredProducts]);

  const handlePricePreset = (min, max) => {
    setMinPrice(min);
    setMaxPrice(max);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setCategorySlug('');
    setBrandSlug('');
    setSearchTerm('');
    setMinPrice('');
    setMaxPrice('');
    setSortOption('newest');
    setCurrentPage(1);
  };

  return (
    <div className="container">
      {/* Breadcrumbs */}
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
        <span>Sản phẩm</span>
        {categorySlug && (
          <>
            <Icons.ChevronRight size={12} />
            <span style={{ color: 'var(--primary)', fontWeight: 700 }}>
              {categories.find((c) => c.slug === categorySlug)?.category_name || categorySlug}
            </span>
          </>
        )}
      </div>

      <div className="catalog-layout">
        {/* Left Filter Sidebar */}
        <aside className="filter-sidebar">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              paddingBottom: 12,
              borderBottom: '1px solid var(--border-light)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 800, fontSize: 15 }}>
              <Icons.Sliders size={18} style={{ color: 'var(--primary)' }} />
              BỘ LỌC TÌM KIẾM
            </div>
            <button
              onClick={handleClearFilters}
              style={{ fontSize: 11.5, color: '#EF4444', fontWeight: 700 }}
            >
              Đặt lại
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-group">
            <h4 className="filter-heading">Danh mục Gaming Gear</h4>
            <ul className="filter-list">
              <li>
                <label className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="filter-cat"
                    checked={!categorySlug}
                    onChange={() => {
                      setCategorySlug('');
                      setCurrentPage(1);
                    }}
                  />
                  <span>Tất cả danh mục</span>
                </label>
              </li>
              {categories.map((c) => (
                <li key={c.category_id}>
                  <label className="filter-checkbox-label">
                    <input
                      type="radio"
                      name="filter-cat"
                      checked={categorySlug === c.slug}
                      onChange={() => {
                        setCategorySlug(c.slug);
                        setCurrentPage(1);
                      }}
                    />
                    <span>{c.category_name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Brand Filter */}
          <div className="filter-group">
            <h4 className="filter-heading">Thương hiệu</h4>
            <ul className="filter-list">
              <li>
                <label className="filter-checkbox-label">
                  <input
                    type="radio"
                    name="filter-brand"
                    checked={!brandSlug}
                    onChange={() => {
                      setBrandSlug('');
                      setCurrentPage(1);
                    }}
                  />
                  <span>Tất cả thương hiệu</span>
                </label>
              </li>
              {brands.map((b) => (
                <li key={b.brand_id}>
                  <label className="filter-checkbox-label">
                    <input
                      type="radio"
                      name="filter-brand"
                      checked={brandSlug === b.slug}
                      onChange={() => {
                        setBrandSlug(b.slug);
                        setCurrentPage(1);
                      }}
                    />
                    <span>{b.brand_name}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          {/* Price Presets */}
          <div className="filter-group">
            <h4 className="filter-heading">Mức giá</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {[
                { label: 'Dưới 3 triệu', min: '0', max: '3000000' },
                { label: 'Từ 3 - 5 triệu', min: '3000000', max: '5000000' },
                { label: 'Từ 5 - 15 triệu', min: '5000000', max: '15000000' },
                { label: 'Trên 15 triệu (Hi-End)', min: '15000000', max: '' },
              ].map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => handlePricePreset(range.min, range.max)}
                  style={{
                    textAlign: 'left',
                    padding: '6px 10px',
                    borderRadius: 4,
                    fontSize: 12.5,
                    backgroundColor: minPrice === range.min && maxPrice === range.max ? '#FEE2E2' : '#F9FAFB',
                    color: minPrice === range.min && maxPrice === range.max ? 'var(--primary)' : '#4B5563',
                    fontWeight: minPrice === range.min && maxPrice === range.max ? 700 : 500,
                    border: '1px solid var(--border-light)',
                  }}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom Price Range */}
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 11.5, color: '#6B7280', fontWeight: 600 }}>Tùy chọn khoảng giá:</span>
              <div className="filter-price-inputs">
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Từ (₫)"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                />
                <span>-</span>
                <input
                  type="number"
                  className="filter-input"
                  placeholder="Đến (₫)"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>
              <button
                className="filter-apply-btn"
                onClick={() => setCurrentPage(1)}
              >
                Áp dụng giá
              </button>
            </div>
          </div>
        </aside>

        {/* Right Product Grid & Sorting */}
        <main>
          {/* Catalog Topbar */}
          <div className="catalog-topbar">
            <div>
              <span style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>
                {categorySlug
                  ? categories.find((c) => c.slug === categorySlug)?.category_name
                  : 'Tất cả Gaming Gear'}
              </span>
              <span style={{ fontSize: 13, color: '#6B7280', marginLeft: 8 }}>
                ({pagination.total || products.length} sản phẩm)
              </span>
            </div>

            <div className="catalog-sort-group">
              <span style={{ fontWeight: 600, color: '#4B5563' }}>Sắp xếp theo:</span>
              <select
                className="sort-select"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="rating">Đánh giá cao nhất</option>
                <option value="name_asc">Tên sản phẩm A-Z</option>
              </select>
            </div>
          </div>

          {/* Products Grid or Loading / Empty */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
              <p style={{ fontWeight: 700, fontSize: 15 }}>Đang tải danh sách Gaming Gear...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <Icons.Search size={56} />
              </div>
              <h3 className="empty-state-title">Không tìm thấy sản phẩm phù hợp</h3>
              <p className="empty-state-desc">
                Thử thay đổi bộ lọc tìm kiếm hoặc từ khóa để khám phá thêm nhiều gear đỉnh cao nhé!
              </p>
              <button
                onClick={handleClearFilters}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '10px 20px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 13,
                }}
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            <div className="products-grid">
              {products.map((prod) => (
                <ProductCard key={prod.product_id} product={prod} onNavigate={onNavigate} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              >
                <Icons.ChevronLeft size={16} />
              </button>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`page-btn ${page === currentPage ? 'active' : ''}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={currentPage >= pagination.totalPages}
                onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              >
                <Icons.ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
