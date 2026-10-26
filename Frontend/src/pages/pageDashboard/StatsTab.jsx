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
              <line x1="12" y1="1" x2="12" y2="23"></line>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
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

      {/* 3 Charts Grid */}
      <div className="freedash-charts-grid">
        {/* Chart 1: Doanh số theo ngành hàng (Total Sales) */}
        <div className="freedash-chart-card">
          <div className="freedash-card-title">Tỷ lệ Doanh số Ngành hàng</div>
          <div className="freedash-donut-wrap">
            <div style={{ position: 'relative', width: 200, height: 200 }}>
              <svg width="200" height="200" viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
                {/* Background Ring */}
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  stroke="#F8FAFC"
                  strokeWidth="14"
                />
                {/* Segment 1: Cyan (Tai nghe & Display ~ 28%) */}
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  stroke="#06B6D4"
                  strokeWidth="14"
                  strokeDasharray="452.39"
                  strokeDashoffset="325"
                  strokeLinecap="round"
                />
                {/* Segment 2: Pink/Red (Chuột Gaming ~ 30%) */}
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth="14"
                  strokeDasharray="452.39"
                  strokeDashoffset="340"
                  strokeLinecap="round"
                  style={{ transform: 'rotate(105deg)', transformOrigin: '100px 100px' }}
                />
                {/* Segment 3: Red GearK (Bàn phím cơ ~ 42%) */}
                <circle
                  cx="100"
                  cy="100"
                  r="72"
                  fill="none"
                  stroke="#DC2626"
                  strokeWidth="14"
                  strokeDasharray="452.39"
                  strokeDashoffset="262"
                  strokeLinecap="round"
                  style={{ transform: 'rotate(215deg)', transformOrigin: '100px 100px' }}
                />
              </svg>
              {/* Center Text */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#94A3B8',
                  fontSize: 14,
                  fontWeight: 600,
                  pointerEvents: 'none',
                }}
              >
                Gaming Gear
              </div>
            </div>

            {/* Donut Legend */}
            <div className="freedash-donut-legend">
              <div className="freedash-legend-row">
                <div className="freedash-legend-left">
                  <span className="freedash-dot" style={{ backgroundColor: '#DC2626' }}></span>
                  <span>Bàn phím cơ</span>
                </div>
                <span className="freedash-legend-val">42% (9.8M)</span>
              </div>

              <div className="freedash-legend-row">
                <div className="freedash-legend-left">
                  <span className="freedash-dot" style={{ backgroundColor: '#F43F5E' }}></span>
                  <span>Chuột Gaming</span>
                </div>
                <span className="freedash-legend-val">30% (7.1M)</span>
              </div>

              <div className="freedash-legend-row">
                <div className="freedash-legend-left">
                  <span className="freedash-dot" style={{ backgroundColor: '#06B6D4' }}></span>
                  <span>Tai nghe & Màn hình</span>
                </div>
                <span className="freedash-legend-val">28% (6.5M)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart 2: Net Income Bar Chart */}
        <div className="freedash-chart-card">
          <div className="freedash-card-title">Doanh thu 6 tháng gần nhất</div>
          <div className="freedash-barchart-wrap">
            <div className="freedash-barchart-body">
              {/* Y Axis */}
              <div className="freedash-yaxis">
                <span>50M</span>
                <span>40M</span>
                <span>30M</span>
                <span>20M</span>
                <span>10M</span>
                <span>0</span>
              </div>

              {/* Bars with grid lines */}
              <div className="freedash-bars-area">
                <div className="freedash-gridline" style={{ top: '0%' }}></div>
                <div className="freedash-gridline" style={{ top: '25%' }}></div>
                <div className="freedash-gridline" style={{ top: '50%' }}></div>
                <div className="freedash-gridline" style={{ top: '75%' }}></div>
                <div className="freedash-gridline" style={{ top: '100%' }}></div>

                {/* T5 */}
                <div className="freedash-bar-col">
                  <div className="freedash-bar-pillar" style={{ height: '48%' }} title="Tháng 5: 24 Triệu"></div>
                  <span className="freedash-bar-label">T5</span>
                </div>

                {/* T6 */}
                <div className="freedash-bar-col">
                  <div className="freedash-bar-pillar" style={{ height: '38%' }} title="Tháng 6: 19 Triệu"></div>
                  <span className="freedash-bar-label">T6</span>
                </div>

                {/* T7 */}
                <div className="freedash-bar-col">
                  <div className="freedash-bar-pillar" style={{ height: '28%' }} title="Tháng 7: 14 Triệu"></div>
                  <span className="freedash-bar-label">T7</span>
                </div>

                {/* T8 */}
                <div className="freedash-bar-col">
                  <div className="freedash-bar-pillar" style={{ height: '65%' }} title="Tháng 8: 32 Triệu"></div>
                  <span className="freedash-bar-label">T8</span>
                </div>

                {/* T9 */}
                <div className="freedash-bar-col">
                  <div className="freedash-bar-pillar" style={{ height: '48%' }} title="Tháng 9: 24 Triệu"></div>
                  <span className="freedash-bar-label">T9</span>
                </div>

                {/* T10 */}
                <div className="freedash-bar-col">
                  <div className="freedash-bar-pillar" style={{ height: '94%' }} title="Tháng 10: 47 Triệu"></div>
                  <span className="freedash-bar-label">T10</span>
                </div>
              </div>
            </div>

            <div className="freedash-barchart-footer">Tăng trưởng ổn định qua từng tháng</div>
          </div>
        </div>

        {/* Chart 3: Doanh số theo khu vực */}
        <div className="freedash-chart-card">
          <div className="freedash-card-title">Phân bố Doanh số theo Tỉnh thành</div>
          <div className="freedash-location-wrap">
            {/* World Map Vector Illustration */}
            <div className="freedash-map-container">
              <svg width="270" height="130" viewBox="0 0 600 320" fill="none">
                <path
                  d="M120 70 Q 150 40 180 60 T 230 75 Q 240 110 200 130 T 130 110 Z"
                  fill="#E2E8F0"
                />
                <path
                  d="M170 160 Q 210 180 200 240 Q 180 280 160 250 T 150 180 Z"
                  fill="#E2E8F0"
                />
                <path
                  d="M290 50 Q 340 40 370 70 T 350 120 Q 300 130 280 90 Z"
                  fill="#E2E8F0"
                />
                <path
                  d="M310 140 Q 360 150 370 200 Q 350 250 320 230 T 300 160 Z"
                  fill="#E2E8F0"
                />
                <path
                  d="M400 60 Q 520 40 540 100 T 470 160 Q 420 140 390 100 Z"
                  fill="#E2E8F0"
                />
                <path
                  d="M480 200 Q 530 200 520 250 Q 480 260 460 230 Z"
                  fill="#E2E8F0"
                />
              </svg>
            </div>

            {/* Location Progress Bars */}
            <div className="freedash-location-list">
              <div className="freedash-location-item">
                <span className="freedash-loc-country" style={{ width: 110 }}>Hà Nội</span>
                <div className="freedash-loc-bar-bg">
                  <div
                    className="freedash-loc-bar-fill"
                    style={{ width: '38%', backgroundColor: '#DC2626' }}
                  ></div>
                </div>
                <span className="freedash-loc-percent">38%</span>
              </div>

              <div className="freedash-location-item">
                <span className="freedash-loc-country" style={{ width: 110 }}>TP. Hồ Chí Minh</span>
                <div className="freedash-loc-bar-bg">
                  <div
                    className="freedash-loc-bar-fill"
                    style={{ width: '32%', backgroundColor: '#F43F5E' }}
                  ></div>
                </div>
                <span className="freedash-loc-percent">32%</span>
              </div>

              <div className="freedash-location-item">
                <span className="freedash-loc-country" style={{ width: 110 }}>Đà Nẵng</span>
                <div className="freedash-loc-bar-bg">
                  <div
                    className="freedash-loc-bar-fill"
                    style={{ width: '18%', backgroundColor: '#06B6D4' }}
                  ></div>
                </div>
                <span className="freedash-loc-percent">18%</span>
              </div>

              <div className="freedash-location-item">
                <span className="freedash-loc-country" style={{ width: 110 }}>Tỉnh thành khác</span>
                <div className="freedash-loc-bar-bg">
                  <div
                    className="freedash-loc-bar-fill"
                    style={{ width: '12%', backgroundColor: '#10B981' }}
                  ></div>
                </div>
                <span className="freedash-loc-percent">12%</span>
              </div>
            </div>
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
