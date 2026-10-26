import React, { useState, useEffect } from 'react';
import ImageUploadField from '../../components/common/ImageUploadField';
import { generateSku } from '../../utils/formatters';

export default function AddProductModal({
  showAddProductModal,
  setShowAddProductModal,
  handleCreateProduct,
  submittingProduct,
  newProdName,
  setNewProdName,
  newProdCatId,
  setNewProdCatId,
  categories,
  newProdBrandId,
  setNewProdBrandId,
  brands,
  newProdDesc,
  setNewProdDesc,
  newProdThumb,
  setNewProdThumb,
  newProdImages = [],
  setNewProdImages = () => {},
  newVariantName,
  setNewVariantName,
  newVariantSku,
  setNewVariantSku,
  newVariantPrice,
  setNewVariantPrice,
  newVariantSalePrice,
  setNewVariantSalePrice,
  newVariantStock,
  setNewVariantStock,
  newVariantImages = [],
  setNewVariantImages = () => {},
  Icons,
}) {
  const [skuTouched, setSkuTouched] = useState(false);

  // Auto-generate SKU when product name or variant name changes, if user hasn't typed custom SKU
  useEffect(() => {
    if (!skuTouched && (newProdName || newVariantName)) {
      setNewVariantSku(generateSku(newProdName, newVariantName));
    }
  }, [newProdName, newVariantName, skuTouched, setNewVariantSku]);

  const handleRegenerateSku = () => {
    const generated = generateSku(newProdName, newVariantName);
    setNewVariantSku(generated);
    setSkuTouched(false);
  };

  if (!showAddProductModal) return null;

  return (
    <div className="modal-overlay" onClick={() => setShowAddProductModal(false)}>
      <div
        className="modal-card"
        style={{ maxWidth: 680, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                backgroundColor: 'rgba(227, 0, 25, 0.1)',
                color: 'var(--primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.Plus size={20} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0, fontSize: 16 }}>
                Thêm sản phẩm Gaming Gear mới
              </h3>
              <span style={{ fontSize: 12, color: '#6B7280' }}>
                Hỗ trợ tải lên ảnh tệp qua thư viện Multer & danh sách ảnh theo biến thể
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowAddProductModal(false)}
            style={{ color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleCreateProduct}>
            {/* Tên sản phẩm */}
            <div className="form-group">
              <label className="form-label">Tên sản phẩm *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="VD: Chuột Razer DeathAdder V3 Pro Wireless"
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

            {/* Mô tả */}
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

            {/* Ảnh đại diện (Multer Upload) */}
            <ImageUploadField
              label="Ảnh đại diện chính (Thumbnail - Multer File Upload)"
              value={newProdThumb}
              onChange={setNewProdThumb}
              multiple={false}
              hint="Chọn tệp ảnh từ máy tính (Multer sẽ lưu vào thư mục /uploads)"
            />

            {/* Danh sách ảnh thư viện sản phẩm (Product Gallery Images) */}
            <ImageUploadField
              label="Danh sách ảnh bổ sung sản phẩm (Gallery Images)"
              value={newProdImages}
              onChange={setNewProdImages}
              multiple={true}
              hint="Tải lên nhiều góc chụp của sản phẩm bằng Multer"
            />

            {/* Phiên bản mặc định (Variant) */}
            <div
              style={{
                borderTop: '1px solid var(--border-light)',
                paddingTop: 16,
                marginTop: 16,
                backgroundColor: '#FAFAFA',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #E5E7EB',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                <Icons.Layers size={18} style={{ color: 'var(--primary)' }} />
                <h4 style={{ fontSize: 14, fontWeight: 800, margin: 0, color: '#111827' }}>
                  Cấu hình phiên bản mặc định & Danh sách ảnh biến thể
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="form-group">
                  <label className="form-label">Tên phiên bản</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: Màu Đen Nhám / Red Switch"
                    value={newVariantName}
                    onChange={(e) => setNewVariantName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="form-label" style={{ margin: 0 }}>
                      Mã SKU <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>(Tự sinh)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleRegenerateSku}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#6366F1',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 3,
                        padding: '2px 4px',
                      }}
                      title="Tạo mã SKU ngẫu nhiên theo tên sản phẩm"
                    >
                      <Icons.Sparkles size={13} />
                      Tự sinh mã
                    </button>
                  </div>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="VD: RZ-VIPER-TRANG-8K2A"
                    value={newVariantSku}
                    onChange={(e) => {
                      setSkuTouched(true);
                      setNewVariantSku(e.target.value.toUpperCase());
                    }}
                    style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.5px' }}
                  />
                  <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'block', marginTop: 3 }}>
                    *Tự động sinh theo tên SP. Có thể sửa tay hoặc bấm "Tự sinh mã".
                  </span>
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
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Số lượng tồn kho</label>
                  <input
                    type="number"
                    className="form-input"
                    value={newVariantStock}
                    onChange={(e) => setNewVariantStock(e.target.value)}
                  />
                </div>
              </div>

              {/* Danh sách ảnh riêng cho biến thể này (Multer) */}
              <div style={{ marginTop: 12 }}>
                <ImageUploadField
                  label="Danh sách ảnh cho biến thể này (Variant Images)"
                  value={newVariantImages}
                  onChange={setNewVariantImages}
                  multiple={true}
                  hint="Tải lên danh sách ảnh riêng của màu sắc/phiên bản này (Multer File Upload)"
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
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
                  cursor: submittingProduct ? 'not-allowed' : 'pointer',
                  opacity: submittingProduct ? 0.7 : 1,
                }}
              >
                {submittingProduct ? 'Đang lưu sản phẩm...' : 'Lưu sản phẩm'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddProductModal(false)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 6,
                  border: '1px solid var(--border-light)',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
