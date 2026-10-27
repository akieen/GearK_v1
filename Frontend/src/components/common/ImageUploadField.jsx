import React, { useState, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import StarIcon from '@mui/icons-material/Star';
import AddLinkIcon from '@mui/icons-material/AddLink';

import { uploadApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';

export default function ImageUploadField({
  label = 'Hình ảnh',
  value = '',
  onChange,
  multiple = false,
  placeholder = 'Chọn tệp ảnh từ máy tính hoặc dán URL...',
  hint = 'Hỗ trợ: JPG, PNG, WEBP, GIF, SVG (Tối đa 10MB)',
}) {
  const toast = useToast();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      if (!f.type.startsWith('image/')) {
        toast.error(`"${f.name}" không phải tệp ảnh hợp lệ!`);
        return;
      }
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`"${f.name}" vượt quá 10MB! Vui lòng chọn ảnh nhỏ hơn.`);
        return;
      }
    }

    setUploading(true);
    try {
      if (multiple) {
        const res = await uploadApi.uploadFiles(files);
        if (res.success && res.data?.urls) {
          toast.success(`Đã tải lên ${res.data.urls.length} ảnh thành công!`);
          const currentList = Array.isArray(value) ? value : (value ? [value] : []);
          onChange([...currentList, ...res.data.urls]);
        }
      } else {
        const res = await uploadApi.uploadFile(files[0]);
        if (res.success && res.data?.url) {
          toast.success('Đã tải ảnh lên thành công!');
          onChange(res.data.url);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi tải ảnh lên bằng Multer');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleAddUrl = (e) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (multiple) {
      const currentList = Array.isArray(value) ? value : (value ? [value] : []);
      onChange([...currentList, urlInput.trim()]);
    } else {
      onChange(urlInput.trim());
    }
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (indexToRemove) => {
    if (multiple) {
      const currentList = Array.isArray(value) ? value : [];
      onChange(currentList.filter((_, i) => i !== indexToRemove));
    } else {
      onChange('');
    }
  };

  const handleSetPrimary = (indexToPrimary) => {
    if (!multiple) return;
    const currentList = Array.isArray(value) ? [...value] : [];
    if (indexToPrimary > 0 && indexToPrimary < currentList.length) {
      const [item] = currentList.splice(indexToPrimary, 1);
      currentList.unshift(item);
      onChange(currentList);
    }
  };

  const imagesList = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (value ? [value] : []);

  return (
    <Box sx={{ mb: 2.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', textTransform: 'uppercase' }}>
          {label}
        </Typography>
        <Button
          size="small"
          onClick={() => setShowUrlInput(!showUrlInput)}
          startIcon={<AddLinkIcon fontSize="small" />}
          sx={{ fontSize: '0.75rem', p: 0.5 }}
        >
          {showUrlInput ? 'Ẩn URL' : '+ Dán URL ảnh'}
        </Button>
      </Box>

      {/* Manual URL Input */}
      {showUrlInput && (
        <Box sx={{ display: 'flex', gap: 1, mb: 1.5 }}>
          <TextField
            size="small"
            fullWidth
            placeholder="https://images.unsplash.com/photo-..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleAddUrl}
            sx={{ flexShrink: 0 }}
          >
            Thêm
          </Button>
        </Box>
      )}

      {/* Drop Zone */}
      <Paper
        variant="outlined"
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        sx={{
          borderStyle: 'dashed',
          borderWidth: 2,
          borderColor: isDragOver ? 'primary.main' : '#CBD5E1',
          backgroundColor: isDragOver ? 'rgba(227, 0, 25, 0.04)' : '#F8FAFC',
          borderRadius: 2.5,
          p: 2.5,
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 1,
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
          multiple={multiple}
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: uploading ? '#DBEAFE' : '#FEE2E2',
            color: uploading ? 'info.main' : 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {uploading ? <CircularProgress size={22} color="inherit" /> : <CloudUploadIcon />}
        </Box>

        <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
          {uploading ? 'Đang tải ảnh lên server...' : 'Kéo thả ảnh vào đây, hoặc bấm để duyệt file'}
        </Typography>

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {hint}
        </Typography>
      </Paper>

      {/* Thumbnails Preview */}
      {imagesList.length > 0 && (
        <Box sx={{ mt: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
          {imagesList.map((img, idx) => {
            const url = typeof img === 'string' ? img : img?.image_url;
            const isFirst = idx === 0;

            return (
              <Box
                key={idx}
                sx={{
                  position: 'relative',
                  width: 80,
                  height: 80,
                  borderRadius: 2,
                  border: isFirst ? '2px solid #E30019' : '1px solid #E5E7EB',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <Box
                  component="img"
                  src={url}
                  alt={`Upload ${idx}`}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }}
                />

                {isFirst && multiple && (
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'primary.main',
                      color: '#FFF',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      textAlign: 'center',
                      py: 0.2,
                    }}
                  >
                    Ảnh chính
                  </Box>
                )}

                {/* Actions overlay */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    display: 'flex',
                    gap: 0.5,
                  }}
                >
                  {multiple && !isFirst && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetPrimary(idx);
                      }}
                      title="Đặt làm ảnh chính"
                      sx={{
                        p: 0.25,
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        color: '#F59E0B',
                        '&:hover': { backgroundColor: '#FFFFFF' },
                      }}
                    >
                      <StarIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage(idx);
                    }}
                    title="Xóa ảnh"
                    sx={{
                      p: 0.25,
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'error.main',
                      '&:hover': { backgroundColor: '#FFFFFF' },
                    }}
                  >
                    <DeleteOutlineIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </Box>
              </Box>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
