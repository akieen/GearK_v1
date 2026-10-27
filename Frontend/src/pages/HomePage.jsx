import React, { useState, useEffect } from 'react';
import { HeroBanner } from '../components/home/HeroBanner';
import { TrustFeatures, FlashSaleSection } from '../components/home/HomeSections';
import { BrandShowcase } from '../components/home/BrandShowcase';
import ProductCard from '../components/common/ProductCard';
import Icons from '../components/common/Icons';

export const HomePage = ({
  products = [],
  categories = [],
  brands = [],
  onNavigate,
}) => {
  const [selectedCatTab, setSelectedCatTab] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const filteredProducts =
    selectedCatTab === 'all'
      ? products
      : products.filter((p) => p.category_slug === selectedCatTab);

  return (
    <div style={{ paddingBottom: 40 }}>
      {/* Hero Section */}
      <HeroBanner onNavigate={onNavigate} categories={categories} />

      {/* Trust & Guarantee Bar */}
      <TrustFeatures />

      {/* Flash Sale Deal Sốc */}
      <FlashSaleSection products={products} onNavigate={onNavigate} />

      {/* Gaming Gear by Category Showcase */}
      <section className="container section-wrapper">
        <div className="section-header">
          <h3 className="section-title">GAMING GEAR NỔI BẬT</h3>
          <div className="section-tabs">
            <button
              className={`tab-btn ${selectedCatTab === 'all' ? 'active' : ''}`}
              onClick={() => setSelectedCatTab('all')}
            >
              Tất cả
            </button>
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                className={`tab-btn ${selectedCatTab === cat.slug ? 'active' : ''}`}
                onClick={() => setSelectedCatTab(cat.slug)}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
          <button
            className="view-all-link"
            onClick={() => onNavigate('products')}
          >
            <span>Xem tất cả</span>
            <Icons.ChevronRight size={14} />
          </button>
        </div>

        <div className="products-grid">
          {filteredProducts.map((prod) => (
            <ProductCard key={prod.product_id} product={prod} onNavigate={onNavigate} />
          ))}
        </div>
      </section>

      {/* Mid Promotional Graphic Banner */}
      <div className="container" style={{ marginBottom: 36 }}>
        <div
          style={{
            background: 'linear-gradient(135deg, #7F1D1D 0%, #18181B 100%)',
            borderRadius: 16,
            padding: '36px 48px',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 20,
            border: '1px solid #991B1B',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div>
            <span
              style={{
                backgroundColor: 'var(--primary)',
                color: '#fff',
                fontSize: 11,
                fontWeight: 800,
                padding: '4px 8px',
                borderRadius: 4,
                textTransform: 'uppercase',
              }}
            >
              GEARK WORKSHOP & MODDING
            </span>
            <h2 style={{ fontSize: 24, fontWeight: 900, marginTop: 8, marginBottom: 6 }}>
              Dịch Vụ Lube Switch, Cân Wire & Mod Phím Cơ Chuyên Nghiệp
            </h2>
            <p style={{ color: '#E5E7EB', fontSize: 13.5, maxWidth: 540 }}>
              Nâng tầm trải nghiệm gõ phím với dàn kỹ thuật viên nhiều năm kinh nghiệm tại các showroom GearK. Lấy ngay trong ngày.
            </p>
          </div>
          <button
            onClick={() => onNavigate('products?category=ban-phim-co')}
            style={{
              backgroundColor: '#FFFFFF',
              color: 'var(--primary)',
              fontWeight: 800,
              fontSize: 14,
              padding: '12px 24px',
              borderRadius: 8,
              boxShadow: '0 4px 14px rgba(0,0,0,0.2)',
            }}
          >
            Khám phá dịch vụ & Gear
          </button>
        </div>
      </div>

      {/* Brand Partners Showcase */}
      <BrandShowcase brands={brands} onNavigate={onNavigate} />
    </div>
  );
};
