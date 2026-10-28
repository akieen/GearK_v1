import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import Avatar from '@mui/material/Avatar';
import InputBase from '@mui/material/InputBase';
import Chip from '@mui/material/Chip';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import ConfirmationNumberOutlinedIcon from '@mui/icons-material/ConfirmationNumberOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ChatOutlinedIcon from '@mui/icons-material/ChatOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import GridViewOutlinedIcon from '@mui/icons-material/GridViewOutlined';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import StarIcon from '@mui/icons-material/Star';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import SearchIcon from '@mui/icons-material/Search';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import SecurityOutlinedIcon from '@mui/icons-material/SecurityOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';

import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardApi, couponApi } from '../api/extraApi';
import { orderApi } from '../api/cartApi';
import { productApi } from '../api/productApi';
import { categoryApi, brandApi } from '../api/categoryApi';
import { formatPrice, formatDate, getOrderStatusText, generateSku } from '../utils/formatters';
import Icons from '../components/common/Icons';

import StatsTab from './pageDashboard/StatsTab';
import OrdersTab from './pageDashboard/OrdersTab';
import ProductsTab from './pageDashboard/ProductsTab';
import CouponsTab from './pageDashboard/CouponsTab';
import CategoriesTab from './pageDashboard/CategoriesTab';
import BrandsTab from './pageDashboard/BrandsTab';
import VariantsTab from './pageDashboard/VariantsTab';
import InventoryTab from './pageDashboard/InventoryTab';
import UsersTab from './pageDashboard/UsersTab';
import AddProductModal from './pageDashboard/AddProductModal';
import EditProductModal from './pageDashboard/EditProductModal';

