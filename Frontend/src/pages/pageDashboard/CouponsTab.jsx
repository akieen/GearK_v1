import React, { useState } from 'react';

export default function CouponsTab({
  coupons = [],
  newCouponCode,
  setNewCouponCode,
  newDiscountType,
  setNewDiscountType,
  newDiscountVal,
  setNewDiscountVal,
  newUsageLimit,
  setNewUsageLimit,
  newStartDate,
  setNewStartDate,
  newEndDate,
  setNewEndDate,
  handleCreateCoupon,
  handleUpdateCoupon,
  formatPrice,
  formatDate,
  isAdmin,
  handleDeleteCoupon,
  Icons,
}) {
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [editCode, setEditCode] = useState('');
  const [editType, setEditType] = useState('percent');
  const [editValue, setEditValue] = useState('');
  const [editLimit, setEditLimit] = useState('');
  const [editStart, setEditStart] = useState('');
  const [editEnd, setEditEnd] = useState('');
  const [updating, setUpdating] = useState(false);

  const toInputDate = (val) => {
    if (!val) return '';
    const d = new Date(val);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const startEdit = (cpn) => {
    setEditingCoupon(cpn);
    setEditCode(cpn.coupon_code || '');
    setEditType(cpn.discount_type || 'percent');
    setEditValue(cpn.discount_value || '');
    setEditLimit(cpn.usage_limit ?? '');
    // Format to YYYY-MM-DD for date input safely without timezone shifting
    setEditStart(toInputDate(cpn.start_date));
    setEditEnd(toInputDate(cpn.end_date));
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCoupon) return;
    setUpdating(true);
    const success = await handleUpdateCoupon(editingCoupon.coupon_id, {
      coupon_code: editCode.trim().toUpperCase(),
      discount_type: editType,
      discount_value: parseFloat(editValue),
      usage_limit: editLimit !== '' ? parseInt(editLimit) : null,
      start_date: editStart || null,
      end_date: editEnd || null,
    });
    setUpdating(false);
    if (success) {
      setEditingCoupon(null);
    }
  };

  const getCouponStatus = (cpn) => {
    const now = new Date();
    if (cpn.end_date && new Date(cpn.end_date) < now) {
      return { label: 'Đã hết hạn', bg: '#FEE2E2', color: '#EF4444' };
    }
    if (cpn.start_date && new Date(cpn.start_date) > now) {
      return { label: 'Chưa bắt đầu', bg: '#FEF3C7', color: '#D97706' };
    }
    if (cpn.usage_limit !== null && cpn.used_count >= cpn.usage_limit) {
      return { label: 'Hết lượt dùng', bg: '#F3F4F6', color: '#6B7280' };
    }
    return { label: 'Đang hiệu lực', bg: '#D1FAE5', color: '#065F46' };
  };

  const formatShortDate = (dateVal) => {
    if (!dateVal) return null;
    return new Date(dateVal).toLocaleDateString('vi-VN');
  };

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Icons.Tag size={18} style={{ color: 'var(--primary)' }} />
          <h3 style={{ fontSize: 15, fontWeight: 800, margin: 0 }}>
            Tạo mã giảm giá mới
          </h3>
        </div>

        <form onSubmit={handleCreateCoupon}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 14 }}>
            <div>
              <label className="form-label">Mã Voucher *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="VD: GAMING2026"
                value={newCouponCode}
                onChange={(e) => setNewCouponCode(e.target.value)}
              />
            </div>

            <div>
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

            <div>
              <label className="form-label">Giá trị giảm *</label>
              <input
                type="number"
                required
                min="1"
                className="form-input"
                placeholder={newDiscountType === 'percent' ? 'VD: 10 (%)' : 'VD: 100000 (₫)'}
                value={newDiscountVal}
                onChange={(e) => setNewDiscountVal(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Giới hạn lượt dùng</label>
              <input
                type="number"
                min="1"
                className="form-input"
                placeholder="Để trống = Không giới hạn"
                value={newUsageLimit}
                onChange={(e) => setNewUsageLimit(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Ngày bắt đầu</label>
              <input
                type="date"
                className="form-input"
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
              />
            </div>

            <div>
              <label className="form-label">Ngày kết thúc / Hết hạn</label>
              <input
                type="date"
                className="form-input"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              style={{
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                padding: '10px 24px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13,
                cursor: 'pointer',
              }}
            >
              Tạo mã giảm giá
            </button>
          </div>
        </form>
      </div>

      {/* Edit Coupon Modal */}
      {editingCoupon && (
        <div className="drawer-overlay" style={{ zIndex: 9999 }}>
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 12,
              padding: 24,
              maxWidth: 500,
              width: '90%',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0 }}>
                Chỉnh sửa mã: {editingCoupon.coupon_code}
              </h3>
              <button
                type="button"
                onClick={() => setEditingCoupon(null)}
                style={{ padding: 4, color: '#6B7280' }}
              >
                <Icons.X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div>
                  <label className="form-label">Mã Code</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Loại</label>
                    <select
                      className="form-input"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                    >
                      <option value="percent">Phần trăm (%)</option>
                      <option value="fixed">Số tiền cố định (₫)</option>
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Giá trị</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Giới hạn lượt dùng</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    placeholder="Không giới hạn"
                    value={editLimit}
                    onChange={(e) => setEditLimit(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label className="form-label">Ngày bắt đầu</label>
                    <input
                      type="date"
                      className="form-input"
                      value={editStart}
                      onChange={(e) => setEditStart(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Ngày kết thúc</label>
                    <input
                      type="date"
                      className="form-input"
                      value={editEnd}
                      onChange={(e) => setEditEnd(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 18 }}>
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 6,
                    border: '1px solid var(--border-light)',
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  style={{
                    backgroundColor: 'var(--primary)',
                    color: '#FFFFFF',
                    padding: '8px 18px',
                    borderRadius: 6,
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupons List */}
      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Mã giảm giá</th>
              <th>Loại & Giá trị</th>
              <th>Lượt sử dụng</th>
              <th>Thời gian hiệu lực</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#6B7280' }}>
                  Chưa có mã giảm giá nào
                </td>
              </tr>
            ) : (
              coupons.map((cpn) => {
                const status = getCouponStatus(cpn);
                const startDateStr = formatShortDate(cpn.start_date);
                const endDateStr = formatShortDate(cpn.end_date);

                return (
                  <tr key={cpn.coupon_id}>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          color: 'var(--primary)',
                          fontSize: 13.5,
                          backgroundColor: '#FEE2E2',
                          padding: '3px 8px',
                          borderRadius: 4,
                          letterSpacing: 0.5,
                        }}
                      >
                        {cpn.coupon_code}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#111827' }}>
                        {cpn.discount_type === 'percent'
                          ? `${parseFloat(cpn.discount_value)}%`
                          : formatPrice(cpn.discount_value)}
                      </div>
                      <div style={{ fontSize: 11.5, color: '#6B7280' }}>
                        {cpn.discount_type === 'percent' ? 'Phần trăm' : 'Cố định'}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700 }}>
                        <span style={{ color: '#6366F1' }}>{cpn.used_count ?? 0}</span>
                        <span style={{ color: '#9CA3AF', margin: '0 4px' }}>/</span>
                        <span style={{ color: cpn.usage_limit ? '#111827' : '#9CA3AF' }}>
                          {cpn.usage_limit ?? '∞'}
                        </span>
                      </div>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {startDateStr || endDateStr ? (
                        <div>
                          <div>
                            <span style={{ color: '#6B7280' }}>Từ:</span>{' '}
                            <strong>{startDateStr || 'Tức thì'}</strong>
                          </div>
                          <div style={{ marginTop: 2 }}>
                            <span style={{ color: '#6B7280' }}>Đến:</span>{' '}
                            <strong>{endDateStr || 'Vô thời hạn'}</strong>
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontStyle: 'italic' }}>Không giới hạn thời gian</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          backgroundColor: status.bg,
                          color: status.color,
                          padding: '3px 8px',
                          borderRadius: 12,
                          display: 'inline-block',
                        }}
                      >
                        ● {status.label}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#6B7280' }}>
                      {formatDate(cpn.created_at)}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => startEdit(cpn)}
                          title="Sửa mã"
                          style={{
                            color: '#3B82F6',
                            padding: '5px 8px',
                            borderRadius: 4,
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Icons.Sliders size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteCoupon(cpn.coupon_id)}
                          title="Xóa mã"
                          style={{
                            color: '#EF4444',
                            padding: '5px 8px',
                            borderRadius: 4,
                            backgroundColor: '#FEF2F2',
                            border: '1px solid #FECACA',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          <Icons.Trash2 size={14} />
                        </button>
                      </div>
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
