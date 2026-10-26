import React, { useState, useEffect, useCallback, useRef } from 'react';
import { productApi, uploadApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from '../../components/common/ImageUploadField';
import { generateSku } from '../../utils/formatters';

export default function VariantsTab({ products, formatPrice, isAdmin, Icons, onNavigate, targetProductId }) {
  const toast = useToast();
  const [selectedProductId, setSelectedProductId] = useState(targetProductId || '');
  const [productDetail, setProductDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Form add variant
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [skuManuallyEdited, setSkuManuallyEdited] = useState(false);
  const [newVariantName, setNewVariantName] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newSalePrice, setNewSalePrice] = useState('');
  const [newStock, setNewStock] = useState('10');
  const [newWarranty, setNewWarranty] = useState('24');
  const [newSpecsList, setNewSpecsList] = useState([
    { key: 'Màu sắc', value: '' },
    { key: 'Bảo hành', value: '24 tháng' },
  ]);
  const [newVariantImages, setNewVariantImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Auto-generate SKU when variant name changes or form opens
  useEffect(() => {
    if (!skuManuallyEdited && showAddForm) {
      const prodName = productDetail?.product_name || (Array.isArray(products) && products.find(p => p.product_id === parseInt(selectedProductId, 10))?.product_name) || '';
      if (prodName || newVariantName) {
        setNewSku(generateSku(prodName, newVariantName));
      }
    }
  }, [newVariantName, showAddForm, skuManuallyEdited, productDetail, selectedProductId, products]);

  const handleRegenerateSku = () => {
    const prodName = productDetail?.product_name || (Array.isArray(products) && products.find(p => p.product_id === parseInt(selectedProductId, 10))?.product_name) || '';
    setNewSku(generateSku(prodName, newVariantName));
    setSkuManuallyEdited(false);
  };

  // Managing Variant Images Modal
  const [managingVariantImages, setManagingVariantImages] = useState(null);
  const [uploadingVariantImg, setUploadingVariantImg] = useState(false);
  const variantFileInputRef = useRef(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showAddUrlInput, setShowAddUrlInput] = useState(false);

  // Quick edit variant modal/state
  const [editingVariant, setEditingVariant] = useState(null);
  const [editVariantName, setEditVariantName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editWarranty, setEditWarranty] = useState('12');
  const [editSpecsList, setEditSpecsList] = useState([]);
  const [updating, setUpdating] = useState(false);

  // Quick Presets for specifications
  const presets = {
    mouse: [
      { key: 'Màu sắc', value: 'Đen' },
      { key: 'Cảm biến', value: 'Quang học Focus Pro 35K' },
      { key: 'DPI tối đa', value: '35.000 DPI' },
      { key: 'Kết nối', value: 'Không dây 2.4GHz / Type-C' },
      { key: 'Trọng lượng', value: '54g' },
      { key: 'Thời lượng pin', value: '95 giờ' },
    ],
    keyboard: [
      { key: 'Màu sắc', value: 'Đen' },
      { key: 'Loại Switch', value: 'ROG RX Red Linear' },
      { key: 'Layout', value: 'TKL 87 phím' },
      { key: 'Kết nối', value: 'Có dây Type-C tháo rời' },
      { key: 'Đèn LED', value: 'RGB Aura Sync 16.8 triệu màu' },
      { key: 'Keycap', value: 'PBT Doubleshot' },
    ],
    headphone: [
      { key: 'Màu sắc', value: 'Đen' },
      { key: 'Kiểu kết nối', value: 'Wireless 2.4GHz / Bluetooth 5.3' },
      { key: 'Đường kính Driver', value: '50mm Neodymium' },
      { key: 'Microphone', value: 'Tháo rời, chống ồn đa hướng' },
      { key: 'Thời lượng pin', value: '50 giờ' },
    ],
    monitor: [
      { key: 'Kích thước', value: '27 inch' },
      { key: 'Độ phân giải', value: '2K QHD (2560 x 1440)' },
      { key: 'Tần số quét', value: '180Hz' },
      { key: 'Tấm nền', value: 'Fast IPS' },
      { key: 'Thời gian phản hồi', value: '1ms GTG' },
      { key: 'Cổng kết nối', value: '2x HDMI 2.0, 1x DisplayPort 1.4' },
    ],
  };

  const addSpecRow = (setter) => {
    setter((prev) => [...prev, { key: '', value: '' }]);
  };

  const removeSpecRow = (setter, idx) => {
    setter((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateSpecRow = (setter, idx, field, val) => {
    setter((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item))
    );
  };

  const applyPreset = (setter, type) => {
    if (presets[type]) {
      setter(presets[type].map((item) => ({ ...item })));
    }
  };

  const parseSpecsToObj = (list) => {
    const obj = {};
    list.forEach((item) => {
      if (item.key && item.key.trim()) {
        obj[item.key.trim()] = item.value ? item.value.trim() : '';
      }
    });
    return Object.keys(obj).length > 0 ? obj : null;
  };

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
      const prodName = productDetail?.product_name || (Array.isArray(products) && products.find(p => p.product_id === parseInt(selectedProductId, 10))?.product_name) || '';
      const finalSku = (newSku.trim() || generateSku(prodName, newVariantName)).toUpperCase();

      const payload = {
        sku: finalSku,
        variant_name: newVariantName.trim(),
        price: parseFloat(newPrice),
        sale_price: newSalePrice ? parseFloat(newSalePrice) : null,
        stock: parseInt(newStock) || 0,
        warranty_months: parseInt(newWarranty) || 12,
        specifications: parseSpecsToObj(newSpecsList),
        images: newVariantImages,
      };

      const res = await productApi.addVariant(selectedProductId, payload);
      if (res.success) {
        toast.success(`Đã thêm biến thể "${newVariantName.trim()}" kèm danh sách ảnh!`);
        setNewSku('');
        setSkuManuallyEdited(false);
        setNewVariantName('');
        setNewPrice('');
        setNewSalePrice('');
        setNewStock('10');
        setNewSpecsList([
          { key: 'Màu sắc', value: '' },
          { key: 'Bảo hành', value: '24 tháng' },
        ]);
        setNewVariantImages([]);
        setShowAddForm(false);
        fetchVariants(selectedProductId);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm biến thể');
    } finally {
      setSubmitting(false);
    }
  };

  // Variant Image Management Actions
  const handleAddImagesToVariant = async (files) => {
    if (!managingVariantImages || !files || files.length === 0) return;
    setUploadingVariantImg(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await productApi.addVariantImage(managingVariantImages.variant_id, files[i]);
      }
      toast.success(`Đã thêm ${files.length} ảnh cho biến thể thành công!`);
      await fetchVariants(selectedProductId);
      const res = await productApi.getProductById(selectedProductId);
      if (res.success && res.data) {
        const updated = res.data.variants?.find((v) => v.variant_id === managingVariantImages.variant_id);
        if (updated) setManagingVariantImages(updated);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tải ảnh biến thể lên bằng Multer');
    } finally {
      setUploadingVariantImg(false);
      if (variantFileInputRef.current) variantFileInputRef.current.value = '';
    }
  };

  const handleAddImageUrlToVariant = async (e) => {
    e.preventDefault();
    if (!managingVariantImages || !customImageUrl.trim()) return;
    setUploadingVariantImg(true);
    try {
      await productApi.addVariantImage(managingVariantImages.variant_id, { image_url: customImageUrl.trim() });
      toast.success('Đã thêm ảnh cho biến thể thành công!');
      setCustomImageUrl('');
      setShowAddUrlInput(false);
      await fetchVariants(selectedProductId);
      const res = await productApi.getProductById(selectedProductId);
      if (res.success && res.data) {
        const updated = res.data.variants?.find((v) => v.variant_id === managingVariantImages.variant_id);
        if (updated) setManagingVariantImages(updated);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm ảnh biến thể');
    } finally {
      setUploadingVariantImg(false);
    }
  };

  const handleSetPrimaryVariantImage = async (imageId) => {
    try {
      const res = await productApi.setPrimaryVariantImage(imageId);
      if (res.success) {
        toast.success('Đã đặt làm ảnh chính của biến thể!');
        await fetchVariants(selectedProductId);
        if (managingVariantImages) {
          const vRes = await productApi.getProductById(selectedProductId);
          if (vRes.success && vRes.data) {
            const updated = vRes.data.variants?.find((v) => v.variant_id === managingVariantImages.variant_id);
            if (updated) setManagingVariantImages(updated);
          }
        }
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi đặt ảnh chính');
    }
  };

  const handleDeleteVariantImage = async (imageId) => {
    if (!window.confirm('Bạn có chắc muốn xóa ảnh này khỏi danh sách ảnh biến thể?')) return;
    try {
      const res = await productApi.deleteVariantImage(imageId);
      if (res.success) {
        toast.success('Đã xóa ảnh biến thể thành công!');
        await fetchVariants(selectedProductId);
        if (managingVariantImages) {
          const vRes = await productApi.getProductById(selectedProductId);
          if (vRes.success && vRes.data) {
            const updated = vRes.data.variants?.find((v) => v.variant_id === managingVariantImages.variant_id);
            if (updated) setManagingVariantImages(updated);
          }
        }
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xóa ảnh biến thể');
    }
  };

  const handleOpenEdit = (v) => {
    setEditingVariant(v);
    setEditVariantName(v.variant_name);
    setEditPrice(v.price);
    setEditSalePrice(v.sale_price || '');
    setEditStock(v.stock);
    setEditWarranty(v.warranty_months || 12);

    let parsed = v.specifications;
    if (typeof parsed === 'string') {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        parsed = null;
      }
    }
    if (parsed && typeof parsed === 'object') {
      const list = Object.entries(parsed).map(([k, val]) => ({
        key: k,
        value: typeof val === 'object' ? JSON.stringify(val) : String(val),
      }));
      setEditSpecsList(list.length > 0 ? list : [{ key: '', value: '' }]);
    } else {
      setEditSpecsList([{ key: '', value: '' }]);
    }
  };

  const handleUpdateVariant = async (e) => {
    e.preventDefault();
    if (!editingVariant) return;

    setUpdating(true);
    try {
      const payload = {
        variant_name: editVariantName.trim() || editingVariant.variant_name,
        price: parseFloat(editPrice),
        sale_price: editSalePrice ? parseFloat(editSalePrice) : null,
        stock: parseInt(editStock),
        warranty_months: parseInt(editWarranty) || 12,
        specifications: parseSpecsToObj(editSpecsList),
      };

      const res = await productApi.updateVariant(editingVariant.variant_id, payload);
      if (res.success) {
        toast.success(`Đã cập nhật biến thể #${editingVariant.sku} thành công!`);
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

  // Reusable Specifications Editor UI
  const renderSpecsEditor = (specsList, setSpecsList) => {
    return (
      <div
        style={{
          marginTop: 14,
          padding: 14,
          backgroundColor: '#F9FAFB',
          borderRadius: 8,
          border: '1px solid #E5E7EB',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 10,
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          <div>
            <label
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: '#111827',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>⚡ Thông số kỹ thuật (Cột `specifications` JSON)</span>
            </label>
            <span style={{ fontSize: 11.5, color: '#6B7280' }}>
              Nhập các cặp Tên thông số - Giá trị. Lưu tự động dưới dạng JSON trong MySQL.
            </span>
          </div>

          {/* Quick Presets */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#9CA3AF' }}>Mẫu nhanh:</span>
            <button
              type="button"
              onClick={() => applyPreset(setSpecsList, 'mouse')}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🖱️ Chuột
            </button>
            <button
              type="button"
              onClick={() => applyPreset(setSpecsList, 'keyboard')}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ⌨️ Bàn phím
            </button>
            <button
              type="button"
              onClick={() => applyPreset(setSpecsList, 'headphone')}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🎧 Tai nghe
            </button>
            <button
              type="button"
              onClick={() => applyPreset(setSpecsList, 'monitor')}
              style={{
                fontSize: 11,
                padding: '3px 8px',
                borderRadius: 4,
                backgroundColor: '#FFFFFF',
                border: '1px solid #D1D5DB',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              🖥️ Màn hình
            </button>
          </div>
        </div>

        {/* Dynamic Key-Value Rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {specsList.map((item, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                placeholder="Tên thông số (VD: Màu sắc, DPI, Switch...)"
                value={item.key}
                onChange={(e) => updateSpecRow(setSpecsList, idx, 'key', e.target.value)}
                className="form-input"
                style={{ flex: 1, height: 36, fontSize: 13, backgroundColor: '#FFFFFF' }}
              />
              <span style={{ fontWeight: 800, color: '#9CA3AF' }}>:</span>
              <input
                type="text"
                placeholder="Giá trị (VD: Đen nhám, 35.000 DPI, ROG RX Red...)"
                value={item.value}
                onChange={(e) => updateSpecRow(setSpecsList, idx, 'value', e.target.value)}
                className="form-input"
                style={{ flex: 1.5, height: 36, fontSize: 13, backgroundColor: '#FFFFFF' }}
              />
              <button
                type="button"
                onClick={() => removeSpecRow(setSpecsList, idx)}
                style={{
                  padding: '6px',
                  color: '#EF4444',
                  cursor: 'pointer',
                  borderRadius: 4,
                  border: 'none',
                  background: 'none',
                }}
                title="Xóa thông số này"
              >
                <Icons.Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
          <button
            type="button"
            onClick={() => addSpecRow(setSpecsList)}
            style={{
              fontSize: 12.5,
              padding: '5px 12px',
              borderRadius: 6,
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              fontWeight: 700,
              cursor: 'pointer',
              border: '1px solid #BFDBFE',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <Icons.Plus size={14} />
            <span>Thêm dòng thông số</span>
          </button>

          <span style={{ fontSize: 11.5, color: '#6B7280', fontFamily: 'monospace' }}>
            Đã nhập: {specsList.filter((s) => s.key.trim()).length} thông số
          </span>
        </div>
      </div>
    );
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
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 12,
              }}
            >
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <label className="form-label" style={{ margin: 0 }}>
                    Mã SKU <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>(Tự động sinh)</span>
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
                    title="Tự động tạo mã SKU mới theo tên sản phẩm"
                  >
                    <Icons.Sparkles size={13} />
                    Tự sinh mã
                  </button>
                </div>
                <input
                  type="text"
                  className="form-input"
                  placeholder="VD: RZ-VIPER-TRANG-8K2A"
                  value={newSku}
                  onChange={(e) => {
                    setSkuManuallyEdited(true);
                    setNewSku(e.target.value.toUpperCase());
                  }}
                  style={{ fontFamily: 'monospace', fontWeight: 600, letterSpacing: '0.5px' }}
                />
                <span style={{ fontSize: '0.72rem', color: '#6B7280', display: 'block', marginTop: 3 }}>
                  *Mã SKU định danh duy nhất. Tự động sinh theo tên biến thể hoặc có thể tự nhập.
                </span>
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

            {/* Specifications Key-Value Builder */}
            {renderSpecsEditor(newSpecsList, setNewSpecsList)}

            {/* Variant Images Upload (Multer) */}
            <div style={{ marginTop: 14 }}>
              <ImageUploadField
                label="Danh sách hình ảnh biến thể (Multer File Upload)"
                value={newVariantImages}
                onChange={setNewVariantImages}
                multiple={true}
                hint="Tải lên một hoặc nhiều tệp ảnh riêng cho biến thể này (Multer)"
              />
            </div>

            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
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
                <th>Ảnh biến thể</th>
                <th>Thông số kỹ thuật (JSON Specifications)</th>
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
                  <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#6B7280' }}>
                    Chưa có biến thể nào cho sản phẩm này
                  </td>
                </tr>
              ) : (
                productDetail.variants.map((v) => {
                  let specsObj = v.specifications;
                  if (typeof specsObj === 'string') {
                    try {
                      specsObj = JSON.parse(specsObj);
                    } catch (e) {
                      specsObj = null;
                    }
                  }
                  const specEntries =
                    specsObj && typeof specsObj === 'object'
                      ? Object.entries(specsObj)
                      : [];

                  return (
                    <tr key={v.variant_id}>
                      <td style={{ fontWeight: 800, color: 'var(--primary)', fontFamily: 'monospace' }}>
                        {v.sku}
                      </td>
                      <td style={{ fontWeight: 700 }}>
                        {v.variant_name}
                      </td>
                      {/* Variant Images Gallery Column */}
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            {v.images && v.images.length > 0 ? (
                              v.images.slice(0, 3).map((img, idx) => (
                                <div
                                  key={img.image_id || idx}
                                  style={{
                                    width: 34,
                                    height: 34,
                                    borderRadius: 4,
                                    border: img.is_primary ? '2px solid var(--primary)' : '1px solid #D1D5DB',
                                    overflow: 'hidden',
                                    backgroundColor: '#FFF',
                                    position: 'relative',
                                  }}
                                  title={img.is_primary ? 'Ảnh chính của biến thể' : 'Ảnh biến thể'}
                                >
                                  <img
                                    src={img.image_url}
                                    alt=""
                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                  />
                                  {img.is_primary === 1 && (
                                    <span
                                      style={{
                                        position: 'absolute',
                                        bottom: 0,
                                        left: 0,
                                        right: 0,
                                        backgroundColor: 'var(--primary)',
                                        color: '#FFF',
                                        fontSize: 7,
                                        textAlign: 'center',
                                        fontWeight: 900,
                                      }}
                                    >
                                      CHÍNH
                                    </span>
                                  )}
                                </div>
                              ))
                            ) : (
                              <span style={{ fontSize: 11, color: '#9CA3AF' }}>Chưa có</span>
                            )}
                            {v.images && v.images.length > 3 && (
                              <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 700 }}>
                                +{v.images.length - 3}
                              </span>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setManagingVariantImages(v)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              padding: '4px 8px',
                              borderRadius: 4,
                              fontSize: 11,
                              fontWeight: 700,
                              backgroundColor: '#F3F4F6',
                              color: '#1F2937',
                              border: '1px solid #D1D5DB',
                              cursor: 'pointer',
                              marginLeft: 4,
                              whiteSpace: 'nowrap',
                            }}
                            title="Quản lý danh sách ảnh của biến thể này"
                          >
                            <Icons.Camera size={13} />
                            <span>Ảnh ({v.images?.length || 0})</span>
                          </button>
                        </div>
                      </td>
                      {/* Specifications column */}
                      <td>
                        {specEntries.length > 0 ? (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, maxWidth: 300 }}>
                            {specEntries.map(([k, val], i) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: 11,
                                  backgroundColor: '#F3F4F6',
                                  color: '#374151',
                                  padding: '2px 6px',
                                  borderRadius: 4,
                                  border: '1px solid #E5E7EB',
                                  display: 'inline-flex',
                                  gap: 3,
                                }}
                              >
                                <strong style={{ color: '#1F2937' }}>{k}:</strong> {String(val)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: '#9CA3AF', fontSize: 12 }}>—</span>
                        )}
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
                            Sửa thông số / giá
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
                  );
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Edit Variant Modal (Includes Specifications Editor) */}
      {editingVariant && (
        <div className="modal-overlay" onClick={() => setEditingVariant(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: 640, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="modal-title">Cập nhật biến thể: {editingVariant.sku}</h3>
              <button onClick={() => setEditingVariant(null)}>
                <Icons.X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleUpdateVariant}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Mã SKU</label>
                    <input
                      type="text"
                      disabled
                      className="form-input"
                      value={editingVariant.sku}
                      style={{ backgroundColor: '#F3F4F6' }}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tên biến thể *</label>
                    <input
                      type="text"
                      required
                      className="form-input"
                      value={editVariantName}
                      onChange={(e) => setEditVariantName(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10 }}>
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
                      placeholder="Trống nếu không giảm"
                      value={editSalePrice}
                      onChange={(e) => setEditSalePrice(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Tồn kho *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      className="form-input"
                      value={editStock}
                      onChange={(e) => setEditStock(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Bảo hành (tháng)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-input"
                      value={editWarranty}
                      onChange={(e) => setEditWarranty(e.target.value)}
                    />
                  </div>
                </div>

                {/* Edit Specifications */}
                {renderSpecsEditor(editSpecsList, setEditSpecsList)}

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
                      padding: '8px 24px',
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

      {/* Modal: Variant Images Manager (Quản lý danh sách ảnh biến thể) */}
      {managingVariantImages && (
        <div className="modal-overlay" onClick={() => setManagingVariantImages(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: 660, maxHeight: '90vh', overflowY: 'auto' }}
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
                  <Icons.Camera size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: 16 }}>
                    Quản lý danh sách ảnh biến thể
                  </h3>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Biến thể: <strong>{managingVariantImages.variant_name}</strong> (SKU: {managingVariantImages.sku})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setManagingVariantImages(null)}
                style={{ color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Multer Upload Section */}
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  border: '2px dashed #CBD5E1',
                  borderRadius: 8,
                  padding: 16,
                  textAlign: 'center',
                  marginBottom: 18,
                }}
              >
                <input
                  ref={variantFileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => handleAddImagesToVariant(e.target.files)}
                />

                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    backgroundColor: uploadingVariantImg ? '#EFF6FF' : '#FEE2E2',
                    color: uploadingVariantImg ? '#2563EB' : 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 8px auto',
                  }}
                >
                  {uploadingVariantImg ? (
                    <div
                      style={{
                        width: 18,
                        height: 18,
                        border: '2px solid #2563EB',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        animation: 'spin 0.8s linear infinite',
                      }}
                    />
                  ) : (
                    <Icons.Upload size={20} />
                  )}
                </div>

                <div style={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                  {uploadingVariantImg ? 'Đang tải ảnh lên server bằng Multer...' : 'Tải lên ảnh mới cho biến thể này'}
                </div>
                <div style={{ fontSize: 11.5, color: '#64748B', marginTop: 2, marginBottom: 10 }}>
                  Hỗ trợ: JPG, PNG, WEBP, GIF, SVG (Tối đa 10MB/ảnh)
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={uploadingVariantImg}
                    onClick={() => variantFileInputRef.current?.click()}
                    style={{
                      backgroundColor: 'var(--primary)',
                      color: '#FFF',
                      padding: '7px 16px',
                      borderRadius: 6,
                      fontWeight: 700,
                      fontSize: 12.5,
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      cursor: uploadingVariantImg ? 'wait' : 'pointer',
                    }}
                  >
                    <Icons.Upload size={14} />
                    <span>Chọn tệp ảnh từ máy tính</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAddUrlInput(!showAddUrlInput)}
                    style={{
                      backgroundColor: '#FFF',
                      color: '#374151',
                      border: '1px solid #D1D5DB',
                      padding: '7px 14px',
                      borderRadius: 6,
                      fontWeight: 600,
                      fontSize: 12.5,
                      cursor: 'pointer',
                    }}
                  >
                    {showAddUrlInput ? 'Ẩn link URL' : 'Thêm bằng URL'}
                  </button>
                </div>

                {/* Add Image by URL input */}
                {showAddUrlInput && (
                  <form onSubmit={handleAddImageUrlToVariant} style={{ marginTop: 12, display: 'flex', gap: 8 }}>
                    <input
                      type="url"
                      required
                      className="form-input"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      style={{ flex: 1, fontSize: 12.5 }}
                    />
                    <button
                      type="submit"
                      disabled={uploadingVariantImg}
                      style={{
                        backgroundColor: '#10B981',
                        color: '#FFF',
                        padding: '6px 14px',
                        borderRadius: 6,
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      Thêm URL
                    </button>
                  </form>
                )}
              </div>

              {/* Existing Variant Images Grid */}
              <div style={{ marginBottom: 12 }}>
                <h4 style={{ fontSize: 13.5, fontWeight: 800, color: '#1F2937', marginBottom: 10 }}>
                  Danh sách ảnh hiện tại ({managingVariantImages.images?.length || 0} ảnh)
                </h4>

                {(!managingVariantImages.images || managingVariantImages.images.length === 0) ? (
                  <div
                    style={{
                      padding: 24,
                      textAlign: 'center',
                      backgroundColor: '#F9FAFB',
                      borderRadius: 6,
                      border: '1px solid #E5E7EB',
                      color: '#6B7280',
                      fontSize: 13,
                    }}
                  >
                    Biến thể này chưa có hình ảnh nào. Hãy chọn tệp ảnh ở trên để tải lên!
                  </div>
                ) : (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))',
                      gap: 12,
                    }}
                  >
                    {managingVariantImages.images.map((img) => {
                      const isPrimary = img.is_primary === 1;

                      return (
                        <div
                          key={img.image_id}
                          style={{
                            border: isPrimary ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                            borderRadius: 8,
                            padding: 8,
                            backgroundColor: '#FFFFFF',
                            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            position: 'relative',
                          }}
                        >
                          {/* Image preview box */}
                          <div
                            style={{
                              width: '100%',
                              height: 100,
                              borderRadius: 4,
                              overflow: 'hidden',
                              backgroundColor: '#FAFAFA',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <img
                              src={img.image_url}
                              alt=""
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/120x120?text=Loi+Anh';
                              }}
                            />
                          </div>

                          {/* Primary status badge */}
                          {isPrimary ? (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 800,
                                color: 'var(--primary)',
                                backgroundColor: 'var(--primary-light)',
                                padding: '2px 8px',
                                borderRadius: 4,
                                marginBottom: 6,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                              }}
                            >
                              ⭐ Ảnh chính
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetPrimaryVariantImage(img.image_id)}
                              style={{
                                fontSize: 11,
                                color: '#2563EB',
                                backgroundColor: '#EFF6FF',
                                border: '1px solid #BFDBFE',
                                padding: '2px 8px',
                                borderRadius: 4,
                                fontWeight: 600,
                                cursor: 'pointer',
                                marginBottom: 6,
                              }}
                            >
                              Đặt làm ảnh chính
                            </button>
                          )}

                          {/* Delete image button */}
                          <button
                            type="button"
                            onClick={() => handleDeleteVariantImage(img.image_id)}
                            style={{
                              fontSize: 11,
                              color: '#EF4444',
                              backgroundColor: '#FEF2F2',
                              border: '1px solid #FECACA',
                              padding: '2px 8px',
                              borderRadius: 4,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Icons.Trash2 size={11} />
                            <span>Xóa</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setManagingVariantImages(null)}
                  style={{
                    backgroundColor: '#1E293B',
                    color: '#FFF',
                    padding: '8px 20px',
                    borderRadius: 6,
                    fontWeight: 700,
                    fontSize: 13,
                  }}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
