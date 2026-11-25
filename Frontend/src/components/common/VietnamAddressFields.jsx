import React, { useMemo } from 'react';
import Grid from '@mui/material/Grid';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
import vietnamAddressService from '../../services/vietnamAddressService';

export default function VietnamAddressFields({
  selectedProvince,
  setSelectedProvince,
  selectedWard,
  setSelectedWard,
  detailAddress,
  setDetailAddress,
  disabled = false,
}) {
  const provinces = useMemo(() => vietnamAddressService.getProvinces(), []);

  const wards = useMemo(() => {
    if (!selectedProvince) return [];
    return vietnamAddressService.getWardsByProvinceCode(selectedProvince.code);
  }, [selectedProvince]);

  const handleProvinceChange = (event, newValue) => {
    setSelectedProvince(newValue);
    setSelectedWard(null); // Tự động reset phường khi đổi tỉnh
  };

  const fullPreview = vietnamAddressService.formatAddress(
    detailAddress,
    selectedWard,
    selectedProvince
  );

  return (
    <>
      {/* Tỉnh / Thành phố: 50% hàng 2 */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.75, display: 'block', fontSize: 13 }}>
          Tỉnh / Thành phố <span style={{ color: '#EF4444' }}>*</span>
        </Typography>
        <Autocomplete
          fullWidth
          disabled={disabled}
          options={provinces}
          getOptionLabel={(option) => option?.name || ''}
          value={selectedProvince}
          onChange={handleProvinceChange}
          isOptionEqualToValue={(option, value) => option.code === value?.code}
          noOptionsText="Không tìm thấy tỉnh/thành"
          slotProps={{
            popper: {
              sx: {
                '& .MuiAutocomplete-paper': {
                  borderRadius: 2,
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  mt: 0.5,
                },
                '& .MuiAutocomplete-listbox': {
                  maxHeight: 280,
                  '& .MuiAutocomplete-option': {
                    fontSize: 14,
                    py: 1,
                    px: 1.5,
                  },
                },
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              placeholder="Chọn Tỉnh / Thành phố"
              required={!selectedProvince}
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  fontSize: 14,
                  minHeight: 40,
                },
              }}
            />
          )}
        />
      </Grid>

      {/* Phường / Xã: 50% hàng 2 */}
      <Grid size={{ xs: 12, sm: 6 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.75, display: 'block', fontSize: 13 }}>
          Phường / Xã <span style={{ color: '#EF4444' }}>*</span>
        </Typography>
        <Autocomplete
          fullWidth
          disabled={disabled || !selectedProvince}
          options={wards}
          getOptionLabel={(option) => option?.name || ''}
          value={selectedWard}
          onChange={(event, newValue) => setSelectedWard(newValue)}
          isOptionEqualToValue={(option, value) => option.code === value?.code}
          noOptionsText={selectedProvince ? 'Không tìm thấy phường/xã' : 'Vui lòng chọn tỉnh trước'}
          slotProps={{
            popper: {
              sx: {
                '& .MuiAutocomplete-paper': {
                  borderRadius: 0,
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                  mt: 0.5,
                },
                '& .MuiAutocomplete-listbox': {
                  maxHeight: 280,
                  '& .MuiAutocomplete-option': {
                    fontSize: 14,
                    py: 1,
                    px: 1.5,
                  },
                },
              },
            },
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              fullWidth
              size="small"
              placeholder={selectedProvince ? 'Chọn Phường / Xã' : 'Vui lòng chọn Tỉnh trước'}
              required={!selectedWard}
              sx={{
                bgcolor: '#FFFFFF',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 0,
                  fontSize: 14,
                  minHeight: 40,
                },
              }}
            />
          )}
        />
      </Grid>

      {/* Địa chỉ chi tiết: 100% hàng 3 */}
      <Grid size={12}>
        <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 0.75, display: 'block', fontSize: 13 }}>
          Địa chỉ chi tiết (Số nhà, tên đường, ngõ ngách, tòa nhà...) <span style={{ color: '#EF4444' }}>*</span>
        </Typography>
        <TextField
          disabled={disabled}
          fullWidth
          size="small"
          placeholder="Ví dụ: Số 123 Đường Cầu Giấy, Tòa nhà FPT"
          value={detailAddress}
          onChange={(e) => setDetailAddress(e.target.value)}
          required
          sx={{
            bgcolor: '#FFFFFF',
            '& .MuiOutlinedInput-root': {
              borderRadius: 0,
              fontSize: 14,
              minHeight: 40,
            },
          }}
        />
      </Grid>

      {fullPreview ? (
        <Grid size={12}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              p: 1.25,
              bgcolor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 1.5,
              fontSize: 12.5,
              color: '#166534',
            }}
          >
            <LocationOnOutlinedIcon sx={{ fontSize: 16, color: '#15803D', flexShrink: 0 }} />
            <Box>
              <span style={{ fontWeight: 700 }}>Địa chỉ đầy đủ:</span> {fullPreview}
            </Box>
          </Box>
        </Grid>
      ) : null}
    </>
  );
}
