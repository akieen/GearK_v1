import React from 'react';

export default function AddProductModal({ showAddProductModal, setShowAddProductModal, handleCreateProduct, submittingProduct, newProdName, setNewProdName, newProdCatId, setNewProdCatId, categories, newProdBrandId, setNewProdBrandId, brands, newProdDesc, setNewProdDesc, newProdThumb, setNewProdThumb, newVariantName, setNewVariantName, newVariantSku, setNewVariantSku, newVariantPrice, setNewVariantPrice, newVariantSalePrice, setNewVariantSalePrice, newVariantStock, setNewVariantStock, Icons }) {
  return (
    <>
    {showAddProductModal && (
        <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 600, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Thêm sản phẩm Gaming Gear mới</h3>
              <button onClick={() => setShowAddProductModal(false)}>
                <Icons.X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleCreateProduct}>
                <div className="form-group">
                  <label className="form-label">Tên sản phẩm *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="VD: Chuột Razer DeathAdder V3 Pro"
                    value={newProdName}
                    onChange={(e) => setNewProdName(e.target.value)}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Danh mục *</label>
                    <select
                      className="form-input"
                      required
                      value={newProdCatId}
                      onChange={(e) => setNewProdCatId(e.target.value)}
                    >
                      <option value="">-- Chọn danh mục --</option>
                      {categories.map((c) => (
                        <option key={c.category_id} value={c.category_id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Thương hiệu *</label>
                    <select
                      className="form-input"
                      required
                      value={newProdBrandId}
                      onChange={(e) => setNewProdBrandId(e.target.value)}
                    >
                      <option value="">-- Chọn thương hiệu --</option>
                      {brands.map((b) => (
                        <option key={b.brand_id} value={b.brand_id}>
                          {b.brand_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Mô tả sản phẩm</label>
                  <textarea
                    rows={3}
                    className="form-input"
                    placeholder="Tính năng nổi bật, switch, cảm biến, tần số..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Link ảnh đại diện (Thumbnail URL)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://images.unsplash.com/..."
                    value={newProdThumb}
                    onChange={(e) => setNewProdThumb(e.target.value)}
                  />
                </div>

                <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 14, marginTop: 14 }}>
                  <h4 style={{ fontSize: 13.5, fontWeight: 800, marginBottom: 10, color: 'var(--primary)' }}>
                    Cấu hình phiên bản mặc định (Variant)
                  </h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <div className="form-group">
                      <label className="form-label">Tên phiên bản</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="VD: Màu Đen Nhám"
                        value={newVariantName}
                        onChange={(e) => setNewVariantName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Mã SKU</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="VD: RZR-DA3-BLK"
                        value={newVariantSku}
                        onChange={(e) => setNewVariantSku(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giá gốc (₫) *</label>
                      <input
                        type="number"
                        required
                        className="form-input"
                        placeholder="VD: 3990000"
                        value={newVariantPrice}
                        onChange={(e) => setNewVariantPrice(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Giá khuyến mãi (₫)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="VD: 3590000"
                        value={newVariantSalePrice}
                        onChange={(e) => setNewVariantSalePrice(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Số lượng tồn kho</label>
                      <input
                        type="number"
                        className="form-input"
                        value={newVariantStock}
                        onChange={(e) => setNewVariantStock(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
                  <button
                    type="submit"
                    disabled={submittingProduct}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      padding: '12px',
                      borderRadius: 6,
                      fontWeight: 800,
                      fontSize: 14,
                    }}
                  >
                    {submittingProduct ? 'Đang lưu...' : 'Lưu sản phẩm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddProductModal(false)}
                    style={{
                      padding: '12px 20px',
                      borderRadius: 6,
                      border: '1px solid var(--border-light)',
                      fontWeight: 700,
                    }}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      </>
  );
}
