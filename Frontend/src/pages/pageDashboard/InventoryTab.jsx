import React, { useState, useEffect, useCallback } from 'react';
import { inventoryApi } from '../../api/inventoryApi';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDate } from '../../utils/formatters';

export default function InventoryTab({ Icons }) {
  const toast = useToast();

  // Active view: 'items' (Danh sách tồn kho) | 'history' (Lịch sử nhập xuất)
  const [activeSubTab, setActiveSubTab] = useState('items');

  // Inventory items state
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState({
    total_variants: 0,
    total_stock: 0,
    low_stock_count: 0,
    out_of_stock_count: 0,
    total_imports: 0,
    total_exports: 0,
  });
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortOption, setSortOption] = useState('stock_asc');

  // Transactions state
  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [txSearch, setTxSearch] = useState('');

  // Suppliers state
  const [suppliers, setSuppliers] = useState([]);

  // Modals state
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);

  // Form: Import stock
  const [importVariantId, setImportVariantId] = useState('');
  const [importQty, setImportQty] = useState('10');
  const [importUnitCost, setImportUnitCost] = useState('');
  const [importSupplierId, setImportSupplierId] = useState('');
  const [importNote, setImportNote] = useState('');
  const [submittingImport, setSubmittingImport] = useState(false);

  // Form: Export stock
  const [exportVariantId, setExportVariantId] = useState('');
  const [exportQty, setExportQty] = useState('1');
  const [exportType, setExportType] = useState('adjustment');
  const [exportReason, setExportReason] = useState('Kiểm kê / điều chuyển kho');
  const [exportNote, setExportNote] = useState('');
  const [submittingExport, setSubmittingExport] = useState(false);

  // Quick add supplier modal/state
  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [submittingSupplier, setSubmittingSupplier] = useState(false);

  // Fetch Inventory items
  const fetchInventory = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await inventoryApi.getInventory({
        page: itemsPage,
        limit: 15,
        search: searchKeyword,
        low_stock: filterLowStock ? 'true' : undefined,
        sort: sortOption,
      });

      if (res.success && res.data) {
        setItems(res.data.items || []);
        if (res.data.pagination) {
          setItemsTotalPages(res.data.pagination.totalPages || 1);
        }
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải danh sách kho');
    } finally {
      setLoadingItems(false);
    }
  }, [itemsPage, searchKeyword, filterLowStock, sortOption, toast]);

  // Fetch Transaction logs
  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await inventoryApi.getTransactions({
        page: txPage,
        limit: 15,
        transaction_type: txTypeFilter,
        search: txSearch,
      });

      if (res.success && res.data) {
        setTransactions(res.data.items || []);
        if (res.data.pagination) {
          setTxTotalPages(res.data.pagination.totalPages || 1);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải lịch sử giao dịch kho');
    } finally {
      setLoadingTx(false);
    }
  }, [txPage, txTypeFilter, txSearch, toast]);

  // Fetch Suppliers
  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await inventoryApi.getSuppliers();
      if (res.success && res.data) {
        setSuppliers(res.data);
      }
    } catch (err) {
      console.error('Lỗi tải danh sách nhà cung cấp:', err);
    }
  }, []);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  useEffect(() => {
    if (activeSubTab === 'history') {
      fetchTransactions();
    }
  }, [activeSubTab, fetchTransactions]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  // Handle open Import modal
  const handleOpenImport = (variant = null) => {
    setSelectedVariant(variant);
    if (variant) {
      setImportVariantId(String(variant.variant_id));
      setImportUnitCost(String(Math.round(variant.price * 0.75)));
    } else if (items.length > 0) {
      setImportVariantId(String(items[0].variant_id));
      setImportUnitCost(String(Math.round(items[0].price * 0.75)));
    }
    setImportQty('10');
    setImportNote('');
    setShowImportModal(true);
  };

  // Handle open Export modal
  const handleOpenExport = (variant = null) => {
    setSelectedVariant(variant);
    if (variant) {
      setExportVariantId(String(variant.variant_id));
    } else if (items.length > 0) {
      setExportVariantId(String(items[0].variant_id));
    }
    setExportQty('1');
    setExportType('adjustment');
    setExportReason('Kiểm kê / điều chuyển kho');
    setExportNote('');
    setShowExportModal(true);
  };

  // Submit Import Stock
  const handleImportSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(importQty, 10);
    if (!importVariantId || isNaN(qty) || qty <= 0) {
      toast.warning('Vui lòng chọn biến thể và nhập số lượng hợp lệ (> 0)');
      return;
    }

    setSubmittingImport(true);
    try {
      const payload = {
        variant_id: parseInt(importVariantId, 10),
        quantity: qty,
        unit_cost: importUnitCost ? parseFloat(importUnitCost) : undefined,
        supplier_id: importSupplierId ? parseInt(importSupplierId, 10) : undefined,
        note: importNote.trim(),
      };

      const res = await inventoryApi.importStock(payload);
      if (res.success) {
        toast.success(res.message || `Đã nhập thêm ${qty} sản phẩm vào kho!`);
        setShowImportModal(false);
        fetchInventory();
        if (activeSubTab === 'history') fetchTransactions();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi nhập hàng vào kho');
    } finally {
      setSubmittingImport(false);
    }
  };

  // Submit Export Stock
  const handleExportSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(exportQty, 10);
    if (!exportVariantId || isNaN(qty) || qty <= 0) {
      toast.warning('Vui lòng chọn biến thể và nhập số lượng xuất hợp lệ (> 0)');
      return;
    }

    setSubmittingExport(true);
    try {
      const payload = {
        variant_id: parseInt(exportVariantId, 10),
        quantity: qty,
        transaction_type: exportType,
        reason: exportReason,
        note: exportNote.trim(),
      };

      const res = await inventoryApi.exportStock(payload);
      if (res.success) {
        toast.success(res.message || `Đã xuất ${qty} sản phẩm ra khỏi kho!`);
        setShowExportModal(false);
        fetchInventory();
        if (activeSubTab === 'history') fetchTransactions();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xuất kho');
    } finally {
      setSubmittingExport(false);
    }
  };

  // Submit New Supplier
  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplierName.trim()) {
      toast.warning('Vui lòng nhập tên nhà cung cấp');
      return;
    }

    setSubmittingSupplier(true);
    try {
      const res = await inventoryApi.createSupplier({
        supplier_name: newSupplierName.trim(),
        phone: newSupplierPhone.trim(),
        email: newSupplierEmail.trim(),
      });
      if (res.success && res.data) {
        toast.success(`Đã thêm nhà cung cấp "${newSupplierName.trim()}"`);
        setNewSupplierName('');
        setNewSupplierPhone('');
        setNewSupplierEmail('');
        setShowAddSupplier(false);
        await fetchSuppliers();
        setImportSupplierId(String(res.data.supplier_id));
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm nhà cung cấp');
    } finally {
      setSubmittingSupplier(false);
    }
  };

  // Helper to format transaction type label & badge
  const renderTxBadge = (type) => {
    switch (type) {
      case 'purchase':
        return (
          <span style={{ backgroundColor: '#DCFCE7', color: '#15803D', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
            📥 Nhập hàng
          </span>
        );
      case 'sale':
        return (
          <span style={{ backgroundColor: '#EFF6FF', color: '#1D4ED8', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
            🛒 Xuất bán đơn
          </span>
        );
      case 'damage':
        return (
          <span style={{ backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
            ⚠️ Xuất hủy hỏng
          </span>
        );
      case 'adjustment':
        return (
          <span style={{ backgroundColor: '#FEF3C7', color: '#B45309', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
            🔄 Xuất điều chỉnh
          </span>
        );
      case 'return':
        return (
          <span style={{ backgroundColor: '#F3E8FF', color: '#7E22CE', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
            ↩️ Hoàn kho
          </span>
        );
      default:
        return (
          <span style={{ backgroundColor: '#F3F4F6', color: '#4B5563', padding: '3px 8px', borderRadius: 4, fontWeight: 800, fontSize: 11 }}>
            {type}
          </span>
        );
    }
  };

  const currentSelectedForImport = items.find((it) => String(it.variant_id) === String(importVariantId));
  const currentSelectedForExport = items.find((it) => String(it.variant_id) === String(exportVariantId));

  return (
    <div>
      {/* Top Header & Fast Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 14,
          marginBottom: 20,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: '#111827', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--primary)' }}>📦</span> Quản lý kho hàng & Xuất Nhập Tồn
          </h2>
          <span style={{ fontSize: 12.5, color: '#6B7280', marginTop: 4, display: 'inline-block' }}>
            Theo dõi tồn kho thời gian thực, nhập hàng từ nhà phân phối và quản lý xuất kho
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={() => handleOpenImport()}
            style={{
              backgroundColor: '#10B981',
              color: '#FFFFFF',
              padding: '9px 18px',
              borderRadius: 6,
              fontWeight: 800,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(16, 185, 129, 0.25)',
              cursor: 'pointer',
            }}
          >
            <Icons.Plus size={16} />
            <span>+ Nhập hàng</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenExport()}
            style={{
              backgroundColor: '#E30019',
              color: '#FFFFFF',
              padding: '9px 18px',
              borderRadius: 6,
              fontWeight: 800,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              boxShadow: '0 2px 6px rgba(227, 0, 25, 0.25)',
              cursor: 'pointer',
            }}
          >
            <Icons.Minus size={16} />
            <span>- Xuất thêm</span>
          </button>

          <button
            type="button"
            onClick={() => {
              fetchInventory();
              if (activeSubTab === 'history') fetchTransactions();
            }}
            style={{
              backgroundColor: '#FFFFFF',
              color: '#374151',
              border: '1px solid #D1D5DB',
              padding: '9px 14px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 13,
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
            title="Làm mới dữ liệu kho"
          >
            <Icons.RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 14,
          marginBottom: 20,
        }}
      >
        {/* Total Stock */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: 16,
            border: '1px solid var(--border-light)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
            Tổng số lượng tồn kho
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#111827', marginTop: 4 }}>
            {summary.total_stock.toLocaleString()} <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>chiếc</span>
          </div>
          <div style={{ fontSize: 12, color: '#10B981', marginTop: 4, fontWeight: 600 }}>
            {summary.total_variants} cấu hình / biến thể
          </div>
        </div>

        {/* Low Stock Alert */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: 16,
            border: summary.low_stock_count > 0 ? '1px solid #FCD34D' : '1px solid var(--border-light)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
            Cảnh báo sắp hết kho
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: summary.low_stock_count > 0 ? '#D97706' : '#10B981', marginTop: 4 }}>
            {summary.low_stock_count} <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>mặt hàng (≤ 5)</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            {summary.out_of_stock_count} mặt hàng đã hết hẳn (0 chiếc)
          </div>
        </div>

        {/* Total Imports */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: 16,
            border: '1px solid var(--border-light)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
            Tổng lượt nhập kho
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#10B981', marginTop: 4 }}>
            {summary.total_imports} <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>lượt</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            Tự động ghi nhận giao dịch
          </div>
        </div>

        {/* Total Exports */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            padding: 16,
            border: '1px solid var(--border-light)',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6B7280', textTransform: 'uppercase' }}>
            Tổng lượt xuất kho
          </div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#E30019', marginTop: 4 }}>
            {summary.total_exports} <span style={{ fontSize: 13, fontWeight: 600, color: '#6B7280' }}>lượt</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 4 }}>
            Bán hàng & điều chuyển
          </div>
        </div>
      </div>

      {/* Sub Tabs Switcher */}
      <div
        style={{
          display: 'flex',
          borderBottom: '2px solid #E5E7EB',
          marginBottom: 18,
          gap: 20,
        }}
      >
        <button
          type="button"
          onClick={() => setActiveSubTab('items')}
          style={{
            padding: '10px 4px',
            fontSize: 14,
            fontWeight: 800,
            color: activeSubTab === 'items' ? 'var(--primary)' : '#6B7280',
            borderBottom: activeSubTab === 'items' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: -2,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <span>📦 Danh sách tồn kho</span>
          <span
            style={{
              backgroundColor: activeSubTab === 'items' ? 'var(--primary-light)' : '#F3F4F6',
              color: activeSubTab === 'items' ? 'var(--primary)' : '#6B7280',
              padding: '1px 6px',
              borderRadius: 10,
              fontSize: 11,
            }}
          >
            {summary.total_variants}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('history')}
          style={{
            padding: '10px 4px',
            fontSize: 14,
            fontWeight: 800,
            color: activeSubTab === 'history' ? 'var(--primary)' : '#6B7280',
            borderBottom: activeSubTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
            marginBottom: -2,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
          }}
        >
          <span>📜 Lịch sử nhập / xuất kho</span>
        </button>
      </div>

      {/* VIEW 1: INVENTORY ITEMS LIST */}
      {activeSubTab === 'items' && (
        <div>
          {/* Filters Bar */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              padding: 14,
              border: '1px solid var(--border-light)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="form-input"
                style={{ maxWidth: 320, fontSize: 13 }}
                placeholder="Tìm tên sản phẩm, mã SKU, phiên bản..."
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setItemsPage(1);
                }}
              />

              <button
                type="button"
                onClick={() => {
                  setFilterLowStock(!filterLowStock);
                  setItemsPage(1);
                }}
                style={{
                  backgroundColor: filterLowStock ? '#FEF3C7' : '#F3F4F6',
                  color: filterLowStock ? '#B45309' : '#374151',
                  border: filterLowStock ? '1px solid #FCD34D' : '1px solid #E5E7EB',
                  padding: '7px 14px',
                  borderRadius: 6,
                  fontWeight: 700,
                  fontSize: 12.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>⚠️ Chỉ xem sắp hết (≤ 5)</span>
                {summary.low_stock_count > 0 && (
                  <span style={{ backgroundColor: '#EF4444', color: '#FFF', padding: '1px 5px', borderRadius: 10, fontSize: 10 }}>
                    {summary.low_stock_count}
                  </span>
                )}
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12.5, color: '#6B7280', fontWeight: 600 }}>Sắp xếp:</span>
              <select
                className="form-input"
                style={{ width: 'auto', fontSize: 12.5 }}
                value={sortOption}
                onChange={(e) => {
                  setSortOption(e.target.value);
                  setItemsPage(1);
                }}
              >
                <option value="stock_asc">Tồn kho: Thấp đến Cao (Ưu tiên nhập)</option>
                <option value="stock_desc">Tồn kho: Cao đến Thấp</option>
                <option value="name_asc">Tên sản phẩm: A - Z</option>
                <option value="newest">Mới cập nhật</option>
              </select>
            </div>
          </div>

          {/* Items Table */}
          <div className="data-table-card">
            {loadingItems ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#6B7280' }}>
                Đang tải dữ liệu kho hàng...
              </div>
            ) : items.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#6B7280' }}>
                Không tìm thấy mặt hàng nào trong kho phù hợp với bộ lọc
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Sản phẩm / Biến thể</th>
                    <th>Mã SKU</th>
                    <th>Danh mục / Hãng</th>
                    <th>Giá niêm yết</th>
                    <th>Tồn kho hiện tại</th>
                    <th>Bảo hành</th>
                    <th style={{ textAlign: 'right' }}>Thao tác kho</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const isLowStock = it.stock <= 5 && it.stock > 0;
                    const isOutOfStock = it.stock === 0;

                    return (
                      <tr key={it.variant_id}>
                        {/* Product & Variant info */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <img
                              src={it.image_url || it.thumbnail_url || 'https://placehold.co/60x60?text=GearK'}
                              alt=""
                              style={{
                                width: 44,
                                height: 44,
                                objectFit: 'contain',
                                borderRadius: 6,
                                border: '1px solid #E5E7EB',
                                backgroundColor: '#FFF',
                              }}
                              onError={(e) => {
                                e.target.src = 'https://placehold.co/60x60?text=GearK';
                              }}
                            />
                            <div>
                              <div style={{ fontWeight: 800, color: '#111827', fontSize: 13.5 }}>
                                {it.product_name}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700 }}>
                                Phiên bản: {it.variant_name}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td style={{ fontWeight: 800, fontFamily: 'monospace', color: '#374151' }}>
                          {it.sku}
                        </td>

                        <td style={{ fontSize: 12.5, color: '#4B5563' }}>
                          <div>{it.category_name || '—'}</div>
                          <strong style={{ color: '#111827' }}>{it.brand_name || 'GearK'}</strong>
                        </td>

                        <td style={{ fontWeight: 700, color: '#111827' }}>
                          {formatPrice(it.sale_price || it.price)}
                        </td>

                        {/* Stock badge */}
                        <td>
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 4,
                              fontWeight: 900,
                              fontSize: 12.5,
                              padding: '3px 10px',
                              borderRadius: 4,
                              backgroundColor: isOutOfStock ? '#FEE2E2' : isLowStock ? '#FEF3C7' : '#DCFCE7',
                              color: isOutOfStock ? '#B91C1C' : isLowStock ? '#B45309' : '#15803D',
                            }}
                          >
                            {isOutOfStock ? '❌ Hết hàng (0)' : isLowStock ? `⚠️ Sắp hết (${it.stock})` : `✓ Còn ${it.stock} chiếc`}
                          </span>
                        </td>

                        <td style={{ fontSize: 12.5 }}>
                          {it.warranty_months} tháng
                        </td>

                        {/* Quick Import / Export actions */}
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: 6 }}>
                            <button
                              type="button"
                              onClick={() => handleOpenImport(it)}
                              style={{
                                backgroundColor: '#10B981',
                                color: '#FFF',
                                padding: '5px 10px',
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                cursor: 'pointer',
                              }}
                              title="Nhập thêm hàng vào kho cho biến thể này"
                            >
                              <span>📥 Nhập</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenExport(it)}
                              disabled={it.stock === 0}
                              style={{
                                backgroundColor: it.stock === 0 ? '#E5E7EB' : '#E30019',
                                color: it.stock === 0 ? '#9CA3AF' : '#FFF',
                                padding: '5px 10px',
                                borderRadius: 4,
                                fontSize: 12,
                                fontWeight: 800,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 3,
                                cursor: it.stock === 0 ? 'not-allowed' : 'pointer',
                              }}
                              title="Xuất bớt hàng khỏi kho (kiểm kê, hỏng...)"
                            >
                              <span>📤 Xuất</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {itemsTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
                <button
                  type="button"
                  disabled={itemsPage === 1}
                  onClick={() => setItemsPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #D1D5DB',
                    backgroundColor: itemsPage === 1 ? '#F3F4F6' : '#FFF',
                    cursor: itemsPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Trang trước
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700 }}>
                  Trang {itemsPage} / {itemsTotalPages}
                </span>
                <button
                  type="button"
                  disabled={itemsPage === itemsTotalPages}
                  onClick={() => setItemsPage((p) => Math.min(itemsTotalPages, p + 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #D1D5DB',
                    backgroundColor: itemsPage === itemsTotalPages ? '#F3F4F6' : '#FFF',
                    cursor: itemsPage === itemsTotalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: INVENTORY TRANSACTIONS LOG */}
      {activeSubTab === 'history' && (
        <div>
          {/* History Filters */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 8,
              padding: 14,
              border: '1px solid var(--border-light)',
              marginBottom: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flex: 1, minWidth: 260 }}>
              <input
                type="text"
                className="form-input"
                style={{ maxWidth: 320, fontSize: 13 }}
                placeholder="Tìm mã SKU, tên sản phẩm, ghi chú..."
                value={txSearch}
                onChange={(e) => {
                  setTxSearch(e.target.value);
                  setTxPage(1);
                }}
              />

              <select
                className="form-input"
                style={{ width: 'auto', fontSize: 12.5 }}
                value={txTypeFilter}
                onChange={(e) => {
                  setTxTypeFilter(e.target.value);
                  setTxPage(1);
                }}
              >
                <option value="all">Tất cả loại giao dịch</option>
                <option value="purchase">📥 Nhập hàng (Purchase)</option>
                <option value="sale">🛒 Xuất bán (Sale)</option>
                <option value="adjustment">🔄 Xuất điều chỉnh / Kiểm kê (Adjustment)</option>
                <option value="damage">⚠️ Xuất hủy hàng hỏng (Damage)</option>
                <option value="return">↩️ Hoàn trả (Return)</option>
              </select>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="data-table-card">
            {loadingTx ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#6B7280' }}>
                Đang tải lịch sử xuất nhập kho...
              </div>
            ) : transactions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '36px 0', color: '#6B7280' }}>
                Chưa có giao dịch kho nào được ghi nhận
              </div>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Mã GD & Thời gian</th>
                    <th>Sản phẩm / Biến thể</th>
                    <th>Loại giao dịch</th>
                    <th>Biến động số lượng</th>
                    <th>Tồn kho sau GD</th>
                    <th>Người thực hiện</th>
                    <th>Ghi chú / Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => {
                    const isPositive = tx.quantity_delta > 0;

                    return (
                      <tr key={tx.inventory_transaction_id}>
                        <td>
                          <div style={{ fontWeight: 800, fontFamily: 'monospace', color: 'var(--primary)' }}>
                            #{tx.inventory_transaction_id}
                          </div>
                          <div style={{ fontSize: 11.5, color: '#6B7280' }}>
                            {formatDate(tx.created_at)}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontWeight: 700, color: '#111827', fontSize: 13 }}>
                            {tx.product_name}
                          </div>
                          <div style={{ fontSize: 12, color: '#4B5563' }}>
                            {tx.variant_name} • <span style={{ fontFamily: 'monospace' }}>{tx.sku}</span>
                          </div>
                        </td>

                        <td>{renderTxBadge(tx.transaction_type)}</td>

                        <td>
                          <span
                            style={{
                              fontWeight: 900,
                              fontSize: 14,
                              color: isPositive ? '#15803D' : '#B91C1C',
                              fontFamily: 'monospace',
                            }}
                          >
                            {isPositive ? `+${tx.quantity_delta}` : tx.quantity_delta}
                          </span>
                        </td>

                        <td>
                          <strong style={{ color: '#111827', fontSize: 13 }}>{tx.stock_after}</strong> chiếc
                        </td>

                        <td style={{ fontSize: 12.5, color: '#4B5563' }}>
                          {tx.created_by_name || 'Hệ thống'}
                        </td>

                        <td style={{ fontSize: 12.5, color: '#374151', maxWidth: 260 }}>
                          {tx.note || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {txTotalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, padding: 16 }}>
                <button
                  type="button"
                  disabled={txPage === 1}
                  onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #D1D5DB',
                    backgroundColor: txPage === 1 ? '#F3F4F6' : '#FFF',
                    cursor: txPage === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  Trang trước
                </button>
                <span style={{ display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 700 }}>
                  Trang {txPage} / {txTotalPages}
                </span>
                <button
                  type="button"
                  disabled={txPage === txTotalPages}
                  onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 4,
                    border: '1px solid #D1D5DB',
                    backgroundColor: txPage === txTotalPages ? '#F3F4F6' : '#FFF',
                    cursor: txPage === txTotalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  Trang sau
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: NHẬP HÀNG VÀO KHO (IMPORT STOCK) */}
      {/* ========================================================= */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Icons.Plus size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: 16 }}>
                    Nhập hàng vào kho (Import Stock)
                  </h3>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Tăng số lượng tồn kho và ghi nhật ký giao dịch
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                style={{ color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleImportSubmit}>
                {/* Chọn mặt hàng / biến thể */}
                <div className="form-group">
                  <label className="form-label">Chọn mặt hàng / biến thể cần nhập *</label>
                  <select
                    className="form-input"
                    required
                    value={importVariantId}
                    onChange={(e) => {
                      setImportVariantId(e.target.value);
                      const selected = items.find((it) => String(it.variant_id) === e.target.value);
                      if (selected) {
                        setImportUnitCost(String(Math.round(selected.price * 0.75)));
                      }
                    }}
                  >
                    <option value="">-- Chọn biến thể sản phẩm --</option>
                    {items.map((it) => (
                      <option key={it.variant_id} value={it.variant_id}>
                        {it.product_name} - {it.variant_name} (SKU: {it.sku} - Tồn hiện tại: {it.stock})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Preview Banner */}
                {currentSelectedForImport && (
                  <div
                    style={{
                      backgroundColor: '#ECFDF5',
                      border: '1px solid #A7F3D0',
                      borderRadius: 8,
                      padding: '12px 14px',
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#065F46' }}>
                        Tồn kho hiện tại: {currentSelectedForImport.stock} chiếc
                      </div>
                      <div style={{ fontSize: 12, color: '#047857', marginTop: 2 }}>
                        Mã SKU: <strong>{currentSelectedForImport.sku}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>Tồn sau khi nhập:</span>
                      <div style={{ fontSize: 16, fontWeight: 900, color: '#065F46' }}>
                        {currentSelectedForImport.stock + (parseInt(importQty, 10) || 0)} chiếc
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Số lượng nhập */}
                  <div className="form-group">
                    <label className="form-label">Số lượng nhập thêm *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      className="form-input"
                      placeholder="VD: 20"
                      value={importQty}
                      onChange={(e) => setImportQty(e.target.value)}
                    />
                  </div>

                  {/* Đơn giá nhập */}
                  <div className="form-group">
                    <label className="form-label">Đơn giá nhập vốn (₫)</label>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      className="form-input"
                      placeholder="VD: 1500000"
                      value={importUnitCost}
                      onChange={(e) => setImportUnitCost(e.target.value)}
                    />
                  </div>
                </div>

                {/* Nhà cung cấp */}
                <div className="form-group">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                    <label className="form-label" style={{ margin: 0 }}>Nhà phân phối / Cung cấp</label>
                    <button
                      type="button"
                      onClick={() => setShowAddSupplier(!showAddSupplier)}
                      style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      {showAddSupplier ? 'Hủy thêm NCC' : '+ Thêm NCC mới'}
                    </button>
                  </div>

                  {showAddSupplier ? (
                    <div style={{ backgroundColor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 6, padding: 10, marginTop: 4 }}>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Tên nhà cung cấp (VD: Asus ROG VN)..."
                        value={newSupplierName}
                        onChange={(e) => setNewSupplierName(e.target.value)}
                        style={{ marginBottom: 6 }}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 8 }}>
                        <input
                          type="text"
                          className="form-input"
                          placeholder="Số điện thoại"
                          value={newSupplierPhone}
                          onChange={(e) => setNewSupplierPhone(e.target.value)}
                        />
                        <input
                          type="email"
                          className="form-input"
                          placeholder="Email"
                          value={newSupplierEmail}
                          onChange={(e) => setNewSupplierEmail(e.target.value)}
                        />
                      </div>
                      <button
                        type="button"
                        disabled={submittingSupplier}
                        onClick={handleCreateSupplier}
                        style={{
                          backgroundColor: '#1E293B',
                          color: '#FFF',
                          padding: '6px 14px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {submittingSupplier ? 'Đang lưu...' : 'Lưu nhà cung cấp'}
                      </button>
                    </div>
                  ) : (
                    <select
                      className="form-input"
                      value={importSupplierId}
                      onChange={(e) => setImportSupplierId(e.target.value)}
                    >
                      <option value="">-- Chọn nhà cung cấp (Tùy chọn) --</option>
                      {suppliers.map((s) => (
                        <option key={s.supplier_id} value={s.supplier_id}>
                          {s.supplier_name} {s.phone ? `(${s.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Ghi chú */}
                <div className="form-group">
                  <label className="form-label">Ghi chú nhập hàng</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="VD: Nhập hàng đợt 1 từ NPP Viễn Sơn, số hóa đơn VAT..."
                    value={importNote}
                    onChange={(e) => setImportNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    type="submit"
                    disabled={submittingImport}
                    style={{
                      flex: 1,
                      backgroundColor: '#10B981',
                      color: '#FFFFFF',
                      padding: '11px',
                      borderRadius: 6,
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: submittingImport ? 'wait' : 'pointer',
                      border: 'none',
                    }}
                  >
                    {submittingImport ? 'Đang cập nhật kho...' : 'Xác nhận nhập kho'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowImportModal(false)}
                    style={{
                      padding: '11px 20px',
                      borderRadius: 6,
                      border: '1px solid #D1D5DB',
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
      )}

      {/* ========================================================= */}
      {/* MODAL 2: XUẤT KHO / XUẤT THÊM (EXPORT STOCK) */}
      {/* ========================================================= */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div
            className="modal-card"
            style={{ maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}
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
                  <Icons.Minus size={20} />
                </div>
                <div>
                  <h3 className="modal-title" style={{ margin: 0, fontSize: 16 }}>
                    Xuất hàng khỏi kho (Export Stock)
                  </h3>
                  <span style={{ fontSize: 12, color: '#6B7280' }}>
                    Giảm trừ số lượng tồn kho (kiểm kê, hư hỏng, điều chuyển, bảo hành...)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                style={{ color: '#6B7280', cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <Icons.X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <form onSubmit={handleExportSubmit}>
                {/* Chọn mặt hàng / biến thể */}
                <div className="form-group">
                  <label className="form-label">Chọn mặt hàng / biến thể cần xuất *</label>
                  <select
                    className="form-input"
                    required
                    value={exportVariantId}
                    onChange={(e) => setExportVariantId(e.target.value)}
                  >
                    <option value="">-- Chọn biến thể sản phẩm --</option>
                    {items.map((it) => (
                      <option key={it.variant_id} value={it.variant_id}>
                        {it.product_name} - {it.variant_name} (SKU: {it.sku} - Tồn: {it.stock})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Preview Banner */}
                {currentSelectedForExport && (
                  <div
                    style={{
                      backgroundColor: '#FEF2F2',
                      border: '1px solid #FECACA',
                      borderRadius: 8,
                      padding: '12px 14px',
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: '#991B1B' }}>
                        Tồn kho hiện tại: {currentSelectedForExport.stock} chiếc
                      </div>
                      <div style={{ fontSize: 12, color: '#B91C1C', marginTop: 2 }}>
                        Mã SKU: <strong>{currentSelectedForExport.sku}</strong>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: 11, color: '#B91C1C', fontWeight: 600 }}>Tồn sau khi xuất:</span>
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: 900,
                          color: currentSelectedForExport.stock - (parseInt(exportQty, 10) || 0) < 0 ? '#DC2626' : '#991B1B',
                        }}
                      >
                        {Math.max(0, currentSelectedForExport.stock - (parseInt(exportQty, 10) || 0))} chiếc
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {/* Số lượng xuất */}
                  <div className="form-group">
                    <label className="form-label">Số lượng xuất kho *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      max={currentSelectedForExport ? currentSelectedForExport.stock : undefined}
                      className="form-input"
                      placeholder="VD: 5"
                      value={exportQty}
                      onChange={(e) => setExportQty(e.target.value)}
                    />
                  </div>

                  {/* Loại xuất */}
                  <div className="form-group">
                    <label className="form-label">Loại xuất kho *</label>
                    <select
                      className="form-input"
                      required
                      value={exportType}
                      onChange={(e) => {
                        setExportType(e.target.value);
                        if (e.target.value === 'damage') {
                          setExportReason('Xuất hủy hàng lỗi / hỏng / vỡ màn hình');
                        } else {
                          setExportReason('Kiểm kê / điều chuyển kho');
                        }
                      }}
                    >
                      <option value="adjustment">🔄 Xuất điều chỉnh / Kiểm kê</option>
                      <option value="damage">⚠️ Xuất hủy hàng lỗi / hỏng</option>
                      <option value="sale">🛒 Xuất bán lẻ trực tiếp</option>
                    </select>
                  </div>
                </div>

                {/* Lý do xuất */}
                <div className="form-group">
                  <label className="form-label">Lý do xuất kho *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="VD: Xuất điều chuyển về chi nhánh Hà Nội..."
                    value={exportReason}
                    onChange={(e) => setExportReason(e.target.value)}
                  />
                </div>

                {/* Ghi chú thêm */}
                <div className="form-group">
                  <label className="form-label">Ghi chú chi tiết</label>
                  <textarea
                    rows={2}
                    className="form-input"
                    placeholder="Thông tin thêm, người nhận hàng, biên bản bàn giao..."
                    value={exportNote}
                    onChange={(e) => setExportNote(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
                  <button
                    type="submit"
                    disabled={submittingExport || (currentSelectedForExport && currentSelectedForExport.stock < parseInt(exportQty, 10))}
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--primary)',
                      color: '#FFFFFF',
                      padding: '11px',
                      borderRadius: 6,
                      fontWeight: 800,
                      fontSize: 13.5,
                      cursor: submittingExport ? 'wait' : 'pointer',
                      border: 'none',
                    }}
                  >
                    {submittingExport ? 'Đang xử lý xuất kho...' : 'Xác nhận xuất kho'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowExportModal(false)}
                    style={{
                      padding: '11px 20px',
                      borderRadius: 6,
                      border: '1px solid #D1D5DB',
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
      )}
    </div>
  );
}
