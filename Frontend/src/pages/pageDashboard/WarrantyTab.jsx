import React, { useState, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Tooltip from '@mui/material/Tooltip';
import CircularProgress from '@mui/material/CircularProgress';

import SearchIcon from '@mui/icons-material/Search';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import BuildCircleOutlineIcon from '@mui/icons-material/BuildCircleOutlined';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';

import { warrantyApi } from '../../api/warrantyApi';
import { useToast } from '../../context/ToastContext';
import { formatDate, getWarrantyStatusText } from '../../utils/formatters';
import { AppButton } from '../../components/ui/AppButton';

export default function WarrantyTab({ isAdmin, formatPrice, Icons }) {
  const toast = useToast();
  const [claims, setClaims] = useState([]);
  const [counts, setCounts] = useState({ all: 0, pending: 0, approved: 0, repairing: 0, completed: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  // Review Modal state
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [newStatus, setNewStatus] = useState('pending');
  const [adminNote, setAdminNote] = useState('');
  const [submittingStatus, setSubmittingStatus] = useState(false);

  // Image zoom modal
  const [zoomImage, setZoomImage] = useState(null);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    try {
      const res = await warrantyApi.getAllClaimsAdmin({
        status: statusFilter,
        search: search.trim() || undefined,
        page,
        limit: 30,
      });

      if (res.success) {
        setClaims(res.data || []);
        if (res.counts) setCounts(res.counts);
      }
    } catch (err) {
      console.error('Lỗi lấy danh sách bảo hành:', err);
      toast.error(err.message || 'Lỗi tải danh sách yêu cầu bảo hành');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleOpenReview = (claim) => {
    setSelectedClaim(claim);
    setNewStatus(claim.status || 'pending');
    setAdminNote(claim.admin_note || '');
  };

  const handleCloseReview = () => {
    setSelectedClaim(null);
    setNewStatus('pending');
    setAdminNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!selectedClaim) return;

    setSubmittingStatus(true);
    try {
      const res = await warrantyApi.updateClaimStatus(selectedClaim.claim_id, {
        status: newStatus,
        admin_note: adminNote,
      });

      if (res.success) {
        toast.success(res.message || 'Cập nhật trạng thái bảo hành thành công!');
        handleCloseReview();
        fetchClaims();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi cập nhật trạng thái bảo hành');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const filterTabs = [
    { id: 'all', label: 'Tất cả', count: counts.all, color: '#64748B' },
    { id: 'pending', label: 'Chờ duyệt', count: counts.pending, color: '#D97706' },
    { id: 'approved', label: 'Đã tiếp nhận', count: counts.approved, color: '#2563EB' },
    { id: 'repairing', label: 'Đang xử lý', count: counts.repairing, color: '#7C3AED' },
    { id: 'completed', label: 'Hoàn thành', count: counts.completed, color: '#059669' },
    { id: 'rejected', label: 'Từ chối', count: counts.rejected, color: '#DC2626' },
  ];

  const parseImages = (imgs) => {
    if (!imgs) return [];
    if (Array.isArray(imgs)) return imgs;
    try {
      const parsed = JSON.parse(imgs);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      // not json, return as single string
    }
    return [imgs];
  };

  return (
    <Box>
      {/* Metric Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Chờ duyệt</Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#D97706', mt: 0.5 }}>
                {counts.pending}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#FEF3C7', color: '#D97706', width: 44, height: 44 }}>
              <PendingActionsIcon />
            </Avatar>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Đã tiếp nhận</Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#2563EB', mt: 0.5 }}>
                {counts.approved}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#DBEAFE', color: '#2563EB', width: 44, height: 44 }}>
              <VerifiedUserIcon />
            </Avatar>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Đang sửa chữa</Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#7C3AED', mt: 0.5 }}>
                {counts.repairing}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#EDE9FE', color: '#7C3AED', width: 44, height: 44 }}>
              <BuildCircleOutlineIcon />
            </Avatar>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Đã hoàn tất</Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#059669', mt: 0.5 }}>
                {counts.completed}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#D1FAE5', color: '#059669', width: 44, height: 44 }}>
              <CheckCircleOutlineIcon />
            </Avatar>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>Từ chối</Typography>
              <Typography sx={{ fontSize: 24, fontWeight: 900, color: '#DC2626', mt: 0.5 }}>
                {counts.rejected}
              </Typography>
            </Box>
            <Avatar sx={{ bgcolor: '#FEE2E2', color: '#DC2626', width: 44, height: 44 }}>
              <HighlightOffIcon />
            </Avatar>
          </Paper>
        </Grid>
      </Grid>

      {/* Main Table Container */}
      <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, bgcolor: '#FFFFFF', border: '1px solid #E2E8F0' }}>
        {/* Top Controls: Filter Pills & Search */}
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
          {/* Status Pills */}
          <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {filterTabs.map((tab) => {
              const active = statusFilter === tab.id;
              return (
                <Chip
                  key={tab.id}
                  label={`${tab.label} (${tab.count})`}
                  onClick={() => setStatusFilter(tab.id)}
                  sx={{
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    bgcolor: active ? '#DC2626' : '#F1F5F9',
                    color: active ? '#FFFFFF' : '#475569',
                    '&:hover': {
                      bgcolor: active ? '#B91C1C' : '#E2E8F0',
                    },
                  }}
                />
              );
            })}
          </Stack>

          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Tìm theo mã bảo hành, mã đơn, tên khách, SĐT, thiết bị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: { xs: '100%', md: 360 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#94A3B8', fontSize: 18 }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>

        {/* Claims Table */}
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead sx={{ bgcolor: '#F8FAFC' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>MÃ & NGÀY GỬI</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>KHÁCH HÀNG</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>SẢN PHẨM & ĐƠN HÀNG</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>MÔ TẢ LỖI & ẢNH</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569' }}>TRẠNG THÁI</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: 12, color: '#475569', textAlign: 'center' }}>THAO TÁC</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <CircularProgress size={32} sx={{ color: '#DC2626' }} />
                    <Typography sx={{ mt: 1.5, fontSize: 13, color: '#64748B' }}>Đang tải yêu cầu bảo hành...</Typography>
                  </TableCell>
                </TableRow>
              ) : claims.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 6 }}>
                    <VerifiedUserIcon sx={{ fontSize: 44, color: '#CBD5E1', mb: 1 }} />
                    <Typography sx={{ fontWeight: 700, color: '#64748B' }}>Không tìm thấy yêu cầu bảo hành nào</Typography>
                    <Typography sx={{ fontSize: 12, color: '#94A3B8' }}>Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                claims.map((claim) => {
                  const statusInfo = getWarrantyStatusText(claim.status);
                  const images = parseImages(claim.image_urls);

                  return (
                    <TableRow key={claim.claim_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {/* Mã & Ngày gửi */}
                      <TableCell>
                        <Typography sx={{ fontWeight: 800, color: '#DC2626', fontSize: 13 }}>
                          #WC-{claim.claim_id}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: '#64748B', mt: 0.25 }}>
                          {formatDate(claim.created_at)}
                        </Typography>
                      </TableCell>

                      {/* Khách hàng */}
                      <TableCell>
                        <Stack direction="row" spacing={1.25} alignItems="center">
                          <Avatar
                            src={claim.user?.avatar_url}
                            sx={{ width: 32, height: 32, fontSize: 12, bgcolor: '#FEE2E2', color: '#DC2626' }}
                          >
                            {claim.user?.full_name ? claim.user.full_name[0] : 'U'}
                          </Avatar>
                          <Box>
                            <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#1E293B' }}>
                              {claim.user?.full_name || 'Khách hàng'}
                            </Typography>
                            <Typography sx={{ fontSize: 11, color: '#64748B' }}>
                              {claim.phone_number || claim.user?.email || 'N/A'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Sản phẩm & Đơn hàng */}
                      <TableCell sx={{ maxWidth: 260 }}>
                        <Typography sx={{ fontWeight: 700, fontSize: 13, color: '#1E293B', lineHeight: 1.3 }}>
                          {claim.product_name}
                        </Typography>
                        <Stack direction="row" spacing={1} sx={{ mt: 0.5 }} alignItems="center">
                          <Chip
                            label={`Đơn #${claim.order?.order_code}`}
                            size="small"
                            sx={{ height: 18, fontSize: 10, fontWeight: 700, bgcolor: '#F1F5F9', color: '#475569' }}
                          />
                          {claim.serial_number && (
                            <Chip
                              label={`S/N: ${claim.serial_number}`}
                              size="small"
                              sx={{ height: 18, fontSize: 10, fontWeight: 600, bgcolor: '#EFF6FF', color: '#1D4ED8' }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      {/* Mô tả lỗi & Ảnh */}
                      <TableCell sx={{ maxWidth: 280 }}>
                        <Typography
                          sx={{
                            fontSize: 12,
                            color: '#334155',
                            lineHeight: 1.4,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                          title={claim.issue_description}
                        >
                          {claim.issue_description}
                        </Typography>

                        {/* Thumbnail images */}
                        {images.length > 0 && (
                          <Stack direction="row" spacing={0.75} sx={{ mt: 1 }}>
                            {images.slice(0, 3).map((img, idx) => (
                              <Box
                                key={idx}
                                component="img"
                                src={img}
                                alt="Minh chứng"
                                onClick={() => setZoomImage(img)}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  objectFit: 'cover',
                                  borderRadius: 1,
                                  border: '1px solid #CBD5E1',
                                  cursor: 'pointer',
                                  '&:hover': { transform: 'scale(1.08)', transition: '0.15s' },
                                }}
                              />
                            ))}
                            {images.length > 3 && (
                              <Box
                                onClick={() => setZoomImage(images[3])}
                                sx={{
                                  width: 34,
                                  height: 34,
                                  borderRadius: 1,
                                  bgcolor: '#F1F5F9',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  fontSize: 11,
                                  fontWeight: 700,
                                  color: '#64748B',
                                  cursor: 'pointer',
                                }}
                              >
                                +{images.length - 3}
                              </Box>
                            )}
                          </Stack>
                        )}
                      </TableCell>

                      {/* Trạng thái */}
                      <TableCell>
                        <Chip
                          label={statusInfo.label}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: 11.5,
                            bgcolor: statusInfo.bg,
                            color: statusInfo.color,
                            border: `1px solid ${statusInfo.color}30`,
                          }}
                        />
                        {claim.admin_note && (
                          <Tooltip title={`Ghi chú admin: ${claim.admin_note}`} arrow>
                            <Typography
                              sx={{
                                fontSize: 11,
                                color: '#64748B',
                                mt: 0.5,
                                fontStyle: 'italic',
                                display: '-webkit-box',
                                WebkitLineClamp: 1,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                                maxWidth: 140,
                              }}
                            >
                              Ghi chú: {claim.admin_note}
                            </Typography>
                          </Tooltip>
                        )}
                      </TableCell>

                      {/* Thao tác */}
                      <TableCell sx={{ textAlign: 'center' }}>
                        <Button
                          variant="contained"
                          size="small"
                          onClick={() => handleOpenReview(claim)}
                          startIcon={<EditIcon sx={{ fontSize: 15 }} />}
                          sx={{
                            fontSize: 11.5,
                            fontWeight: 700,
                            textTransform: 'none',
                            bgcolor: '#DC2626',
                            boxShadow: 'none',
                            '&:hover': { bgcolor: '#B91C1C' },
                          }}
                        >
                          Xử lý
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Review / Process Modal */}
      <Dialog open={!!selectedClaim} onClose={handleCloseReview} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3, p: 1 } }}>
        {selectedClaim && (
          <form onSubmit={handleUpdateStatus}>
            <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserIcon sx={{ color: '#DC2626', fontSize: 24 }} />
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Xử lý yêu cầu bảo hành #WC-{selectedClaim.claim_id}
                </Typography>
              </Box>
              <IconButton onClick={handleCloseReview} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 2.5 }}>
              <Stack spacing={2.5}>
                {/* Thông tin đơn hàng & khách hàng */}
                <Box sx={{ p: 2, bgcolor: '#F8FAFC', borderRadius: 2.5, border: '1px solid #E2E8F0' }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', mb: 1 }}>
                    Thông tin yêu cầu
                  </Typography>
                  <Typography sx={{ fontSize: 14, fontWeight: 800, color: '#1E293B' }}>
                    {selectedClaim.product_name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#475569', mt: 0.5 }}>
                    Mã đơn hàng: <strong>#{selectedClaim.order?.order_code}</strong> • Ngày gửi: {formatDate(selectedClaim.created_at)}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: '#475569', mt: 0.25 }}>
                    Khách hàng: <strong>{selectedClaim.user?.full_name}</strong> (SĐT / Email: {selectedClaim.phone_number || selectedClaim.user?.email || 'Chưa cập nhật'})
                  </Typography>
                  {selectedClaim.serial_number && (
                    <Typography sx={{ fontSize: 12, color: '#1D4ED8', mt: 0.25, fontWeight: 700 }}>
                      Số Serial / S/N: {selectedClaim.serial_number}
                    </Typography>
                  )}
                </Box>

                {/* Mô tả lỗi từ khách hàng */}
                <Box>
                  <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569', mb: 0.5 }}>
                    Mô tả lỗi từ khách hàng:
                  </Typography>
                  <Box sx={{ p: 1.5, bgcolor: '#FEF2F2', border: '1px solid #FEE2E2', borderRadius: 2 }}>
                    <Typography sx={{ fontSize: 13, color: '#991B1B', lineHeight: 1.5 }}>
                      "{selectedClaim.issue_description}"
                    </Typography>
                  </Box>
                </Box>

                {/* Hình ảnh lỗi đính kèm */}
                {parseImages(selectedClaim.image_urls).length > 0 && (
                  <Box>
                    <Typography sx={{ fontSize: 12, fontWeight: 700, color: '#475569', mb: 0.75 }}>
                      Hình ảnh minh chứng ({parseImages(selectedClaim.image_urls).length} ảnh):
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1 }}>
                      {parseImages(selectedClaim.image_urls).map((img, i) => (
                        <Box
                          key={i}
                          component="img"
                          src={img}
                          alt="Ảnh lỗi"
                          onClick={() => setZoomImage(img)}
                          sx={{
                            width: 68,
                            height: 68,
                            objectFit: 'cover',
                            borderRadius: 1.5,
                            border: '1px solid #CBD5E1',
                            cursor: 'pointer',
                            '&:hover': { opacity: 0.85 },
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Trạng thái duyệt */}
                <TextField
                  select
                  label="Trạng thái xử lý *"
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  fullWidth
                  size="small"
                >
                  <MenuItem value="pending">Chờ duyệt (Pending)</MenuItem>
                  <MenuItem value="approved">Đã duyệt / Tiếp nhận bảo hành (Approved)</MenuItem>
                  <MenuItem value="repairing">Đang xử lý / Sửa chữa kỹ thuật (Repairing)</MenuItem>
                  <MenuItem value="completed">Đã hoàn thành / Đã trả sản phẩm (Completed)</MenuItem>
                  <MenuItem value="rejected">Từ chối bảo hành (Rejected)</MenuItem>
                </TextField>

                {/* Ghi chú phản hồi cho khách hàng */}
                <TextField
                  label="Ghi chú kỹ thuật & Phản hồi cho khách hàng"
                  placeholder="Ví dụ: Đã tiếp nhận sản phẩm, đã gửi sang trung tâm bảo hành hãng Asus; Hoặc: Lỗi rơi vỡ ngoại lực không thuộc phạm vi bảo hành..."
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  multiline
                  rows={3}
                  fullWidth
                  helperText="Ghi chú này sẽ hiển thị trực tiếp cho khách hàng trong mục Đơn hàng & Bảo hành của họ."
                />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
              <Button variant="outlined" onClick={handleCloseReview} disabled={submittingStatus} sx={{ textTransform: 'none' }}>
                Đóng
              </Button>
              <Button
                variant="contained"
                type="submit"
                disabled={submittingStatus}
                sx={{
                  textTransform: 'none',
                  bgcolor: '#DC2626',
                  fontWeight: 700,
                  '&:hover': { bgcolor: '#B91C1C' },
                }}
              >
                {submittingStatus ? 'Đang cập nhật...' : 'Lưu kết quả xử lý'}
              </Button>
            </DialogActions>
          </form>
        )}
      </Dialog>

      {/* Image Zoom Dialog */}
      <Dialog open={!!zoomImage} onClose={() => setZoomImage(null)} maxWidth="md">
        <Box sx={{ position: 'relative', bgcolor: '#000000', p: 1, display: 'flex', justifyContent: 'center' }}>
          <IconButton
            onClick={() => setZoomImage(null)}
            sx={{ position: 'absolute', top: 8, right: 8, color: '#FFFFFF', bgcolor: 'rgba(0,0,0,0.5)' }}
          >
            <CloseIcon />
          </IconButton>
          <Box
            component="img"
            src={zoomImage}
            alt="Phóng to"
            sx={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 1 }}
          />
        </Box>
      </Dialog>
    </Box>
  );
}
