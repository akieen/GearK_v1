import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartApi } from '../api/cartApi';
import { wishlistApi } from '../api/extraApi';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user, token, openAuthModal } = useAuth();
  const toast = useToast();

  const [cart, setCart] = useState({ items: [], total_amount: 0, total_items: 0 });
  const [loading, setLoading] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [wishlistItems, setWishlistItems] = useState([]);

  // Fetch cart from backend
  const fetchCart = useCallback(async () => {
    if (!token) {
      setCart({ items: [], total_amount: 0, total_items: 0 });
      return;
    }
    try {
      setLoading(true);
      const res = await cartApi.getCart();
      if (res.success && res.data) {
        setCart(res.data);
      }
    } catch (err) {
      console.error('Lỗi lấy giỏ hàng:', err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Fetch wishlist
  const fetchWishlist = useCallback(async () => {
    if (!token) {
      setWishlistIds(new Set());
      setWishlistItems([]);
      return;
    }
    try {
      const res = await wishlistApi.getWishlist();
      if (res.success && res.data) {
        const items = res.data || [];
        setWishlistItems(items);
        setWishlistIds(new Set(items.map((item) => item.product_id)));
      }
    } catch (err) {
      console.error('Lỗi lấy wishlist:', err);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart({ items: [], total_amount: 0, total_items: 0 });
      setWishlistIds(new Set());
      setWishlistItems([]);
    }
  }, [token, fetchCart, fetchWishlist]);

  // Add to cart
  const addToCart = async (variantId, quantity = 1, showDrawer = true) => {
    if (!token) {
      toast.info('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
      openAuthModal('login');
      return false;
    }

    try {
      const res = await cartApi.addToCart(variantId, quantity);
      if (res.success) {
        toast.success('Đã thêm sản phẩm vào giỏ hàng thành công!');
        await fetchCart();
        if (showDrawer) {
          setIsCartDrawerOpen(true);
        }
        return true;
      }
      toast.error(res.message || 'Không thể thêm vào giỏ hàng');
      return false;
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm sản phẩm');
      return false;
    }
  };

  // Update item quantity
  const updateQuantity = async (itemId, quantity) => {
    if (quantity <= 0) {
      return removeItem(itemId);
    }
    try {
      const res = await cartApi.updateCartItem(itemId, quantity);
      if (res.success) {
        await fetchCart();
        return true;
      }
      toast.error(res.message || 'Lỗi cập nhật số lượng');
      return false;
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật giỏ hàng');
      return false;
    }
  };

  // Remove cart item
  const removeItem = async (itemId) => {
    try {
      const res = await cartApi.removeCartItem(itemId);
      if (res.success) {
        toast.info('Đã xóa sản phẩm khỏi giỏ hàng');
        await fetchCart();
        return true;
      }
      toast.error(res.message || 'Lỗi xóa sản phẩm');
      return false;
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa sản phẩm');
      return false;
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      await cartApi.clearCart();
      await fetchCart();
    } catch (err) {
      console.error('Lỗi làm sạch giỏ hàng:', err);
    }
  };

  // Toggle wishlist
  const toggleWishlist = async (productId, variantId = null) => {
    if (!token) {
      toast.info('Vui lòng đăng nhập để lưu sản phẩm yêu thích!');
      openAuthModal('login');
      return false;
    }
    try {
      const res = await wishlistApi.toggleWishlist({
        product_id: productId,
        variant_id: variantId,
      });
      if (res.success) {
        const isAdded =
          res.data?.in_wishlist !== undefined
            ? res.data.in_wishlist
            : res.message?.includes('thêm') || res.data?.action === 'added';
        if (isAdded) {
          toast.success('Đã lưu vào danh sách yêu thích ❤️');
        } else {
          toast.info('Đã bỏ khỏi danh sách yêu thích');
        }
        await fetchWishlist();
        return true;
      }
      return false;
    } catch (err) {
      toast.error(err.message || 'Lỗi thao tác wishlist');
      return false;
    }
  };

  const isInWishlist = (productId) => wishlistIds.has(productId);

  const cartCount = cart.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart.total_amount || 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        fetchCart,
        isCartDrawerOpen,
        setIsCartDrawerOpen,
        wishlistCount: wishlistItems.length,
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
