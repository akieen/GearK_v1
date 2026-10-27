import React, { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Paper from '@mui/material/Paper';
import InputBase from '@mui/material/InputBase';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import LogoutIcon from '@mui/icons-material/Logout';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { productApi } from '../../api/productApi';
import { categoryApi, brandApi } from '../../api/categoryApi';
import { formatPrice } from '../../utils/formatters';

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
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Category Mega Menu State
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [treeCategories, setTreeCategories] = useState([]);
  const [brandsList, setBrandsList] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  // User menu anchor
  const [userMenuAnchor, setUserMenuAnchor] = useState(null);

  const searchRef = useRef(null);
  const categoryMenuRef = useRef(null);

  // Close dropdowns when clicking outside or pressing Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(e.target)) {
        setIsCategoryMenuOpen(false);
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsCategoryMenuOpen(false);
        setIsSearchOpen(false);
        setUserMenuAnchor(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Fetch hierarchical categories and brands
  useEffect(() => {
    let isMounted = true;
    const fetchDropdownData = async () => {
      try {
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
        console.error('Lỗi nạp dữ liệu danh mục dropdown:', err);
        if (isMounted && categories && categories.length > 0) {
          setTreeCategories(categories);
          setActiveCategoryId((prev) => prev || categories[0].category_id);
        }
      }
    };

    fetchDropdownData();
    return () => {
      isMounted = false;
    };
  }, [categories]);

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
    <Box component="header" sx={{ position: 'sticky', top: 0, zIndex: 1100, backgroundColor: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' }}>
      {/* Top Bar */}
      <Box
        sx={{
          backgroundColor: '#0F1012',
          color: '#D1D5DB',
          fontSize: '0.75rem',
          py: 0.6,
          borderBottom: '1px solid #27272A',
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                Hotline: <strong style={{ color: '#FFFFFF' }}>1800 6975</strong> (8:00 - 21:00)
              </Typography>
              <Typography variant="caption" sx={{ color: '#9CA3AF', display: { xs: 'none', md: 'inline' } }}>
                Showroom: Hà Nội & TP. Hồ Chí Minh
              </Typography>
            </Box>

            {/* Quick Demo Switcher */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: '#9CA3AF' }}>
                1-Click Demo:
              </Typography>
              <Chip
                label="Admin"
                size="small"
                onClick={() => quickLogin('admin')}
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: '#7F1D1D',
                  color: '#FECACA',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#991B1B' },
                }}
              />
              <Chip
                label="Staff"
                size="small"
                onClick={() => quickLogin('staff')}
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: '#1E3A8A',
                  color: '#BFDBFE',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#1D4ED8' },
                }}
              />
              <Chip
                label="Khách"
                size="small"
                onClick={() => quickLogin('customer')}
                sx={{
                  height: 20,
                  fontSize: '0.6875rem',
                  fontWeight: 800,
                  backgroundColor: '#064E3B',
                  color: '#A7F3D0',
                  cursor: 'pointer',
                  '&:hover': { backgroundColor: '#047857' },
                }}
              />
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Main Navigation Bar */}
      <Box sx={{ py: 1.5, backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1.5, md: 3 } }}>
            {/* Logo */}
            <Box
              onClick={() => onNavigate('home')}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.25,
                cursor: 'pointer',
                userSelect: 'none',
                textDecoration: 'none',
              }}
            >
              <Box
                sx={{
                  backgroundColor: 'primary.main',
                  color: '#FFFFFF',
                  fontWeight: 900,
                  fontSize: '1.25rem',
                  px: 1.5,
                  py: 0.5,
                  borderRadius: 2,
                  letterSpacing: '0.04em',
                  boxShadow: '0 4px 12px rgba(227, 0, 25, 0.3)',
                }}
              >
                GEARK
              </Box>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 900, lineHeight: 1.1, color: 'text.primary' }}>
                  GAMING
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.6875rem' }}>
                  PRO STORE
                </Typography>
              </Box>
            </Box>

            {/* Category Mega Menu Trigger Button */}
            <Box ref={categoryMenuRef} sx={{ position: 'relative' }}>
              <Button
                variant={isCategoryMenuOpen ? 'contained' : 'outlined'}
                color="primary"
                onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                startIcon={isCategoryMenuOpen ? <CloseIcon /> : <MenuIcon />}
                endIcon={<KeyboardArrowDownIcon sx={{ transform: isCategoryMenuOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 800,
                  px: 2,
                  py: 1,
                  display: { xs: 'none', md: 'flex' },
                }}
              >
                DANH MỤC
              </Button>

              {/* Mega Menu Dropdown */}
              {isCategoryMenuOpen && (
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 12px)',
                    left: 0,
                    width: 780,
                    display: 'flex',
                    borderRadius: 3,
                    border: '1px solid #E5E7EB',
                    overflow: 'hidden',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 16px 40px rgba(0, 0, 0, 0.15)',
                    zIndex: 1200,
                  }}
                >
                  {/* Left Sidebar: Categories List */}
                  <Box
                    sx={{
                      width: 260,
                      backgroundColor: '#F8FAFC',
                      borderRight: '1px solid #E5E7EB',
                      py: 1,
                    }}
                  >
                    {treeCategories.map((cat) => {
                      const isActive = activeCategory && activeCategory.category_id === cat.category_id;
                      return (
                        <Box
                          key={cat.category_id}
                          onMouseEnter={() => setActiveCategoryId(cat.category_id)}
                          onClick={() => handleCategoryClick(cat.slug)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            px: 2,
                            py: 1.25,
                            cursor: 'pointer',
                            backgroundColor: isActive ? '#FFFFFF' : 'transparent',
                            color: isActive ? 'primary.main' : 'text.primary',
                            fontWeight: isActive ? 800 : 600,
                            borderLeft: isActive ? '3px solid #E30019' : '3px solid transparent',
                            '&:hover': {
                              backgroundColor: '#FFFFFF',
                              color: 'primary.main',
                            },
                          }}
                        >
                          <Typography variant="body2" sx={{ fontWeight: 'inherit', fontSize: '0.84375rem' }}>
                            {cat.category_name}
                          </Typography>
                          <ChevronRightIcon sx={{ fontSize: 16, color: isActive ? 'primary.main' : 'text.disabled' }} />
                        </Box>
                      );
                    })}

                    <Divider sx={{ my: 1 }} />
                    <Box
                      onClick={() => {
                        setIsCategoryMenuOpen(false);
                        onNavigate('products');
                      }}
                      sx={{
                        px: 2,
                        py: 1,
                        cursor: 'pointer',
                        color: 'primary.main',
                        fontWeight: 800,
                        fontSize: '0.8125rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        '&:hover': { textDecoration: 'underline' },
                      }}
                    >
                      <span>Xem tất cả sản phẩm</span>
                      <ChevronRightIcon fontSize="small" />
                    </Box>
                  </Box>

                  {/* Right Panel: Active Category Content */}
                  <Box sx={{ flex: 1, p: 2.5, maxHeight: 420, overflowY: 'auto' }}>
                    {activeCategory && (
                      <>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, pb: 1, borderBottom: '1px solid #F1F5F9' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            {activeCategory.category_name}
                          </Typography>
                          <Button
                            size="small"
                            onClick={() => handleCategoryClick(activeCategory.slug)}
                            sx={{ color: 'primary.main', fontWeight: 700, fontSize: '0.75rem' }}
                          >
                            Xem tất cả →
                          </Button>
                        </Box>

                        {/* Brands list */}
                        {brandsList.length > 0 && (
                          <Box sx={{ mb: 2.5 }}>
                            <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                              Thương hiệu nổi bật
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {brandsList.slice(0, 10).map((brand) => (
                                <Chip
                                  key={brand.brand_id}
                                  label={brand.brand_name}
                                  size="small"
                                  onClick={() => handleBrandClick(activeCategory.slug, brand.slug)}
                                  sx={{
                                    backgroundColor: '#F1F5F9',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    '&:hover': { backgroundColor: '#FEE2E2', color: 'primary.main' },
                                  }}
                                />
                              ))}
                            </Box>
                          </Box>
                        )}

                        {/* Price presets */}
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase', mb: 1, display: 'block' }}>
                            Khoảng giá
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {priceFilters.map((p, idx) => (
                              <Chip
                                key={idx}
                                label={p.label}
                                size="small"
                                variant="outlined"
                                onClick={() => handlePriceFilter(activeCategory.slug, p.min, p.max)}
                                sx={{
                                  fontWeight: 600,
                                  cursor: 'pointer',
                                  '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
                </Paper>
              )}
            </Box>

            {/* Search Bar */}
            <Box ref={searchRef} sx={{ flex: 1, position: 'relative' }}>
              <Paper
                component="form"
                onSubmit={handleSearchSubmit}
                elevation={0}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: 2.5,
                  backgroundColor: '#F4F5F7',
                  border: '1.5px solid #E5E7EB',
                  px: 1.5,
                  py: 0.5,
                  transition: 'all 0.2s ease',
                  '&:focus-within': {
                    borderColor: 'primary.main',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 0 0 3px rgba(227, 0, 25, 0.1)',
                  },
                }}
              >
                <InputBase
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bạn cần tìm linh kiện, gear gì hôm nay? (Razer, K70, Asus ROG...)"
                  fullWidth
                  sx={{
                    fontSize: '0.875rem',
                    color: 'text.primary',
                  }}
                />
                <IconButton type="submit" size="small" sx={{ color: 'primary.main', p: 0.75 }}>
                  <SearchIcon />
                </IconButton>
              </Paper>

              {/* Search Autocomplete Dropdown */}
              {isSearchOpen && searchResults.length > 0 && (
                <Paper
                  elevation={3}
                  sx={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    left: 0,
                    right: 0,
                    zIndex: 1300,
                    borderRadius: 2.5,
                    overflow: 'hidden',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <Box sx={{ p: 1, px: 2, backgroundColor: '#F8FAFC', borderBottom: '1px solid #F1F5F9' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                      Sản phẩm gợi ý ({searchResults.length})
                    </Typography>
                  </Box>

                  {searchResults.map((prod) => (
                    <Box
                      key={prod.product_id}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        onNavigate(`product/${prod.slug}`);
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        p: 1.5,
                        px: 2,
                        cursor: 'pointer',
                        borderBottom: '1px solid #F8FAFC',
                        '&:hover': { backgroundColor: '#F8FAFC' },
                      }}
                    >
                      <Box
                        component="img"
                        src={prod.thumbnail_url}
                        alt={prod.product_name}
                        sx={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 1.5, border: '1px solid #E5E7EB', p: 0.5 }}
                      />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {prod.product_name}
                        </Typography>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          {formatPrice(prod.min_sale_price || prod.min_price)}
                        </Typography>
                      </Box>
                    </Box>
                  ))}

                  <Box
                    onClick={handleSearchSubmit}
                    sx={{
                      p: 1.5,
                      textAlign: 'center',
                      backgroundColor: '#FEF2F2',
                      color: 'primary.main',
                      fontWeight: 800,
                      fontSize: '0.8125rem',
                      cursor: 'pointer',
                      '&:hover': { textDecoration: 'underline' },
                    }}
                  >
                    Xem tất cả kết quả cho "{searchQuery}" →
                  </Box>
                </Paper>
              )}
            </Box>

            {/* Header Right Actions */}
            <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center">
              {/* Wishlist */}
              <IconButton
                onClick={() => onNavigate('wishlist')}
                title="Danh sách yêu thích"
                sx={{
                  color: 'text.primary',
                  borderRadius: 2,
                  p: 1,
                  '&:hover': { color: 'primary.main', backgroundColor: 'rgba(227, 0, 25, 0.05)' },
                }}
              >
                <Badge badgeContent={wishlistCount} color="error" max={99}>
                  <FavoriteIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>

              {/* Cart Drawer Trigger */}
              <IconButton
                onClick={() => setIsCartDrawerOpen(true)}
                title="Giỏ hàng"
                sx={{
                  color: 'primary.main',
                  borderRadius: 2,
                  p: 1,
                  backgroundColor: 'rgba(227, 0, 25, 0.04)',
                  '&:hover': { backgroundColor: 'rgba(227, 0, 25, 0.1)' },
                }}
              >
                <Badge badgeContent={cartCount} color="error" max={99}>
                  <ShoppingCartIcon sx={{ fontSize: 22 }} />
                </Badge>
              </IconButton>

              {/* User Account / Auth */}
              {user ? (
                <>
                  <Button
                    onClick={(e) => setUserMenuAnchor(e.currentTarget)}
                    startIcon={<PersonIcon />}
                    endIcon={<KeyboardArrowDownIcon sx={{ fontSize: 16 }} />}
                    sx={{
                      borderRadius: 2,
                      fontWeight: 700,
                      backgroundColor: '#FEE2E2',
                      color: 'primary.main',
                      px: 1.75,
                      py: 0.8,
                      '&:hover': { backgroundColor: '#FECACA' },
                    }}
                  >
                    <Box component="span" sx={{ maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {user.full_name?.split(' ').pop() || 'Tài khoản'}
                    </Box>
                  </Button>

                  <Menu
                    anchorEl={userMenuAnchor}
                    open={Boolean(userMenuAnchor)}
                    onClose={() => setUserMenuAnchor(null)}
                    PaperProps={{
                      sx: {
                        width: 240,
                        borderRadius: 3,
                        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12)',
                        border: '1px solid #E5E7EB',
                        mt: 1,
                      },
                    }}
                  >
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid #F1F5F9' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {user.full_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        {user.email}
                      </Typography>
                      <Chip label={user.role} size="small" sx={{ mt: 0.5, height: 20, fontSize: '0.6875rem', fontWeight: 700 }} />
                    </Box>

                    {isStaff && (
                      <MenuItem
                        onClick={() => {
                          setUserMenuAnchor(null);
                          onNavigate('admin');
                        }}
                        sx={{ fontWeight: 700, color: 'primary.main', py: 1.25 }}
                      >
                        <DashboardIcon fontSize="small" sx={{ mr: 1.5 }} />
                        Trang Quản Trị (Admin)
                      </MenuItem>
                    )}

                    <MenuItem
                      onClick={() => {
                        setUserMenuAnchor(null);
                        onNavigate('my-orders');
                      }}
                      sx={{ py: 1.25 }}
                    >
                      <Inventory2Icon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                      Đơn hàng của tôi
                    </MenuItem>

                    <MenuItem
                      onClick={() => {
                        setUserMenuAnchor(null);
                        onNavigate('profile');
                      }}
                      sx={{ py: 1.25 }}
                    >
                      <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
                      Thông tin tài khoản
                    </MenuItem>

                    <Divider />

                    <MenuItem
                      onClick={() => {
                        setUserMenuAnchor(null);
                        logout();
                      }}
                      sx={{ color: 'error.main', py: 1.25 }}
                    >
                      <LogoutIcon fontSize="small" sx={{ mr: 1.5 }} />
                      Đăng xuất
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => openAuthModal('login')}
                  startIcon={<PersonIcon />}
                  sx={{
                    borderRadius: 2,
                    fontWeight: 800,
                    px: 2,
                    py: 0.9,
                  }}
                >
                  Đăng nhập
                </Button>
              )}
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Secondary Category SubNav */}
      <Box sx={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E5E7EB', py: 0.75, display: { xs: 'none', sm: 'block' } }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, overflowX: 'auto' }}>
            <Button
              size="small"
              onClick={() => onNavigate('home')}
              sx={{
                fontWeight: currentRoute === 'home' ? 800 : 600,
                color: currentRoute === 'home' ? 'primary.main' : 'text.primary',
                minWidth: 'auto',
                p: '4px 8px',
              }}
            >
              Trang chủ
            </Button>

            {categories.slice(0, 6).map((cat) => (
              <Button
                key={cat.category_id}
                size="small"
                onClick={() => onNavigate(`products?category=${cat.slug}`)}
                sx={{
                  fontWeight: 600,
                  color: 'text.secondary',
                  minWidth: 'auto',
                  p: '4px 8px',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {cat.category_name}
              </Button>
            ))}

            <Button
              size="small"
              onClick={() => onNavigate('products')}
              startIcon={<LocalFireDepartmentIcon sx={{ color: '#F59E0B' }} />}
              sx={{
                fontWeight: 800,
                color: 'primary.main',
                minWidth: 'auto',
                p: '4px 8px',
                ml: 'auto',
              }}
            >
              Khuyến Mãi Hot
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Header;
