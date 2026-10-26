import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addressApi, couponApi } from '../api/extraApi';
import { orderApi } from '../api/cartApi';
import { formatPrice } from '../utils/formatters';
import Icons from '../components/common/Icons';
import { Modal } from '../components/common/ToastContainer';

export const CheckoutPage = ({ onNavigate, onOrderCompleted, initialCoupon }) => {
  const { cart, cartTotal, fetchCart } = useCart();
  const { user, openAuthModal } = useAuth();
  const toast = useToast();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [newRecipientName, setNewRecipientName] = useState('');
  const [newRecipientPhone, setNewRecipientPhone] = useState('');
  const [newStreetAddress, setNewStreetAddress] = useState('');
  const [savingAddress, setSavingAddress] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [orderNotes, setOrderNotes] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [validatingCoupon, setValidatingCoupon] = useState(false);
  const [placingOrder, setPlacingOrder] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Always fetch latest cart on mount to ensure all items are loaded
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Support coupon passed from CartPage or URL query
  useEffect(() => {
    const hash = window.location.hash || '';
    const qs = hash.includes('?') ? hash.split('?')[1] : '';
    const sp = new URLSearchParams(qs);
    const cCode = initialCoupon || sp.get('coupon');
    if (cCode && !appliedCoupon) {
      setCouponCode(cCode);
      couponApi.validateCoupon(cCode, cartTotal || 1).then((res) => {
        if (res.success && res.data) {
          setAppliedCoupon(res.data);
        }
      }).catch(() => {});
    }
  }, [initialCoupon, cartTotal, appliedCoupon]);

  // Fetch addresses
  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    const loadAddresses = async () => {
      try {
        const res = await addressApi.getAddresses();
        if (res.success && res.data) {
          const list = res.data || [];
          setAddresses(list);
          if (list.length > 0) {
            setSelectedAddressId(list[0].address_id);
          } else {
            setShowNewAddressForm(true);
          }
        }
      } catch (err) {
        console.error('Lỗi tải danh sách địa chỉ:', err);
      }
    };
    loadAddresses();
  }, [user]);

  // Handle adding a new address
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    if (!newRecipientName || !newRecipientPhone || !newStreetAddress) {
      toast.warning('Vui lòng điền đầy đủ thông tin giao hàng!');
      return;
    }
    setSavingAddress(true);
    try {
      const res = await addressApi.createAddress({
        recipient_name: newRecipientName.trim(),
        recipient_phone: newRecipientPhone.trim(),
        street_address: newStreetAddress.trim(),
        is_default: addresses.length === 0,
      });
      if (res.success && res.data) {
        toast.success('Thêm địa chỉ giao hàng thành công!');
        const createdId = res.data.insertId || res.data.address_id;
        const updatedList = await addressApi.getAddresses();
        setAddresses(updatedList.data || []);
        setSelectedAddressId(createdId);
        setShowNewAddressForm(false);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi lưu địa chỉ');
    } finally {
      setSavingAddress(false);
    }
  };

  // Coupon check
  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setValidatingCoupon(true);
    try {
      const res = await couponApi.validateCoupon(couponCode.trim(), cartTotal);
      if (res.success && res.data) {
        setAppliedCoupon(res.data);
        toast.success(`Áp dụng mã ${couponCode.toUpperCase()} thành công!`);
      }
    } catch (err) {
      toast.error(err.message || 'Mã giảm giá không hợp lệ hoặc đã hết hạn');
    } finally {
      setValidatingCoupon(false);
    }
  };

  const discountAmount = appliedCoupon ? parseFloat(appliedCoupon.discount_amount || 0) : 0;
  const finalTotal = Math.max(0, cartTotal - discountAmount);

  const selectedAddress = addresses.find((a) => a.address_id === selectedAddressId);

  // Validate before showing confirmation dialog
  const handleOpenConfirmModal = () => {
    if (!selectedAddressId) {
      toast.warning('Vui lòng chọn hoặc thêm địa chỉ nhận hàng!');
      return;
    }

    if (!cart.items || cart.items.length === 0) {
      toast.warning('Giỏ hàng đang trống!');
      return;
    }

    setShowConfirmModal(true);
  };

  // Submit Order after customer confirms in dialog
  const handleExecuteOrder = async () => {
    setPlacingOrder(true);
    try {
      const payload = {
        address_id: selectedAddressId,
        payment_method: paymentMethod,
        notes: orderNotes.trim(),
        coupon_code: appliedCoupon ? appliedCoupon.coupon_code : undefined,
        items: cart.items.map((it) => ({
          variant_id: it.variant_id,
          quantity: it.quantity,
        })),
      };

      const res = await orderApi.createOrder(payload);
      if (res.success && res.data) {
        setShowConfirmModal(false);
        toast.success('🎉 Đặt hàng thành công! Cảm ơn bạn đã tin chọn GearK.');
        await fetchCart();
        if (onOrderCompleted) {
          onOrderCompleted(res.data);
        }
        onNavigate(`order-success/${res.data.order_code || res.data.order_id}`);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tạo đơn hàng');
    } finally {
      setPlacingOrder(false);
    }
  };

  if (!cart.items || cart.items.length === 0) {
    return (
      <div className="container" style={{ padding: '60px 0', textAlign: 'center' }}>
        <p style={{ fontWeight: 700, fontSize: 16 }}>Giỏ hàng chưa có sản phẩm để thanh toán.</p>
        <button
          onClick={() => onNavigate('products')}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '10px 20px',
            borderRadius: 6,
            fontWeight: 700,
            marginTop: 14,
          }}
        >
          Quay lại mua sắm
        </button>
      </div>
    );
  }

  return (
    <div className="container">
      <div style={{ padding: '24px 0 16px 0', borderBottom: '2px solid var(--border-light)' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#111827' }}>
          TIẾN HÀNH ĐẶT HÀNG & THANH TOÁN
        </h2>
      </div>

      <div className="checkout-grid">
        {/* Left Form: Address & Payment */}
        <div>
          {/* Section 1: Delivery Address */}
          <div className="checkout-section-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 className="checkout-section-title" style={{ margin: 0 }}>
                <Icons.MapPin size={20} style={{ color: 'var(--primary)' }} />
                1. Thông tin người nhận & Địa chỉ giao hàng
              </h3>
              <button
                type="button"
                onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 700 }}
              >
                {showNewAddressForm ? 'Chọn từ sổ địa chỉ' : '+ Thêm địa chỉ mới'}
              </button>
            </div>

            {showNewAddressForm ? (
              <form onSubmit={handleAddNewAddress} style={{ backgroundColor: '#F9FAFB', padding: 16, borderRadius: 8 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Tên người nhận *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      placeholder="Nguyễn Văn Khách"
                      value={newRecipientName}
                      onChange={(e) => setNewRecipientName(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Số điện thoại *</label>
                    <input
                      type="tel"
                      required
                      className="form-input"
                      placeholder="0987654321"
                      value={newRecipientPhone}
                      onChange={(e) => setNewRecipientPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Địa chỉ cụ thể (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội"
                    value={newStreetAddress}
                    onChange={(e) => setNewStreetAddress(e.target.value)}
                  />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    type="submit"
                    disabled={savingAddress}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      padding: '8px 18px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    {savingAddress ? 'Đang lưu...' : 'Lưu địa chỉ này'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewAddressForm(false)}
                    style={{
                      padding: '8px 14px',
                      borderRadius: 6,
                      border: '1px solid var(--border-light)',
                      fontWeight: 600,
                      fontSize: 13,
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {addresses.length === 0 ? (
                  <p style={{ fontSize: 13, color: '#6B7280' }}>
                    Bạn chưa có địa chỉ giao hàng nào. Vui lòng bấm "+ Thêm địa chỉ mới" ở trên.
                  </p>
                ) : (
                  addresses.map((addr) => (
                    <div
                      key={addr.address_id}
                      className={`address-item-card ${selectedAddressId === addr.address_id ? 'selected' : ''}`}
                      onClick={() => setSelectedAddressId(addr.address_id)}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontWeight: 800, fontSize: 14, color: '#111827' }}>
                          {addr.recipient_name} • {addr.recipient_phone}
                        </span>
                        {selectedAddressId === addr.address_id && (
                          <span style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 12 }}>
                            ✓ Đang chọn
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 13, color: '#4B5563', marginTop: 4 }}>
                        {addr.street_address}
                      </p>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Section 2: Payment Method */}
          <div className="checkout-section-card">
            <h3 className="checkout-section-title">
              <Icons.CreditCard size={20} style={{ color: 'var(--primary)' }} />
              2. Phương thức thanh toán
            </h3>

            <div
              className={`payment-method-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('cod')}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === 'cod' && <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div>Thanh toán khi nhận hàng (COD)</div>
                <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
                  Kiểm tra hàng trước khi thanh toán tiền mặt cho shipper.
                </div>
              </div>
            </div>

            <div
              className={`payment-method-card ${paymentMethod === 'bank_transfer' ? 'selected' : ''}`}
              onClick={() => setPaymentMethod('bank_transfer')}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', border: '2px solid var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === 'bank_transfer' && <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--primary)' }} />}
              </div>
              <div style={{ flex: 1 }}>
                <div>Chuyển khoản Ngân hàng (VietQR - Miễn phí)</div>
                <div style={{ fontSize: 12, color: '#6B7280', fontWeight: 400 }}>
                  Quét mã QR qua app ngân hàng hoặc Internet Banking xác nhận tức thì.
                </div>
              </div>
            </div>

            {paymentMethod === 'bank_transfer' && (
              <div
                style={{
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  borderRadius: 8,
                  padding: 14,
                  marginTop: 10,
                  fontSize: 12.5,
                  color: '#991B1B',
                }}
              >
                <div style={{ fontWeight: 800, marginBottom: 4 }}>THÔNG TIN TÀI KHOẢN GEARK PRO:</div>
                <div>Ngân hàng: <strong>MBBank (Ngân hàng Quân Đội)</strong></div>
                <div>Số tài khoản: <strong>0987654321999</strong></div>
                <div>Chủ tài khoản: <strong>GEARK GAMING ECOMMERCE</strong></div>
                <div>Nội dung CK: <strong>GEARK + SĐT của bạn</strong></div>
              </div>
            )}
          </div>

          {/* Section 3: Notes */}
          <div className="checkout-section-card">
            <h3 className="checkout-section-title">
              <Icons.Tag size={18} style={{ color: 'var(--primary)' }} />
              3. Ghi chú giao hàng
            </h3>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến 15 phút..."
              value={orderNotes}
              onChange={(e) => setOrderNotes(e.target.value)}
            />
          </div>
        </div>

        {/* Right Summary Box */}
        <div>
          <div className="cart-summary-box">
            <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 14, color: '#111827' }}>
              Đơn hàng của bạn ({cart.items.length} món)
            </h3>

            {/* List items brief */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                maxHeight: 220,
                overflowY: 'auto',
                marginBottom: 16,
                paddingRight: 4,
              }}
            >
              {cart.items.map((item) => (
                <div key={item.cart_item_id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12.5 }}>
                  <img
                    src={item.thumbnail_url}
                    alt={item.product_name}
                    style={{ width: 42, height: 42, objectFit: 'contain', borderRadius: 4, border: '1px solid #E5E7EB' }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.product_name}
                    </div>
                    <div style={{ color: '#6B7280' }}>
                      SL: {item.quantity} × {formatPrice(item.sale_price || item.price)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--primary)' }}>
                    {formatPrice((parseFloat(item.sale_price || item.price) || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            {/* Coupon Box */}
            <form className="coupon-form" onSubmit={handleApplyCoupon}>
              <input
                type="text"
                className="coupon-input"
                placeholder="Mã voucher"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button type="submit" className="coupon-btn" disabled={validatingCoupon}>
                {validatingCoupon ? '...' : 'Áp dụng'}
              </button>
            </form>

            {appliedCoupon && (
              <div style={{ fontSize: 12, color: '#065F46', backgroundColor: '#D1FAE5', padding: '6px 10px', borderRadius: 4, marginBottom: 10 }}>
                ✓ Đã áp dụng mã: <strong>{appliedCoupon.coupon_code}</strong>
              </div>
            )}

            <div className="summary-row">
              <span>Tạm tính:</span>
              <span style={{ fontWeight: 700 }}>{formatPrice(cartTotal)}</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-row" style={{ color: '#10B981' }}>
                <span>Voucher giảm giá:</span>
                <span style={{ fontWeight: 700 }}>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="summary-row">
              <span>Phí vận chuyển:</span>
              <span style={{ color: '#10B981', fontWeight: 700 }}>0₫ (Miễn phí)</span>
            </div>

            <div className="summary-row total">
              <span>Tổng thanh toán:</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            <button
              className="btn-checkout"
              disabled={placingOrder}
              onClick={handleOpenConfirmModal}
            >
              {placingOrder ? 'ĐANG TẠO ĐƠN HÀNG...' : 'TIẾN HÀNH ĐẶT HÀNG'}
            </button>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog before finalizing order */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => !placingOrder && setShowConfirmModal(false)}
        title="Xác nhận thông tin đặt hàng"
        maxWidth={550}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Notice banner */}
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#EFF6FF',
              borderRadius: 8,
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              fontSize: 13,
              color: '#1E40AF',
            }}
          >
            <Icons.Info size={20} style={{ color: '#2563EB', flexShrink: 0 }} />
            <div>
              Vui lòng kiểm tra kỹ thông tin người nhận và đơn hàng trước khi xác nhận.
            </div>
          </div>

          {/* Delivery & Payment details */}
          <div
            style={{
              backgroundColor: '#F9FAFB',
              borderRadius: 8,
              border: '1px solid #E5E7EB',
              padding: '14px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              fontSize: 13,
            }}
          >
            {/* Recipient info */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                <Icons.MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>Địa chỉ nhận hàng:</span>
              </div>
              {selectedAddress ? (
                <div style={{ paddingLeft: 22 }}>
                  <div style={{ fontWeight: 700, color: '#111827' }}>
                    {selectedAddress.recipient_name} —{' '}
                    <span style={{ color: '#2563EB' }}>{selectedAddress.recipient_phone}</span>
                  </div>
                  <div style={{ color: '#4B5563', marginTop: 2, lineHeight: 1.4 }}>
                    {selectedAddress.street_address}
                  </div>
                </div>
              ) : (
                <div style={{ paddingLeft: 22, color: '#DC2626' }}>Chưa chọn địa chỉ</div>
              )}
            </div>

            <div style={{ height: 1, backgroundColor: '#E5E7EB' }} />

            {/* Payment method */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, color: '#374151', marginBottom: 4 }}>
                <Icons.CreditCard size={16} style={{ color: 'var(--primary)' }} />
                <span>Hình thức thanh toán:</span>
              </div>
              <div style={{ paddingLeft: 22, color: '#111827', fontWeight: 600 }}>
                {paymentMethod === 'cod' ? (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    💵 Thanh toán tiền mặt khi nhận hàng (COD)
                  </span>
                ) : (
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    🏦 Chuyển khoản ngân hàng (Quét mã VietQR)
                  </span>
                )}
              </div>
            </div>

            {/* Order notes if any */}
            {orderNotes.trim() && (
              <>
                <div style={{ height: 1, backgroundColor: '#E5E7EB' }} />
                <div>
                  <div style={{ fontWeight: 700, color: '#374151', marginBottom: 2 }}>
                    Ghi chú của bạn:
                  </div>
                  <div style={{ color: '#4B5563', fontStyle: 'italic', paddingLeft: 8 }}>
                    "{orderNotes.trim()}"
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Items summary */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: '#374151', marginBottom: 8 }}>
              Danh sách sản phẩm ({cart.items?.length || 0} món):
            </div>
            <div
              style={{
                maxHeight: 150,
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                border: '1px solid #E5E7EB',
                borderRadius: 8,
                padding: '8px 12px',
                backgroundColor: '#FFFFFF',
              }}
            >
              {cart.items?.map((item) => (
                <div
                  key={item.cart_item_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 10,
                    fontSize: 12.5,
                    paddingBottom: 6,
                    borderBottom: '1px dashed #F3F4F6',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                    <img
                      src={item.thumbnail_url}
                      alt={item.product_name}
                      style={{ width: 32, height: 32, objectFit: 'contain', borderRadius: 4, border: '1px solid #E5E7EB', flexShrink: 0 }}
                    />
                    <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <span style={{ fontWeight: 600, color: '#111827' }}>{item.product_name}</span>
                      <span style={{ color: '#6B7280', marginLeft: 6 }}>× {item.quantity}</span>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#111827', whiteSpace: 'nowrap' }}>
                    {formatPrice((parseFloat(item.sale_price || item.price) || 0) * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Financial summary box */}
          <div
            style={{
              backgroundColor: '#FFFBEB',
              border: '1px solid #FDE68A',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              fontSize: 13,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#4B5563' }}>
              <span>Tạm tính:</span>
              <span style={{ fontWeight: 600, color: '#111827' }}>{formatPrice(cartTotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
                <span>Voucher giảm giá ({appliedCoupon?.coupon_code}):</span>
                <span style={{ fontWeight: 700 }}>-{formatPrice(discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#059669' }}>
              <span>Phí vận chuyển:</span>
              <span style={{ fontWeight: 700 }}>0₫ (Miễn phí toàn quốc)</span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                borderTop: '1px dashed #FCD34D',
                paddingTop: 8,
                marginTop: 2,
              }}
            >
              <span style={{ fontWeight: 800, fontSize: 14, color: '#92400E' }}>Tổng thanh toán:</span>
              <span style={{ fontWeight: 900, fontSize: 19, color: 'var(--primary)' }}>
                {formatPrice(finalTotal)}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end',
              marginTop: 4,
            }}
          >
            <button
              type="button"
              disabled={placingOrder}
              onClick={() => setShowConfirmModal(false)}
              style={{
                padding: '10px 18px',
                borderRadius: 6,
                fontWeight: 600,
                fontSize: 13.5,
                border: '1px solid #D1D5DB',
                backgroundColor: '#FFFFFF',
                color: '#374151',
                cursor: placingOrder ? 'not-allowed' : 'pointer',
              }}
            >
              Kiểm tra lại
            </button>
            <button
              type="button"
              disabled={placingOrder}
              onClick={handleExecuteOrder}
              style={{
                padding: '10px 24px',
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 13.5,
                border: 'none',
                backgroundColor: 'var(--primary)',
                color: '#FFFFFF',
                cursor: placingOrder ? 'not-allowed' : 'pointer',
                opacity: placingOrder ? 0.75 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                boxShadow: '0 2px 4px rgba(227, 0, 25, 0.25)',
              }}
            >
              {placingOrder ? (
                <>
                  <span className="spinner" style={{ width: 14, height: 14, border: '2px solid #FFF', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }} />
                  Đang tạo đơn hàng...
                </>
              ) : (
                'Xác nhận đặt hàng'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
