import React, { useState, useMemo } from 'react';

export default function ProductsTab({
  products,
  setShowAddProductModal,
  onNavigate,
  formatPrice,
  isAdmin,
  handleDeleteProduct,
  onEditProduct,
  onManageVariants,
  Icons,
}) {
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const statusCounts = useMemo(() => {
    const counts = { all: products.length, active: 0, inactive: 0, archived: 0 };
    products.forEach((p) => {
      if (counts[p.status] !== undefined) {
        counts[p.status] += 1;
      }
    });
    return counts;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter;
      const term = searchTerm.trim().toLowerCase();
      const matchSearch =
        !term ||
        p.product_name.toLowerCase().includes(term) ||
        (p.brand_name && p.brand_name.toLowerCase().includes(term)) ||
        (p.category_name && p.category_name.toLowerCase().includes(term));
      return matchStatus && matchSearch;
    });
  }, [products, statusFilter, searchTerm]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Đang kinh doanh', bg: '#ECFDF5', color: '#059669', border: '#A7F3D0' };
      case 'inactive':
        return { label: 'Tạm ngưng bán', bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' };
      case 'archived':
        return { label: 'Lưu trữ / Đã dừng', bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
      default:
        return { label: status || 'Không rõ', bg: '#F3F4F6', color: '#6B7280', border: '#E5E7EB' };
    }
  };

  return (
    <div>
      {/* Top Header & Action */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>
            Quản lý sản phẩm ({products.length})
          </div>
          <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 2 }}>
            Bao gồm cả sản phẩm đang bán, tạm ngưng và lưu trữ
          </div>
        </div>

        <button
          onClick={() => setShowAddProductModal(true)}
          style={{
            backgroundColor: 'var(--primary)',
            color: '#FFFFFF',
            padding: '9px 18px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            border: 'none',
          }}
        >
          <Icons.Plus size={16} />
          Thêm sản phẩm mới
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          backgroundColor: '#FFFFFF',
          padding: '12px 16px',
          borderRadius: 8,
          border: '1px solid var(--border-light)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: '#374151' }}>
            Lọc trạng thái:
          </span>
          <select
            className="sort-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid var(--border-light)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả ({statusCounts.all})</option>
            <option value="active">Đang kinh doanh ({statusCounts.active})</option>
            <option value="inactive">Tạm ngưng bán ({statusCounts.inactive})</option>
            <option value="archived">Lưu trữ ({statusCounts.archived})</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 260 }}>
          <input
            type="text"
            className="form-input"
            placeholder="Tìm theo tên, hãng, danh mục..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '6px 12px', fontSize: 13, width: '100%' }}
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="data-table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Thương hiệu</th>
              <th>Giá bán</th>
              <th>Tồn kho</th>
              <th>Trạng thái</th>
              <th style={{ textAlign: 'center' }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ textAlign: 'center', padding: '36px 16px', color: '#6B7280' }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Không tìm thấy sản phẩm nào phù hợp</div>
                  <div style={{ fontSize: 12, color: '#9CA3AF', marginTop: 4 }}>
                    Hãy thử đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map((prod) => {
                const badge = getStatusBadge(prod.status);
                return (
                  <tr key={prod.product_id}>
                    <td>
                      <img
                        src={prod.thumbnail_url}
                        alt=""
                        style={{
                          width: 44,
                          height: 44,
                          objectFit: 'contain',
                          borderRadius: 4,
                          border: '1px solid #E5E7EB',
                          backgroundColor: '#F9FAFB',
                        }}
                      />
                    </td>
                    <td style={{ fontWeight: 700, maxWidth: 220 }}>
                      <span
                        style={{ cursor: 'pointer', color: '#111827' }}
                        onClick={() => onNavigate(`product/${prod.slug}`)}
                      >
                        {prod.product_name}
                      </span>
                    </td>
                    <td>{prod.category_name}</td>
                    <td>{prod.brand_name}</td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>
                      {formatPrice(prod.min_sale_price || prod.min_price)}
                    </td>
                    <td style={{ fontWeight: 700, color: prod.total_stock < 10 ? '#EF4444' : '#10B981' }}>
                      {prod.total_stock}
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 11.5,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 12,
                          backgroundColor: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          display: 'inline-block',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {badge.label}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <button
                          type="button"
                          onClick={() => onEditProduct && onEditProduct(prod)}
                          style={{
                            color: '#2563EB',
                            backgroundColor: '#EFF6FF',
                            border: '1px solid #BFDBFE',
                            padding: '5px 10px',
                            borderRadius: 5,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                          }}
                          title="Sửa thông tin sản phẩm"
                        >
                          <Icons.Edit size={14} />
                          Sửa
                        </button>
                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(prod.product_id)}
                            style={{
                              color: '#EF4444',
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              padding: '5px 8px',
                              borderRadius: 5,
                              display: 'inline-flex',
                              alignItems: 'center',
                              fontSize: 12,
                              cursor: 'pointer',
                            }}
                            title="Xóa sản phẩm"
                          >
                            <Icons.Trash2 size={14} />
                          </button>
                        )}
                      </div>
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
