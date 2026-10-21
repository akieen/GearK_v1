import React from 'react';
import Icons from './Icons';

export const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="container">
        <div className="footer-grid">
          {/* Col 1 */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div className="brand-badge" style={{ fontSize: 18, padding: '4px 10px' }}>GEARK</div>
              <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: 18 }}>GAMING PRO STORE</span>
            </div>
            <p style={{ fontSize: 13, color: '#9CA3AF', lineHeight: 1.6, marginBottom: 16 }}>
              Hệ thống bán lẻ thiết bị chơi game Hi-End, linh kiện PC và phụ kiện công nghệ hàng đầu Việt Nam. Đối tác chiến lược phân phối chính hãng của Razer, Logitech G, Corsair, Asus ROG, SteelSeries.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 13 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>Showroom HCM: 78-80 Hoàng Hoa Thám, P.12, Q. Tân Bình, TP.HCM</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.MapPin size={16} style={{ color: 'var(--primary)' }} />
                <span>Showroom HN: 162 Thái Hà, P. Trung Liệt, Q. Đống Đa, Hà Nội</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Icons.Phone size={16} style={{ color: 'var(--primary)' }} />
                <span>Tổng đài miễn phí: <strong>1800 6975</strong> (8:00 - 21:00)</span>
              </div>
            </div>
          </div>

          {/* Col 2 */}
          <div>
            <h4 className="footer-col-title">Chính sách & Hỗ trợ</h4>
            <ul className="footer-links">
              <li><a href="#policy">Chính sách bảo hành 1 đổi 1</a></li>
              <li><a href="#shipping">Chính sách giao hàng siêu tốc 2h</a></li>
              <li><a href="#return">Chính sách đổi trả trong 30 ngày</a></li>
              <li><a href="#installment">Hướng dẫn mua hàng trả góp 0%</a></li>
              <li><a href="#faq">Câu hỏi thường gặp (FAQ)</a></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div>
            <h4 className="footer-col-title">Về GearK</h4>
            <ul className="footer-links">
              <li><a href="#about">Giới thiệu về công ty</a></li>
              <li><a href="#careers">Tuyển dụng nhân tài</a></li>
              <li><a href="#partners">Hợp tác kinh doanh (B2B)</a></li>
              <li><a href="#news">Tin tức công nghệ & eSports</a></li>
              <li><a href="#privacy">Chính sách bảo mật thông tin</a></li>
            </ul>
          </div>

          {/* Col 4 */}
          <div>
            <h4 className="footer-col-title">Thanh toán & Chứng nhận</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {['COD Tiền mặt', 'VietQR', 'VNPay', 'Visa/Master', 'Trả góp 0%'].map((method, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#27272A',
                    color: '#E5E7EB',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: '1px solid #3F3F46',
                  }}
                >
                  {method}
                </span>
              ))}
            </div>

            <h4 className="footer-col-title" style={{ marginTop: 20 }}>Kết nối cùng GearK</h4>
            <div style={{ display: 'flex', gap: 10 }}>
              {['Facebook', 'YouTube', 'TikTok', 'Discord'].map((social, idx) => (
                <span
                  key={idx}
                  style={{
                    backgroundColor: '#27272A',
                    color: '#D1D5DB',
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '6px 12px',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {social}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 GearK Gaming E-Commerce Clone. </p>
        </div>
      </div>
    </footer>
  );
};
