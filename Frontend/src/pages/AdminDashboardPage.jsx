import React, { useState, useEffect, useCallback } from 'react';
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

  const [activeTab, setActiveTab] = useState('stats'); // 'stats' | 'orders' | 'products' | 'categories' | 'brands' | 'variants' | 'coupons'
  const [productsMenuOpen, setProductsMenuOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Orders management state
  const [orders, setOrders] = useState([]);
  const [orderFilter, setOrderFilter] = useState('');
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Products management state
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [targetVariantProductId, setTargetVariantProductId] = useState(null);

  // Coupons state
  const [coupons, setCoupons] = useState([]);
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newDiscountType, setNewDiscountType] = useState('percent');
  const [newDiscountVal, setNewDiscountVal] = useState('');
  const [newUsageLimit, setNewUsageLimit] = useState('');
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');

  // Categories & Brands for product creation
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // New product form
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
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Lỗi lấy thống kê:', err);
    } finally {
      setLoadingStats(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoadingOrders(true);
    try {
      const params = {};
      if (orderFilter) params.status = orderFilter;
      const res = await orderApi.getAllOrdersAdmin(params);
      if (res.success && res.data) {
        setOrders(res.data.items || res.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn admin:', err);
    } finally {
      setLoadingOrders(false);
    }
  }, [orderFilter]);

  const fetchProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const res = await productApi.getProducts({ limit: 100, status: 'all' });
      if (res.success && res.data) {
        setProducts(res.data.items || []);
      }
    } catch (err) {
      console.error('Lỗi lấy sản phẩm admin:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await couponApi.getCoupons();
      if (res.success && res.data) {
        setCoupons(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy coupons:', err);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoryApi.getCategories();
      if (res.success && res.data) {
        setCategories(res.data || []);
      }
    } catch (err) {
      console.error('Lỗi lấy danh mục:', err);
    }
  }, []);

  const fetchBrands = useCallback(async () => {
    try {
      const res = await brandApi.getBrands();
      if (res.success && res.data) {
        setBrands(res.data || []);
      }
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

  // Handle Order Status Update
  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      const res = await orderApi.updateOrderStatus(orderId, newStatus);
      if (res.success) {
        const statusLabel = getOrderStatusText(newStatus)?.label || newStatus;
        toast.success(`Đã cập nhật trạng thái đơn: ${statusLabel}`);
        fetchOrders();
        fetchStats();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật trạng thái');
    }
  };

  // Handle Delete Product
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

  // Handle Add Product
  const handleCreateProduct = async (e) => {
    e.preventDefault();
    if (!newProdName || !newProdCatId || !newProdBrandId || !newVariantPrice) {
      toast.warning('Vui lòng điền đủ các thông tin bắt buộc!');
      return;
    }

    setSubmittingProduct(true);
    try {
      const payload = {
        category_id: parseInt(newProdCatId),
        brand_id: parseInt(newProdBrandId),
        product_name: newProdName.trim(),
        description: newProdDesc.trim(),
        thumbnail_url: newProdThumb.trim() || (newProdImages.length > 0 ? newProdImages[0] : (newVariantImages.length > 0 ? newVariantImages[0] : 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80')),
        images: newProdImages,
        variants: [
          {
            sku: newVariantSku.trim() || generateSku(newProdName, newVariantName),
            variant_name: newVariantName.trim() || 'Bản Tiêu Chuẩn',
            price: parseFloat(newVariantPrice),
            sale_price: newVariantSalePrice ? parseFloat(newVariantSalePrice) : parseFloat(newVariantPrice),
            stock: parseInt(newVariantStock) || 20,
            specifications: { 'Bảo hành': '24 tháng', 'Tình trạng': 'Mới 100% fullbox' },
            images: newVariantImages,
          },
        ],
      };

      const res = await productApi.createProduct(payload);
      if (res.success) {
        toast.success('Thêm sản phẩm mới thành công!');
        setShowAddProductModal(false);
        // Reset form
        setNewProdName('');
        setNewProdDesc('');
        setNewProdThumb('');
        setNewProdImages([]);
        setNewVariantSku('');
        setNewVariantName('');
        setNewVariantPrice('');
        setNewVariantSalePrice('');
        setNewVariantImages([]);
        fetchProducts();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tạo sản phẩm mới');
    } finally {
      setSubmittingProduct(false);
    }
  };

  // Handle Update Product
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

  // Handle Add Coupon
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    if (!newCouponCode || !newDiscountVal) return;

    if (newStartDate && newEndDate && new Date(newStartDate) > new Date(newEndDate)) {
      toast.warning('Ngày kết thúc phải sau hoặc bằng ngày bắt đầu!');
      return;
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
        setNewCouponCode('');
        setNewDiscountVal('');
        setNewUsageLimit('');
        setNewStartDate('');
        setNewEndDate('');
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
    try {
      const res = await couponApi.deleteCoupon(id);
      if (res.success) {
        toast.info('Đã xóa mã voucher');
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa voucher');
    }
  };

  if (!isStaff) {
    return (
      <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
        <Icons.ShieldCheck size={56} style={{ color: '#EF4444', margin: '0 auto 16px auto' }} />
        <h2 style={{ fontSize: 22, fontWeight: 900 }}>Quyền truy cập bị từ chối</h2>
        <p style={{ color: '#6B7280', marginTop: 8 }}>
          Trang này chỉ dành cho Quản trị viên (Admin) và Nhân viên (Staff).
        </p>
        <button
          onClick={() => onNavigate('home')}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 700,
            marginTop: 16,
          }}
        >
          Quay lại trang chủ
        </button>
      </div>
    );
  }

  return (
    <div className="freedash-wrapper">
      {/* Left Navigation Sidebar */}
      <aside className="freedash-sidebar">
        {/* Brand */}
        <div className="freedash-brand">
          <div className="freedash-logo-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
              <line x1="4" y1="22" x2="4" y2="15"></line>
            </svg>
          </div>
          <span className="freedash-brand-name">GearK Dash</span>
        </div>

        {/* Dashboard Main Button */}
        <button
          className={`freedash-nav-btn ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
              <polyline points="9 22 9 12 15 12 15 22"></polyline>
            </svg>
            <span>Tổng quan (Dashboard)</span>
          </div>
        </button>

        {/* APPLICATIONS GROUP: BÁN HÀNG & ĐƠN HÀNG */}
        <div className="freedash-nav-group-title">BÁN HÀNG & ĐƠN HÀNG</div>

        <button
          className={`freedash-nav-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z"></path>
              <path d="M13 5v2"></path>
              <path d="M13 17v2"></path>
              <path d="M13 11v2"></path>
            </svg>
            <span>Đơn hàng (Orders)</span>
          </div>
        </button>

        <button
          className={`freedash-nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            if (!isAdmin) {
              toast.warning('Chỉ Quản trị viên (Admin) mới có quyền truy cập mục quản lý nhân sự & phân quyền!');
              return;
            }
            setActiveTab('users');
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            <span>Nhân sự & Khách hàng</span>
          </div>
          {!isAdmin && (
            <span style={{ fontSize: 10, background: '#F1F5F9', padding: '2px 6px', borderRadius: 4, color: '#94A3B8' }}>
              Admin
            </span>
          )}
        </button>

        <button
          className="freedash-nav-btn"
          onClick={() => toast.info('Tin nhắn khách hàng & Đánh giá')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <span>Khách hàng & Chat</span>
          </div>
        </button>

        <button
          className="freedash-nav-btn"
          onClick={() => toast.info('Lịch hẹn bảo hành & sự kiện')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <span>Lịch giao hàng (Calendar)</span>
          </div>
        </button>

        {/* COMPONENTS GROUP: SẢN PHẨM & KHO HÀNG */}
        <div className="freedash-nav-group-title">SẢN PHẨM & KHO HÀNG</div>

        <button
          className={`freedash-nav-btn ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Quản lý Tồn kho</span>
          </div>
        </button>

        <div>
          <button
            className={`freedash-nav-btn ${['products', 'variants'].includes(activeTab) ? 'active' : ''}`}
            onClick={() => {
              setProductsMenuOpen(!productsMenuOpen);
              if (!['products', 'variants'].includes(activeTab)) {
                setActiveTab('products');
              }
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              <span>Quản lý Sản phẩm</span>
            </div>
            <Icons.ChevronDown size={14} style={{ transform: productsMenuOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
          </button>

          {productsMenuOpen && (
            <div className="freedash-nav-sublist">
              <button
                className={`freedash-subnav-btn ${activeTab === 'products' ? 'active' : ''}`}
                onClick={() => setActiveTab('products')}
              >
                Danh sách sản phẩm
              </button>
              <button
                className={`freedash-subnav-btn ${activeTab === 'variants' ? 'active' : ''}`}
                onClick={() => setActiveTab('variants')}
              >
                Phiên bản / Biến thể
              </button>
            </div>
          )}
        </div>

        <button
          className={`freedash-nav-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            <span>Danh mục (Categories)</span>
          </div>
        </button>

        <button
          className={`freedash-nav-btn ${activeTab === 'brands' ? 'active' : ''}`}
          onClick={() => setActiveTab('brands')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span>Thương hiệu (Brands)</span>
          </div>
        </button>

        <button
          className={`freedash-nav-btn ${activeTab === 'coupons' ? 'active' : ''}`}
          onClick={() => setActiveTab('coupons')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
            <span>Mã giảm giá (Coupons)</span>
          </div>
        </button>

        {/* AUTHENTICATION GROUP */}
        <div className="freedash-nav-group-title">HỆ THỐNG</div>

        <button
          className="freedash-nav-btn"
          onClick={() => onNavigate('home')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <span>Login</span>
          </div>
        </button>

        <button
          className="freedash-nav-btn"
          onClick={() => onNavigate('home')}
          style={{ marginTop: 'auto', color: '#DC2626' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Icons.ChevronLeft size={18} />
            <span>Về Storefront</span>
          </div>
        </button>
      </aside>

      {/* Main Content Area */}
      <div className="freedash-main">
        {/* Topbar Header */}
        <header className="freedash-topbar">
          <div className="freedash-topbar-left">
            <div className="freedash-icon-pill" title="Thông báo">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              <span className="freedash-badge-count">5</span>
            </div>

            <div className="freedash-icon-pill" title="Cài đặt">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
            </div>

            <div className="freedash-lang-pill">
              <span>EN</span>
              <Icons.ChevronDown size={13} />
            </div>
          </div>

          <div className="freedash-topbar-right">
            <div className="freedash-search-box">
              <input
                type="text"
                placeholder="Search"
                className="freedash-search-input"
              />
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </div>

            <div className="freedash-user-badge">
              <img
                src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80'}
                alt="Avatar"
                className="freedash-user-avatar"
              />
              <span className="freedash-user-name">
                Hello, <strong>{user?.full_name || 'Jason Doe'}</strong>
              </span>
              <Icons.ChevronDown size={14} style={{ color: '#94A3B8' }} />
            </div>
          </div>
        </header>

        {/* Content Body */}
        <div className="freedash-content">
          {/* Greeting Row */}
          <div className="freedash-greeting-row">
            <div>
              <h1 className="freedash-greeting-title">
                Good Morning {user?.full_name ? user.full_name.split(' ').slice(-1)[0] : 'Jason'}!
              </h1>
              <div className="freedash-greeting-sub">Dashboard</div>
            </div>

            <div className="freedash-date-filter">
              <span>Aug 23</span>
              <Icons.ChevronDown size={14} />
            </div>
          </div>
                    {/* TAB 1: OVERVIEW & STATS */}
          {activeTab === 'stats' && (
            <StatsTab
              stats={stats}
              loadingStats={loadingStats}
              formatPrice={formatPrice}
              formatDate={formatDate}
              getOrderStatusText={getOrderStatusText}
              Icons={Icons}
            />
          )}

          {/* TAB 2: ORDERS MANAGEMENT */}
          {activeTab === 'orders' && (
            <OrdersTab
              orders={orders}
              orderFilter={orderFilter}
              setOrderFilter={setOrderFilter}
              fetchOrders={fetchOrders}
              handleUpdateStatus={handleUpdateStatus}
              formatPrice={formatPrice}
              getOrderStatusText={getOrderStatusText}
            />
          )}

          {/* TAB 3: PRODUCTS MANAGEMENT */}
          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              setShowAddProductModal={setShowAddProductModal}
              onNavigate={onNavigate}
              formatPrice={formatPrice}
              isAdmin={isAdmin}
              handleDeleteProduct={handleDeleteProduct}
              onEditProduct={(prod) => setEditingProduct(prod)}
              onManageVariants={handleManageVariants}
              Icons={Icons}
            />
          )}

          {/* TAB: CATEGORIES */}
          {activeTab === 'categories' && (
            <CategoriesTab
              categories={categories}
              fetchCategories={fetchCategories}
              isAdmin={isAdmin}
              Icons={Icons}
            />
          )}

          {/* TAB: BRANDS */}
          {activeTab === 'brands' && (
            <BrandsTab
              brands={brands}
              fetchBrands={fetchBrands}
              isAdmin={isAdmin}
              Icons={Icons}
            />
          )}

          {/* TAB: PRODUCT VARIANTS */}
          {activeTab === 'variants' && (
            <VariantsTab
              products={products}
              formatPrice={formatPrice}
              isAdmin={isAdmin}
              Icons={Icons}
              onNavigate={onNavigate}
              targetProductId={targetVariantProductId}
            />
          )}

          {/* TAB 4: COUPONS */}
          {activeTab === 'coupons' && (
            <CouponsTab
              coupons={coupons}
              newCouponCode={newCouponCode}
              setNewCouponCode={setNewCouponCode}
              newDiscountType={newDiscountType}
              setNewDiscountType={setNewDiscountType}
              newDiscountVal={newDiscountVal}
              setNewDiscountVal={setNewDiscountVal}
              newUsageLimit={newUsageLimit}
              setNewUsageLimit={setNewUsageLimit}
              newStartDate={newStartDate}
              setNewStartDate={setNewStartDate}
              newEndDate={newEndDate}
              setNewEndDate={setNewEndDate}
              handleCreateCoupon={handleCreateCoupon}
              handleUpdateCoupon={handleUpdateCoupon}
              formatPrice={formatPrice}
              formatDate={formatDate}
              isAdmin={isAdmin}
              handleDeleteCoupon={handleDeleteCoupon}
              Icons={Icons}
            />
          )}

          {/* TAB: INVENTORY / KHO HÀNG */}
          {activeTab === 'inventory' && (
            <InventoryTab Icons={Icons} />
          )}

          {/* TAB: USERS & STAFF MANAGEMENT */}
          {activeTab === 'users' && (
            <UsersTab
              user={user}
              isAdmin={isAdmin}
              toast={toast}
              Icons={Icons}
            />
          )}
        </div>
      </div>

      {/* Modal Add Product */}
      <AddProductModal
        showAddProductModal={showAddProductModal}
        setShowAddProductModal={setShowAddProductModal}
        handleCreateProduct={handleCreateProduct}
        submittingProduct={submittingProduct}
        newProdName={newProdName}
        setNewProdName={setNewProdName}
        newProdCatId={newProdCatId}
        setNewProdCatId={setNewProdCatId}
        categories={categories}
        newProdBrandId={newProdBrandId}
        setNewProdBrandId={setNewProdBrandId}
        brands={brands}
        newProdDesc={newProdDesc}
        setNewProdDesc={setNewProdDesc}
        newProdThumb={newProdThumb}
        setNewProdThumb={setNewProdThumb}
        newProdImages={newProdImages}
        setNewProdImages={setNewProdImages}
        newVariantName={newVariantName}
        setNewVariantName={setNewVariantName}
        newVariantSku={newVariantSku}
        setNewVariantSku={setNewVariantSku}
        newVariantPrice={newVariantPrice}
        setNewVariantPrice={setNewVariantPrice}
        newVariantSalePrice={newVariantSalePrice}
        setNewVariantSalePrice={setNewVariantSalePrice}
        newVariantStock={newVariantStock}
        setNewVariantStock={setNewVariantStock}
        newVariantImages={newVariantImages}
        setNewVariantImages={setNewVariantImages}
        Icons={Icons}
      />

      {/* Modal Edit Product */}
      <EditProductModal
        editingProduct={editingProduct}
        setEditingProduct={setEditingProduct}
        categories={categories}
        brands={brands}
        handleUpdateProduct={handleUpdateProduct}
        onManageVariants={handleManageVariants}
        Icons={Icons}
      />
    </div>
  );
};
