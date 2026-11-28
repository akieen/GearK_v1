require('dotenv').config();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Cloudinary storage configuration
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'geark_products',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
  },
});

// File type filter - allow jpg, jpeg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Định dạng tệp không được hỗ trợ! Chỉ chấp nhận ảnh: JPG, JPEG, PNG, WEBP.'
      ),
      false
    );
  }
};

// Multer upload instance using CloudinaryStorage
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit per file
  },
});

// Helper to extract direct HTTPS URL from Multer/Cloudinary file object
function getUploadedFileUrl(file) {
  if (!file) return null;
  if (file.path && (file.path.startsWith('http://') || file.path.startsWith('https://'))) {
    return file.path;
  }
  if (file.secure_url) return file.secure_url;
  if (file.url) return file.url;
  if (file.path) return file.path;
  return null;
}

module.exports = {
  upload,
  cloudinary,
  storage,
  getUploadedFileUrl,
};
