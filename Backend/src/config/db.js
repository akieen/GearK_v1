const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const prisma = require('./prisma');

dotenv.config();

// Create MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'geark_db',
  waitForConnections: true,
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

// Test MySQL database connection
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log(`[Database] Đã kết nối thành công tới MySQL database: ${process.env.DB_NAME || 'geark_db'} trên port ${process.env.DB_PORT || 3306}`);
    connection.release();
    return true;
  } catch (error) {
    console.error('[Database Error] Không thể kết nối tới cơ sở dữ liệu MySQL:');
    console.error(`- Host: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.error(`- User: ${process.env.DB_USER || 'root'}`);
    console.error(`- Database: ${process.env.DB_NAME || 'geark_db'}`);
    console.error(`- Chi tiết lỗi: ${error.message}`);
    return false;
  }
}

module.exports = {
  pool,
  prisma,
  testConnection
};
