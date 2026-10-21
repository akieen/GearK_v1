import React, { useState } from 'react';
import { categoryApi } from '../../api/categoryApi';
import { useToast } from '../../context/ToastContext';

export default function CategoriesTab({ categories, fetchCategories, isAdmin, Icons }) {
  const toast = useToast();
  const [newCatName, setNewCatName] = useState('');
  const [newParentId, setNewParentId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) {
      toast.warning('Vui lòng nhập tên danh mục');
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        category_name: newCatName.trim(),
        parent_id: newParentId ? parseInt(newParentId) : null,
      };
      const res = await categoryApi.createCategory(payload);
      if (res.success) {
        toast.success(`Đã thêm danh mục "${newCatName.trim()}"!`);
        setNewCatName('');
        setNewParentId('');
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm danh mục');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${name}"?`)) return;
    try {
      const res = await categoryApi.deleteCategory(id);
      if (res.success) {
        toast.success(`Đã xóa danh mục "${name}"`);
        fetchCategories();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa danh mục');
    }
  };

  return (
    <div>
      {/* Create Category Card */}
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
          <Icons.Folder size={18} style={{ color: 'var(--primary)' }} />
          Thêm danh mục sản phẩm mới
        </h3>
        <form onSubmit={handleCreate} style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="form-label">Tên danh mục *</label>
            <input
              type="text"
              required
              className="form-input"
              placeholder="VD: Màn hình Gaming, Ghế công thái học..."
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
            />
          </div>

          <div style={{ width: 220 }}>
            <label className="form-label">Danh mục cha (Tùy chọn)</label>
            <select
              className="form-input"
              value={newParentId}
              onChange={(e) => setNewParentId(e.target.value)}
            >
              <option value="">-- Là danh mục gốc --</option>
              {categories
                .filter((c) => !c.parent_id)
                .map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
            </select>
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
            {submitting ? 'Đang tạo...' : 'Thêm danh mục'}
          </button>
        </form>
      </div>

      {/* Categories Table */}
      <div className="data-table-card">
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>
            Danh sách danh mục ({categories.length})
          </div>
          <button
            onClick={fetchCategories}
            style={{ fontSize: 12.5, color: 'var(--primary)', fontWeight: 700 }}
          >
            Làm mới
          </button>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên danh mục</th>
              <th>Slug / Đường dẫn</th>
              <th>Danh mục cha</th>
              <th>Số sản phẩm</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: 24, color: '#6B7280' }}>
                  Chưa có danh mục nào
                </td>
              </tr>
            ) : (
              categories.map((cat) => {
                const parent = categories.find((c) => c.category_id === cat.parent_id);
                return (
                  <tr key={cat.category_id}>
                    <td style={{ fontWeight: 700, color: '#6B7280' }}>#{cat.category_id}</td>
                    <td style={{ fontWeight: 800, color: '#111827' }}>
                      {cat.category_name}
                    </td>
                    <td style={{ fontSize: 12, color: '#6B7280', fontFamily: 'monospace' }}>
                      /{cat.slug}
                    </td>
                    <td>
                      {parent ? (
                        <span style={{ fontSize: 12, backgroundColor: '#F3F4F6', padding: '2px 8px', borderRadius: 4, fontWeight: 600 }}>
                          {parent.category_name}
                        </span>
                      ) : (
                        <span style={{ fontSize: 12, color: '#9CA3AF' }}>Gốc</span>
                      )}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {cat.product_count ?? 0}
                    </td>
                    <td>
                      {isAdmin && (
                        <button
                          onClick={() => handleDelete(cat.category_id, cat.category_name)}
                          style={{ color: '#EF4444', padding: 4 }}
                          title="Xóa danh mục"
                        >
                          <Icons.Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
