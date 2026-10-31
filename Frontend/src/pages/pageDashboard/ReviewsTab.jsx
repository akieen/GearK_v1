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
import Avatar from '@mui/material/Avatar';
import Rating from '@mui/material/Rating';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

import StarIcon from '@mui/icons-material/Star';
import DeleteOutlineIcon from '@mui/icons-material/Delete';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import RestartAltIcon from '@mui/icons-material/RestartAlt';

import { reviewApi } from '../../api/extraApi';
import { useToast } from '../../context/ToastContext';
import { formatDate } from '../../utils/formatters';
import AdminPagination from '../../components/common/AdminPagination';
import ProductDetailModal from './ProductDetailModal';

export default function ReviewsTab({ isAdmin = true, formatPrice }) {
  const toast = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [ratingFilter, setRatingFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  const [summary, setSummary] = useState({
    total_reviews: 0,
    avg_rating: 5.0,
    count_5_star: 0,
    count_4_star: 0,
    count_3_star: 0,
    count_low_star: 0,
  });

  // Modal xem chi tiết sản phẩm từ review
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [showProductModal, setShowProductModal] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await reviewApi.getAllReviews({
        page: page + 1,
        limit: rowsPerPage,
        rating: ratingFilter !== 'all' ? ratingFilter : undefined,
        search: searchTerm.trim() || undefined,
      });

      if (res.success && res.data) {
        setReviews(res.data.items || []);
        if (res.data.pagination) {
          setTotalItems(res.data.pagination.total || 0);
        }
        if (res.data.summary) {
          setSummary(res.data.summary);
        }
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi tải danh sách đánh giá');
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, ratingFilter, searchTerm, toast]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  const handleDeleteReview = async (id, authorName) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa đánh giá của khách hàng "${authorName}"?`)) return;
    try {
      const res = await reviewApi.deleteReview(id);
      if (res.success) {
        toast.success('Đã xóa đánh giá thành công!');
        fetchReviews();
      }
    } catch (err) {
      toast.error(err.message || 'Lỗi khi xóa đánh giá');
    }
  };

  const handleOpenProductDetail = (prodId) => {
    setSelectedProductId(prodId);
    setShowProductModal(true);
  };

  const kpis = [
    {
      title: 'Tổng số lượt đánh giá',
      main: summary.total_reviews,
      unit: 'nhận xét',
      sub: 'Từ khách hàng đã mua sản phẩm',
      color: '#1E293B',
    },
    {
      title: 'Điểm đánh giá trung bình',
      main: Number(summary.avg_rating).toFixed(1),
      unit: '/ 5 ⭐',
      sub: `${summary.count_5_star} đánh giá 5 sao tuyệt đối`,
      color: '#D97706',
    },
    {
      title: 'Đánh giá tích cực (4-5 sao)',
      main: summary.count_5_star + summary.count_4_star,
      unit: 'lượt',
      sub: 'Mức độ hài lòng của khách hàng',
      color: '#059669',
    },
    {
      title: 'Đánh giá cần lưu ý (≤ 2 sao)',
      main: summary.count_low_star,
      unit: 'lượt',
      sub: 'Cần chăm sóc & hỗ trợ khách hàng',
      color: summary.count_low_star > 0 ? '#DC2626' : '#64748B',
    },
  ];

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 2.5 }}>
        <Box>
          <Typography sx={{ fontSize: 20, fontWeight: 900 }}>⭐ Đánh giá sản phẩm của khách hàng</Typography>
          <Typography sx={{ fontSize: 12.5, color: 'text.secondary', mt: 0.5 }}>
            Theo dõi, lắng nghe ý kiến phản hồi và kiểm duyệt các đánh giá của người mua
          </Typography>
        </Box>
        <IconButton
          onClick={fetchReviews}
          sx={{ bgcolor: '#FFF', border: '1px solid #D1D5DB', borderRadius: 2 }}
          title="Làm mới danh sách đánh giá"
        >
          <RestartAltIcon fontSize="small" />
        </IconButton>
      </Stack>

      {/* KPI Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1.75, mb: 2.5 }}>
        {kpis.map((k, i) => (
          <Paper key={i} elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid #E5E7EB' }}>
            <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>{k.title}</Typography>
            <Typography sx={{ fontSize: 24, fontWeight: 900, color: k.color, mt: 0.5 }}>
              {k.main} <Box component="span" sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>{k.unit}</Box>
            </Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.5 }}>{k.sub}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filter toolbar */}
      <Paper elevation={0} sx={{ p: 1.75, mb: 2, borderRadius: 2, border: '1px solid #E5E7EB', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.25} flexWrap="wrap">
          <Typography sx={{ fontWeight: 700, fontSize: 13 }}>Lọc theo số sao:</Typography>
          <Select
            size="small"
            value={ratingFilter}
            onChange={(e) => { setRatingFilter(e.target.value); setPage(0); }}
            sx={{ fontSize: 13, fontWeight: 600, minWidth: 150, bgcolor: '#F8FAFC' }}
          >
            <MenuItem value="all">Tất cả số sao</MenuItem>
            <MenuItem value="5">⭐⭐⭐⭐⭐ 5 sao</MenuItem>
            <MenuItem value="4">⭐⭐⭐⭐ 4 sao</MenuItem>
            <MenuItem value="3">⭐⭐⭐ 3 sao</MenuItem>
            <MenuItem value="2">⭐⭐ 2 sao</MenuItem>
            <MenuItem value="1">⭐ 1 sao</MenuItem>
          </Select>
        </Stack>

        <TextField
          size="small"
          placeholder="Tìm tên khách, sản phẩm, nội dung..."
          value={searchTerm}
          onChange={(e) => { setSearchTerm(e.target.value); setPage(0); }}
          sx={{ minWidth: 280, '& .MuiInputBase-input': { fontSize: 13, py: 0.85 } }}
        />
      </Paper>

      {/* Bảng danh sách đánh giá */}
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: '#F8FAFC' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Sản phẩm</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Khách hàng</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Đánh giá</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Nội dung nhận xét</TableCell>
              <TableCell sx={{ fontWeight: 700, fontSize: 12.5 }}>Thời gian</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, fontSize: 12.5 }}>Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4.5, color: 'text.secondary' }}>
                  Đang tải danh sách đánh giá...
                </TableCell>
              </TableRow>
            ) : reviews.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4.5, color: 'text.secondary' }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>Không tìm thấy đánh giá nào</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>
                    Hãy thử thay đổi bộ lọc số sao hoặc từ khóa tìm kiếm
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              reviews.map((r) => (
                <TableRow key={r.review_id} hover>
                  {/* Cột sản phẩm */}
                  <TableCell sx={{ py: 1.5, maxWidth: 220 }}>
                    <Stack direction="row" alignItems="center" spacing={1.25}>
                      <Box
                        component="img"
                        src={r.thumbnail_url || 'https://placehold.co/50x50?text=No+Img'}
                        alt=""
                        onClick={() => handleOpenProductDetail(r.product_id)}
                        sx={{
                          width: 44,
                          height: 44,
                          objectFit: 'contain',
                          borderRadius: 1.5,
                          border: '1px solid #E5E7EB',
                          bgcolor: '#FAFAFA',
                          cursor: 'pointer',
                          '&:hover': { transform: 'scale(1.05)' },
                          transition: 'transform 0.15s ease',
                        }}
                      />
                      <Box>
                        <Typography
                          onClick={() => handleOpenProductDetail(r.product_id)}
                          sx={{
                            fontSize: 13,
                            fontWeight: 700,
                            cursor: 'pointer',
                            color: '#0F172A',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
                          }}
                        >
                          {r.product_name}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                          ID: #{r.product_id}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Cột khách hàng */}
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={1}>
                      <Avatar
                        src={r.avatar_url || ''}
                        sx={{ width: 32, height: 32, fontSize: 13, bgcolor: '#6366F1' }}
                      >
                        {r.full_name ? r.full_name.charAt(0).toUpperCase() : 'U'}
                      </Avatar>
                      <Box>
                        <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#1E293B' }}>
                          {r.full_name || 'Khách hàng'}
                        </Typography>
                        <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>
                          {r.email || '—'}
                        </Typography>
                      </Box>
                    </Stack>
                  </TableCell>

                  {/* Cột điểm số sao */}
                  <TableCell>
                    <Stack spacing={0.25}>
                      <Rating value={Number(r.rating)} readOnly size="small" />
                      <Typography sx={{ fontSize: 11, fontWeight: 700, color: r.rating >= 4 ? '#059669' : r.rating <= 2 ? '#DC2626' : '#D97706' }}>
                        {r.rating === 5 ? 'Tuyệt vời (5/5)' : r.rating === 4 ? 'Rất tốt (4/5)' : r.rating === 3 ? 'Bình thường (3/5)' : r.rating === 2 ? 'Kém (2/5)' : 'Rất tệ (1/5)'}
                      </Typography>
                    </Stack>
                  </TableCell>

                  {/* Cột nhận xét */}
                  <TableCell sx={{ maxWidth: 300 }}>
                    <Typography
                      sx={{
                        fontSize: 13,
                        color: '#334155',
                        lineHeight: 1.5,
                        fontStyle: r.content ? 'normal' : 'italic',
                      }}
                    >
                      {r.content ? `"${r.content}"` : 'Khách hàng không để lại nhận xét chi tiết.'}
                    </Typography>
                  </TableCell>

                  {/* Cột thời gian */}
                  <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {formatDate(r.created_at)}
                  </TableCell>

                  {/* Cột hành động */}
                  <TableCell align="center">
                    <Stack direction="row" justifyContent="center" spacing={0.75}>
                      <Tooltip title="Xem chi tiết sản phẩm">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenProductDetail(r.product_id)}
                          sx={{ bgcolor: '#EFF6FF', color: '#2563EB', border: '1px solid #BFDBFE', borderRadius: 1.5 }}
                        >
                          <VisibilityOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      {isAdmin && (
                        <Tooltip title="Xóa đánh giá này">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteReview(r.review_id, r.full_name)}
                            sx={{ bgcolor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 1.5 }}
                          >
                            <DeleteOutlineIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {totalItems > 0 && (
          <AdminPagination
            count={totalItems}
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

      {/* Modal xem chi tiết sản phẩm khi bấm xem từ review */}
      <ProductDetailModal
        open={showProductModal}
        productId={selectedProductId}
        onClose={() => {
          setShowProductModal(false);
          setSelectedProductId(null);
        }}
        formatPrice={formatPrice || ((p) => `${Number(p).toLocaleString()}₫`)}
      />
    </Box>
  );
}

