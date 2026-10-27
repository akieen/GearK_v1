import React from 'react';

export default function OrdersTab({ orders, orderFilter, setOrderFilter, fetchOrders, handleUpdateStatus, formatPrice, getOrderStatusText }) {
  const displayedOrders = orderFilter
    ? orders.filter((ord) => ord.order_status === orderFilter)
    : orders;

  const handleFilterChange = (e) => {
    const val = e.target.value;
    setOrderFilter(val);
    if (typeof fetchOrders === 'function') {
      fetchOrders(val);
    }
  };

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          backgroundColor: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid var(--border-light)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontWeight: 700, fontSize: 13 }}>Lọc theo trạng thái:</span>
          <select
            className="sort-select"
            value={orderFilter}
            onChange={handleFilterChange}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #D1D5DB',
              fontSize: 13,
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
              backgroundColor: '#F9FAFB',
            }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xác nhận</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="processing">Đang xử lý</option>
            <option value="shipping">Đang giao hàng</option>
            <option value="completed">Đã hoàn thành</option>
            <option value="cancelled">Đã hủy</option>
            <option value="refunded">Đã hoàn tiền</option>
          </select>
          <span style={{ fontSize: 12, color: '#6B7280', fontWeight: 600 }}>
            ({displayedOrders.length} đơn hàng)
          </span>
        </div>
        <button
          onClick={() => fetchOrders && fetchOrders(orderFilter)}
          style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none' }}
        >
          Làm mới danh sách
        </button> 
      </div>

      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã đơn</th>
              <th>Khách hàng</th>
              <th>SĐT / Địa chỉ</th>
              <th>Tổng tiền</th>
              <th>PT Thanh toán</th>
              <th>Cập nhật trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {displayedOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#6B7280' }}>
                  {orderFilter ? `Không có đơn hàng nào ở trạng thái này` : 'Không có đơn hàng nào'}
                </td>
              </tr>
            ) : (
              displayedOrders.map((ord) => {
                const statusInfo = getOrderStatusText(ord.order_status);
                return (
                  <tr key={ord.order_id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {ord.order_code}
                    </td>
                    <td>
                      <strong>{ord.recipient_name || ord.customer_name || 'Khách hàng'}</strong>
                      <div style={{ fontSize: 11, color: '#6B7280' }}>{ord.email || ord.customer_email || '—'}</div>
                    </td>
                    <td style={{ fontSize: 12, maxWidth: 220 }}>
                      <div style={{ fontWeight: 600, color: '#111827' }}>
                        {ord.recipient_phone || '—'}
                      </div>
                      <div style={{ color: '#4B5563', fontSize: 11.5, marginTop: 2, lineHeight: 1.3 }}>
                        {ord.shipping_address || ord.street_address || 'Chưa cập nhật địa chỉ'}
                      </div>
                    </td>
                    <td style={{ fontWeight: 800 }}>{formatPrice(ord.total_amount)}</td>
                    <td>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 6px', backgroundColor: '#F3F4F6', borderRadius: 4 }}>
                        {ord.payment_method ? ord.payment_method.toUpperCase() : 'COD'}
                      </span>
                    </td>
                    <td>
                      <select
                        value={ord.order_status}
                        onChange={(e) => handleUpdateStatus(ord.order_id, e.target.value)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: 6,
                          border: `1px solid ${statusInfo.color}40`,
                          fontSize: 12,
                          fontWeight: 700,
                          backgroundColor: statusInfo.bg,
                          color: statusInfo.color,
                          cursor: 'pointer',
                          outline: 'none',
                        }}
                      >
                        <option value="pending">Chờ xác nhận</option>
                        <option value="confirmed">Đã xác nhận</option>
                        <option value="processing">Đang xử lý</option>
                        <option value="shipping">Đang giao hàng</option>
                        <option value="completed">Đã hoàn thành</option>
                        <option value="cancelled">Hủy đơn</option>
                        <option value="refunded">Đã hoàn tiền</option>
                      </select>
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
