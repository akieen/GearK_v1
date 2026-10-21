import React from 'react';
import Icons from '../../components/common/Icons';

export default function StatsTab({ stats, loadingStats, formatPrice, formatDate, getOrderStatusText }) {
  const totalRevenue = stats?.summary?.total_revenue ?? stats?.total_revenue ?? 0;
  const totalOrders = stats?.summary?.total_orders ?? stats?.total_orders ?? 0;
  const totalCustomers = stats?.summary?.total_users ?? stats?.total_customers ?? 0;
  const lowStockCount = stats?.low_stock_items?.length ?? stats?.low_stock_count ?? 0;

  return (
    <div>
      {loadingStats ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>Đang tải thống kê...</div>
      ) : (
        <>
          {/* KPI Cards Grid */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon-box" style={{ backgroundColor: '#10B981' }}>
                <Icons.CreditCard size={24} />
              </div>
              <div>
                <div className="kpi-val">{formatPrice(totalRevenue)}</div>
                <div className="kpi-label">Tổng doanh thu</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box" style={{ backgroundColor: '#3B82F6' }}>
                <Icons.Package size={24} />
              </div>
              <div>
                <div className="kpi-val">{totalOrders}</div>
                <div className="kpi-label">Tổng đơn hàng</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box" style={{ backgroundColor: '#8B5CF6' }}>
                <Icons.User size={24} />
              </div>
              <div>
                <div className="kpi-val">{totalCustomers}</div>
                <div className="kpi-label">Khách hàng đăng ký</div>
              </div>
            </div>

            <div className="kpi-card">
              <div className="kpi-icon-box" style={{ backgroundColor: '#EF4444' }}>
                <Icons.Flame size={24} />
              </div>
              <div>
                <div className="kpi-val">{lowStockCount}</div>
                <div className="kpi-label">Cảnh báo sắp hết kho</div>
              </div>
            </div>
          </div>

          {/* Recent Orders in Stats */}
          <div className="data-table-card" style={{ marginBottom: 24 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', fontWeight: 800 }}>
              Đơn hàng mới nhất
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Ngày đặt</th>
                  <th>Tổng tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {(!stats?.recent_orders || stats.recent_orders.length === 0) ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', color: '#6B7280' }}>
                      Chưa có đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  stats.recent_orders.map((ord) => {
                    const statusInfo = getOrderStatusText(ord.order_status);
                    return (
                      <tr key={ord.order_id}>
                        <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                          {ord.order_code}
                        </td>
                        <td>{ord.customer_name || ord.full_name || ord.recipient_name || 'Khách hàng'}</td>
                        <td>{formatDate(ord.created_at)}</td>
                        <td style={{ fontWeight: 700 }}>{formatPrice(ord.total_amount)}</td>
                        <td>
                          <span
                            className="status-pill"
                            style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}
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
        </>
      )}
    </div>
  );
}
