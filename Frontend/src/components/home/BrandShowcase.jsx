import React from 'react';

export const BrandShowcase = ({ brands = [], onNavigate }) => {
  return (
    <section className="container section-wrapper">
      <div className="section-header">
        <h3 className="section-title">THƯƠNG HIỆU GAMING NỔI TIẾNG</h3>
        <span style={{ fontSize: 13, color: '#6B7280' }}>Phân phối chính hãng 100%</span>
      </div>

      <div className="brand-grid">
        {brands.map((brand) => (
          <div
            key={brand.brand_id}
            className="brand-card"
            onClick={() => onNavigate(`products?brand=${brand.slug}`)}
            style={{ cursor: 'pointer' }}
          >
            <img
              src={brand.logo_url || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=300&q=80'}
              alt={brand.brand_name}
            />
            <span className="brand-card-name">{brand.brand_name}</span>
          </div>
        ))}
      </div>
    </section>
  );
};
