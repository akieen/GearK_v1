const { PrismaClient } = require('@prisma/client');

// Tự động serialize BigInt thành Number hoặc String khi gửi JSON response qua Express
BigInt.prototype.toJSON = function () {
  const int = Number(this);
  return Number.isSafeInteger(int) ? int : this.toString();
};

const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

module.exports = prisma;