export const AdminDashboardPage = ({ onNavigate }) => {
  const { user, isStaff, isAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('stats');
  const [productsMenuOpen, setProductsMenuOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('');
  const [products, setProducts] = useState([]);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [targetVariantProductId, setTargetVariantProductId] = useState(null);

  const [coupons, setCoupons] = useState([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState('percent');
  const [newDiscountVal, setNewDiscountVal] = useState('');
  const [newUsageLimit, setNewUsageLimit] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [newProdName, setNewProdName] = useState('');
  const [newProdCatId, setNewProdCatId] = useState('');
  const [newProdBrandId, setNewProdBrandId] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdThumb, setNewProdThumb] = useState('');
  const [newProdImages, setNewProdImages] = useState([]);
  const [newVariantSku, setNewVariantSku] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantSalePrice, setNewVariantSalePrice] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('20');
  const [newVariantImages, setNewVariantImages] = useState([]);
  const [submittingProduct, setSubmittingProduct] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoadingStats(true);
    try {
      const res = await dashboardApi.getStats();
      if (res.success && res.data) setStats(res.data);
    } catch (err) {
      console.error('Lỗi lấy thống kê:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchOrders = useCallback(async (filterOverride) => {
    try {
      const target = filterOverride !== undefined ? filterOverride : orderFilter;
      const res = await orderApi.getAllOrdersAdmin({ limit: 100, ...(target && { order_status: target, status: target }) });
      if (res.success && res.data) setOrders(res.data.items || res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn admin:', err);
    }
  }, [orderFilter]);

  const fetchProducts = useCallback(async () => {
    try {
      const res = await productApi.getProducts({ limit: 100, status: 'all' });
      if (res.success && res.data) setProducts(res.data.items || []);
    } catch (err) {
      console.error('Lỗi lấy sản phẩm admin:', err);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await couponApi.getCoupons();
      if (res.success && res.data) setCoupons(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy coupons:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.success && res.data) setCategories(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await brandApi.getBrands();
      if (res.success && res.data) setBrands(res.data || []);
    } catch (err) {
      console.error('Lỗi lấy thương hiệu:', err);
    }
  }, []);

  useEffect(() => {
    if (!isStaff) return;
    fetchStats();
    fetchCategories();
    fetchBrands();
  }, [isStaff, fetchStats, fetchCategories, fetchBrands]);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
    if (activeTab === 'products' || activeTab === 'variants') fetchProducts();
    if (activeTab === 'coupons') fetchCoupons();
    if (activeTab === 'categories') fetchCategories();
    if (activeTab === 'brands') fetchBrands();
  }, [activeTab, fetchOrders, fetchProducts, fetchCoupons, fetchCategories, fetchBrands]);

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await orderApi.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        toast.success(`Đã cập nhật trạng thái đơn: ${getOrderStatusText(newStatus)?.label || newStatus}`);
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) return;
    try {
      const res = await productApi.deleteProduct(id);
      if (res.success) {
        toast.success('Đã xóa sản phẩm thành công!');
        fetchProducts();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa sản phẩm');
    }
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdCatId || !newProdBrandId || !newVariantPrice) {
      return toast.warning('Vui lòng điền đủ các thông tin bắt buộc!');
    }
    setSubmittingProduct(true);
    try {
      const defaultThumb = 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80';
      const res = await productApi.createProduct({
        category_id: parseInt(newProdCatId),
        brand_id: parseInt(newProdBrandId),
        product_name: newProdName.trim(),
        description: newProdDesc.trim(),
        thumbnail_url: newProdThumb.trim() || newProdImages[0] || newVariantImages[0] || defaultThumb,
        images: newProdImages,
        variants: [{
          sku: newVariantSku.trim() || generateSku(newProdName, newVariantName),
          variant_name: newVariantName.trim() || 'Bản Tiêu Chuẩn',
          price: parseFloat(newVariantPrice),
          sale_price: newVariantSalePrice ? parseFloat(newVariantSalePrice) : parseFloat(newVariantPrice),
          stock: parseInt(newVariantStock) || 20,
          specifications: { 'Bảo hành': '24 tháng', 'Tình trạng': 'Mới 100% fullbox' },
          images: newVariantImages,
        }],
      });
      if (res.success) {
        toast.success('Thêm sản phẩm mới thành công!');
        setShowAddProductModal(false);
        setNewProdName(''); setNewProdDesc(''); setNewProdThumb(''); setNewProdImages([]);
        setNewVariantSku(''); setNewVariantName(''); setNewVariantPrice(''); setNewVariantSalePrice(''); setNewVariantImages([]);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tạo sản phẩm mới');
    } finally {
      setSubmittingProduct(false);
    }
  };

  const handleUpdateProduct = async (id, payload) => {
    try {
      const res = await productApi.updateProduct(id, payload);
      if (res.success) {
        toast.success('Cập nhật sản phẩm thành công!');
        setEditingProduct(null);
        fetchProducts();
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật sản phẩm');
      return false;
    }
  };

  const handleManageVariants = (productId) => {
    setTargetVariantProductId(productId);
    setActiveTab('variants');
  };

  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode || !newDiscountVal) return;
    if (newStartDate && newEndDate && new Date(newStartDate) > new Date(newEndDate)) {
      return toast.warning('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu!');
    }
    try {
      const res = await couponApi.createCoupon({
        coupon_code: newCouponCode.trim().toUpperCase(),
        discount_type: newDiscountType,
        discount_value: parseFloat(newDiscountVal),
        usage_limit: newUsageLimit !== '' ? parseInt(newUsageLimit) : undefined,
        start_date: newStartDate || undefined,
        end_date: newEndDate || undefined,
      });
      if (res.success) {
        toast.success(`Đã tạo mã ${newCouponCode.toUpperCase()}!`);
        setNewCouponCode(''); setNewDiscountVal(''); setNewUsageLimit(''); setNewStartDate(''); setNewEndDate('');
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tạo mã giảm giá');
    }
  };

  const handleUpdateCoupon = async (id, data) => {
    try {
      const res = await couponApi.updateCoupon(id, data);
      if (res.success) {
        toast.success('Cập nhật mã giảm giá thành công!');
        fetchCoupons();
        return true;
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật mã giảm giá');
      return false;
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa mã giảm giá này?')) return;
    try {
      const res = await couponApi.deleteCoupon(id);
      if (res.success) {
        toast.success(res.message || 'Đã xóa mã voucher thành công');
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa voucher');
    }
  };

  if (!isStaff) {
    return (
      <Container maxWidth="sm" sx={{ py: 10, textAlign: 'center' }}>
        <SecurityOutlinedIcon sx={{ fontSize: 56, color: 'error.main', mb: 2 }} />
        <Typography variant="h4" fontWeight={900}>Quyền truy cập bị từ chối</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, mb: 2.5 }}>
          Trang này chỉ dành cho Quản trị viên (Admin) và Nhân viên (Staff).
        </Typography>
        <Button variant="contained" onClick={() => onNavigate('home')}>Quay lại trang chủ</Button>
      </Container>
    );
  }

  const navBtnSx = (active) => ({
    flexGrow: 0,
    borderRadius: '10px',
    mb: 0.5,
    px: 1.5,
    py: 1,
    color: active ? '#FFFFFF' : '#64748B',
    background: active ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : 'transparent',
    boxShadow: active ? '0 6px 14px rgba(220, 38, 38, 0.28)' : 'none',
    '&:hover': {
      background: active ? 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)' : '#F8FAFC',
      color: active ? '#FFFFFF' : '#1E293B',
    },
    '& .MuiListItemIcon-root': { color: active ? '#FFFFFF' : 'inherit', minWidth: 30 },
  });

  const renderGroupTitle = (title) => (
    <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.8px', textTransform: 'uppercase', mt: 2, mb: 0.75, px: 1 }}>
      {title}
    </Typography>
  );

  const renderNavBtn = (id, label, icon, onClickOverride, extra) => {
    const active = activeTab === id;
    return (
      <ListItemButton key={id} sx={navBtnSx(active)} onClick={onClickOverride || (() => setActiveTab(id))}>
        {icon && <ListItemIcon>{icon}</ListItemIcon>}
        <ListItemText
          primary={label}
          primaryTypographyProps={{ fontSize: 13.5, fontWeight: active ? 700 : 600, noWrap: true }}
        />
        {extra}
      </ListItemButton>
    );
  };

  const iconPillSx = { width: 38, height: 38, bgcolor: '#FFFFFF', border: '1px solid #EEF2F6', color: '#64748B' };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#F4F7FD', color: '#1E293B' }}>
      {/* Sidebar */}
      <Box
        component="aside"
        sx={{
          width: 250,
          bgcolor: '#FFFFFF',
          borderRight: '1px solid #E2E8F0',
          display: 'flex',
          flexDirection: 'column',
          p: '24px 16px',
          flexShrink: 0,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 1, pb: 2.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#FFFFFF',
              boxShadow: '0 4px 14px rgba(220, 38, 38, 0.35)',
            }}
          >
            <FlagOutlinedIcon fontSize="small" />
          </Box>
          <Typography sx={{ fontSize: 20, fontWeight: 800, color: '#1E293B', letterSpacing: '-0.5px' }}>
            GearK Dash
          </Typography>
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderNavBtn('stats', 'Tổng quan (Dashboard)', <HomeOutlinedIcon sx={{ fontSize: 18 }} />)}

          {renderGroupTitle('BÁN HÀNG & ĐƠN HÀNG')}
          {renderNavBtn('orders', 'Đơn hàng (Orders)', <ConfirmationNumberOutlinedIcon sx={{ fontSize: 18 }} />)}
          {renderNavBtn(
            'users',
            'Nhân sự & Khách hàng',
            <PeopleOutlinedIcon sx={{ fontSize: 18 }} />,
            () => isAdmin ? setActiveTab('users') : toast.warning('Chỉ Quản trị viên (Admin) mới có quyền truy cập mục quản lý nhân sự & phân quyền!'),
            !isAdmin && <Chip label="Admin" size="small" sx={{ height: 18, fontSize: 10, bgcolor: '#F1F5F9', color: '#94A3B8' }} />
          )}
          {renderNavBtn('chat', 'Khách hàng & Chat', <ChatOutlinedIcon sx={{ fontSize: 18 }} />, () => toast.info('Tin nhắn khách hàng & Đánh giá'))}
          {renderNavBtn('calendar', 'Lịch giao hàng (Calendar)', <CalendarTodayOutlinedIcon sx={{ fontSize: 18 }} />, () => toast.info('Lịch hẹn bảo hành & sự kiện'))}

          {renderGroupTitle('SẢN PHẨM & KHO HÀNG')}
          {renderNavBtn('inventory', 'Quản lý Tồn kho', <GridViewOutlinedIcon sx={{ fontSize: 18 }} />)}

          <ListItemButton
            sx={navBtnSx(['products', 'variants'].includes(activeTab))}
            onClick={() => {
              setProductsMenuOpen(!productsMenuOpen);
              if (!['products', 'variants'].includes(activeTab)) setActiveTab('products');
            }}
          >
            <ListItemIcon><DescriptionOutlinedIcon sx={{ fontSize: 18 }} /></ListItemIcon>
            <ListItemText primary="Quản lý Sản phẩm" primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600, noWrap: true }} />
            {productsMenuOpen ? <ExpandLessIcon sx={{ fontSize: 16 }} /> : <ExpandMoreIcon sx={{ fontSize: 16 }} />}
          </ListItemButton>

          <Collapse in={productsMenuOpen} timeout="auto" unmountOnExit>
            <Stack sx={{ pl: 1.5, mb: 0.5, ml: 2, borderLeft: '2px solid #E2E8F0' }}>
              {[
                { id: 'products', label: 'Danh sách sản phẩm' },
                { id: 'variants', label: 'Phiên bản / Biến thể' },
              ].map((sub) => {
                const subActive = activeTab === sub.id;
                return (
                  <ListItemButton
                    key={sub.id}
                    onClick={() => setActiveTab(sub.id)}
                    sx={{
                      flexGrow: 0,
                      py: 0.75,
                      px: 1.5,
                      borderRadius: '8px',
                      color: subActive ? '#DC2626' : '#64748B',
                      bgcolor: subActive ? '#FEE2E2' : 'transparent',
                      '&:hover': { color: '#DC2626', bgcolor: '#FEF2F2' },
                    }}
                  >
                    <ListItemText primary={sub.label} primaryTypographyProps={{ fontSize: 13, fontWeight: subActive ? 700 : 600 }} />
                  </ListItemButton>
                );
              })}
            </Stack>
          </Collapse>

          {renderNavBtn('categories', 'Danh mục (Categories)', <Inventory2OutlinedIcon sx={{ fontSize: 18 }} />)}
          {renderNavBtn('brands', 'Thương hiệu (Brands)', <StarIcon sx={{ fontSize: 18 }} />)}
          {renderNavBtn('coupons', 'Mã giảm giá (Coupons)', <CreditCardOutlinedIcon sx={{ fontSize: 18 }} />)}

          {renderGroupTitle('HỆ THỐNG')}
          {renderNavBtn('login', 'Login', <LockOutlinedIcon sx={{ fontSize: 18 }} />, () => onNavigate('home'))}

          <ListItemButton
            onClick={() => onNavigate('home')}
            sx={{ ...navBtnSx(false), mt: 'auto', color: '#DC2626', '&:hover': { bgcolor: '#FEF2F2', color: '#DC2626' } }}
          >
            <ListItemIcon sx={{ color: '#DC2626 !important', minWidth: 30 }}>
              <ChevronLeftIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText primary="Về Storefront" primaryTypographyProps={{ fontSize: 13.5, fontWeight: 600 }} />
          </ListItemButton>
        </Box>
      </Box>

      {/* Main Content */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflowY: 'auto' }}>
        <Stack component="header" direction="row" alignItems="center" justifyContent="space-between" sx={{ px: 4, py: 2.25, gap: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <IconButton title="Thông báo" sx={iconPillSx}>
              <Badge badgeContent={5} color="error"><NotificationsNoneOutlinedIcon sx={{ fontSize: 18 }} /></Badge>
            </IconButton>
            <IconButton title="Cài đặt" sx={iconPillSx}>
              <SettingsOutlinedIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <Paper elevation={0} sx={{ px: 1.75, py: 0.75, borderRadius: 5, border: '1px solid #EEF2F6', display: 'flex', alignItems: 'center', gap: 0.75, cursor: 'pointer', color: '#64748B' }}>
              <Typography sx={{ fontSize: 12.5, fontWeight: 700 }}>EN</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
            </Paper>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={2.5}>
            <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', px: 2.25, py: 0.75, width: 260, borderRadius: 99, border: '1px solid #EEF2F6' }}>
              <InputBase placeholder="Search" sx={{ fontSize: 13.5, width: '100%' }} />
              <SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
            </Paper>
            <Stack direction="row" alignItems="center" spacing={1.25} sx={{ cursor: 'pointer' }}>
              <Avatar
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                sx={{ width: 36, height: 36, border: '2px solid #E2E8F0' }}
              />
              <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: '#475569' }}>
                Hello, <strong>{user?.full_name || 'Jason Doe'}</strong>
              </Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: '#94A3B8' }} />
            </Stack>
          </Stack>
        </Stack>

        <Box sx={{ px: 4, pb: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
            <Box>
              <Typography sx={{ fontSize: 24, fontWeight: 800, color: '#1E293B', letterSpacing: '-0.3px' }}>
                Good Morning {user?.full_name ? user.full_name.split(' ').slice(-1)[0] : 'Jason'}!
              </Typography>
              <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', mt: 0.5 }}>Dashboard</Typography>
            </Box>
            <Paper elevation={0} sx={{ px: 2, py: 1, borderRadius: 5, border: '1px solid #EEF2F6', display: 'flex', alignItems: 'center', gap: 1, color: '#64748B', cursor: 'pointer' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Aug 23</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 16 }} />
            </Paper>
          </Stack>

          {activeTab === 'stats' && <StatsTab stats={stats} loadingStats={loadingStats} formatPrice={formatPrice} formatDate={formatDate} getOrderStatusText={getOrderStatusText} Icons={Icons} />}
          {activeTab === 'orders' && <OrdersTab orders={orders} orderFilter={orderFilter} setOrderFilter={setOrderFilter} fetchOrders={fetchOrders} handleUpdateStatus={handleUpdateStatus} formatPrice={formatPrice} getOrderStatusText={getOrderStatusText} />}
          {activeTab === 'products' && <ProductsTab products={products} setShowAddProductModal={setShowAddProductModal} onNavigate={onNavigate} formatPrice={formatPrice} isAdmin={isAdmin} handleDeleteProduct={handleDeleteProduct} onEditProduct={setEditingProduct} onManageVariants={handleManageVariants} Icons={Icons} />}
          {activeTab === 'categories' && <CategoriesTab categories={categories} fetchCategories={fetchCategories} isAdmin={isAdmin} Icons={Icons} />}
          {activeTab === 'brands' && <BrandsTab brands={brands} fetchBrands={fetchBrands} isAdmin={isAdmin} Icons={Icons} />}
          {activeTab === 'variants' && <VariantsTab products={products} formatPrice={formatPrice} isAdmin={isAdmin} Icons={Icons} onNavigate={onNavigate} targetProductId={targetVariantProductId} />}
          {activeTab === 'coupons' && (
            <CouponsTab
              coupons={coupons} newCouponCode={newCouponCode} setNewCouponCode={setNewCouponCode}
              newDiscountType={newDiscountType} setNewDiscountType={setNewDiscountType}
              newDiscountVal={newDiscountVal} setNewDiscountVal={setNewDiscountVal}
              newUsageLimit={newUsageLimit} setNewUsageLimit={setNewUsageLimit}
              newStartDate={newStartDate} setNewStartDate={setNewStartDate}
              newEndDate={newEndDate} setNewEndDate={setNewEndDate}
              handleCreateCoupon={handleCreateCoupon} handleUpdateCoupon={handleUpdateCoupon}
              formatPrice={formatPrice} formatDate={formatDate} isAdmin={isAdmin}
              handleDeleteCoupon={handleDeleteCoupon} Icons={Icons}
            />
          )}
          {activeTab === 'inventory' && <InventoryTab Icons={Icons} />}
          {activeTab === 'users' && <UsersTab user={user} isAdmin={isAdmin} toast={toast} Icons={Icons} />}
        </Box>
      </Box>

      <AddProductModal
        showAddProductModal={showAddProductModal} setShowAddProductModal={setShowAddProductModal}
        handleCreateProduct={handleCreateProduct} submittingProduct={submittingProduct}
        newProdName={newProdName} setNewProdName={setNewProdName}
        newProdCatId={newProdCatId} setNewProdCatId={setNewProdCatId} categories={categories}
        newProdBrandId={newProdBrandId} setNewProdBrandId={setNewProdBrandId} brands={brands}
        newProdDesc={newProdDesc} setNewProdDesc={setNewProdDesc}
        newProdThumb={newProdThumb} setNewProdThumb={setNewProdThumb}
        newProdImages={newProdImages} setNewProdImages={setNewProdImages}
        newVariantName={newVariantName} setNewVariantName={setNewVariantName}
        newVariantSku={newVariantSku} setNewVariantSku={setNewVariantSku}
        newVariantPrice={newVariantPrice} setNewVariantPrice={setNewVariantPrice}
        newVariantSalePrice={newVariantSalePrice} setNewVariantSalePrice={setNewVariantSalePrice}
        newVariantStock={newVariantStock} setNewVariantStock={setNewVariantStock}
        newVariantImages={newVariantImages} setNewVariantImages={setNewVariantImages}
        Icons={Icons}
      />

      <EditProductModal
        editingProduct={editingProduct} setEditingProduct={setEditingProduct}
        categories={categories} brands={brands}
        handleUpdateProduct={handleUpdateProduct} onManageVariants={handleManageVariants}
        Icons={Icons}
      />
    </Box>
  );
};
