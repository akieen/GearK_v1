import React from 'react';
import Icons from '../../components/common/Icons';

export default function StatsTab({ stats, loadingStats, formatPrice, formatDate, getOrderStatusText }) {
  const totalRevenue = stats?.summary?.total_revenue ?? stats?.total_revenue ?? 18306000;
  const totalOrders = stats?.summary?.total_orders ?? stats?.total_orders ?? 1538;
  const totalCustomers = stats?.summary?.total_users ?? stats?.total_customers ?? 236;
  const totalProducts = stats?.total_products ?? 864;

  return (
    <div>
      {/* 4 Metric Cards */}
      <div className="freedash-metrics-grid">
        {/* Card 1: Khách hàng mới */}
        <div className="freedash-metric-card">
          <div className="freedash-metric-top">
            <span className="freedash-metric-number">{totalCustomers}</span>
            <span className="freedash-metric-badge freedash-badge-up">+18.33%</span>
          </div>
          <div className="freedash-metric-label">Khách hàng mới (Clients)</div>
          <div className="freedash-metric-icon-bg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <line x1="19" y1="8" x2="19" y2="14"></line>
              <line x1="22" y1="11" x2="16" y2="11"></line>
            </svg>
          </div>
        </div>

        {/* Card 2: Doanh thu tháng */}
        <div className="freedash-metric-card">
          <div className="freedash-metric-top">
            <span className="freedash-metric-number">{formatPrice(totalRevenue)}</span>
          </div>
          <div className="freedash-metric-label">Doanh thu tháng (Earnings)</div>
          <div className="freedash-metric-icon-bg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            </svg>
          </div>
        </div>

        {/* Card 3: Đơn hàng mới */}
        <div className="freedash-metric-card">
          <div className="freedash-metric-top">
            <span className="freedash-metric-number">{totalOrders}</span>
            <span className="freedash-metric-badge freedash-badge-down">-5.2%</span>
          </div>
          <div className="freedash-metric-label">Tổng đơn hàng (Orders)</div>
          <div className="freedash-metric-icon-bg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
            </svg>
          </div>
        </div>

        {/* Card 4: Tổng sản phẩm kinh doanh */}
        <div className="freedash-metric-card">
          <div className="freedash-metric-top">
            <span className="freedash-metric-number">{totalProducts}</span>
          </div>
          <div className="freedash-metric-label">Sản phẩm trong kho (Catalog)</div>
          <div className="freedash-metric-icon-bg">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
          </div>
        </div>
      </div>



      {/* Real Recent Orders Section */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid #EEF2F6',
          boxShadow: '0 4px 18px rgba(0, 0, 0, 0.02)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #EEF2F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ fontSize: 16, fontWeight: 800, color: '#1E293B' }}>
            Đơn hàng gần đây (Recent Orders)
          </div>
          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#DC2626' }}>
            Dữ liệu hệ thống GearK
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #EEF2F6', color: '#64748B', textAlign: 'left' }}>
              <th style={{ padding: '12px 24px', fontWeight: 700 }}>Mã đơn</th>
              <th style={{ padding: '12px 20px', fontWeight: 700 }}>Khách hàng</th>
              <th style={{ padding: '12px 20px', fontWeight: 700 }}>Ngày đặt</th>
              <th style={{ padding: '12px 20px', fontWeight: 700 }}>Tổng tiền</th>
              <th style={{ padding: '12px 24px', fontWeight: 700 }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {!stats?.recent_orders || stats.recent_orders.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '36px 0', color: '#94A3B8' }}>
                  Chưa có đơn hàng nào
                </td>
              </tr>
            ) : (
              stats.recent_orders.map((ord) => {
                const statusInfo = getOrderStatusText(ord.order_status);
                return (
                  <tr key={ord.order_id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 24px', fontWeight: 800, color: '#DC2626' }}>
                      {ord.order_code}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 600, color: '#1E293B' }}>
                      {ord.customer_name || ord.full_name || ord.recipient_name || 'Khách hàng'}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#64748B' }}>
                      {formatDate(ord.created_at)}
                    </td>
                    <td style={{ padding: '14px 20px', fontWeight: 700, color: '#1E293B' }}>
                      {formatPrice(ord.total_amount)}
                    </td>
                    <td style={{ padding: '14px 24px' }}>
                      <span
                        style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color,
                        }}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
