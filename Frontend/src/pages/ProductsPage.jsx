import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Pagination from '@mui/material/Pagination';
import Chip from '@mui/material/Chip';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { productApi } from '../api/productApi';
import ProductCard from '../components/common/ProductCard';
import ProductFilterSidebar from '../components/products/ProductFilterSidebar';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

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

  const activeCategoryObj = categories.find((c) => c.slug === categorySlug);
  const hasActiveFilters = Boolean(categorySlug || brandSlug || searchTerm || minPrice || maxPrice);

  return (
    <Box sx={{ py: 3, pb: 8 }}>
      <Container maxWidth="lg">
        {/* Breadcrumbs */}
        <Breadcrumbs
          separator={<NavigateNextIcon fontSize="small" />}
          sx={{ mb: 3, fontSize: '0.84375rem' }}
        >
          <Link
            underline="hover"
            color="inherit"
            sx={{ cursor: 'pointer', fontWeight: 600 }}
            onClick={() => onNavigate('home')}
          >
            Trang chủ
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>
            Sản phẩm
          </Typography>
          {activeCategoryObj && (
            <Typography color="primary.main" sx={{ fontWeight: 700 }}>
              {activeCategoryObj.category_name}
            </Typography>
          )}
        </Breadcrumbs>

        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, alignItems: 'flex-start' }}>
          {/* Left Filter Sidebar (Modular & Sticky) */}
          <ProductFilterSidebar
            categories={categories}
            categorySlug={categorySlug}
            onSelectCategory={(slug) => {
              setCategorySlug(slug);
              setCurrentPage(1);
            }}
            brands={brands}
            brandSlug={brandSlug}
            onSelectBrand={(slug) => {
              setBrandSlug(slug);
              setCurrentPage(1);
            }}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onChangeMinPrice={setMinPrice}
            onChangeMaxPrice={setMaxPrice}
            onApplyPrice={() => setCurrentPage(1)}
            onPricePreset={handlePricePreset}
            onResetFilters={handleClearFilters}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Right Product Grid & Sorting */}
          <Box sx={{ flex: 1, minWidth: 0, width: '100%' }}>
            {/* Top Toolbar */}
            <Paper
              elevation={1}
              sx={{
                p: 1.5,
                px: 2,
                mb: 2.5,
                borderRadius: 2.5,
                border: '1px solid #E5E7EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
                backgroundColor: '#FFFFFF',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                <Typography variant="subtitle1" component="span" sx={{ fontWeight: 800, fontSize: '0.9375rem' }}>
                  {activeCategoryObj ? activeCategoryObj.category_name : 'Tất cả Gaming Gear'}
                </Typography>
                <Typography variant="body2" component="span" sx={{ color: 'text.secondary' }}>
                  ({pagination.total || products.length} sản phẩm)
                </Typography>

                {/* Active Filter Chips */}
                {categorySlug && activeCategoryObj && (
                  <Chip
                    label={`DM: ${activeCategoryObj.category_name}`}
                    size="small"
                    onDelete={() => setCategorySlug('')}
                    sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600 }}
                  />
                )}
                {brandSlug && (
                  <Chip
                    label={`Hãng: ${brands.find((b) => b.slug === brandSlug)?.brand_name || brandSlug}`}
                    size="small"
                    onDelete={() => setBrandSlug('')}
                    sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600 }}
                  />
                )}
                {(minPrice || maxPrice) && (
                  <Chip
                    label={`Giá: ${minPrice ? Number(minPrice).toLocaleString('vi-VN') + '₫' : '0₫'} - ${maxPrice ? Number(maxPrice).toLocaleString('vi-VN') + '₫' : '∞'}`}
                    size="small"
                    onDelete={() => {
                      setMinPrice('');
                      setMaxPrice('');
                    }}
                    sx={{ height: 24, fontSize: '0.72rem', fontWeight: 600 }}
                  />
                )}
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  Sắp xếp:
                </Typography>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <Select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    sx={{
                      fontSize: '0.8125rem',
                      borderRadius: 1.5,
                      '& .MuiSelect-select': { py: 0.75, px: 1.25 },
                    }}
                  >
                    <MenuItem value="newest">Mới nhất</MenuItem>
                    <MenuItem value="price_asc">Giá tăng dần</MenuItem>
                    <MenuItem value="price_desc">Giá giảm dần</MenuItem>
                    <MenuItem value="rating">Đánh giá cao nhất</MenuItem>
                    <MenuItem value="name_asc">Tên sản phẩm A-Z</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Paper>

            {/* Products Content */}
            {loading ? (
              <LoadingSpinner message="Đang tải danh sách Gaming Gear..." minHeight={320} />
            ) : products.length === 0 ? (
              <EmptyState
                title="Không tìm thấy sản phẩm phù hợp"
                description="Thử thay đổi bộ lọc tìm kiếm hoặc từ khóa để khám phá thêm nhiều gear đỉnh cao nhé!"
                actionText="Xóa tất cả bộ lọc"
                onAction={handleClearFilters}
              />
            ) : (
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: 'repeat(1, 1fr)',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 2.5,
                }}
              >
                {products.map((prod) => (
                  <ProductCard key={prod.product_id} product={prod} onNavigate={onNavigate} />
                ))}
              </Box>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={pagination.totalPages}
                  page={currentPage}
                  onChange={(e, page) => {
                    setCurrentPage(page);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  color="primary"
                  shape="rounded"
                  size="medium"
                  showFirstButton
                  showLastButton
                />
              </Box>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ProductsPage;
