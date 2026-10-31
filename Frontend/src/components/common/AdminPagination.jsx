import React from 'react';
import TablePagination from '@mui/material/TablePagination';

export default function AdminPagination({
  count = 0,
  page = 0,
  rowsPerPage = 10,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 20, 50],
  sx = {},
}) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={Math.max(0, Math.min(page, Math.max(0, Math.ceil(count / rowsPerPage) - 1)))}
      onPageChange={onPageChange}
      rowsPerPage={rowsPerPage}
      onRowsPerPageChange={onRowsPerPageChange}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage="Số dòng mỗi trang:"
      labelDisplayedRows={({ from, to, count: totalCount }) =>
        `${from} - ${to} trên tổng số ${totalCount !== -1 ? totalCount : `hơn ${to}`}`
      }
      sx={{
        borderTop: '1px solid #E5E7EB',
        bgcolor: '#FAFAFA',
        '.MuiTablePagination-toolbar': {
          minHeight: 52,
          px: 2,
        },
        '.MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows': {
          fontSize: '0.8125rem',
          color: '#475569',
          fontWeight: 600,
        },
        '.MuiTablePagination-select': {
          fontSize: '0.8125rem',
          fontWeight: 700,
          py: 0.5,
        },
        ...sx,
      }}
    />
  );
}

