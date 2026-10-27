import React, { useState, useEffect } from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { AuthModal } from './components/auth/AuthModal';
import { ToastContainer } from './components/common/ToastContainer';

// Pages
import { HomePage } from './pages/HomePage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { MyOrdersPage } from './pages/MyOrdersPage';
import { WishlistPage } from './pages/WishlistPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

// APIs
import { productApi } from './api/productApi';
import { categoryApi, brandApi } from './api/categoryApi';
import Box from '@mui/material/Box';

// Helper to parse route path and query parameters from hash or path string
const parseRoute = (path) => {
  const cleanPath = (path || '').replace(/^#\/?/, '').trim();
  if (!cleanPath) {
    return { route: 'home', params: {} };
  }

  const [routePath, queryString] = cleanPath.split('?');
  const queryParams = new URLSearchParams(queryString || '');
  const params = {};
  queryParams.forEach((val, key) => {
    params[key] = val;
  });

  if (routePath.startsWith('product/')) {
    const slug = routePath.replace(/^product\//, '');
    return { route: 'product-detail', params: { slug, ...params } };
  } else if (routePath.startsWith('order-success/')) {
    const code = routePath.replace(/^order-success\//, '');
    return { route: 'order-success', params: { orderCode: code, ...params } };
  } else if (routePath.startsWith('admin')) {
    return { route: 'admin', params };
  }

  return { route: routePath || 'home', params };
};

function AppContent() {
  const initialParsed = parseRoute(window.location.hash);
  const [currentRoute, setCurrentRoute] = useState(initialParsed.route);
  const [routeParams, setRouteParams] = useState(initialParsed.params);
  const [lastOrderData, setLastOrderData] = useState(null);

  // Global store data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Đảm bảo cuộn về đầu trang khi tải lại trang và trước khi unload
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
    window.scrollTo(0, 0);

    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Cuộn về đầu trang mỗi khi chuyển route
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentRoute]);

  // Listen for browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const { route, params } = parseRoute(window.location.hash);
      setCurrentRoute(route);
      setRouteParams(params);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [prodRes, catRes, brandRes] = await Promise.all([
          productApi.getProducts({ limit: 12 }),
          categoryApi.getCategories(),
          brandApi.getBrands(),
        ]);
        if (prodRes.success && prodRes.data) {
          setProducts(prodRes.data.items || []);
        }
        if (catRes.success && catRes.data) {
          setCategories(catRes.data || []);
        }
        if (brandRes.success && brandRes.data) {
          setBrands(brandRes.data || []);
        }
      } catch (err) {
        console.error('Lỗi nạp dữ liệu ban đầu:', err);
      }
    };
    loadInitialData();
  }, []);

  // Custom client navigation
  const navigate = (path, updateHash = true) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const { route, params } = parseRoute(path);
    setCurrentRoute(route);
    setRouteParams(params);

    if (updateHash) {
      window.location.hash = path;
    }
  };

  const isAdminRoute = currentRoute === 'admin' || currentRoute.startsWith('admin');

  return (
    <>
      {!isAdminRoute && (
        <Header
          onNavigate={navigate}
          currentRoute={currentRoute}
          categories={categories}
        />
      )}

      <Box component="main" sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {currentRoute === 'home' && (
          <HomePage
            products={products}
            categories={categories}
            brands={brands}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'products' && (
          <ProductsPage
            initialCategory={routeParams.category || ''}
            initialBrand={routeParams.brand || ''}
            initialSearch={routeParams.search || ''}
            categories={categories}
            brands={brands}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'product-detail' && (
          <ProductDetailPage
            slug={routeParams.slug}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'cart' && (
          <CartPage onNavigate={navigate} />
        )}

        {currentRoute === 'checkout' && (
          <CheckoutPage
            onNavigate={navigate}
            onOrderCompleted={(data) => setLastOrderData(data)}
            initialCoupon={routeParams.coupon}
          />
        )}

        {currentRoute === 'order-success' && (
          <OrderSuccessPage
            orderCode={routeParams.orderCode}
            orderData={lastOrderData}
            onNavigate={navigate}
          />
        )}

        {currentRoute === 'my-orders' && (
          <MyOrdersPage onNavigate={navigate} />
        )}

        {currentRoute === 'wishlist' && (
          <WishlistPage onNavigate={navigate} />
        )}

        {currentRoute === 'profile' && (
          <ProfilePage onNavigate={navigate} />
        )}

        {currentRoute === 'admin' && (
          <AdminDashboardPage onNavigate={navigate} />
        )}
      </Box>

      {!isAdminRoute && <Footer />}

      {/* Global Modals & Drawers */}
      <CartDrawer onNavigate={navigate} />
      <AuthModal />
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <AppContent />
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
