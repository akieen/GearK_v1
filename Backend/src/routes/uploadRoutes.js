const express = require('express');
const router = express.Router();
const multer = require('multer');
const { upload } = require('../middlewares/upload');
const { verifyToken } = require('../middlewares/auth');
const { successResponse, errorResponse } = require('../utils/helpers');

// Middleware wrapper to catch Multer errors gracefully
function handleMulterUpload(uploadMiddleware) {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return errorResponse(res, 'Dung lượng ảnh vượt quá giới hạn cho phép (tối đa 10MB)', 400);
        }
        return errorResponse(res, `Lỗi tải tệp: ${err.message}`, 400);
      } else if (err) {
        return errorResponse(res, err.message, 400);
      }
      next();
    });
  };
}

// [POST] /api/upload (accepts any image field: file, image, files, images)
router.post(
  '/',
  verifyToken,
  handleMulterUpload(upload.any()),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'Vui lòng chọn ít nhất một tệp ảnh để tải lên', 400);
    }

    const uploadedUrls = req.files.map((f) => `/uploads/${f.filename}`);
    const primaryUrl = uploadedUrls[0];

    const fileDetails = req.files.map((f) => ({
      filename: f.filename,
      original_name: f.originalname,
      size: f.size,
      mimetype: f.mimetype,
      url: `/uploads/${f.filename}`,
    }));

    return successResponse(
      res,
      {
        url: primaryUrl,
        urls: uploadedUrls,
        files: fileDetails,
        count: uploadedUrls.length,
      },
      `Tải lên thành công ${uploadedUrls.length} ảnh`,
      201
    );
  }
);

// [POST] /api/upload/multiple (explicit multi upload)
router.post(
  '/multiple',
  verifyToken,
  handleMulterUpload(upload.array('images', 20)),
  (req, res) => {
    if (!req.files || req.files.length === 0) {
      return errorResponse(res, 'Vui lòng chọn ảnh để tải lên', 400);
    }

    const uploadedUrls = req.files.map((f) => `/uploads/${f.filename}`);
    return successResponse(
      res,
      {
        urls: uploadedUrls,
        count: uploadedUrls.length,
      },
      `Tải lên thành công ${uploadedUrls.length} ảnh`,
      201
    );
  }
);

module.exports = router;
