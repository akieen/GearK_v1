function notFoundHandler(req, res, next) {
  res.status(404).json({
    success: false,
    message: `Không tìm thấy endpoint: [${req.method}] ${req.originalUrl}`
  });
}

function errorHandler(err, req, res, next) {
  console.error('[Error Details]:', err);

  // Handle MySQL specific errors
  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      message: 'Dữ liệu bị trùng lặp (ví dụ: email, slug hoặc mã đã tồn tại)',
      detail: err.sqlMessage
    });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_ROW_IS_REFERENCED_2') {
    return res.status(400).json({
      success: false,
      message: 'Lỗi ràng buộc khóa ngoại (foreign key constraint) trong cơ sở dữ liệu',
      detail: err.sqlMessage
    });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Lỗi hệ thống máy chủ nội bộ',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
