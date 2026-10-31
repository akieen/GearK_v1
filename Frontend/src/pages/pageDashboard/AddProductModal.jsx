import React, { useState, useEffect } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

import ImageUploadField from '../../components/common/ImageUploadField';
import { generateSku } from '../../utils/formatters';

export default function AddProductModal({
  showAddProductModal,
  setShowAddProductModal,
  handleCreateProduct,
  submittingProduct,
  newProdName,
  setNewProdName,
  newProdCatId,
  setNewProdCatId,
  categories,
  newProdBrandId,
  setNewProdBrandId,
  brands,
  newProdDesc,
  setNewProdDesc,
  newProdThumb,
  setNewProdThumb,
  newProdImages = [],
  setNewProdImages = () => {},
  newVariantName,
  setNewVariantName,
  newVariantSku,
  setNewVariantSku,
  newVariantPrice,
  setNewVariantPrice,
  newVariantSalePrice,
  setNewVariantSalePrice,
  newVariantStock,
  setNewVariantStock,
  newVariantImages = [],
  setNewVariantImages = () => {},
  Icons,
}) {
  const [skuTouched, setSkuTouched] = useState(false);

  useEffect(() => {
    if (!skuTouched && (newProdName || newVariantName)) {
      setNewVariantSku(generateSku(newProdName, newVariantName));
    }
  }, [newProdName, newVariantName, skuTouched, setNewVariantSku]);

  const handleRegenerateSku = () => {
    setNewVariantSku(generateSku(newProdName, newVariantName));
    setSkuTouched(false);
  };

  return (
    <Dialog open={Boolean(showAddProductModal)} onClose={() => setShowAddProductModal(false)} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: 'primary.light', color: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AddIcon />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 16, fontWeight: 800 }}>Thêm sản phẩm Gaming Gear mới</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
              Hỗ trợ tải lên ảnh tệp qua thư viện Multer & danh sách ảnh theo biến thể
            </Typography>
          </Box>
        </Stack>
        <IconButton size="small" onClick={() => setShowAddProductModal(false)}><CloseIcon /></IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleCreateProduct}>
        <DialogContent dividers sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Tên sản phẩm *</Typography>
            <TextField
              fullWidth size="small" required
              placeholder="VD: Chuột Razer DeathAdder V3 Pro Wireless"
              value={newProdName} onChange={(e) => setNewProdName(e.target.value)}
            />
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Danh mục *</Typography>
              <Select fullWidth size="small" required displayEmpty value={newProdCatId} onChange={(e) => setNewProdCatId(e.target.value)}>
                <MenuItem value="">-- Chọn danh mục --</MenuItem>
                {categories.map((c) => <MenuItem key={c.category_id} value={c.category_id}>{c.category_name}</MenuItem>)}
              </Select>
            </Box>
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Thương hiệu *</Typography>
              <Select fullWidth size="small" required displayEmpty value={newProdBrandId} onChange={(e) => setNewProdBrandId(e.target.value)}>
                <MenuItem value="">-- Chọn thương hiệu --</MenuItem>
                {brands.map((b) => <MenuItem key={b.brand_id} value={b.brand_id}>{b.brand_name}</MenuItem>)}
              </Select>
            </Box>
          </Box>

          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.75 }}>Mô tả sản phẩm</Typography>
            <TextField
              fullWidth size="small" multiline rows={3}
              placeholder="Tính năng nổi bật, switch, cảm biến, tần số..."
              value={newProdDesc} onChange={(e) => setNewProdDesc(e.target.value)}
            />
          </Box>

          <ImageUploadField
            label="Ảnh đại diện chính (Thumbnail - Multer File Upload)"
            value={newProdThumb}
            onChange={setNewProdThumb}
            multiple={false}
            hint="Chọn tệp ảnh từ máy tính (Multer sẽ lưu vào thư mục /uploads)"
          />

          <ImageUploadField
            label="Danh sách ảnh bổ sung sản phẩm (Gallery Images)"
            value={newProdImages}
            onChange={setNewProdImages}
            multiple={true}
            hint="Tải lên nhiều góc chụp của sản phẩm bằng Multer"
          />

          <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#FAFAFA', border: '1px solid #E5E7EB' }}>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              {Icons?.Layers && <Icons.Layers size={18} style={{ color: '#E30019' }} />}
              <Typography sx={{ fontSize: 14, fontWeight: 800 }}>
                Cấu hình phiên bản mặc định & Danh sách ảnh biến thể
              </Typography>
            </Stack>

            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Tên phiên bản</Typography>
                <TextField fullWidth size="small" placeholder="VD: Màu Đen Nhám / Red Switch" value={newVariantName} onChange={(e) => setNewVariantName(e.target.value)} />
              </Box>

              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
                  <Typography sx={{ fontSize: 13, fontWeight: 700 }}>
                    Mã SKU <Box component="span" sx={{ fontSize: '0.72rem', color: 'success.main' }}>(Tự sinh)</Box>
                  </Typography>
                  <Button size="small" onClick={handleRegenerateSku} startIcon={<AutoAwesomeIcon sx={{ fontSize: 14 }} />} sx={{ py: 0, px: 0.5, fontSize: 12, color: '#6366F1' }}>
                    Tự sinh mã
                  </Button>
                </Stack>
                <TextField
                  fullWidth size="small" placeholder="VD: RZ-VIPER-TRANG-8K2A" value={newVariantSku}
                  onChange={(e) => {
                    setSkuTouched(true);
                    setNewVariantSku(e.target.value.toUpperCase());
                  }}
                  sx={{ '& input': { fontFamily: 'monospace', fontWeight: 600 } }}
                />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Giá gốc (₫) *</Typography>
                <TextField fullWidth size="small" type="number" required placeholder="VD: 3990000" value={newVariantPrice} onChange={(e) => setNewVariantPrice(e.target.value)} />
              </Box>

              <Box>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Giá khuyến mãi (₫)</Typography>
                <TextField fullWidth size="small" type="number" placeholder="VD: 3590000" value={newVariantSalePrice} onChange={(e) => setNewVariantSalePrice(e.target.value)} />
              </Box>

              <Box sx={{ gridColumn: 'span 2' }}>
                <Typography sx={{ fontSize: 13, fontWeight: 700, mb: 0.5 }}>Số lượng tồn kho</Typography>
                <TextField fullWidth size="small" type="number" value={newVariantStock} onChange={(e) => setNewVariantStock(e.target.value)} />
              </Box>
            </Box>

            <Box sx={{ mt: 1.5 }}>
              <ImageUploadField
                label="Danh sách ảnh cho biến thể này (Variant Images)"
                value={newVariantImages}
                onChange={setNewVariantImages}
                multiple={true}
                hint="Tải lên danh sách ảnh riêng của màu sắc/phiên bản này (Multer File Upload)"
              />
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button variant="outlined" color="inherit" onClick={() => setShowAddProductModal(false)}>Hủy</Button>
          <Button type="submit" variant="contained" disabled={submittingProduct}>
            {submittingProduct ? 'Đang lưu sản phẩm...' : 'Lưu sản phẩm'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
