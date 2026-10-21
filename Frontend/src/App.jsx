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
function AppContent() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.replace('#', '');
    return hash || 'home';
  });
  const [routeParams, setRouteParams] = useState({});
  const [lastOrderData, setLastOrderData] = useState(null);

  // Global store data
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  // Listen for browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') || 'home';
      navigate(hash, false);
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

    // Parse path: e.g. "product/razer-viper-v3-pro" or "products?category=chuot-gaming"
    const [routePath, queryString] = path.split('?');
    const queryParams = new URLSearchParams(queryString || '');

    const params = {};
    queryParams.forEach((val, key) => {
      params[key] = val;
    });

    if (routePath.startsWith('product/')) {
      const slug = routePath.replace('product/', '');
      setCurrentRoute('product-detail');
      setRouteParams({ slug, ...params });
    } else if (routePath.startsWith('order-success/')) {
      const code = routePath.replace('order-success/', '');
      setCurrentRoute('order-success');
      setRouteParams({ orderCode: code, ...params });
    } else {
      setCurrentRoute(routePath || 'home');
      setRouteParams(params);
    }

    if (updateHash) {
      window.location.hash = path;
    }
  };

  return (
    <>
      <Header
        onNavigate={navigate}
        currentRoute={currentRoute}
        categories={categories}
      />

      <main style={{ flex: 1 }}>
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
      </main>

      <Footer />

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
