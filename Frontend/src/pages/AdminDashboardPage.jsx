import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardApi, couponApi } from '../api/extraApi';
import { orderApi } from '../api/cartApi';
import { productApi } from '../api/productApi';
import { categoryApi, brandApi } from '../api/categoryApi';
import { formatPrice, formatDate, getOrderStatusText } from '../utils/formatters';
import Icons from '../components/common/Icons';
import StatsTab from './pageDashboard/StatsTab';
import OrdersTab from './pageDashboard/OrdersTab';
import ProductsTab from './pageDashboard/ProductsTab';
import CouponsTab from './pageDashboard/CouponsTab';
import CategoriesTab from './pageDashboard/CategoriesTab';
import BrandsTab from './pageDashboard/BrandsTab';
import VariantsTab from './pageDashboard/VariantsTab';
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

  // Categories & Brands for product creation
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // New product form
  const [newProdName, setNewProdName] = useState('');
  const [newProdCatId, setNewProdCatId] = useState('');
  const [newProdBrandId, setNewProdBrandId] = useState('');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdThumb, setNewProdThumb] = useState('');
  const [newVariantSku, setNewVariantSku] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newVariantPrice, setNewVariantPrice] = useState('');
  const [newVariantSalePrice, setNewVariantSalePrice] = useState('');
  const [newVariantStock, setNewVariantStock] = useState('20');
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
        thumbnail_url: newProdThumb.trim() || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80',
        variants: [
          {
            sku: newVariantSku.trim() || `GEARK-${Date.now().toString().slice(-4)}`,
            variant_name: newVariantName.trim() || 'Bản Tiêu Chuẩn',
            price: parseFloat(newVariantPrice),
            sale_price: newVariantSalePrice ? parseFloat(newVariantSalePrice) : parseFloat(newVariantPrice),
            stock: parseInt(newVariantStock) || 20,
            specifications: { 'Bảo hành': '24 tháng', 'Tình trạng': 'Mới 100% fullbox' },
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
        setNewVariantSku('');
        setNewVariantName('');
        setNewVariantPrice('');
        setNewVariantSalePrice('');
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
    try {
      const res = await couponApi.createCoupon({
        coupon_code: newCouponCode.trim().toUpperCase(),
        discount_type: newDiscountType,
        discount_value: parseFloat(newDiscountVal),
        usage_limit: newUsageLimit !== '' ? parseInt(newUsageLimit) : undefined,
      });
      if (res.success) {
        toast.success(`Đã tạo mã ${newCouponCode.toUpperCase()}!`);
        setNewCouponCode('');
        setNewDiscountVal('');
        setNewUsageLimit('');
        fetchCoupons();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tạo mã giảm giá');
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
    <div className="container" style={{ paddingBottom: 60 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 0 16px 0',
          borderBottom: '2px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            type="button"
            onClick={() => onNavigate('home')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              backgroundColor: '#F3F4F6',
              color: '#374151',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid #E5E7EB',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#E5E7EB';
              e.currentTarget.style.color = '#111827';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
              e.currentTarget.style.color = '#374151';
            }}
          >
            <Icons.ChevronLeft size={16} />
            <span>Về cửa hàng</span>
          </button>
          <h1 style={{ fontSize: 24, fontWeight: 900, color: '#111827', margin: 0 }}>
            BẢNG ĐIỀU KHIỂN QUẢN TRỊ GEARK
          </h1>
        </div>
        <span
          style={{
            backgroundColor: '#FEE2E2',
            color: 'var(--primary)',
            padding: '6px 14px',
            borderRadius: 20,
            fontSize: 12,
            fontWeight: 800,
            textTransform: 'uppercase',
          }}
        >
          👑 {user.role}: {user.full_name}
        </span>
      </div>

      <div className="admin-layout">
        {/* Left Navigation Sidebar */}
        <aside className="admin-sidebar">
          <button
            className={`admin-nav-item ${activeTab === 'stats' ? 'active' : ''}`}
            onClick={() => setActiveTab('stats')}
          >
            <Icons.LayoutDashboard size={18} />
            <span>Tổng quan & KPI</span>
          </button>

          <button
            className={`admin-nav-item ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            <Icons.Package size={18} />
            <span>Quản lý Đơn hàng</span>
          </button>

          {/* Products Dropdown Menu */}
          <div className="admin-nav-dropdown">
            <button
              className={`admin-nav-item ${['products', 'categories', 'brands', 'variants'].includes(activeTab) ? 'active' : ''}`}
              onClick={() => {
                setProductsMenuOpen(!productsMenuOpen);
                if (!['products', 'categories', 'brands', 'variants'].includes(activeTab)) {
                  setActiveTab('products');
                }
              }}
              style={{ justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icons.Sliders size={18} />
                <span>Quản lý Sản phẩm</span>
              </div>
              {productsMenuOpen ? <Icons.ChevronUp size={16} /> : <Icons.ChevronDown size={16} />}
            </button>

            {productsMenuOpen && (
              <div className="admin-subnav">
                <button
                  className={`admin-subnav-item ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  <Icons.Package size={14} />
                  <span>Tất cả sản phẩm</span>
                </button>

                <button
                  className={`admin-subnav-item ${activeTab === 'categories' ? 'active' : ''}`}
                  onClick={() => setActiveTab('categories')}
                >
                  <Icons.Folder size={14} />
                  <span>Danh mục (Categories)</span>
                </button>

                <button
                  className={`admin-subnav-item ${activeTab === 'brands' ? 'active' : ''}`}
                  onClick={() => setActiveTab('brands')}
                >
                  <Icons.Tag size={14} />
                  <span>Thương hiệu (Brands)</span>
                </button>

                <button
                  className={`admin-subnav-item ${activeTab === 'variants' ? 'active' : ''}`}
                  onClick={() => setActiveTab('variants')}
                >
                  <Icons.Layers size={14} />
                  <span>Biến thể (Product Variants)</span>
                </button>
              </div>
            )}
          </div>

          <button
            className={`admin-nav-item ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            <Icons.Tag size={18} />
            <span>Mã giảm giá (Vouchers)</span>
          </button>
        </aside>

        {/* Main Admin Content */}
        <main>
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
              handleCreateCoupon={handleCreateCoupon}
              formatPrice={formatPrice}
              formatDate={formatDate}
              isAdmin={isAdmin}
              handleDeleteCoupon={handleDeleteCoupon}
              Icons={Icons}
            />
          )}

</main>
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
