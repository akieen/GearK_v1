import React, { useState, useRef } from 'react';
import { uploadApi } from '../../api/productApi';
import { useToast } from '../../context/ToastContext';
import Icons from './Icons';

export default function ImageUploadField({
  label = 'Hình ảnh',
  value = '', // URL string if single, or array of strings/objects if multiple
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

  // Handle uploading files via Multer
  const handleFiles = async (files) => {
    if (!files || files.length === 0) return;

    // Validate size & type on client side before sending
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

  // Convert value for display
  const imagesList = multiple
    ? (Array.isArray(value) ? value : (value ? [value] : []))
    : (value ? [value] : []);

  return (
    <div className="form-group" style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <label className="form-label" style={{ margin: 0, fontWeight: 700, fontSize: 13 }}>
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          style={{
            fontSize: 12,
            color: 'var(--primary)',
            background: 'none',
            border: 'none',
            textDecoration: 'underline',
            cursor: 'pointer',
            padding: 0,
            fontWeight: 600,
          }}
        >
          {showUrlInput ? 'Ẩn nhập URL' : '+ Nhập link URL ảnh'}
        </button>
      </div>

      {/* Manual URL input option */}
      {showUrlInput && (
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input
            type="url"
            className="form-input"
            style={{ flex: 1, fontSize: 13 }}
            placeholder="https://images.unsplash.com/photo-..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            style={{
              backgroundColor: 'var(--primary)',
              color: '#FFF',
              padding: '6px 14px',
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 12.5,
              whiteSpace: 'nowrap',
            }}
          >
            Thêm
          </button>
        </div>
      )}

      {/* Drag & Drop File Upload Box (Multer powered) */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        style={{
          border: isDragOver ? '2px dashed var(--primary)' : '2px dashed #CBD5E1',
          backgroundColor: isDragOver ? 'rgba(227, 0, 25, 0.04)' : '#F8FAFC',
          borderRadius: 8,
          padding: '16px 20px',
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          transition: 'all 0.2s ease',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
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

        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: uploading ? '#EFF6FF' : '#FEE2E2',
            color: uploading ? '#2563EB' : 'var(--primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {uploading ? (
            <div
              style={{
                width: 20,
                height: 20,
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
          {uploading ? 'Đang tải tệp lên server qua Multer...' : (multiple ? 'Chọn hoặc kéo thả nhiều tệp ảnh' : 'Chọn hoặc kéo thả tệp ảnh vào đây')}
        </div>
        <div style={{ fontSize: 11.5, color: '#64748B' }}>
          {hint}
        </div>
      </div>

      {/* Thumbnails Display Grid */}
      {imagesList.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 12,
            alignItems: 'center',
          }}
        >
          {imagesList.map((img, idx) => {
            const imgUrl = typeof img === 'string' ? img : img.image_url;
            const isPrimary = multiple ? idx === 0 : true;

            return (
              <div
                key={idx}
                style={{
                  position: 'relative',
                  width: 70,
                  height: 70,
                  borderRadius: 6,
                  border: isPrimary ? '2px solid var(--primary)' : '1px solid #E2E8F0',
                  overflow: 'hidden',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)',
                  flexShrink: 0,
                }}
              >
                <img
                  src={imgUrl}
                  alt={`Preview ${idx}`}
                  style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/100x100?text=Loi+Anh';
                  }}
                />

                {/* Primary Tag */}
                {isPrimary && (
                  <span
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      backgroundColor: 'var(--primary)',
                      color: '#FFF',
                      fontSize: 9,
                      fontWeight: 800,
                      textAlign: 'center',
                      padding: '1px 0',
                      textTransform: 'uppercase',
                    }}
                  >
                    Chính
                  </span>
                )}

                {/* Set Primary Button for multiple images (if not primary) */}
                {multiple && !isPrimary && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSetPrimary(idx);
                    }}
                    title="Đặt làm ảnh chính"
                    style={{
                      position: 'absolute',
                      top: 2,
                      left: 2,
                      width: 18,
                      height: 18,
                      borderRadius: 3,
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      color: '#4B5563',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid #D1D5DB',
                      cursor: 'pointer',
                      fontSize: 10,
                    }}
                  >
                    ⭐
                  </button>
                )}

                {/* Delete button */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveImage(idx);
                  }}
                  title="Xóa ảnh này"
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(239, 68, 68, 0.9)',
                    color: '#FFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <Icons.X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
