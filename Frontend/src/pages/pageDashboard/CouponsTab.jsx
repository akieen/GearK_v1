import React from 'react';

export default function CouponsTab({ coupons, newCouponCode,
   setNewCouponCode, newDiscountType, setNewDiscountType,
    newDiscountVal, setNewDiscountVal, newUsageLimit, 
    setNewUsageLimit, handleCreateCoupon, formatPrice, 
    formatDate, isAdmin, handleDeleteCoupon, Icons }) {
  return (
    <div>
      {/* Create coupon card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          padding: 20,
          border: '1px solid var(--border-light)',
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12 }}>
          Tạo mã giảm giá mới
        </h3>
        <form onSubmit={handleCreateCoupon} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Mã Voucher</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="VD: GAMING2026"
              value={newCouponCode}
              onChange={(e) => setNewCouponCode(e.target.value)}
            />
          </div>
          <div style={{ width: 140 }}>
            <label className="form-label">Loại giảm giá</label>
            <select
              className="form-input"
              value={newDiscountType}
              onChange={(e) => setNewDiscountType(e.target.value)}
            >
              <option value="percent">Phần trăm (%)</option>
              <option value="fixed">Số tiền cố định (₫)</option>
            </select>
          </div>
          <div style={{ width: 160 }}>
            <label className="form-label">Giá trị giảm</label>
            <input
              type="number"
              required
              className="form-input"
              placeholder={newDiscountType === 'percent' ? 'VD: 10 (%)' : 'VD: 100000 (₫)'}
              value={newDiscountVal}
              onChange={(e) => setNewDiscountVal(e.target.value)}
            />
          </div>
          <div style={{ width: 140 }}>
            <label className="form-label">Giới hạn lượt dùng</label>
            <input
              type="number"
              min="1"
              className="form-input"
              placeholder="Không giới hạn"
              value={newUsageLimit}
              onChange={(e) => setNewUsageLimit(e.target.value)}
            />
          </div>
          <button
            type="submit"
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            Tạo mã ngay
          </button>
        </form>
      </div>

      {/* Coupons List */}
      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã giảm giá</th>
              <th>Loại</th>
              <th>Giá trị</th>
              <th>Đã dùng</th>
              <th>Giới hạn</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 20, color: '#6B7280' }}>
                  Chưa có mã giảm giá nào
                </td>
              </tr>
            ) : (
              coupons.map((cpn) => (
                <tr key={cpn.coupon_id}>
                  <td style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 14 }}>
                    {cpn.coupon_code}
                  </td>
                  <td>{cpn.discount_type === 'percent' ? 'Phần trăm (%)' : 'Số tiền cố định'}</td>
                  <td style={{ fontWeight: 700 }}>
                    {cpn.discount_type === 'percent'
                      ? `${parseFloat(cpn.discount_value)}%`
                      : formatPrice(cpn.discount_value)}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 700, color: '#6366F1' }}>
                    {cpn.used_count ?? 0}
                  </td>
                  <td style={{ textAlign: 'center', color: cpn.usage_limit === null ? '#9CA3AF' : (cpn.used_count >= cpn.usage_limit ? '#EF4444' : '#10B981'), fontWeight: 700 }}>
                    {cpn.usage_limit === null ? '∞' : `${cpn.usage_limit}`}
                  </td>
                  <td>{formatDate(cpn.created_at)}</td>
                  <td>
                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteCoupon(cpn.coupon_id)}
                        style={{ color: '#EF4444', padding: 4 }}
                      >
                        <Icons.Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
