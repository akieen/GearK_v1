function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function generateOrderCode() {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `GK-${dateStr}-${randomStr}`;
}

function successResponse(res, data = null, message = 'Thành công', statusCode = 200) {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
}

function errorResponse(res, message = 'Có lỗi xảy ra', statusCode = 400, errors = null) {
  const response = {
    success: false,
    message
  };
  if (errors) {
    response.errors = errors;
  }
  return res.status(statusCode).json(response);
}

function removeVietnameseTones(str) {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');
}

function generateSku(productName = '', variantName = '') {
  const STOP_WORDS = new Set([
    'CHUOT', 'BAN', 'PHIM', 'TAI', 'NGHE', 'LOT', 'GHE', 'MAN', 'HINH',
    'DE', 'TAY', 'CAP', 'BO', 'CON', 'CAI', 'KHONG', 'DAY', 'GAMING',
    'CHINH', 'HANG', 'CO'
  ]);
  const VAR_STOP_WORDS = new Set(['MAU', 'BAN', 'PHAN', 'LOAI', 'SIZE', 'PHIEN']);

  const clean = (str) => {
    if (!str) return [];
    return removeVietnameseTones(str)
      .toUpperCase()
      .replace(/[^A-Z0-9\s]/g, ' ')
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  };

  const prodTokens = clean(productName);
  const meaningfulProdTokens = prodTokens.filter((w) => !STOP_WORDS.has(w));
  const finalProdTokens = meaningfulProdTokens.length > 0 ? meaningfulProdTokens : prodTokens;

  const varTokens = clean(variantName);
  const meaningfulVarTokens = varTokens.filter((w) => !VAR_STOP_WORDS.has(w));
  const finalVarTokens = meaningfulVarTokens.length > 0 ? meaningfulVarTokens : varTokens;

  let prodPart = finalProdTokens.slice(0, 2).join('-');
  if (prodPart.length > 12) prodPart = prodPart.slice(0, 12);
  if (!prodPart) prodPart = 'GEARK';

  let varPart = finalVarTokens.slice(0, 2).join('-');
  if (varPart.length > 8) varPart = varPart.slice(0, 8);
  if (!varPart) varPart = 'STD';

  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `${prodPart}-${varPart}-${rand}`.replace(/--+/g, '-');
}

module.exports = {
  slugify,
  generateSku,
  generateOrderCode,
  successResponse,
  errorResponse
};
