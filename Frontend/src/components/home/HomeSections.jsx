import React, { useState, useEffect } from 'react';
import Icons from '../common/Icons';
import ProductCard from '../common/ProductCard';

export const TrustFeatures = () => {
  const features = [
    {
      icon: <Icons.ShieldCheck size={22} />,
      title: 'Chính Hãng 100%',
      desc: 'Bảo hành 1 đổi 1 tận nơi',
    },
    {
      icon: <Icons.Truck size={22} />,
      title: 'Giao Nhanh Siêu Tốc 2H',
      desc: 'Miễn phí đơn từ 500.000₫',
    },
    {
      icon: <Icons.RotateCcw size={22} />,
      title: 'Đổi Trả Dễ Dàng 30 Ngày',
      desc: 'Thủ tục nhanh chóng, tiện lợi',
    },
    {
      icon: <Icons.CreditCard size={22} />,
      title: 'Hỗ Trợ Trả Góp 0%',
      desc: 'Duyệt hồ sơ nhanh qua CCCD/Thẻ',
    },
  ];

  return (
    <div className="container">
      <div className="trust-bar">
        <div className="trust-grid">
          {features.map((feat, idx) => (
            <div key={idx} className="trust-item">
              <div className="trust-icon-box">{feat.icon}</div>
              <div>
                <div className="trust-title">{feat.title}</div>
                <div className="trust-desc">{feat.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FlashSaleSection = ({ products = [], onNavigate }) => {
  // Flash sale countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 42,
    seconds: 19,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDigits = (num) => String(num).padStart(2, '0');

  // Products with discounts
  const saleProducts = products.filter(
    (p) => parseFloat(p.min_sale_price) < parseFloat(p.min_price)
  );
  const displayProducts = saleProducts.length > 0 ? saleProducts : products.slice(0, 4);

  return (
    <section className="container" style={{ marginBottom: 36 }}>
      <div className="flash-sale-box">
        <div className="flash-sale-header">
          <div className="flash-sale-title-group">
            <span className="flame-icon" style={{ color: '#F59E0B' }}>
              <Icons.Flame size={28} />
            </span>
            <h3 className="flash-sale-title">GIÁ SỐC HÔM NAY</h3>
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#F87171',
                padding: '3px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 800,
                border: '1px solid rgba(239, 68, 68, 0.4)',
              }}
            >
              GIỚI HẠN SỐ LƯỢNG
            </span>
          </div>

          <div className="countdown-box">
            <span>KẾT THÚC TRONG:</span>
            <span className="countdown-unit">{formatDigits(timeLeft.hours)}</span>:
            <span className="countdown-unit">{formatDigits(timeLeft.minutes)}</span>:
            <span className="countdown-unit">{formatDigits(timeLeft.seconds)}</span>
          </div>
        </div>

        <div className="products-grid">
          {displayProducts.map((prod) => (
            <div key={prod.product_id} style={{ display: 'flex', flexDirection: 'column' }}>
              <ProductCard product={prod} onNavigate={onNavigate} />
              <div className="sale-progress-container" style={{ padding: '0 4px' }}>
                <div className="sale-progress-bar">
                  <div
                    className="sale-progress-fill"
                    style={{ width: `${Math.min(90, Math.max(30, (prod.product_id * 23) % 100))}%` }}
                  />
                </div>
                <div className="sale-progress-text">
                  <span style={{ color: '#F87171', fontWeight: 700 }}>
                    🔥 Đã bán {prod.total_sold || 18} món
                  </span>
                  <span>Còn {prod.total_stock || 12} suất</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
