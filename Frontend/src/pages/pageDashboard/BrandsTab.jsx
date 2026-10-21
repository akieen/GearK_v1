import { useState } from 'react';
import { brandApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';

export default function BrandsTab({ brands, fetchBrands, isAdmin, Icons }) {
  const toast = useToast();
  const [newBrandName, setNewBrandName] = useState('');
  const [newLogoUrl, setNewLogoUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newBrandName.trim()) {
      toast.warning('Vui lòng nhập tên thương hiệu');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        brand_name: newBrandName.trim(),
        logo_url: newLogoUrl.trim() || null,
      };
      const res = await brandApi.createBrand(payload);
      if (res.success) {
        toast.success(`Đã thêm thương hiệu "${newBrandName.trim()}"!`);
        setNewBrandName('');
        setNewLogoUrl('');
        fetchBrands();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm thương hiệu');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa thương hiệu "${name}"?`)) return;
    try {
      const res = await brandApi.deleteBrand(id);
      if (res.success) {
        toast.success(`Đã xóa thương hiệu "${name}"`);
        fetchBrands();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa thương hiệu');
    }
  };

  return (
    <div>
      {/* Create Brand Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          padding: 20,
          border: '1px solid var(--border-light)',
          marginBottom: 20,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Icons.Tag size={18} style={{ color: 'var(--primary)' }} />
          Thêm thương hiệu mới (Brands)
        </h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Tên thương hiệu *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="VD: Logitech G, Razer, Corsair, Asus ROG..."
              value={newBrandName}
              onChange={(e) => setNewBrandName(e.target.value)}
            />
          </div>

          <div style={{ flex: 1, minWidth: 240 }}>
            <label className="form-label">Logo URL (Tùy chọn)</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://..."
              value={newLogoUrl}
              onChange={(e) => setNewLogoUrl(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFFFFF',
              padding: '10px 20px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <Icons.Plus size={16} />
            {submitting ? 'Đang tạo...' : 'Thêm thương hiệu'}
          </button>
        </form>
      </div>

      {/* Brands Table */}
      <div className="data-table-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            Danh sách thương hiệu ({brands.length})
          </div>
          <button
            onClick={fetchBrands}
            style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 700 }}
          >
            Làm mới
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Logo</th>
              <th>Tên thương hiệu</th>
              <th>Số sản phẩm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {brands.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#6B7280' }}>
                  Chưa có thương hiệu nào
                </td>
              </tr>
            ) : (
              brands.map((b) => (
                <tr key={b.brand_id}>
                  <td style={{ fontWeight: 700, color: '#6B7280' }}>#{b.brand_id}</td>
                  <td>
                    {b.logo_url ? (
                      <img
                        src={b.logo_url}
                        alt={b.brand_name}
                        style={{ height: 28, maxWidth: 60, objectFit: 'contain' }}
                      />
                    ) : (
                      <span style={{ fontSize: 11, color: '#9CA3AF' }}>Không có</span>
                    )}
                  </td>
                  <td style={{ fontWeight: 800, color: '#111827' }}>
                    {b.brand_name}
                  </td>
                  <td style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>
                    {b.slug}
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {b.product_count ?? 0}
                  </td>
                  <td>
                    {isAdmin && (
                      <button
                        onClick={() => handleDelete(b.brand_id, b.brand_name)}
                        style={{ color: '#EF4444', padding: 4 }}
                        title="Xóa thương hiệu"
                      >
                        <Icons.Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
