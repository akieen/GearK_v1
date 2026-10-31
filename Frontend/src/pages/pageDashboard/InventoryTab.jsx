import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import DeleteOutlineIcon from '@mui/icons-material/Delete';

import { inventoryApi } from '../../api/inventoryApi';
import { useToast } from '../../context/ToastContext';
import { formatPrice, formatDate } from '../../utils/formatters';

const TX_BADGES = {
  purchase: { label: '📥 Nhập hàng', bg: '#DCFCE7', color: '#15803D' },
  sale: { label: '🛒 Xuất bán đơn', bg: '#EFF6FF', color: '#1D4ED8' },
  damage: { label: '⚠️ Xuất hủy hỏng', bg: '#FEE2E2', color: '#B91C1C' },
  adjustment: { label: '🔄 Xuất điều chỉnh', bg: '#FEF3C7', color: '#B45309' },
  return: { label: '↩️ Hoàn kho', bg: '#F3E8FF', color: '#7E22CE' },
};

export default function InventoryTab() {
  const toast = useToast();
  const [activeSubTab, setActiveSubTab] = useState('items');

  const [items, setItems] = useState([]);
  const [allVariants, setAllVariants] = useState([]);
  const [summary, setSummary] = useState({
    total_variants: 0, total_stock: 0, low_stock_count: 0,
    out_of_stock_count: 0, total_imports: 0, total_exports: 0,
  });
  const [loadingItems, setLoadingItems] = useState(false);
  const [itemsPage, setItemsPage] = useState(1);
  const [itemsTotalPages, setItemsTotalPages] = useState(1);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [filterLowStock, setFilterLowStock] = useState(false);
  const [sortOption, setSortOption] = useState('stock_asc');

  const [transactions, setTransactions] = useState([]);
  const [loadingTx, setLoadingTx] = useState(false);
  const [txPage, setTxPage] = useState(1);
  const [txTotalPages, setTxTotalPages] = useState(1);
  const [txTypeFilter, setTxTypeFilter] = useState('all');
  const [txSearch, setTxSearch] = useState('');

  const [suppliers, setSuppliers] = useState([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);

  // Nhập kho nhiều sản phẩm
  const [importItems, setImportItems] = useState([
    { variant_id: '', quantity: '10', unit_cost: '' },
  ]);
  const [importSupplierId, setImportSupplierId] = useState('');
  const [importNote, setImportNote] = useState('');
  const [submittingImport, setSubmittingImport] = useState(false);

  // Xuất kho nhiều sản phẩm
  const [exportItems, setExportItems] = useState([
    { variant_id: '', quantity: '1' },
  ]);
  const [exportType, setExportType] = useState('adjustment');
  const [exportReason, setExportReason] = useState('Kiểm kê / điều chuyển kho');
  const [exportNote, setExportNote] = useState('');
  const [submittingExport, setSubmittingExport] = useState(false);

  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');
  const [newSupplierEmail, setNewSupplierEmail] = useState('');
  const [submittingSupplier, setSubmittingSupplier] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoadingItems(true);
    try {
      const res = await inventoryApi.getInventory({
        page: itemsPage, limit: 15, search: searchKeyword,
        low_stock: filterLowStock ? 'true' : undefined, sort: sortOption,
      });
      if (res.success && res.data) {
        setItems(res.data.items || []);
        if (res.data.pagination) setItemsTotalPages(res.data.pagination.totalPages || 1);
        if (res.data.summary) setSummary(res.data.summary);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải danh sách kho');
    } finally {
      setLoadingItems(false);
    }
  }, [itemsPage, searchKeyword, filterLowStock, sortOption, toast]);

  const fetchAllVariants = useCallback(async () => {
    try {
      const res = await inventoryApi.getInventory({ limit: 500 });
      if (res.success && res.data?.items) {
        setAllVariants(res.data.items);
      }
    } catch (err) {
      console.error('Lỗi tải danh mục biến thể tổng:', err);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoadingTx(true);
    try {
      const res = await inventoryApi.getTransactions({
        page: txPage, limit: 15, transaction_type: txTypeFilter, search: txSearch,
      });
      if (res.success && res.data) {
        setTransactions(res.data.items || []);
        if (res.data.pagination) setTxTotalPages(res.data.pagination.totalPages || 1);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải lịch sử giao dịch kho');
    } finally {
      setLoadingTx(false);
    }
  }, [txPage, txTypeFilter, txSearch, toast]);

  const fetchSuppliers = useCallback(async () => {
    try {
      const res = await inventoryApi.getSuppliers();
      if (res.success && res.data) setSuppliers(res.data);
    } catch (err) {
      console.error('Lỗi tải danh sách nhà cung cấp:', err);
    }
  }, []);

  useEffect(() => { fetchInventory(); }, [fetchInventory]);
  useEffect(() => { fetchAllVariants(); }, [fetchAllVariants]);
  useEffect(() => { if (activeSubTab === 'history') fetchTransactions(); }, [activeSubTab, fetchTransactions]);
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  // Variant options nguồn cho dropdown (ưu tiên allVariants)
  const availableVariants = useMemo(() => {
    return allVariants.length ? allVariants : items;
  }, [allVariants, items]);

  // === XỬ LÝ NHẬP KHO NHIỀU MẶT HÀNG ===
  const handleOpenImport = (variant = null) => {
    if (variant) {
      setImportItems([{
        variant_id: String(variant.variant_id),
        quantity: '10',
        unit_cost: String(Math.round(variant.price * 0.75)),
      }]);
    } else {
      const first = availableVariants[0];
      setImportItems([{
        variant_id: first ? String(first.variant_id) : '',
        quantity: '10',
        unit_cost: first ? String(Math.round(first.price * 0.75)) : '',
      }]);
    }
    setImportNote('');
    setShowImportModal(true);
  };

  const handleAddImportRow = () => {
    setImportItems((prev) => [
      ...prev,
      { variant_id: '', quantity: '10', unit_cost: '' },
    ]);
  };

  const handleRemoveImportRow = (idx) => {
    setImportItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateImportRow = (idx, field, value) => {
    setImportItems((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        if (field === 'variant_id') {
          const selectedVar = availableVariants.find((v) => String(v.variant_id) === String(value));
          if (selectedVar && !item.unit_cost) {
            updated.unit_cost = String(Math.round(selectedVar.price * 0.75));
          }
        }
        return updated;
      })
    );
  };

  const importSummary = useMemo(() => {
    let totalQty = 0;
    let totalCost = 0;
    importItems.forEach((it) => {
      const q = parseInt(it.quantity, 10) || 0;
      const c = parseFloat(it.unit_cost) || 0;
      totalQty += q;
      totalCost += q * c;
    });
    return { totalQty, totalCost };
  }, [importItems]);

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importItems || importItems.length === 0) {
      return toast.warning('Vui lòng thêm ít nhất một mặt hàng cần nhập');
    }
    for (let i = 0; i < importItems.length; i++) {
      const it = importItems[i];
      const q = parseInt(it.quantity, 10);
      if (!it.variant_id) {
        return toast.warning(`Dòng #${i + 1}: Vui lòng chọn mặt hàng cần nhập`);
      }
      if (isNaN(q) || q <= 0) {
        return toast.warning(`Dòng #${i + 1}: Số lượng nhập phải lớn hơn 0`);
      }
    }

    setSubmittingImport(true);
    try {
      const res = await inventoryApi.importStock({
        supplier_id: importSupplierId ? parseInt(importSupplierId, 10) : undefined,
        note: importNote.trim(),
        items: importItems.map((it) => ({
          variant_id: parseInt(it.variant_id, 10),
          quantity: parseInt(it.quantity, 10),
          unit_cost: it.unit_cost ? parseFloat(it.unit_cost) : undefined,
        })),
      });
      if (res.success) {
        toast.success(res.message || 'Đã nhập kho thành công!');
        setShowImportModal(false);
        fetchInventory();
        fetchAllVariants();
        if (activeSubTab === 'history') fetchTransactions();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi nhập hàng vào kho');
    } finally {
      setSubmittingImport(false);
    }
  };

  // === XỬ LÝ XUẤT KHO NHIỀU MẶT HÀNG ===
  const handleOpenExport = (variant = null) => {
    if (variant) {
      setExportItems([{
        variant_id: String(variant.variant_id),
        quantity: '1',
      }]);
    } else {
      const available = availableVariants.find((v) => v.stock > 0);
      setExportItems([{
        variant_id: available ? String(available.variant_id) : '',
        quantity: '1',
      }]);
    }
    setExportType('adjustment');
    setExportReason('Kiểm kê / điều chuyển kho');
    setExportNote('');
    setShowExportModal(true);
  };

  const handleAddExportRow = () => {
    setExportItems((prev) => [
      ...prev,
      { variant_id: '', quantity: '1' },
    ]);
  };

  const handleRemoveExportRow = (idx) => {
    setExportItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateExportRow = (idx, field, value) => {
    setExportItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const exportSummary = useMemo(() => {
    let totalQty = 0;
    exportItems.forEach((it) => {
      const q = parseInt(it.quantity, 10) || 0;
      totalQty += q;
    });
    return { totalQty };
  }, [exportItems]);

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    if (!exportItems || exportItems.length === 0) {
      return toast.warning('Vui lòng thêm ít nhất một mặt hàng cần xuất');
    }
    for (let i = 0; i < exportItems.length; i++) {
      const it = exportItems[i];
      const q = parseInt(it.quantity, 10);
      if (!it.variant_id) {
        return toast.warning(`Dòng #${i + 1}: Vui lòng chọn mặt hàng cần xuất`);
      }
      if (isNaN(q) || q <= 0) {
        return toast.warning(`Dòng #${i + 1}: Số lượng xuất phải lớn hơn 0`);
      }
      const found = availableVariants.find((v) => String(v.variant_id) === String(it.variant_id));
      if (found && found.stock < q) {
        return toast.warning(`Dòng #${i + 1} (${found.sku}): Tồn kho chỉ còn ${found.stock}, không đủ để xuất ${q} chiếc!`);
      }
    }

    setSubmittingExport(true);
    try {
      const res = await inventoryApi.exportStock({
        transaction_type: exportType,
        reason: exportReason.trim(),
        note: exportNote.trim(),
        items: exportItems.map((it) => ({
          variant_id: parseInt(it.variant_id, 10),
          quantity: parseInt(it.quantity, 10),
        })),
      });
      if (res.success) {
        toast.success(res.message || 'Đã xuất kho thành công!');
        setShowExportModal(false);
        fetchInventory();
        fetchAllVariants();
        if (activeSubTab === 'history') fetchTransactions();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi xuất kho');
    } finally {
      setSubmittingExport(false);
    }
  };

  const handleCreateSupplier = async (e) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return toast.warning('Vui lòng nhập tên nhà cung cấp');
    setSubmittingSupplier(true);
    try {
      const res = await inventoryApi.createSupplier({
        supplier_name: newSupplierName.trim(),
        phone: newSupplierPhone.trim(),
        email: newSupplierEmail.trim(),
      });
      if (res.success && res.data) {
        toast.success(`Đã thêm nhà cung cấp "${newSupplierName.trim()}"`);
        setNewSupplierName(''); setNewSupplierPhone(''); setNewSupplierEmail('');
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

  const renderTxBadge = (type) => {
    const info = TX_BADGES[type] || { label: type, bg: '#F3F4F6', color: '#4B5563' };
    return <Chip label={info.label} size="small" sx={{ bgcolor: info.bg, color: info.color, fontWeight: 800, fontSize: 11, borderRadius: 1 }} />;
  };

  const kpis = [
    { title: 'Tổng số lượng tồn kho', main: summary.total_stock.toLocaleString(), unit: 'chiếc', sub: `${summary.total_variants} cấu hình / biến thể`, color: '#111827', subColor: '#10B981' },
    { title: 'Cảnh báo sắp hết kho', main: summary.low_stock_count, unit: 'mặt hàng (≤ 5)', sub: `${summary.out_of_stock_count} mặt hàng đã hết hẳn (0 chiếc)`, color: summary.low_stock_count > 0 ? '#D97706' : '#10B981', border: summary.low_stock_count > 0 ? '#FCD34D' : '#E5E7EB' },
    { title: 'Tổng lượt nhập kho', main: summary.total_imports, unit: 'lượt', sub: 'Tự động ghi nhận giao dịch', color: '#10B981' },
    { title: 'Tổng lượt xuất kho', main: summary.total_exports, unit: 'lượt', sub: 'Bán hàng & điều chuyển', color: '#E30019' },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 900 }}>📦 Quản lý kho hàng & Xuất Nhập Tồn</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.5 }}>
            Theo dõi tồn kho thời gian thực, nhập hàng từ nhà phân phối và quản lý xuất kho
          </Typography>
        </Box>
        <Stack direction="row" spacing={1.25}>
          <Button variant="contained" color="success" startIcon={<AddIcon />} onClick={() => handleOpenImport()}>
            + Nhập hàng (Nhiều SP)
          </Button>
          <Button variant="contained" color="primary" startIcon={<RemoveIcon />} onClick={() => handleOpenExport()}>
            - Xuất kho (Nhiều SP)
          </Button>
          <IconButton
            onClick={() => { fetchInventory(); fetchAllVariants(); if (activeSubTab === 'history') fetchTransactions(); }}
            sx={{ bgcolor: '#FFF', border: '1px solid #D1D5DB', borderRadius: 2 }}
            title="Làm mới dữ liệu kho"
          >
            <RestartAltIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1.75, mb: 2.5 }}>
        {kpis.map((k, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: 2, border: `1px solid ${k.border || '#E5E7EB'}` }}>
            <Typography sx={{ fontSize: 12, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>{k.title}</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: k.color, mt: 0.5 }}>
              {k.main} <Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>{k.unit}</Box>
            </Typography>
            <Typography sx={{ fontSize: 12, color: k.subColor || 'text.secondary', mt: 0.5, fontWeight: k.subColor ? 600 : 400 }}>{k.sub}</Typography>
          </Paper>
        ))}
      </Box>

      <Tabs value={activeSubTab} onChange={(_, v) => setActiveSubTab(v)} sx={{ mb: 2, borderBottom: '1px solid #E5E7EB' }}>
        <Tab value="items" label={`📦 Danh sách tồn kho (${summary.total_variants})`} sx={{ fontWeight: 800, textTransform: 'none' }} />
        <Tab value="history" label="📜 Lịch sử nhập / xuất kho" sx={{ fontWeight: 800, textTransform: 'none' }} />
      </Tabs>

      {activeSubTab === 'items' && (
        <Box>
          <Paper elevation={0} sx={{ p: 1.75, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
            <Stack direction="row" spacing={1.25} alignItems="center" sx={{ flex: 1, minWidth: 260 }}>
              <TextField
                size="small" placeholder="Tìm tên sản phẩm, mã SKU, phiên bản..." value={searchKeyword}
                onChange={(e) => { setSearchKeyword(e.target.value); setItemsPage(1); }}
                sx={{ maxWidth: 320, width: '100%' }}
              />
              <Button
                size="small"
                variant={filterLowStock ? 'contained' : 'outlined'}
                color={filterLowStock ? 'warning' : 'inherit'}
                onClick={() => { setFilterLowStock(!filterLowStock); setItemsPage(1); }}
                sx={{ whiteSpace: 'nowrap', fontSize: 12.5 }}
              >
                ⚠️ Chỉ xem sắp hết (≤ 5) {summary.low_stock_count > 0 ? `(${summary.low_stock_count})` : ''}
              </Button>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: 12.5, color: 'text.secondary', fontWeight: 600 }}>Sắp xếp:</Typography>
              <Select size="small" value={sortOption} onChange={(e) => { setSortOption(e.target.value); setItemsPage(1); }} sx={{ fontSize: 12.5 }}>
                <MenuItem value="stock_asc">Tồn kho: Thấp đến Cao (Ưu tiên nhập)</MenuItem>
                <MenuItem value="stock_desc">Tồn kho: Cao đến Thấp</MenuItem>
                <MenuItem value="name_asc">Tên sản phẩm: A - Z</MenuItem>
                <MenuItem value="newest">Mới cập nhật</MenuItem>
              </Select>
            </Stack>
          </Paper>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
            {loadingItems ? (
              <Box sx={{ textAlign: 'center', py: 4.5, color: 'text.secondary' }}>Đang tải dữ liệu kho hàng...</Box>
            ) : items.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4.5, color: 'text.secondary' }}>Không tìm thấy mặt hàng nào trong kho phù hợp với bộ lọc</Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Sản phẩm / Biến thể</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Mã SKU</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Danh mục / Hãng</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Giá niêm yết</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Tồn kho hiện tại</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Bảo hành</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: 12.5 }}>Thao tác kho</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((it) => {
                    const isLow = it.stock <= 5 && it.stock > 0;
                    const isOut = it.stock === 0;
                    return (
                      <TableRow key={it.variant_id} hover>
                        <TableCell sx={{ py: 1.5 }}>
                          <Stack direction="row" alignItems="center" spacing={1.25}>
                            <Box
                              component="img"
                              src={it.image_url || it.thumbnail_url || 'https://placehold.co/60x60?text=GearK'}
                              onError={(e) => { e.target.src = 'https://placehold.co/60x60?text=GearK'; }}
                              sx={{ width: 44, height: 44, objectFit: 'contain', borderRadius: 1.5, border: '1px solid #E5E7EB', bgcolor: '#FFF' }}
                            />
                            <Box>
                              <Typography sx={{ fontWeight: 800, fontSize: 13.5 }}>{it.product_name}</Typography>
                              <Typography sx={{ fontSize: 12, color: 'primary.main', fontWeight: 700 }}>Phiên bản: {it.variant_name}</Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 800, fontFamily: 'monospace' }}>{it.sku}</TableCell>
                        <TableCell sx={{ fontSize: 12.5 }}>
                          <Box color="text.secondary">{it.category_name || '—'}</Box>
                          <strong>{it.brand_name || 'GearK'}</strong>
                        </TableCell>
                        <TableCell sx={{ fontWeight: 700 }}>{formatPrice(it.sale_price || it.price)}</TableCell>
                        <TableCell>
                          <Chip
                            label={isOut ? '❌ Hết hàng (0)' : isLow ? `⚠️ Sắp hết (${it.stock})` : `✓ Còn ${it.stock} chiếc`}
                            size="small"
                            sx={{
                              fontWeight: 900, fontSize: 12, borderRadius: 1,
                              bgcolor: isOut ? '#FEE2E2' : isLow ? '#FEF3C7' : '#DCFCE7',
                              color: isOut ? '#B91C1C' : isLow ? '#B45309' : '#15803D',
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 12.5 }}>{it.warranty_months} tháng</TableCell>
                        <TableCell align="right">
                          <Stack direction="row" justifyContent="flex-end" spacing={0.75}>
                            <Button size="small" variant="contained" color="success" onClick={() => handleOpenImport(it)} sx={{ py: 0.4, px: 1.25, fontSize: 12 }}>
                              📥 Nhập
                            </Button>
                            <Button size="small" variant="contained" color="primary" disabled={isOut} onClick={() => handleOpenExport(it)} sx={{ py: 0.4, px: 1.25, fontSize: 12 }}>
                              📤 Xuất
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {itemsTotalPages > 1 && (
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ p: 2, bgcolor: '#FAFAFA', borderTop: '1px solid #E5E7EB' }}>
                <Button size="small" variant="outlined" disabled={itemsPage === 1} onClick={() => setItemsPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Trang {itemsPage} / {itemsTotalPages}</Typography>
                <Button size="small" variant="outlined" disabled={itemsPage === itemsTotalPages} onClick={() => setItemsPage((p) => Math.min(itemsTotalPages, p + 1))}>Trang sau</Button>
              </Stack>
            )}
          </TableContainer>
        </Box>
      )}

      {activeSubTab === 'history' && (
        <Box>
          <Paper elevation={0} sx={{ p: 1.75, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <TextField
              size="small" placeholder="Tìm mã SKU, tên sản phẩm, ghi chú..." value={txSearch}
              onChange={(e) => { setTxSearch(e.target.value); setTxPage(1); }}
              sx={{ maxWidth: 320, width: '100%' }}
            />
            <Select size="small" value={txTypeFilter} onChange={(e) => { setTxTypeFilter(e.target.value); setTxPage(1); }} sx={{ fontSize: 12.5 }}>
              <MenuItem value="all">Tất cả loại giao dịch</MenuItem>
              <MenuItem value="purchase">📥 Nhập hàng (Purchase)</MenuItem>
              <MenuItem value="sale">🛒 Xuất bán (Sale)</MenuItem>
              <MenuItem value="adjustment">🔄 Xuất điều chỉnh / Kiểm kê (Adjustment)</MenuItem>
              <MenuItem value="damage">⚠️ Xuất hủy hàng hỏng (Damage)</MenuItem>
              <MenuItem value="return">↩️ Hoàn trả (Return)</MenuItem>
            </Select>
          </Paper>

          <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
            {loadingTx ? (
              <Box sx={{ textAlign: 'center', py: 4.5, color: 'text.secondary' }}>Đang tải lịch sử xuất nhập kho...</Box>
            ) : transactions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4.5, color: 'text.secondary' }}>Chưa có giao dịch kho nào được ghi nhận</Box>
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Mã GD & Thời gian</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Sản phẩm / Biến thể</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Loại giao dịch</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Biến động số lượng</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Tồn kho sau GD</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Người thực hiện</TableCell>
                    <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Ghi chú / Lý do</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => {
                    const isPos = tx.quantity_delta > 0;
                    return (
                      <TableRow key={tx.inventory_transaction_id} hover>
                        <TableCell sx={{ py: 1.5 }}>
                          <Typography sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main', fontSize: 13 }}>#{tx.inventory_transaction_id}</Typography>
                          <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>{formatDate(tx.created_at)}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>{tx.product_name}</Typography>
                          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{tx.variant_name} • <Box component="span" sx={{ fontFamily: 'monospace' }}>{tx.sku}</Box></Typography>
                        </TableCell>
                        <TableCell>{renderTxBadge(tx.transaction_type)}</TableCell>
                        <TableCell sx={{ fontWeight: 900, fontSize: 14, color: isPos ? '#15803D' : '#B91C1C', fontFamily: 'monospace' }}>
                          {isPos ? `+${tx.quantity_delta}` : tx.quantity_delta}
                        </TableCell>
                        <TableCell><strong>{tx.stock_after}</strong> chiếc</TableCell>
                        <TableCell sx={{ fontSize: 12.5, color: 'text.secondary' }}>{tx.created_by_name || 'Hệ thống'}</TableCell>
                        <TableCell sx={{ fontSize: 12.5, maxWidth: 260 }}>{tx.note || '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}

            {txTotalPages > 1 && (
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ p: 2, bgcolor: '#FAFAFA', borderTop: '1px solid #E5E7EB' }}>
                <Button size="small" variant="outlined" disabled={txPage === 1} onClick={() => setTxPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Trang {txPage} / {txTotalPages}</Typography>
                <Button size="small" variant="outlined" disabled={txPage === txTotalPages} onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}>Trang sau</Button>
              </Stack>
            )}
          </TableContainer>
        </Box>
      )}

      {/* ========================================================= */}
      {/* MODAL: NHẬP HÀNG VÀO KHO (HỖ TRỢ NHIỀU SẢN PHẨM)         */}
      {/* ========================================================= */}
      <Dialog open={showImportModal} onClose={() => setShowImportModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#DCFCE7', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AddIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Phiếu nhập hàng vào kho (Import Stock)</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Hỗ trợ nhập cùng lúc nhiều mặt hàng vào kho</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setShowImportModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleImportSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Danh sách các mặt hàng nhập */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#1E293B' }}>
                  Danh sách mặt hàng cần nhập ({importItems.length})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddImportRow}
                  sx={{ fontSize: 12, fontWeight: 700 }}
                >
                  + Thêm mặt hàng khác
                </Button>
              </Stack>

              <Stack spacing={1.5}>
                {importItems.map((item, idx) => {
                  const selectedVar = availableVariants.find((v) => String(v.variant_id) === String(item.variant_id));
                  const curStock = selectedVar ? selectedVar.stock : 0;
                  const addQty = parseInt(item.quantity, 10) || 0;
                  const afterStock = curStock + addQty;

                  return (
                    <Paper
                      key={idx}
                      elevation={0}
                      sx={{
                        p: 1.75,
                        borderRadius: 2,
                        border: '1px solid #E2E8F0',
                        bgcolor: '#FAFAFA',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.25,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: 'primary.main' }}>
                          Mặt hàng #{idx + 1}
                        </Typography>
                        {importItems.length > 1 && (
                          <Tooltip title="Xóa mặt hàng này">
                            <IconButton size="small" color="error" onClick={() => handleRemoveImportRow(idx)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr 1fr' }, gap: 1.5 }}>
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>Chọn mặt hàng / biến thể *</Typography>
                          <Select
                            fullWidth
                            size="small"
                            required
                            displayEmpty
                            value={item.variant_id}
                            onChange={(e) => handleUpdateImportRow(idx, 'variant_id', e.target.value)}
                            sx={{ bgcolor: '#FFF', fontSize: 13 }}
                          >
                            <MenuItem value="">-- Chọn biến thể sản phẩm --</MenuItem>
                            {availableVariants.map((it) => (
                              <MenuItem key={it.variant_id} value={String(it.variant_id)}>
                                {it.product_name} - {it.variant_name} (SKU: {it.sku} - Tồn: {it.stock})
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>

                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>Số lượng nhập *</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            required
                            inputProps={{ min: 1 }}
                            value={item.quantity}
                            onChange={(e) => handleUpdateImportRow(idx, 'quantity', e.target.value)}
                            sx={{ bgcolor: '#FFF' }}
                          />
                        </Box>

                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>Đơn giá vốn (₫)</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            inputProps={{ min: 0, step: 1000 }}
                            value={item.unit_cost}
                            onChange={(e) => handleUpdateImportRow(idx, 'unit_cost', e.target.value)}
                            sx={{ bgcolor: '#FFF' }}
                          />
                        </Box>
                      </Box>

                      {selectedVar && (
                        <Stack direction="row" spacing={2} sx={{ fontSize: 11.5, color: '#047857', bgcolor: '#ECFDF5', p: 0.75, borderRadius: 1 }}>
                          <Box>SKU: <strong>{selectedVar.sku}</strong></Box>
                          <Box>Tồn hiện tại: <strong>{curStock}</strong> chiếc</Box>
                          <Box>Tồn sau nhập: <strong>{afterStock}</strong> chiếc</Box>
                          {item.unit_cost && (
                            <Box sx={{ ml: 'auto !important' }}>
                              Thành tiền: <strong>{formatPrice((parseInt(item.quantity, 10) || 0) * (parseFloat(item.unit_cost) || 0))}</strong>
                            </Box>
                          )}
                        </Stack>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            {/* Khối thống kê tổng phiếu nhập */}
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#F0FDF4', border: '1px solid #BBF7D0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>Tổng cộng phiếu nhập:</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#15803D' }}>
                  {importItems.length} mặt hàng • {importSummary.totalQty} sản phẩm
                </Typography>
              </Box>
              {importSummary.totalCost > 0 && (
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 12, color: '#166534', fontWeight: 600 }}>Tổng giá trị vốn dự kiến:</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: '#15803D' }}>
                    {formatPrice(importSummary.totalCost)}
                  </Typography>
                </Box>
              )}
            </Paper>

            <Divider />

            {/* Thông tin nhà cung cấp & Ghi chú */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Nhà phân phối / Cung cấp</Typography>
                  <Button size="small" onClick={() => setShowAddSupplier(!showAddSupplier)} sx={{ py: 0, fontSize: 11.5, fontWeight: 700 }}>
                    {showAddSupplier ? 'Hủy' : '+ Thêm NCC mới'}
                  </Button>
                </Stack>

                {showAddSupplier ? (
                  <Paper elevation={0} sx={{ bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 2, p: 1.25 }}>
                    <TextField fullWidth size="small" placeholder="Tên nhà cung cấp..." value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} sx={{ mb: 1, bgcolor: '#FFF' }} />
                    <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1 }}>
                      <TextField fullWidth size="small" placeholder="Số điện thoại" value={newSupplierPhone} onChange={(e) => setNewSupplierPhone(e.target.value)} sx={{ bgcolor: '#FFF' }} />
                      <TextField fullWidth size="small" type="email" placeholder="Email" value={newSupplierEmail} onChange={(e) => setNewSupplierEmail(e.target.value)} sx={{ bgcolor: '#FFF' }} />
                    </Box>
                    <Button size="small" variant="contained" color="secondary" disabled={submittingSupplier} onClick={handleCreateSupplier}>
                      {submittingSupplier ? 'Đang lưu...' : 'Lưu nhà cung cấp'}
                    </Button>
                  </Paper>
                ) : (
                  <Select fullWidth size="small" displayEmpty value={importSupplierId} onChange={(e) => setImportSupplierId(e.target.value)}>
                    <MenuItem value="">-- Chọn nhà cung cấp (Tùy chọn) --</MenuItem>
                    {suppliers.map((s) => (
                      <MenuItem key={s.supplier_id} value={String(s.supplier_id)}>
                        {s.supplier_name} {s.phone ? `(${s.phone})` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                )}
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Ghi chú đợt nhập hàng</Typography>
                <TextField
                  fullWidth
                  size="small"
                  multiline
                  rows={2}
                  placeholder="VD: Nhập đợt hàng tháng 10 từ NPP Viễn Sơn..."
                  value={importNote}
                  onChange={(e) => setImportNote(e.target.value)}
                />
              </Box>
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <Button variant="outlined" color="inherit" onClick={() => setShowImportModal(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="success" disabled={submittingImport} sx={{ fontWeight: 800 }}>
              {submittingImport
                ? 'Đang cập nhật kho...'
                : `Xác nhận nhập kho (${importItems.length} mặt hàng, ${importSummary.totalQty} sản phẩm)`}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* ========================================================= */}
      {/* MODAL: XUẤT HÀNG KHỎI KHO (HỖ TRỢ NHIỀU SẢN PHẨM)        */}
      {/* ========================================================= */}
      <Dialog open={showExportModal} onClose={() => setShowExportModal(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2, bgcolor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RemoveIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Phiếu xuất hàng khỏi kho (Export Stock)</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Hỗ trợ xuất cùng lúc nhiều mặt hàng (kiểm kê, hư hỏng, điều chuyển...)</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setShowExportModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleExportSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            {/* Danh sách các mặt hàng xuất */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography sx={{ fontSize: 13.5, fontWeight: 800, color: '#1E293B' }}>
                  Danh sách mặt hàng cần xuất ({exportItems.length})
                </Typography>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddExportRow}
                  sx={{ fontSize: 12, fontWeight: 700 }}
                >
                  + Thêm mặt hàng khác
                </Button>
              </Stack>

              <Stack spacing={1.5}>
                {exportItems.map((item, idx) => {
                  const selectedVar = availableVariants.find((v) => String(v.variant_id) === String(item.variant_id));
                  const curStock = selectedVar ? selectedVar.stock : 0;
                  const expQty = parseInt(item.quantity, 10) || 0;
                  const afterStock = Math.max(0, curStock - expQty);
                  const isOver = curStock < expQty;

                  return (
                    <Paper
                      key={idx}
                      elevation={0}
                      sx={{
                        p: 1.75,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: isOver ? '#FCA5A5' : '#E2E8F0',
                        bgcolor: isOver ? '#FEF2F2' : '#FAFAFA',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.25,
                      }}
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography sx={{ fontSize: 12.5, fontWeight: 700, color: isOver ? 'error.main' : '#334155' }}>
                          Mặt hàng #{idx + 1}
                        </Typography>
                        {exportItems.length > 1 && (
                          <Tooltip title="Xóa mặt hàng này">
                            <IconButton size="small" color="error" onClick={() => handleRemoveExportRow(idx)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>

                      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '2fr 1fr' }, gap: 1.5 }}>
                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>Chọn mặt hàng / biến thể cần xuất *</Typography>
                          <Select
                            fullWidth
                            size="small"
                            required
                            displayEmpty
                            value={item.variant_id}
                            onChange={(e) => handleUpdateExportRow(idx, 'variant_id', e.target.value)}
                            sx={{ bgcolor: '#FFF', fontSize: 13 }}
                          >
                            <MenuItem value="">-- Chọn biến thể sản phẩm --</MenuItem>
                            {availableVariants.map((it) => (
                              <MenuItem key={it.variant_id} value={String(it.variant_id)} disabled={it.stock === 0}>
                                {it.product_name} - {it.variant_name} (SKU: {it.sku} - Tồn: {it.stock}) {it.stock === 0 ? '(Hết hàng)' : ''}
                              </MenuItem>
                            ))}
                          </Select>
                        </Box>

                        <Box>
                          <Typography sx={{ fontSize: 12, fontWeight: 700, mb: 0.5 }}>Số lượng xuất *</Typography>
                          <TextField
                            fullWidth
                            size="small"
                            type="number"
                            required
                            inputProps={{ min: 1, max: selectedVar ? selectedVar.stock : undefined }}
                            value={item.quantity}
                            onChange={(e) => handleUpdateExportRow(idx, 'quantity', e.target.value)}
                            error={isOver}
                            helperText={isOver ? `Vượt quá tồn kho (chỉ còn ${curStock})` : ''}
                            sx={{ bgcolor: '#FFF' }}
                          />
                        </Box>
                      </Box>

                      {selectedVar && (
                        <Stack direction="row" spacing={2} sx={{ fontSize: 11.5, color: isOver ? '#B91C1C' : '#991B1B', bgcolor: isOver ? '#FEE2E2' : '#FFF1F2', p: 0.75, borderRadius: 1 }}>
                          <Box>SKU: <strong>{selectedVar.sku}</strong></Box>
                          <Box>Tồn hiện tại: <strong>{curStock}</strong> chiếc</Box>
                          <Box>Tồn sau xuất: <strong>{afterStock}</strong> chiếc</Box>
                        </Stack>
                      )}
                    </Paper>
                  );
                })}
              </Stack>
            </Box>

            {/* Khối thống kê tổng phiếu xuất */}
            <Paper elevation={0} sx={{ p: 1.5, borderRadius: 2, bgcolor: '#FFF1F2', border: '1px solid #FECDD3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontSize: 12, color: '#9F1239', fontWeight: 600 }}>Tổng cộng phiếu xuất:</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#BE123C' }}>
                  {exportItems.length} mặt hàng • {exportSummary.totalQty} sản phẩm
                </Typography>
              </Box>
            </Paper>

            <Divider />

            {/* Thông tin loại xuất & Lý do */}
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Loại xuất kho *</Typography>
                <Select
                  fullWidth
                  size="small"
                  required
                  value={exportType}
                  onChange={(e) => {
                    setExportType(e.target.value);
                    setExportReason(e.target.value === 'damage' ? 'Xuất hủy hàng lỗi / hỏng / vỡ màn hình' : 'Kiểm kê / điều chuyển kho');
                  }}
                >
                  <MenuItem value="adjustment">🔄 Xuất điều chỉnh / Kiểm kê</MenuItem>
                  <MenuItem value="damage">⚠️ Xuất hủy hàng lỗi / hỏng</MenuItem>
                  <MenuItem value="sale">🛒 Xuất bán lẻ trực tiếp</MenuItem>
                </Select>
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Lý do xuất kho *</Typography>
                <TextField
                  fullWidth
                  size="small"
                  required
                  value={exportReason}
                  onChange={(e) => setExportReason(e.target.value)}
                />
              </Box>
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Ghi chú chi tiết</Typography>
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                placeholder="Thông tin thêm, người nhận hàng, biên bản bàn giao..."
                value={exportNote}
                onChange={(e) => setExportNote(e.target.value)}
              />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2, bgcolor: '#F8FAFC', borderTop: '1px solid #E2E8F0' }}>
            <Button variant="outlined" color="inherit" onClick={() => setShowExportModal(false)}>Hủy</Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={submittingExport}
              sx={{ fontWeight: 800 }}
            >
              {submittingExport
                ? 'Đang xử lý xuất kho...'
                : `Xác nhận xuất kho (${exportItems.length} mặt hàng, ${exportSummary.totalQty} sản phẩm)`}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
