// Currency and helper formatters for GearK

export const formatPrice = (amount) => {
  if (amount === undefined || amount === null || isNaN(amount)) return '0₫';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(num).replace('VND', '₫');
};

export const formatNumber = (num) => {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return new Intl.NumberFormat('vi-VN').format(num);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const calculateDiscount = (originalPrice, salePrice) => {
  const orig = parseFloat(originalPrice);
  const sale = parseFloat(salePrice);
  if (!orig || !sale || sale >= orig) return 0;
  return Math.round(((orig - sale) / orig) * 100);
};

export const getOrderStatusText = (status) => {
  const map = {
    pending: { label: 'Chờ xác nhận', color: '#D97706', bg: '#FEF3C7' },
    confirmed: { label: 'Đã xác nhận', color: '#2563EB', bg: '#DBEAFE' },
    processing: { label: 'Đang xử lý', color: '#6366F1', bg: '#EEF2FF' },
    shipping: { label: 'Đang giao hàng', color: '#7C3AED', bg: '#EDE9FE' },
    completed: { label: 'Đã hoàn thành', color: '#059669', bg: '#D1FAE5' },
    cancelled: { label: 'Đã hủy', color: '#DC2626', bg: '#FEE2E2' },
    refunded: { label: 'Đã hoàn tiền', color: '#DB2777', bg: '#FCE7F3' },
  };
  return map[status] || { label: status, color: '#6B7280', bg: '#F3F4F6' };
};

export const removeVietnameseTones = (str) => {
  if (!str) return '';
  return str
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd');
};

export const generateSku = (productName = '', variantName = '') => {
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
};
