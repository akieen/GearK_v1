import React, { useState, useEffect } from 'react';
import ImageUploadField from '../../components/common/ImageUploadField';

export default function EditProductModal({
  editingProduct,
  setEditingProduct,
  categories,
  brands,
  handleUpdateProduct,
  onManageVariants,
  Icons,
}) {
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [description, setDescription] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [status, setStatus] = useState('active');
  const [submitting, setSubmitting] = useState(false);

  // Sync form state when editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.product_name || '');
      setCategoryId(editingProduct.category_id ? String(editingProduct.category_id) : '');
      setBrandId(editingProduct.brand_id ? String(editingProduct.brand_id) : '');
      setDescription(editingProduct.description || '');
      setThumbnailUrl(editingProduct.thumbnail_url || '');
      setStatus(editingProduct.status || 'active');
    }
  }, [editingProduct]);

  if (!editingProduct) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const payload = {
        product_name: name.trim(),
        category_id: categoryId ? parseInt(categoryId) : null,
        brand_id: brandId ? parseInt(brandId) : null,
        description: description.trim(),
        thumbnail_url: thumbnailUrl.trim(),
        status,
      };

      await handleUpdateProduct(editingProduct.product_id, payload);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
      <div
        className="modal-card"
        style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 8,
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563EB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.Edit size={18} />
            </div>
            <div>
              <h3 className="modal-title" style={{ margin: 0, fontSize: 16 }}>
                Chỉnh sửa thông tin sản phẩm
              </h3>
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                ID: #{editingProduct.product_id} • {editingProduct.product_name}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setEditingProduct(null)}
            style={{ color: 'var(--text-muted)', cursor: 'pointer', background: 'none', border: 'none' }}
          >
            <Icons.X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <form onSubmit={handleSubmit}>
            {/* Tên sản phẩm */}
            <div className="form-group">
              <label className="form-label">Tên sản phẩm *</label>
              <input
                type="text"
                required
                className="form-input"
                placeholder="VD: Chuột Razer DeathAdder V3 Pro"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            {/* Danh mục & Thương hiệu */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Danh mục *</label>
                <select
                  className="form-input"
                  required
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
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
                  value={brandId}
                  onChange={(e) => setBrandId(e.target.value)}
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

            {/* Trạng thái sản phẩm */}
            <div className="form-group">
              <label className="form-label">Trạng thái kinh doanh</label>
              <select
                className="form-input"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="active">Đang kinh doanh (Hiển thị cho khách)</option>
                <option value="inactive">Tạm ngưng bán (Ẩn khỏi trang chủ)</option>
                <option value="archived">Lưu trữ / Đã ngừng kinh doanh</option>
              </select>
            </div>

            {/* Link ảnh đại diện & Multer Upload */}
            <ImageUploadField
              label="Ảnh đại diện (Thumbnail - Multer File Upload)"
              value={thumbnailUrl}
              onChange={setThumbnailUrl}
              multiple={false}
              hint="Chọn ảnh từ máy tính (Multer) hoặc nhập URL"
            />

            {/* Mô tả sản phẩm */}
            <div className="form-group">
              <label className="form-label">Mô tả sản phẩm</label>
              <textarea
                rows={4}
                className="form-input"
                placeholder="Tính năng nổi bật, thông số kỹ thuật, bảo hành..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Quản lý giá & biến thể banner */}
            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: 8,
                padding: '12px 14px',
                marginTop: 10,
                marginBottom: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  Giá bán & Kho hàng (Biến thể)
                </div>
                <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>
                  Giá bán và tồn kho được quản lý chi tiết trong tab "Biến thể sản phẩm".
                </div>
              </div>
              {onManageVariants && (
                <button
                  type="button"
                  onClick={() => {
                    const id = editingProduct.product_id;
                    setEditingProduct(null);
                    onManageVariants(id);
                  }}
                  style={{
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    borderRadius: 6,
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Sửa giá & kho →
                </button>
              )}
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  flex: 1,
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '12px',
                  borderRadius: 6,
                  fontWeight: 800,
                  fontSize: 14,
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  opacity: submitting ? 0.7 : 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                {submitting ? 'Đang lưu thay đổi...' : 'Lưu thay đổi'}
              </button>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                style={{
                  padding: '12px 20px',
                  borderRadius: 6,
                  border: '1px solid var(--border-light)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  backgroundColor: '#FFFFFF',
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
