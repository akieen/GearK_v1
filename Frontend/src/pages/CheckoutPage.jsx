import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';

import LocationOnIcon from '@mui/icons-material/LocationOn';
import PaymentIcon from '@mui/icons-material/Payment';
import EditNoteIcon from '@mui/icons-material/EditNote';
import AddLocationAltIcon from '@mui/icons-material/AddLocationAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { addressApi, couponApi } from '../api/extraApi';
import { orderApi } from '../api/cartApi';
import { paymentApi } from '../api/paymentApi';
import { formatPrice } from '../utils/formatters';
import { AppDialog } from '../components/ui/AppDialog';
import { AppButton } from '../components/ui/AppButton';
import { AppInput } from '../components/ui/AppInput';

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

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

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

  useEffect(() => {
    if (!user) {
      openAuthModal('login');
      return;
    }
    const loadAddresses = async () => {
      try {
        const res = await addressApi.getAddresses();
        if (res.success && res.data) {
          setAddresses(res.data);
          const def = res.data.find((a) => a.is_default);
          if (def) {
            setSelectedAddressId(def.address_id);
          } else if (res.data.length > 0) {
            setSelectedAddressId(res.data[0].address_id);
          }
        }
      } catch (err) {
        console.error('Lỗi nạp địa chỉ:', err);
      }
    };
    loadAddresses();
  }, [user]);

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

  const handleExecuteOrder = async () => {
    setPlacingOrder(true);
    try {
      if (paymentMethod === 'vnpay') {
        const payload = {
          amount: finalTotal,
          address_id: selectedAddressId,
          recipient_name: selectedAddress?.recipient_name,
          recipient_phone: selectedAddress?.recipient_phone,
          street_address: selectedAddress?.street_address,
          coupon_code: appliedCoupon ? appliedCoupon.coupon_code : undefined,
          notes: orderNotes.trim(),
          items: cart.items.map((it) => ({
            variant_id: it.variant_id,
            quantity: it.quantity,
          })),
        };

        toast.info('Đang chuyển hướng sang cổng thanh toán VNPAY...');
        const res = await paymentApi.createPaymentUrl(payload);

        if (res.payment_url || res.data?.payment_url) {
          const vnpUrl = res.payment_url || res.data?.payment_url;
          setShowConfirmModal(false);
          // Chuyển hướng tới trang thanh toán của VNPAY
          window.location.href = vnpUrl;
          return;
        } else {
          throw new Error(res.message || 'Không thể tạo liên kết thanh toán VNPAY');
        }
      }

      // COD và các phương thức thông thường
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
      <Container maxWidth="md" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
          Giỏ hàng chưa có sản phẩm để thanh toán
        </Typography>
        <AppButton variant="primary" onClick={() => onNavigate('products')}>
          Quay lại mua sắm
        </AppButton>
      </Container>
    );
  }

  return (
    <Box sx={{ py: 4, pb: 8 }}>
      <Container maxWidth="lg">
        <Typography variant="h5" sx={{ fontWeight: 900, textTransform: 'uppercase', mb: 3, pb: 2, borderBottom: '2px solid #E5E7EB' }}>
          Tiến hành đặt hàng & Thanh toán
        </Typography>

        <Grid container spacing={3.5}>
          {/* Left Form: Address & Payment */}
          <Grid item xs={12} md={7.5}>
            <Stack spacing={3}>
              {/* Section 1: Delivery Address */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOnIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                    <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                      1. Thông tin người nhận & Địa chỉ giao hàng
                    </Typography>
                  </Box>
                  <Button
                    size="small"
                    startIcon={<AddLocationAltIcon fontSize="small" />}
                    onClick={() => setShowNewAddressForm(!showNewAddressForm)}
                    sx={{ color: 'primary.main', fontWeight: 700 }}
                  >
                    {showNewAddressForm ? 'Sổ địa chỉ' : '+ Thêm mới'}
                  </Button>
                </Box>

                {showNewAddressForm ? (
                  <Box component="form" onSubmit={handleAddNewAddress} sx={{ p: 2.5, backgroundColor: '#F8FAFC', borderRadius: 2, border: '1px solid #E5E7EB' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <AppInput
                          topLabel="Họ và tên người nhận"
                          placeholder="Nguyễn Văn Khách"
                          value={newRecipientName}
                          onChange={(e) => setNewRecipientName(e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <AppInput
                          topLabel="Số điện thoại"
                          placeholder="0987654321"
                          type="tel"
                          value={newRecipientPhone}
                          onChange={(e) => setNewRecipientPhone(e.target.value)}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <AppInput
                          topLabel="Địa chỉ cụ thể (Số nhà, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh/TP)"
                          placeholder="Số 123 Đường Cầu Giấy, Phường Dịch Vọng, Quận Cầu Giấy, Hà Nội"
                          value={newStreetAddress}
                          onChange={(e) => setNewStreetAddress(e.target.value)}
                          required
                        />
                      </Grid>
                    </Grid>
                    <Stack direction="row" spacing={1.5} sx={{ mt: 2 }}>
                      <AppButton type="submit" variant="primary" size="small" loading={savingAddress}>
                        Lưu địa chỉ này
                      </AppButton>
                      <AppButton variant="ghost" size="small" onClick={() => setShowNewAddressForm(false)}>
                        Hủy
                      </AppButton>
                    </Stack>
                  </Box>
                ) : (
                  <Stack spacing={1.5}>
                    {addresses.length === 0 ? (
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        Bạn chưa có địa chỉ giao hàng nào. Vui lòng bấm "+ Thêm mới" ở trên.
                      </Typography>
                    ) : (
                      addresses.map((addr) => {
                        const isSelected = selectedAddressId === addr.address_id;
                        return (
                          <Paper
                            key={addr.address_id}
                            variant="outlined"
                            onClick={() => setSelectedAddressId(addr.address_id)}
                            sx={{
                              p: 2,
                              borderRadius: 2,
                              cursor: 'pointer',
                              border: isSelected ? '2px solid #E30019' : '1px solid #E5E7EB',
                              backgroundColor: isSelected ? '#FEF2F2' : '#FFFFFF',
                              transition: 'all 0.2s',
                              '&:hover': { borderColor: 'primary.main' },
                            }}
                          >
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                                {addr.recipient_name} • {addr.recipient_phone}
                              </Typography>
                              {isSelected && (
                                <Chip
                                  label="✓ Đang chọn"
                                  size="small"
                                  sx={{
                                    height: 20,
                                    fontSize: '0.6875rem',
                                    fontWeight: 800,
                                    backgroundColor: 'primary.main',
                                    color: '#FFFFFF',
                                  }}
                                />
                              )}
                            </Box>
                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                              {addr.street_address}
                            </Typography>
                          </Paper>
                        );
                      })
                    )}
                  </Stack>
                )}
              </Paper>

              {/* Section 2: Payment Method */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <PaymentIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    2. Phương thức thanh toán
                  </Typography>
                </Box>

                <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                  {/* COD */}
                  <Paper
                    variant="outlined"
                    onClick={() => setPaymentMethod('cod')}
                    sx={{
                      p: 2,
                      mb: 1.5,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: paymentMethod === 'cod' ? '2px solid #E30019' : '1px solid #E5E7EB',
                      backgroundColor: paymentMethod === 'cod' ? '#FEF2F2' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FormControlLabel
                      value="cod"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            Thanh toán khi nhận hàng (COD)
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Kiểm tra hàng trước khi thanh toán tiền mặt cho nhân viên giao hàng.
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Paper>

                  {/* VietQR Bank Transfer */}
                  <Paper
                    variant="outlined"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: paymentMethod === 'bank_transfer' ? '2px solid #E30019' : '1px solid #E5E7EB',
                      backgroundColor: paymentMethod === 'bank_transfer' ? '#FEF2F2' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FormControlLabel
                      value="bank_transfer"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            Chuyển khoản Ngân hàng (VietQR - Miễn phí)
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Quét mã QR qua app ngân hàng hoặc Internet Banking xác nhận tức thì.
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Paper>

                  {/* VNPay Gateway */}
                  <Paper
                    variant="outlined"
                    onClick={() => setPaymentMethod('vnpay')}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      cursor: 'pointer',
                      border: paymentMethod === 'vnpay' ? '2px solid #E30019' : '1px solid #E5E7EB',
                      backgroundColor: paymentMethod === 'vnpay' ? '#FEF2F2' : '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <FormControlLabel
                      value="vnpay"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              Cổng thanh toán trực tuyến VNPAY
                            </Typography>
                            <Chip
                              label="ATM • QR • VISA"
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.625rem',
                                fontWeight: 800,
                                backgroundColor: '#E30019',
                                color: '#FFFFFF',
                              }}
                            />
                          </Box>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            Chuyển sang cổng VNPAY quét mã QR Pay hoặc nhập thẻ ATM nội địa / Visa / Master. Đơn hàng chỉ được tạo sau khi thanh toán thành công.
                          </Typography>
                        </Box>
                      }
                      sx={{ m: 0, width: '100%' }}
                    />
                  </Paper>
                </RadioGroup>

                {paymentMethod === 'vnpay' && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    <strong>THANH TOÁN AN TOÀN QUA VNPAY:</strong><br />
                    Khi bấm <strong>"Xác nhận đặt hàng"</strong>, bạn sẽ được tự động chuyển tiếp tới cổng VNPAY. Sau khi thanh toán thành công, hệ thống callback sẽ ghi nhận và tự động tạo đơn hàng cho bạn!
                  </Alert>
                )}

                {paymentMethod === 'bank_transfer' && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                    <strong>THÔNG TIN TÀI KHOẢN GEARK PRO:</strong><br />
                    Ngân hàng: <strong>MBBank (Quân Đội)</strong> — Số TK: <strong>0987654321999</strong><br />
                    Chủ tài khoản: <strong>GEARK GAMING ECOMMERCE</strong><br />
                    Nội dung CK: <strong>GEARK + SĐT của bạn</strong>
                  </Alert>
                )}
              </Paper>

              {/* Section 3: Notes */}
              <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                  <EditNoteIcon sx={{ color: 'primary.main', fontSize: 22 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
                    3. Ghi chú giao hàng
                  </Typography>
                </Box>
                <TextField
                  fullWidth
                  multiline
                  rows={2.5}
                  placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến 15 phút..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                />
              </Paper>
            </Stack>
          </Grid>

          {/* Right Summary Box */}
          <Grid item xs={12} md={4.5}>
            <Paper elevation={1} sx={{ p: 3, borderRadius: 3, border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF' }}>
              <Typography variant="h6" sx={{ fontWeight: 900, mb: 2 }}>
                Đơn hàng của bạn ({cart.items.length} món)
              </Typography>

              {/* Items Brief List */}
              <Stack spacing={1.5} sx={{ maxHeight: 240, overflowY: 'auto', mb: 2.5, pr: 0.5 }}>
                {cart.items.map((item) => (
                  <Box key={item.cart_item_id} sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src={item.thumbnail_url}
                      alt={item.product_name}
                      sx={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 1.5, border: '1px solid #E5E7EB', p: 0.5 }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.product_name}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        SL: {item.quantity} × {formatPrice(item.sale_price || item.price)}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                      {formatPrice((parseFloat(item.sale_price || item.price) || 0) * item.quantity)}
                    </Typography>
                  </Box>
                ))}
              </Stack>

              <Divider sx={{ mb: 2 }} />

              {/* Coupon Form */}
              <Box component="form" onSubmit={handleApplyCoupon} sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Mã voucher"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <AppButton type="submit" variant="primary" size="small" loading={validatingCoupon} sx={{ flexShrink: 0 }}>
                  Áp dụng
                </AppButton>
              </Box>

              {appliedCoupon && (
                <Alert severity="success" sx={{ mb: 2, py: 0, '& .MuiAlert-message': { fontSize: '0.75rem', fontWeight: 700 } }}>
                  Đã áp dụng mã: {appliedCoupon.coupon_code}
                </Alert>
              )}

              {/* Financial Calculation */}
              <Stack spacing={1.25} sx={{ my: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Tạm tính:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatPrice(cartTotal)}</Typography>
                </Box>
                {discountAmount > 0 && (
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', color: 'success.main' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Voucher giảm giá:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>-{formatPrice(discountAmount)}</Typography>
                  </Box>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>Phí vận chuyển:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>0₫ (Miễn phí)</Typography>
                </Box>
                <Divider />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>Tổng thanh toán:</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main' }}>
                    {formatPrice(finalTotal)}
                  </Typography>
                </Box>
              </Stack>

              <AppButton
                variant="primary"
                size="large"
                fullWidth
                glow
                onClick={handleOpenConfirmModal}
                disabled={placingOrder}
                sx={{ py: 1.5, mt: 1 }}
              >
                Tiến hành đặt hàng
              </AppButton>
            </Paper>
          </Grid>
        </Grid>

        {/* Confirmation Dialog */}
        <AppDialog
          open={showConfirmModal}
          onClose={() => !placingOrder && setShowConfirmModal(false)}
          title="Xác nhận thông tin đặt hàng"
          maxWidth="sm"
          headerIcon={<CheckCircleIcon sx={{ color: 'success.main' }} />}
          actions={
            <>
              <AppButton variant="ghost" disabled={placingOrder} onClick={() => setShowConfirmModal(false)}>
                Kiểm tra lại
              </AppButton>
              <AppButton variant="primary" loading={placingOrder} onClick={handleExecuteOrder}>
                {paymentMethod === 'vnpay' ? 'Chuyển sang VNPAY thanh toán' : 'Xác nhận đặt hàng'}
              </AppButton>
            </>
          }
        >
          <Stack spacing={2}>
            <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />}>
              Vui lòng kiểm tra kỹ thông tin người nhận và đơn hàng trước khi hoàn tất.
            </Alert>

            {/* Recipient info */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: '#F8FAFC' }}>
              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                Địa chỉ nhận hàng:
              </Typography>
              {selectedAddress ? (
                <Box sx={{ mt: 0.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                    {selectedAddress.recipient_name} — {selectedAddress.recipient_phone}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {selectedAddress.street_address}
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2" color="error">Chưa chọn địa chỉ</Typography>
              )}

              <Divider sx={{ my: 1.5 }} />

              <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
                Phương thức thanh toán:
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.5 }}>
                {paymentMethod === 'cod'
                  ? '💵 Tiền mặt khi nhận hàng (COD)'
                  : paymentMethod === 'vnpay'
                  ? '💳 Cổng thanh toán trực tuyến VNPAY (ATM/QR/Visa)'
                  : '🏦 Chuyển khoản ngân hàng (VietQR)'}
              </Typography>
            </Paper>

            {/* Financial Summary */}
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, backgroundColor: '#FFFBEB', borderColor: '#FDE68A' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                <Typography variant="body2" sx={{ color: '#4B5563' }}>Tạm tính:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>{formatPrice(cartTotal)}</Typography>
              </Box>
              {discountAmount > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5, color: '#059669' }}>
                  <Typography variant="body2">Giảm giá ({appliedCoupon?.coupon_code}):</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800 }}>-{formatPrice(discountAmount)}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', pt: 1, borderTop: '1px dashed #FCD34D' }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#92400E' }}>Tổng tiền:</Typography>
                <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                  {formatPrice(finalTotal)}
                </Typography>
              </Box>
            </Paper>
          </Stack>
        </AppDialog>
      </Container>
    </Box>
  );
};

export default CheckoutPage;
