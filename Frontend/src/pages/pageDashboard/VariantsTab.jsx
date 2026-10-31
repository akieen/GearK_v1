import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import AdminPagination from '../../components/common/AdminPagination';
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
import CircularProgress from '@mui/material/CircularProgress';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

import { productApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import ImageUploadField from '../../components/common/ImageUploadField';
import { generateSku } from '../../utils/formatters';

const PRESETS = {
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

export default function VariantsTab({ products, formatPrice, isAdmin, Icons, targetProductId }) {
  const toast = useToast();
  const [selectedProductId, setSelectedProductId] = useState(targetProductId || '');
  const [productDetail, setProductDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

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

  const [managingVariantImages, setManagingVariantImages] = useState(null);
  const [uploadingVariantImg, setUploadingVariantImg] = useState(false);
  const variantFileInputRef = useRef(null);
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [showAddUrlInput, setShowAddUrlInput] = useState(false);

  const [editingVariant, setEditingVariant] = useState(null);
  const [editVariantName, setEditVariantName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editSalePrice, setEditSalePrice] = useState('');
  const [editStock, setEditStock] = useState('');
  const [editWarranty, setEditWarranty] = useState('12');
  const [editSpecsList, setEditSpecsList] = useState([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!skuManuallyEdited && showAddForm) {
      const prodName = productDetail?.product_name || products?.find((p) => p.product_id === parseInt(selectedProductId, 10))?.product_name || '';
      if (prodName || newVariantName) setNewSku(generateSku(prodName, newVariantName));
    }
  }, [newVariantName, showAddForm, skuManuallyEdited, productDetail, selectedProductId, products]);

  const handleRegenerateSku = () => {
    const prodName = productDetail?.product_name || products?.find((p) => p.product_id === parseInt(selectedProductId, 10))?.product_name || '';
    setNewSku(generateSku(prodName, newVariantName));
    setSkuManuallyEdited(false);
  };

  const addSpecRow = (setter) => setter((prev) => [...prev, { key: '', value: '' }]);
  const removeSpecRow = (setter, idx) => setter((prev) => prev.filter((_, i) => i !== idx));
  const updateSpecRow = (setter, idx, field, val) => setter((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: val } : item)));
  const applyPreset = (setter, type) => PRESETS[type] && setter(PRESETS[type].map((item) => ({ ...item })));

  const parseSpecsToObj = (list) => {
    const obj = {};
    list.forEach((item) => {
      if (item.key?.trim()) obj[item.key.trim()] = item.value ? item.value.trim() : '';
    });
    return Object.keys(obj).length > 0 ? obj : null;
  };

  useEffect(() => {
    if (targetProductId) setSelectedProductId(targetProductId);
    else if (products.length > 0 && !selectedProductId) setSelectedProductId(products[0].product_id);
  }, [products, selectedProductId, targetProductId]);

  const fetchVariants = useCallback(async (prodId) => {
    if (!prodId) return;
    setLoadingDetail(true);
    try {
      const res = await productApi.getProductById(prodId);
      if (res.success && res.data) {
        setProductDetail(res.data);
        return res.data;
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải biến thể sản phẩm');
    } finally {
      setLoadingDetail(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedProductId) {
      setPage(0);
      fetchVariants(selectedProductId);
    }
  }, [selectedProductId, fetchVariants]);

  const refreshManagedVariant = async (variantId) => {
    const data = await fetchVariants(selectedProductId);
    const updated = data?.variants?.find((v) => v.variant_id === variantId);
    if (updated) setManagingVariantImages(updated);
  };

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    if (!newVariantName.trim() || !newPrice) return toast.warning('Vui lòng nhập tên biến thể và giá bán');
    setSubmitting(true);
    try {
      const prodName = productDetail?.product_name || products?.find((p) => p.product_id === parseInt(selectedProductId, 10))?.product_name || '';
      const finalSku = (newSku.trim() || generateSku(prodName, newVariantName)).toUpperCase();
      const res = await productApi.addVariant(selectedProductId, {
        sku: finalSku,
        variant_name: newVariantName.trim(),
        price: parseFloat(newPrice),
        sale_price: newSalePrice ? parseFloat(newSalePrice) : null,
        stock: parseInt(newStock) || 0,
        warranty_months: parseInt(newWarranty) || 12,
        specifications: parseSpecsToObj(newSpecsList),
        images: newVariantImages,
      });
      if (res.success) {
        toast.success(`Đã thêm biến thể "${newVariantName.trim()}" kèm danh sách ảnh!`);
        setNewSku(''); setSkuManuallyEdited(false); setNewVariantName(''); setNewPrice(''); setNewSalePrice('');
        setNewStock('10'); setNewSpecsList([{ key: 'Màu sắc', value: '' }, { key: 'Bảo hành', value: '24 tháng' }]);
        setNewVariantImages([]); setShowAddForm(false);
        fetchVariants(selectedProductId);
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi thêm biến thể');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddImagesToVariant = async (files) => {
    if (!managingVariantImages || !files?.length) return;
    setUploadingVariantImg(true);
    try {
      for (let i = 0; i < files.length; i++) {
        await productApi.addVariantImage(managingVariantImages.variant_id, files[i]);
      }
      toast.success(`Đã thêm ${files.length} ảnh cho biến thể thành công!`);
      await refreshManagedVariant(managingVariantImages.variant_id);
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
      await refreshManagedVariant(managingVariantImages.variant_id);
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
        if (managingVariantImages) await refreshManagedVariant(managingVariantImages.variant_id);
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
        if (managingVariantImages) await refreshManagedVariant(managingVariantImages.variant_id);
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
      try { parsed = JSON.parse(parsed); } catch { parsed = null; }
    }
    if (parsed && typeof parsed === 'object') {
      const list = Object.entries(parsed).map(([k, val]) => ({ key: k, value: typeof val === 'object' ? JSON.stringify(val) : String(val) }));
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
      const res = await productApi.updateVariant(editingVariant.variant_id, {
        variant_name: editVariantName.trim() || editingVariant.variant_name,
        price: parseFloat(editPrice),
        sale_price: editSalePrice ? parseFloat(editSalePrice) : null,
        stock: parseInt(editStock),
        warranty_months: parseInt(editWarranty) || 12,
        specifications: parseSpecsToObj(editSpecsList),
      });
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
    if (productDetail?.variants?.length <= 1) return toast.warning('Sản phẩm phải có ít nhất 1 biến thể!');
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

  const renderSpecsEditor = (specsList, setSpecsList) => (
    <Paper elevation={0} sx={{ mt: 2, p: 2, bgcolor: '#F9FAFB', borderRadius: 2, border: '1px solid #E5E7EB' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 1.5 }}>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 800 }}>⚡ Thông số kỹ thuật (Cột `specifications` JSON)</Typography>
          <Typography sx={{ fontSize: 11.5, color: 'text.secondary' }}>
            Nhập các cặp Tên thông số - Giá trị. Lưu tự động dưới dạng JSON trong MySQL.
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" spacing={0.75} flexWrap="wrap">
          <Typography sx={{ fontSize: 11, fontWeight: 700, color: 'text.disabled' }}>Mẫu nhanh:</Typography>
          {[
            { id: 'mouse', label: '🖱️ Chuột' },
            { id: 'keyboard', label: '⌨️ Bàn phím' },
            { id: 'headphone', label: '🎧 Tai nghe' },
            { id: 'monitor', label: '🖥️ Màn hình' },
          ].map((p) => (
            <Button key={p.id} size="small" variant="outlined" onClick={() => applyPreset(setSpecsList, p.id)} sx={{ py: 0.25, px: 1, fontSize: 11, bgcolor: '#FFF', borderColor: '#D1D5DB', color: 'text.primary' }}>
              {p.label}
            </Button>
          ))}
        </Stack>
      </Stack>

      <Stack spacing={1}>
        {specsList.map((item, idx) => (
          <Stack key={idx} direction="row" alignItems="center" spacing={1}>
            <TextField
              size="small" placeholder="Tên thông số (VD: Màu sắc, DPI, Switch...)" value={item.key}
              onChange={(e) => updateSpecRow(setSpecsList, idx, 'key', e.target.value)}
              sx={{ flex: 1, bgcolor: '#FFF' }}
            />
            <Typography sx={{ fontWeight: 800, color: 'text.disabled' }}>:</Typography>
            <TextField
              size="small" placeholder="Giá trị (VD: Đen nhám, 35.000 DPI...)" value={item.value}
              onChange={(e) => updateSpecRow(setSpecsList, idx, 'value', e.target.value)}
              sx={{ flex: 1.5, bgcolor: '#FFF' }}
            />
            <IconButton size="small" color="error" onClick={() => removeSpecRow(setSpecsList, idx)}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Stack>
        ))}
      </Stack>

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
        <Button size="small" variant="outlined" startIcon={<AddIcon />} onClick={() => addSpecRow(setSpecsList)} sx={{ bgcolor: '#EFF6FF', borderColor: '#BFDBFE', color: '#2563EB', fontSize: 12.5 }}>
          Thêm dòng thông số
        </Button>
        <Typography sx={{ fontSize: 11.5, color: 'text.secondary', fontFamily: 'monospace' }}>
          Đã nhập: {specsList.filter((s) => s.key.trim()).length} thông số
        </Typography>
      </Stack>
    </Paper>
  );

  return (
    <Box>
      <Paper elevation={0} sx={{ p: 2, mb: 2.5, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 260 }}>
          {Icons?.Sliders && <Icons.Sliders size={20} style={{ color: '#E30019' }} />}
          <Typography sx={{ fontWeight: 800, fontSize: 14, whiteSpace: 'nowrap' }}>Chọn sản phẩm:</Typography>
          <Select size="small" value={selectedProductId} onChange={(e) => setSelectedProductId(e.target.value)} sx={{ maxWidth: 400, width: '100%', fontWeight: 600 }}>
            {products.map((p) => (
              <MenuItem key={p.product_id} value={p.product_id}>{p.product_name} ({p.brand_name || 'GearK'})</MenuItem>
            ))}
          </Select>
        </Stack>

        <Button
          variant="contained"
          color={showAddForm ? 'inherit' : 'primary'}
          startIcon={showAddForm ? <CloseIcon /> : <AddIcon />}
          onClick={() => setShowAddForm(!showAddForm)}
        >
          {showAddForm ? 'Đóng form' : 'Thêm biến thể (Variant)'}
        </Button>
      </Paper>

      {showAddForm && (
        <Paper elevation={0} sx={{ p: 2.5, mb: 2.5, borderRadius: 2, border: '2px solid', borderColor: 'primary.main' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 800, mb: 1.75, color: 'primary.main' }}>
            + Thêm biến thể mới cho: {productDetail?.product_name}
          </Typography>
          <Box component="form" onSubmit={handleCreateVariant}>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Tên biến thể *</Typography>
                <TextField fullWidth size="small" required placeholder="VD: Bản Không dây / Màu Trắng..." value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    Mã SKU <Box component="span" sx={{ fontSize: '0.72rem', color: 'success.main' }}>(Tự động sinh)</Box>
                  </Typography>
                  <Button size="small" onClick={handleRegenerateSku} startIcon={<AutoAwesomeIcon sx={{ fontSize: 13 }} />} sx={{ py: 0, px: 0.5, fontSize: 12, color: '#6366F1' }}>
                    Tự sinh mã
                  </Button>
                </Stack>
                <TextField
                  fullWidth size="small" placeholder="VD: RZ-VIPER-TRANG-8K2A" value={newSku}
                  onChange={(e) => { setSkuManuallyEdited(true); setNewSku(e.target.value.toUpperCase()); }}
                  sx={{ '& input': { fontFamily: 'monospace', fontWeight: 600 } }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Giá niêm yết (₫) *</Typography>
                <TextField fullWidth size="small" type="number" required inputProps={{ min: 0, step: 1000 }} placeholder="VD: 1500000" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Giá khuyến mãi (₫)</Typography>
                <TextField fullWidth size="small" type="number" inputProps={{ min: 0, step: 1000 }} placeholder="Để trống nếu không giảm" value={newSalePrice} onChange={(e) => setNewSalePrice(e.target.value)} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Số lượng tồn kho</Typography>
                <TextField fullWidth size="small" type="number" inputProps={{ min: 0 }} value={newStock} onChange={(e) => setNewStock(e.target.value)} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Bảo hành (tháng)</Typography>
                <TextField fullWidth size="small" type="number" inputProps={{ min: 0 }} value={newWarranty} onChange={(e) => setNewWarranty(e.target.value)} />
              </Box>
            </Box>

            {renderSpecsEditor(newSpecsList, setNewSpecsList)}

            <Box sx={{ mt: 2 }}>
              <ImageUploadField
                label="Danh sách hình ảnh biến thể (Multer File Upload)"
                value={newVariantImages}
                onChange={setNewVariantImages}
                multiple={true}
                hint="Tải lên một hoặc nhiều tệp ảnh riêng cho biến thể này (Multer)"
              />
            </Box>

            <Stack direction="row" justifyContent="flex-end" spacing={1.25} sx={{ mt: 2 }}>
              <Button variant="outlined" color="inherit" onClick={() => setShowAddForm(false)}>Hủy</Button>
              <Button type="submit" variant="contained" disabled={submitting}>{submitting ? 'Đang lưu...' : 'Lưu biến thể mới'}</Button>
            </Stack>
          </Box>
        </Paper>
      )}

      {productDetail && (
        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box component="img" src={productDetail.thumbnail_url} alt="" sx={{ width: 60, height: 60, objectFit: 'contain', borderRadius: 1.5, border: '1px solid #E5E7EB' }} />
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 900 }}>{productDetail.product_name}</Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 0.5, fontSize: 12.5, color: 'text.secondary' }}>
              <Box>Thương hiệu: <strong>{productDetail.brand_name || 'N/A'}</strong></Box>
              <Box>Danh mục: <strong>{productDetail.category_name || 'N/A'}</strong></Box>
              <Box>Số biến thể: <strong>{productDetail.variants?.length || 0}</strong></Box>
            </Stack>
          </Box>
        </Paper>
      )}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0' }}>
        {loadingDetail ? (
          <Box sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>Đang tải dữ liệu biến thể...</Box>
        ) : (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>SKU</TableCell>
                <TableCell>Tên biến thể</TableCell>
                <TableCell>Ảnh biến thể</TableCell>
                <TableCell>Thông số kỹ thuật (JSON)</TableCell>
                <TableCell>Giá niêm yết</TableCell>
                <TableCell>Giá khuyến mãi</TableCell>
                <TableCell>Tồn kho</TableCell>
                <TableCell>Bảo hành</TableCell>
                <TableCell>Thao tác</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {!productDetail?.variants?.length ? (
                <TableRow><TableCell colSpan={9} align="center" sx={{ py: 3, color: 'text.secondary' }}>Chưa có biến thể nào cho sản phẩm này</TableCell></TableRow>
              ) : (
                (productDetail?.variants || []).slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((v) => {
                  let specsObj = v.specifications;
                  if (typeof specsObj === 'string') {
                    try { specsObj = JSON.parse(specsObj); } catch { specsObj = null; }
                  }
                  const specEntries = specsObj && typeof specsObj === 'object' ? Object.entries(specsObj) : [];

                  return (
                    <TableRow key={v.variant_id} hover>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main', fontFamily: 'monospace', py: 1.5 }}>{v.sku}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{v.variant_name}</TableCell>
                      <TableCell>
                        <Stack direction="row" alignItems="center" spacing={0.75}>
                          {v.images?.length > 0 ? (
                            v.images.slice(0, 3).map((img, idx) => (
                              <Box
                                key={img.image_id || idx}
                                sx={{ width: 34, height: 34, borderRadius: 1, border: img.is_primary ? '2px solid #E30019' : '1px solid #D1D5DB', overflow: 'hidden', bgcolor: '#FFF', position: 'relative' }}
                              >
                                <Box component="img" src={img.image_url} alt="" sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                {img.is_primary === 1 && (
                                  <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, bgcolor: 'primary.main', color: '#FFF', fontSize: 7, textAlign: 'center', fontWeight: 900 }}>CHÍNH</Box>
                                )}
                              </Box>
                            ))
                          ) : (
                            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>Chưa có</Typography>
                          )}
                          {v.images?.length > 3 && <Typography sx={{ fontSize: 11, color: 'text.secondary', fontWeight: 700 }}>+{v.images.length - 3}</Typography>}
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() => setManagingVariantImages(v)}
                            startIcon={Icons?.Camera ? <Icons.Camera size={13} /> : null}
                            sx={{ py: 0.4, px: 1, fontSize: 11, bgcolor: '#F3F4F6', borderColor: '#D1D5DB', color: 'text.primary', whiteSpace: 'nowrap' }}
                          >
                            Ảnh ({v.images?.length || 0})
                          </Button>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {specEntries.length > 0 ? (
                          <Stack direction="row" flexWrap="wrap" gap={0.5} sx={{ maxWidth: 300 }}>
                            {specEntries.map(([k, val], i) => (
                              <Box key={i} component="span" sx={{ fontSize: 11, bgcolor: '#F3F4F6', px: 0.75, py: 0.25, borderRadius: 1, border: '1px solid #E5E7EB' }}>
                                <strong>{k}:</strong> {String(val)}
                              </Box>
                            ))}
                          </Stack>
                        ) : (
                          <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>—</Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{formatPrice(v.price)}</TableCell>
                      <TableCell>
                        {v.sale_price ? (
                          <Typography sx={{ fontWeight: 700, color: 'error.main', fontSize: 13.5 }}>{formatPrice(v.sale_price)}</Typography>
                        ) : (
                          <Typography sx={{ color: 'text.disabled', fontSize: 12 }}>Không có</Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${v.stock} chiếc ${v.stock <= 5 ? '⚠️' : ''}`}
                          size="small"
                          sx={{ fontWeight: 800, fontSize: 12, bgcolor: v.stock <= 5 ? '#FEE2E2' : '#ECFDF5', color: v.stock <= 5 ? '#EF4444' : '#059669' }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: 12.5 }}>{v.warranty_months} tháng</TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Button size="small" onClick={() => handleOpenEdit(v)} sx={{ fontSize: 12, fontWeight: 700, py: 0.5, px: 1, bgcolor: '#EFF6FF', color: '#2563EB', whiteSpace: 'nowrap' }}>
                            Sửa thông số / giá
                          </Button>
                          {isAdmin && (
                            <IconButton size="small" color="error" onClick={() => handleDeleteVariant(v.variant_id, v.variant_name)}>
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
        {Boolean(productDetail?.variants?.length) && (
          <AdminPagination
            count={productDetail.variants.length}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        )}
      </TableContainer>

      {/* Edit Variant Modal */}
      <Dialog open={Boolean(editingVariant)} onClose={() => setEditingVariant(null)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800, fontSize: 17 }}>
          Cập nhật biến thể: {editingVariant?.sku}
          <IconButton size="small" onClick={() => setEditingVariant(null)}><CloseIcon /></IconButton>
        </DialogTitle>
        <Box component="form" onSubmit={handleUpdateVariant}>
          <DialogContent dividers>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mb: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Mã SKU</Typography>
                <TextField fullWidth size="small" disabled value={editingVariant?.sku || ''} sx={{ bgcolor: '#F3F4F6' }} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Tên biến thể *</Typography>
                <TextField fullWidth size="small" required value={editVariantName} onChange={(e) => setEditVariantName(e.target.value)} />
              </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 1.25 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Giá niêm yết (₫) *</Typography>
                <TextField fullWidth size="small" type="number" required inputProps={{ min: 0, step: 1000 }} value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Giá khuyến mãi (₫)</Typography>
                <TextField fullWidth size="small" type="number" inputProps={{ min: 0, step: 1000 }} placeholder="Trống nếu không giảm" value={editSalePrice} onChange={(e) => setEditSalePrice(e.target.value)} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Tồn kho *</Typography>
                <TextField fullWidth size="small" type="number" required inputProps={{ min: 0 }} value={editStock} onChange={(e) => setEditStock(e.target.value)} />
              </Box>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Bảo hành (tháng)</Typography>
                <TextField fullWidth size="small" type="number" inputProps={{ min: 0 }} value={editWarranty} onChange={(e) => setEditWarranty(e.target.value)} />
              </Box>
            </Box>

            {renderSpecsEditor(editSpecsList, setEditSpecsList)}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button variant="outlined" color="inherit" onClick={() => setEditingVariant(null)}>Hủy</Button>
            <Button type="submit" variant="contained" disabled={updating}>{updating ? 'Đang lưu...' : 'Lưu thay đổi'}</Button>
          </DialogActions>
        </Box>
      </Dialog>

      {/* Variant Images Manager Modal */}
      <Dialog open={Boolean(managingVariantImages)} onClose={() => setManagingVariantImages(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1.25}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {Icons?.Camera && <Icons.Camera size={20} />}
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Quản lý danh sách ảnh biến thể</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                Biến thể: <strong>{managingVariantImages?.variant_name}</strong> (SKU: {managingVariantImages?.sku})
              </Typography>
            </Box>
          </Stack>
          <IconButton size="small" onClick={() => setManagingVariantImages(null)}><CloseIcon /></IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Paper elevation={0} sx={{ bgcolor: '#F8FAFC', border: '2px dashed #CBD5E1', borderRadius: 2, p: 2, textAlign: 'center', mb: 2.5 }}>
            <input
              ref={variantFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => handleAddImagesToVariant(e.target.files)}
            />
            <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: uploadingVariantImg ? '#EFF6FF' : 'primary.light', color: uploadingVariantImg ? '#2563EB' : 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 1 }}>
              {uploadingVariantImg ? <CircularProgress size={18} /> : <CloudUploadIcon />}
            </Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
              {uploadingVariantImg ? 'Đang tải ảnh lên server bằng Multer...' : 'Tải lên ảnh mới cho biến thể này'}
            </Typography>
            <Typography sx={{ fontSize: 11.5, color: 'text.secondary', mt: 0.25, mb: 1.5 }}>
              Hỗ trợ: JPG, PNG, WEBP, GIF, SVG (Tối đa 10MB/ảnh)
            </Typography>

            <Stack direction="row" justifyContent="center" spacing={1} flexWrap="wrap">
              <Button size="small" variant="contained" disabled={uploadingVariantImg} startIcon={<CloudUploadIcon />} onClick={() => variantFileInputRef.current?.click()}>
                Chọn tệp ảnh từ máy tính
              </Button>
              <Button size="small" variant="outlined" color="inherit" onClick={() => setShowAddUrlInput(!showAddUrlInput)} sx={{ bgcolor: '#FFF' }}>
                {showAddUrlInput ? 'Ẩn link URL' : 'Thêm bằng URL'}
              </Button>
            </Stack>

            {showAddUrlInput && (
              <Box component="form" onSubmit={handleAddImageUrlToVariant} sx={{ mt: 1.5, display: 'flex', gap: 1 }}>
                <TextField fullWidth size="small" type="url" required placeholder="https://images.unsplash.com/photo-..." value={customImageUrl} onChange={(e) => setCustomImageUrl(e.target.value)} sx={{ bgcolor: '#FFF' }} />
                <Button type="submit" variant="contained" color="success" disabled={uploadingVariantImg} sx={{ whiteSpace: 'nowrap' }}>Thêm URL</Button>
              </Box>
            )}
          </Paper>

          <Typography sx={{ fontSize: 13.5, fontWeight: 800, mb: 1.25 }}>
            Danh sách ảnh hiện tại ({managingVariantImages?.images?.length || 0} ảnh)
          </Typography>

          {!managingVariantImages?.images?.length ? (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', bgcolor: '#F9FAFB', border: '1px solid #E5E7EB', color: 'text.secondary', fontSize: 13 }}>
              Biến thể này chưa có hình ảnh nào. Hãy chọn tệp ảnh ở trên để tải lên!
            </Paper>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(135px, 1fr))', gap: 1.5 }}>
              {managingVariantImages.images.map((img) => {
                const isPrimary = img.is_primary === 1;
                return (
                  <Paper key={img.image_id} elevation={0} sx={{ border: isPrimary ? '2px solid #E30019' : '1px solid #E5E7EB', borderRadius: 2, p: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ width: '100%', height: 100, borderRadius: 1, overflow: 'hidden', bgcolor: '#FAFAFA', display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 1 }}>
                      <Box component="img" src={img.image_url} alt="" onError={(e) => { e.target.src = 'https://placehold.co/120x120?text=Loi+Anh'; }} sx={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </Box>
                    {isPrimary ? (
                      <Chip label="⭐ Ảnh chính" size="small" sx={{ bgcolor: 'primary.light', color: 'primary.main', fontSize: 11, fontWeight: 800, mb: 0.75, height: 22 }} />
                    ) : (
                      <Button size="small" onClick={() => handleSetPrimaryVariantImage(img.image_id)} sx={{ fontSize: 11, py: 0.25, px: 1, mb: 0.75, bgcolor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB' }}>
                        Đặt làm ảnh chính
                      </Button>
                    )}
                    <Button size="small" color="error" onClick={() => handleDeleteVariantImage(img.image_id)} startIcon={<DeleteOutlineIcon sx={{ fontSize: 14 }} />} sx={{ fontSize: 11, py: 0.25, px: 1, bgcolor: '#FEF2F2', border: '1px solid #FECACA' }}>
                      Xóa
                    </Button>
                  </Paper>
                );
              })}
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button variant="contained" color="secondary" onClick={() => setManagingVariantImages(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
