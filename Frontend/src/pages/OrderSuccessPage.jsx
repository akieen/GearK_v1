import React from 'react';
import { formatPrice, formatDate } from '../utils/formatters';
import Icons from '../components/common/Icons';

export const OrderSuccessPage = ({ orderData, orderCode, onNavigate }) => {
  const code = orderData?.order_code || orderCode || 'ORD-2026';
  const total = orderData?.total_amount || 0;

  return (
    <div className="container" style={{ padding: '60px 0', maxWidth: 720 }}>
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 16,
          border: '1px solid var(--border-light)',
          padding: 40,
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)',
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            backgroundColor: '#D1FAE5',
            color: '#10B981',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}
        >
          <Icons.Check size={40} />
        </div>

        <span
          style={{
            backgroundColor: '#FEE2E2',
            color: 'var(--primary)',
            fontSize: 12,
            fontWeight: 800,
            padding: '4px 10px',
            borderRadius: 20,
            textTransform: 'uppercase',
          }}
        >
          ĐẶT HÀNG THÀNH CÔNG
        </span>

        <h1 style={{ fontSize: 26, fontWeight: 900, color: '#111827', margin: '14px 0 8px 0' }}>
          Cảm ơn bạn đã mua sắm tại GearK!
        </h1>
        <p style={{ color: '#4B5563', fontSize: 14, maxWidth: 500, margin: '0 auto 24px auto' }}>
          Đơn hàng của bạn đã được tiếp nhận và nhân viên hỗ trợ GearK sẽ gọi điện xác nhận trong ít phút.
        </p>

        {/* Order Details Card */}
        <div
          style={{
            backgroundColor: '#F9FAFB',
            borderRadius: 10,
            border: '1px solid var(--border-light)',
            padding: 20,
            textAlign: 'left',
            marginBottom: 28,
          }}
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, fontSize: 13.5 }}>
            <div>
              <span style={{ color: '#6B7280' }}>Mã đơn hàng:</span>
              <div style={{ fontWeight: 800, color: 'var(--primary)', fontSize: 16 }}>{code}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Tổng số tiền:</span>
              <div style={{ fontWeight: 800, color: '#111827', fontSize: 16 }}>{formatPrice(total)}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Thời gian đặt:</span>
              <div style={{ fontWeight: 600, color: '#374151' }}>{formatDate(new Date())}</div>
            </div>
            <div>
              <span style={{ color: '#6B7280' }}>Trạng thái:</span>
              <div style={{ fontWeight: 700, color: '#F59E0B' }}>Đang chờ xác nhận</div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {['Chờ xác nhận', 'Đã xác nhận', 'Đang vận chuyển', 'Hoàn tất'].map((step, idx) => (
              <div key={idx} style={{ textAlign: 'center', zIndex: 2, flex: 1 }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: idx === 0 ? 'var(--primary)' : '#E5E7EB',
                    color: idx === 0 ? '#FFFFFF' : '#6B7280',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                    fontWeight: 800,
                    fontSize: 13,
                  }}
                >
                  {idx + 1}
                </div>
                <span style={{ fontSize: 12, fontWeight: idx === 0 ? 800 : 500, color: idx === 0 ? 'var(--primary)' : '#6B7280' }}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
          <button
            onClick={() => onNavigate('my-orders')}
            style={{
              padding: '12px 24px',
              borderRadius: 8,
              border: '1.5px solid var(--border-light)',
              backgroundColor: '#FFFFFF',
              color: '#111827',
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Quản lý đơn hàng
          </button>
          <button
            onClick={() => onNavigate('home')}
            style={{
              padding: '12px 28px',
              borderRadius: 8,
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              fontWeight: 800,
              fontSize: 14,
              boxShadow: 'var(--shadow-primary)',
            }}
          >
            Tiếp tục mua sắm
          </button>
        </div>
      </div>
    </div>
  );
};
