import React, { useState, useEffect } from 'react';
import Icons from '../common/Icons';

const slides = [
  {
    id: 1,
    tag: 'SIÊU PHẨM ESPORTS 2026',
    title: 'Chuột Siêu Nhẹ Razer Viper V3 Pro',
    desc: 'Trọng lượng chỉ 54g, cảm biến Focus Pro 35K Gen-2 & tần số gửi tín hiệu 8000Hz không dây siêu tốc.',
    image: 'https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=1200&q=80',
    link: 'product/razer-viper-v3-pro',
    btnText: 'Xem chi tiết ngay',
  },
  {
    id: 2,
    tag: 'ĐỈNH CAO HI-END DISPLAY',
    title: 'Màn Hình Asus ROG Swift OLED PG27AQDM',
    desc: 'Tấm nền OLED 2K 240Hz, phản hồi 0.03ms GTG, tản nhiệt buồng hơi tùy chỉnh chống burn-in độc quyền.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=1200&q=80',
    link: 'product/asus-rog-swift-oled-pg27aqdm',
    btnText: 'Khám phá ngay',
  },
  {
    id: 3,
    tag: 'BÀN PHÍM CƠ TỪ TÍNH RAPID TRIGGER',
    title: 'Corsair K70 MAX RGB Magnetic-Mechanical',
    desc: 'Switch CORSAIR MGX từ tính tùy biến điểm nhận phím từ 0.4mm đến 3.6mm, tần số đáp ứng 8000Hz.',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1200&q=80',
    link: 'product/corsair-k70-max-rgb',
    btnText: 'Mua với giá ưu đãi',
  },
];

export const HeroBanner = ({ onNavigate, categories = [] }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const slide = slides[currentSlide];

  return (
    <section className="hero-section">
      <div className="container">
        <div className="hero-grid">
          {/* Left Category Menu */}
          <div className="hero-category-sidebar">
            <div className="category-menu-card">
              <div
                style={{
                  padding: '12px 16px',
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: 13.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <Icons.Menu size={16} />
                DANH MỤC SẢN PHẨM
              </div>
              {categories.map((cat) => (
                <div
                  key={cat.category_id}
                  className="category-menu-item"
                  onClick={() => onNavigate(`products?category=${cat.slug}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {cat.slug.includes('chuot') ? (
                      <Icons.Mouse size={16} style={{ color: 'var(--primary)' }} />
                    ) : cat.slug.includes('phim') ? (
                      <Icons.Keyboard size={16} style={{ color: 'var(--primary)' }} />
                    ) : cat.slug.includes('tai-nghe') ? (
                      <Icons.Headphones size={16} style={{ color: 'var(--primary)' }} />
                    ) : (
                      <Icons.Monitor size={16} style={{ color: 'var(--primary)' }} />
                    )}
                    {cat.category_name}
                  </span>
                  <Icons.ChevronRight size={14} style={{ color: '#9CA3AF' }} />
                </div>
              ))}
              <div
                className="category-menu-item"
                onClick={() => onNavigate('products')}
                style={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 700 }}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Icons.Sparkles size={16} />
                  Xem tất cả Gaming Gear
                </span>
                <Icons.ChevronRight size={14} />
              </div>
            </div>
          </div>

          {/* Main Carousel Slider */}
          <div className="main-carousel">
            <div
              className="carousel-slide"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              <div className="carousel-content">
                <span className="carousel-tag">{slide.tag}</span>
                <h2 className="carousel-title">{slide.title}</h2>
                <p className="carousel-desc">{slide.desc}</p>
                <button
                  className="carousel-btn"
                  onClick={() => onNavigate(slide.link)}
                >
                  <span>{slide.btnText}</span>
                  <Icons.ChevronRight size={16} />
                </button>
              </div>
            </div>

            {/* Slider Dots */}
            <div className="carousel-indicators">
              {slides.map((s, idx) => (
                <div
                  key={s.id}
                  className={`carousel-dot ${idx === currentSlide ? 'active' : ''}`}
                  onClick={() => setCurrentSlide(idx)}
                  style={{ cursor: 'pointer' }}
                />
              ))}
            </div>
          </div>

          {/* Right Side Mini Banners */}
          <div className="hero-side-banners">
            <div
              className="side-banner"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=600&q=80')`,
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('product/logitech-g-pro-x-superlight-2')}
            >
              <div className="side-banner-content">
                <div className="side-banner-title">Logitech G Pro X Superlight 2</div>
                <div className="side-banner-subtitle">Switch Quang Học - Giảm 300K</div>
              </div>
            </div>

            <div
              className="side-banner"
              style={{
                backgroundImage: `url('https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80')`,
                cursor: 'pointer',
              }}
              onClick={() => onNavigate('product/razer-blackshark-v2-pro')}
            >
              <div className="side-banner-content">
                <div className="side-banner-title">Razer BlackShark V2 Pro</div>
                <div className="side-banner-subtitle">Mic Chuẩn eSports - Ưu đãi lớn</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
