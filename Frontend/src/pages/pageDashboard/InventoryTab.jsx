import React, { useState, useEffect, useCallback } from 'react';
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

import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import CloseIcon from '@mui/icons-material/Close';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

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

  const [importVariantId, setImportVariantId] = useState('');
  const [importQty, setImportQty] = useState('10');
  const [importUnitCost, setImportUnitCost] = useState('');
  const [importSupplierId, setImportSupplierId] = useState('');
  const [importNote, setImportNote] = useState('');
  const [submittingImport, setSubmittingImport] = useState(false);

  const [exportVariantId, setExportVariantId] = useState('');
  const [exportQty, setExportQty] = useState('1');
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
  useEffect(() => { if (activeSubTab === 'history') fetchTransactions(); }, [activeSubTab, fetchTransactions]);
  useEffect(() => { fetchSuppliers(); }, [fetchSuppliers]);

  const handleOpenImport = (variant = null) => {
    const target = variant || items[0];
    if (target) {
      setImportVariantId(String(target.variant_id));
      setImportUnitCost(String(Math.round(target.price * 0.75)));
    }
    setImportQty('10');
    setImportNote('');
    setShowImportModal(true);
  };

  const handleOpenExport = (variant = null) => {
    const target = variant || items[0];
    if (target) setExportVariantId(String(target.variant_id));
    setExportQty('1');
    setExportType('adjustment');
    setExportReason('Kiểm kê / điều chuyển kho');
    setExportNote('');
    setShowExportModal(true);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(importQty, 10);
    if (!importVariantId || isNaN(qty) || qty <= 0) return toast.warning('Vui lòng chọn biến thể và nhập số lượng hợp lệ (> 0)');
    setSubmittingImport(true);
    try {
      const res = await inventoryApi.importStock({
        variant_id: parseInt(importVariantId, 10),
        quantity: qty,
        unit_cost: importUnitCost ? parseFloat(importUnitCost) : undefined,
        supplier_id: importSupplierId ? parseInt(importSupplierId, 10) : undefined,
        note: importNote.trim(),
      });
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

  const handleExportSubmit = async (e) => {
    e.preventDefault();
    const qty = parseInt(exportQty, 10);
    if (!exportVariantId || isNaN(qty) || qty <= 0) return toast.warning('Vui lòng chọn biến thể và nhập số lượng xuất hợp lệ (> 0)');
    setSubmittingExport(true);
    try {
      const res = await inventoryApi.exportStock({
        variant_id: parseInt(exportVariantId, 10),
        quantity: qty,
        transaction_type: exportType,
        reason: exportReason,
        note: exportNote.trim(),
      });
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

  const currentSelectedForImport = items.find((it) => String(it.variant_id) === String(importVariantId));
  const currentSelectedForExport = items.find((it) => String(it.variant_id) === String(exportVariantId));

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
            + Nhập hàng
          </Button>
          <Button variant="contained" color="primary" startIcon={<RemoveIcon />} onClick={() => handleOpenExport()}>
            - Xuất thêm
          </Button>
          <IconButton
            onClick={() => { fetchInventory(); if (activeSubTab === 'history') fetchTransactions(); }}
            sx={{ bgcolor: '#FFF', border: '1px solid #D1D5DB', borderRadius: 2 }}
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
                  <TableRow>
                    <TableCell>Sản phẩm / Biến thể</TableCell>
                    <TableCell>Mã SKU</TableCell>
                    <TableCell>Danh mục / Hãng</TableCell>
                    <TableCell>Giá niêm yết</TableCell>
                    <TableCell>Tồn kho hiện tại</TableCell>
                    <TableCell>Bảo hành</TableCell>
                    <TableCell align="right">Thao tác kho</TableCell>
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
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ p: 2 }}>
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
                  <TableRow>
                    <TableCell>Mã GD & Thời gian</TableCell>
                    <TableCell>Sản phẩm / Biến thể</TableCell>
                    <TableCell>Loại giao dịch</TableCell>
                    <TableCell>Biến động số lượng</TableCell>
                    <TableCell>Tồn kho sau GD</TableCell>
                    <TableCell>Người thực hiện</TableCell>
                    <TableCell>Ghi chú / Lý do</TableCell>
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
              <Stack direction="row" justifyContent="center" alignItems="center" spacing={1.5} sx={{ p: 2 }}>
                <Button size="small" variant="outlined" disabled={txPage === 1} onClick={() => setTxPage((p) => Math.max(1, p - 1))}>Trang trước</Button>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Trang {txPage} / {txTotalPages}</Typography>
                <Button size="small" variant="outlined" disabled={txPage === txTotalPages} onClick={() => setTxPage((p) => Math.min(txTotalPages, p + 1))}>Trang sau</Button>
              </Stack>
            )}
          </TableContainer>
        </Box>
      )}

      {/* Modal: Import Stock */}
      <Dialog open={showImportModal} onClose={() => setShowImportModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#DCFCE7', color: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AddIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Nhập hàng vào kho (Import Stock)</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Tăng số lượng tồn kho và ghi nhật ký giao dịch</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setShowImportModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleImportSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Chọn mặt hàng / biến thể cần nhập *</Typography>
              <Select
                fullWidth size="small" required displayEmpty value={importVariantId}
                onChange={(e) => {
                  setImportVariantId(e.target.value);
                  const sel = items.find((it) => String(it.variant_id) === e.target.value);
                  if (sel) setImportUnitCost(String(Math.round(sel.price * 0.75)));
                }}
              >
                <MenuItem value="">-- Chọn biến thể sản phẩm --</MenuItem>
                {items.map((it) => (
                  <MenuItem key={it.variant_id} value={String(it.variant_id)}>
                    {it.product_name} - {it.variant_name} (SKU: {it.sku} - Tồn hiện tại: {it.stock})
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {currentSelectedForImport && (
              <Paper elevation={0} sx={{ bgcolor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 2, p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#065F46' }}>Tồn kho hiện tại: {currentSelectedForImport.stock} chiếc</Typography>
                  <Typography sx={{ fontSize: 12, color: '#047857' }}>Mã SKU: <strong>{currentSelectedForImport.sku}</strong></Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 11, color: '#047857', fontWeight: 600 }}>Tồn sau khi nhập:</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: '#065F46' }}>
                    {currentSelectedForImport.stock + (parseInt(importQty, 10) || 0)} chiếc
                  </Typography>
                </Box>
              </Paper>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Số lượng nhập thêm *</Typography>
                <TextField fullWidth size="small" type="number" required inputProps={{ min: 1 }} value={importQty} onChange={(e) => setImportQty(e.target.value)} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Đơn giá nhập vốn (₫)</Typography>
                <TextField fullWidth size="small" type="number" inputProps={{ min: 0, step: 1000 }} value={importUnitCost} onChange={(e) => setImportUnitCost(e.target.value)} />
              </Box>
            </Box>

            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700 }}>Nhà phân phối / Cung cấp</Typography>
                <Button size="small" onClick={() => setShowAddSupplier(!showAddSupplier)} sx={{ py: 0, fontSize: 12, fontWeight: 700 }}>
                  {showAddSupplier ? 'Hủy thêm NCC' : '+ Thêm NCC mới'}
                </Button>
              </Stack>

              {showAddSupplier ? (
                <Paper elevation={0} sx={{ bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', borderRadius: 2, p: 1.5 }}>
                  <TextField fullWidth size="small" placeholder="Tên nhà cung cấp (VD: Asus ROG VN)..." value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} sx={{ mb: 1, bgcolor: '#FFF' }} />
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
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Ghi chú nhập hàng</Typography>
              <TextField fullWidth size="small" multiline rows={2} placeholder="VD: Nhập hàng đợt 1 từ NPP Viễn Sơn..." value={importNote} onChange={(e) => setImportNote(e.target.value)} />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => setShowImportModal(false)}>Hủy</Button>
            <Button type="submit" variant="contained" color="success" disabled={submittingImport}>
              {submittingImport ? 'Đang cập nhật kho...' : 'Xác nhận nhập kho'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Modal: Export Stock */}
      <Dialog open={showExportModal} onClose={() => setShowExportModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <RemoveIcon />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Xuất hàng khỏi kho (Export Stock)</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>Giảm trừ số lượng tồn kho (kiểm kê, hư hỏng, điều chuyển...)</Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setShowExportModal(false)}><CloseIcon /></IconButton>
        </DialogTitle>

        <Box component="form" onSubmit={handleExportSubmit}>
          <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Chọn mặt hàng / biến thể cần xuất *</Typography>
              <Select fullWidth size="small" required displayEmpty value={exportVariantId} onChange={(e) => setExportVariantId(e.target.value)}>
                <MenuItem value="">-- Chọn biến thể sản phẩm --</MenuItem>
                {items.map((it) => (
                  <MenuItem key={it.variant_id} value={String(it.variant_id)}>
                    {it.product_name} - {it.variant_name} (SKU: {it.sku} - Tồn: {it.stock})
                  </MenuItem>
                ))}
              </Select>
            </Box>

            {currentSelectedForExport && (
              <Paper elevation={0} sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 2, p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography sx={{ fontSize: 13, fontWeight: 800, color: '#991B1B' }}>Tồn kho hiện tại: {currentSelectedForExport.stock} chiếc</Typography>
                  <Typography sx={{ fontSize: 12, color: '#B91C1C' }}>Mã SKU: <strong>{currentSelectedForExport.sku}</strong></Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography sx={{ fontSize: 11, color: '#B91C1C', fontWeight: 600 }}>Tồn sau khi xuất:</Typography>
                  <Typography sx={{ fontSize: 16, fontWeight: 900, color: '#991B1B' }}>
                    {Math.max(0, currentSelectedForExport.stock - (parseInt(exportQty, 10) || 0))} chiếc
                  </Typography>
                </Box>
              </Paper>
            )}

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Số lượng xuất kho *</Typography>
                <TextField
                  fullWidth size="small" type="number" required
                  inputProps={{ min: 1, max: currentSelectedForExport ? currentSelectedForExport.stock : undefined }}
                  value={exportQty} onChange={(e) => setExportQty(e.target.value)}
                />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Loại xuất kho *</Typography>
                <Select
                  fullWidth size="small" required value={exportType}
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
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Lý do xuất kho *</Typography>
              <TextField fullWidth size="small" required value={exportReason} onChange={(e) => setExportReason(e.target.value)} />
            </Box>

            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Ghi chú chi tiết</Typography>
              <TextField fullWidth size="small" multiline rows={2} placeholder="Thông tin thêm, người nhận hàng, biên bản bàn giao..." value={exportNote} onChange={(e) => setExportNote(e.target.value)} />
            </Box>
          </DialogContent>

          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => setShowExportModal(false)}>Hủy</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submittingExport || (currentSelectedForExport && currentSelectedForExport.stock < parseInt(exportQty, 10))}
            >
              {submittingExport ? 'Đang xử lý xuất kho...' : 'Xác nhận xuất kho'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
