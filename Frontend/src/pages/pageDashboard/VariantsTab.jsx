import React, { useState, useEffect, useCallback } from 'react';
import { productApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';

export default function VariantsTab({ products, formatPrice, isAdmin, Icons, onNavigate, targetProductId }) {
  const toast = useToast();
  const [selectedProductId, setSelectedProductId] = useState(targetProductId || '');
  const [productDetail, setProductDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form add variant
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newVariantName, setNewVariantName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newWarranty, setNewWarranty] = useState('24');
  const [submitting, setSubmitting] = useState(false);

  // Quick edit variant modal/state
  const [editingVariant, setEditingVariant] = useState(null);
  const [editPrice, setEditPrice] = useState('');
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [updating, setUpdating] = useState(false);

  // Auto select first product if available or update when targetProductId changes
  useEffect(() => {
    if (targetProductId) {
      setSelectedProductId(targetProductId);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0].product_id);
    }
  }, [products, selectedProductId, targetProductId]);

  const fetchVariants = useCallback(async (prodId) => {
    if (!prodId) return;
    setLoadingDetail(true);
    try {
      const res = await productApi.getProductById(prodId);
      if (res.success && res.data) {
        setProductDetail(res.data);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải biến thể sản phẩm');
    } finally {
      setLoadingDetail(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedProductId) {
      fetchVariants(selectedProductId);
    }
  }, [selectedProductId, fetchVariants]);

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    if (!newVariantName.trim() || !newPrice) {
      toast.warning('Vui lòng nhập tên biến thể và giá bán');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        sku: newSku.trim() || `VAR-${selectedProductId}-${Date.now().toString().slice(-4)}`,
        variant_name: newVariantName.trim(),
        price: parseFloat(newPrice),
        sale_price: newSalePrice ? parseFloat(newSalePrice) : null,
        stock: parseInt(newStock) || 0,
        warranty_months: parseInt(newWarranty) || 12,
      };

      const res = await productApi.addVariant(selectedProductId, payload);
      if (res.success) {
        toast.success(`Đã thêm biến thể "${newVariantName.trim()}"!`);
        setNewSku('');
        setNewVariantName('');
        setNewPrice('');
        setNewSalePrice('');
        setNewStock('10');
        setShowAddForm(false);
        fetchVariants(selectedProductId);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm biến thể');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (v) => {
    setEditingVariant(v);
    setEditPrice(v.price);
    setEditSalePrice(v.sale_price || '');
    setEditStock(v.stock);
  };

  const handleUpdateVariant = async (e) => {
    e.preventDefault();
    if (!editingVariant) return;

    setUpdating(true);
    try {
      const payload = {
        price: parseFloat(editPrice),
        sale_price: editSalePrice ? parseFloat(editSalePrice) : null,
        stock: parseInt(editStock),
      };

      const res = await productApi.updateVariant(editingVariant.variant_id, payload);
      if (res.success) {
        toast.success(`Đã cập nhật biến thể #${editingVariant.sku}`);
        setEditingVariant(null);
        fetchVariants(selectedProductId);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi cập nhật biến thể');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteVariant = async (variantId, name) => {
    if (productDetail?.variants?.length <= 1) {
      toast.warning('Sản phẩm phải có ít nhất 1 biến thể!');
      return;
    }
    if (!window.confirm(`Bạn có chắc muốn xóa biến thể "${name}"?`)) return;

    try {
      const res = await productApi.deleteVariant(variantId);
      if (res.success) {
        toast.success('Đã xóa biến thể thành công');
        fetchVariants(selectedProductId);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa biến thể');
    }
  };

  return (
    <div>
      {/* Product Selector Bar */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 8,
          padding: 16,
          border: '1px solid var(--border-light)',
          marginBottom: 20,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 260 }}>
          <Icons.Sliders size={20} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 800, fontSize: 14 }}>Chọn sản phẩm:</span>
          <select
            className="form-input"
            style={{ maxWidth: 400, fontWeight: 600 }}
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
          >
            {products.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.product_name} ({p.brand_name || 'GearK'})
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: showAddForm ? '#6B7280' : 'var(--primary)',
            color: '#FFFFFF',
            padding: '8px 16px',
            borderRadius: 6,
            fontWeight: 700,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          {showAddForm ? <Icons.X size={16} /> : <Icons.Plus size={16} />}
          {showAddForm ? 'Đóng form' : 'Thêm biến thể (Variant)'}
        </button>
      </div>

      {/* Add Variant Form */}
      {showAddForm && (
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: 20,
            border: '2px solid var(--primary)',
            marginBottom: 20,
          }}
        >
          <h4 style={{ fontSize: 15, fontWeight: 800, marginBottom: 14, color: 'var(--primary)' }}>
            + Thêm biến thể mới cho: {productDetail?.product_name}
          </h4>
          <form onSubmit={handleCreateVariant}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Tên biến thể *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="VD: Bản Không dây / Màu Trắng / Red Switch..."
                  value={newVariantName}
                  onChange={(e) => setNewVariantName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Mã SKU (Tùy chọn)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: RZ-VIPER-WHT"
                  value={newSku}
                  onChange={(e) => setNewSku(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Giá niêm yết (₫) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="1000"
                  className="form-input"
                  placeholder="VD: 1500000"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Giá khuyến mãi (₫)</label>
                <input
                  type="number"
                  min="0"
                  step="1000"
                  className="form-input"
                  placeholder="Để trống nếu không giảm"
                  value={newSalePrice}
                  onChange={(e) => setNewSalePrice(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Số lượng tồn kho</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Bảo hành (tháng)</label>
                <input
                  type="number"
                  min="0"
                  className="form-input"
                  value={newWarranty}
                  onChange={(e) => setNewWarranty(e.target.value)}
                />
              </div>
            </div>

            <div style={{ marginTop: 14, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #D1D5DB', fontWeight: 600 }}
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  backgroundColor: 'var(--primary)',
                  color: '#FFFFFF',
                  padding: '8px 20px',
                  borderRadius: 6,
                  fontWeight: 700,
                }}
              >
                {submitting ? 'Đang lưu...' : 'Lưu biến thể mới'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Product Summary Header */}
      {productDetail && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            padding: 16,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            border: '1px solid var(--border-light)',
            marginBottom: 16,
          }}
        >
          <img
            src={productDetail.thumbnail_url}
            alt=""
            style={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 6, border: '1px solid #E5E7EB' }}
          />
          <div>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#111827' }}>
              {productDetail.product_name}
            </div>
            <div style={{ fontSize: 12.5, color: '#6B7280', display: 'flex', gap: 14, marginTop: 4 }}>
              <span>Thương hiệu: <strong>{productDetail.brand_name || 'N/A'}</strong></span>
              <span>Danh mục: <strong>{productDetail.category_name || 'N/A'}</strong></span>
              <span>Số biến thể: <strong>{productDetail.variants?.length || 0}</strong></span>
            </div>
          </div>
        </div>
      )}

      {/* Variants Table */}
      <div className="data-table-card">
        {loadingDetail ? (
          <div style={{ textAlign: 'center', padding: '30px 0', color: '#6B7280' }}>
            Đang tải dữ liệu biến thể...
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Tên biến thể</th>
                <th>Giá niêm yết</th>
                <th>Giá khuyến mãi</th>
                <th>Tồn kho</th>
                <th>Bảo hành</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {(!productDetail?.variants || productDetail.variants.length === 0) ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#6B7280' }}>
                    Chưa có biến thể nào cho sản phẩm này
                  </td>
                </tr>
              ) : (
                productDetail.variants.map((v) => (
                  <tr key={v.variant_id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                      {v.sku}
                    </td>
                    <td style={{ fontWeight: 700 }}>
                      {v.variant_name}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {formatPrice(v.price)}
                    </td>
                    <td>
                      {v.sale_price ? (
                        <span style={{ fontWeight: 700, color: '#EF4444' }}>
                          {formatPrice(v.sale_price)}
                        </span>
                      ) : (
                        <span style={{ color: '#9CA3AF', fontSize: 12 }}>Không có</span>
                      )}
                    </td>
                    <td>
                      <span
                        style={{
                          fontWeight: 800,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          backgroundColor: v.stock <= 5 ? '#FEE2E2' : '#ECFDF5',
                          color: v.stock <= 5 ? '#EF4444' : '#059669',
                        }}
                      >
                        {v.stock} chiếc {v.stock <= 5 && '⚠️'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12.5 }}>
                      {v.warranty_months} tháng
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => handleOpenEdit(v)}
                          style={{
                            color: '#2563EB',
                            fontSize: 12,
                            fontWeight: 700,
                            padding: '4px 8px',
                            backgroundColor: '#EFF6FF',
                            borderRadius: 4,
                          }}
                        >
                          Sửa giá / kho
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteVariant(v.variant_id, v.variant_name)}
                            style={{ color: '#EF4444', padding: 4 }}
                            title="Xóa biến thể"
                          >
                            <Icons.Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick Edit Variant Modal */}
      {editingVariant && (
        <div className="modal-overlay" onClick={() => setEditingVariant(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: 420 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Cập nhật: {editingVariant.variant_name}</h3>
              <button onClick={() => setEditingVariant(null)}>
                <Icons.X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateVariant}>
                <div className="form-group">
                  <label className="form-label">SKU</label>
                  <input
                    type="text"
                    disabled
                    className="form-input"
                    value={editingVariant.sku}
                    style={{ backgroundColor: '#F3F4F6' }}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Giá niêm yết (₫) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    className="form-input"
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Giá khuyến mãi (₫)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    className="form-input"
                    placeholder="Để trống nếu không giảm"
                    value={editSalePrice}
                    onChange={(e) => setEditSalePrice(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Số lượng tồn kho *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    className="form-input"
                    value={editStock}
                    onChange={(e) => setEditStock(e.target.value)}
                  />
                </div>

                <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="button"
                    onClick={() => setEditingVariant(null)}
                    style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #D1D5DB' }}
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      padding: '8px 20px',
                      borderRadius: 6,
                      fontWeight: 700,
                    }}
                  >
                    {updating ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
