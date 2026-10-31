const { PrismaClient } = require('@prisma/client');
const dotenv = require('dotenv');

dotenv.config();

// Tự động xây dựng DATABASE_URL từ DB_* nếu DATABASE_URL chưa được thiết lập
if (!process.env.DATABASE_URL) {
  const user = process.env.DB_USER || 'root';
  const pass = process.env.DB_PASSWORD !== undefined && process.env.DB_PASSWORD !== ''
    ? `:${encodeURIComponent(process.env.DB_PASSWORD)}`
    : '';
  const host = process.env.DB_HOST || 'localhost';
  const port = process.env.DB_PORT || 3306;
  const db = process.env.DB_NAME || 'geark_db';
  process.env.DATABASE_URL = `mysql://${user}${pass}@${host}:${port}/${db}`;
}

// Tự động serialize BigInt thành Number hoặc String khi gửi JSON response qua Express
BigInt.prototype.toJSON = function () {
  const int = Number(this);
  return Number.isSafeInteger(int) ? int : this.toString();
};

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;
