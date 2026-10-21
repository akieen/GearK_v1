import React, { useState, useEffect } from 'react';
import { orderApi } from '../api/cartApi';
import { useAuth } from '../context/AuthContext';
import { formatPrice, formatDate, getOrderStatusText } from '../utils/formatters';
import Icons from '../components/common/Icons';

export const MyOrdersPage = ({ onNavigate }) => {
  const { user, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    const loadOrders = async () => {
      setLoading(true);
      try {
        const res = await orderApi.getMyOrders();
        if (res.success && res.data) {
          setOrders(res.data || []);
        }
      } catch (err) {
        console.error('Lỗi lấy đơn hàng:', err);
      } finally {
        setLoading(false);
      }
    };
    loadOrders();
  }, [user]);

  if (!user) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Vui lòng đăng nhập để xem lịch sử đơn hàng.</p>
        <button
          onClick={() => openAuthModal('login')}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 700,
            marginTop: 14,
          }}
        >
          Đăng nhập ngay
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '24px 0 48px 0' }}>
      <div style={{ paddingBottom: 16, borderBottom: '2px solid var(--border-light)', marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>
          ĐƠN HÀNG CỦA TÔI ({orders.length})
        </h2>
        <p style={{ fontSize: 13, color: '#6B7280', marginTop: 4 }}>
          Theo dõi tiến độ vận chuyển và lịch sử mua sắm của bạn tại GearK.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: '#6B7280' }}>
          <p style={{ fontWeight: 700, fontSize: 15 }}>Đang tải lịch sử đơn sắm...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <Icons.Package size={56} className="empty-state-icon" />
          <h3 className="empty-state-title">Bạn chưa có đơn hàng nào</h3>
          <p className="empty-state-desc">Hãy dạo quanh cửa hàng và chọn cho mình bộ Gaming Gear ưng ý nhất!</p>
          <button
            onClick={() => onNavigate('products')}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '10px 24px',
              borderRadius: 6,
              fontWeight: 700,
            }}
          >
            Khám phá Gaming Gear ngay
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          {orders.map((order) => {
            const statusInfo = getOrderStatusText(order.order_status);
            return (
              <div
                key={order.order_id}
                style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: 12,
                  border: '1px solid var(--border-light)',
                  padding: 24,
                  boxShadow: 'var(--shadow-xs)',
                }}
              >
                {/* Order Top Bar */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: '1px solid var(--border-light)',
                    paddingBottom: 14,
                    marginBottom: 16,
                    flexWrap: 'wrap',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontWeight: 800, fontSize: 15, color: '#111827' }}>
                      Mã đơn: <span style={{ color: 'var(--primary)' }}>{order.order_code}</span>
                    </span>
                    <span style={{ fontSize: 12, color: '#9CA3AF' }}>•</span>
                    <span style={{ fontSize: 12.5, color: '#6B7280' }}>
                      Ngày đặt: {formatDate(order.created_at)}
                    </span>
                  </div>

                  <span
                    className="status-pill"
                    style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
                  >
                    ● {statusInfo.label}
                  </span>
                </div>

                {/* Items List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                  {order.items?.map((item) => (
                    <div
                      key={item.order_item_id}
                      style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 13 }}
                    >
                      <img
                        src={item.thumbnail_url || 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=150&q=80'}
                        alt={item.product_name}
                        style={{
                          width: 50,
                          height: 50,
                          objectFit: 'contain',
                          borderRadius: 6,
                          border: '1px solid #E5E7EB',
                        }}
                      />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: '#111827' }}>{item.product_name}</div>
                        {item.variant_name && (
                          <div style={{ fontSize: 11.5, color: '#6B7280' }}>Bản: {item.variant_name}</div>
                        )}
                        <div style={{ color: '#4B5563', marginTop: 2 }}>
                          {item.quantity} × {formatPrice(item.unit_price)}
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: '#111827', fontSize: 14 }}>
                        {formatPrice(parseFloat(item.unit_price) * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Total */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: 14,
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ fontSize: 12.5, color: '#6B7280' }}>
                    Giao tới: <strong>{order.recipient_name}</strong> ({order.recipient_phone}) - {order.shipping_address}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span style={{ fontSize: 13, color: '#4B5563' }}>Tổng số tiền:</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>
                      {formatPrice(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
