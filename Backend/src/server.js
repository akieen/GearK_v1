const dotenv = require('dotenv');
dotenv.config();

const app = require('./app');
const { testConnection } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Test MySQL connection before listening
  const isDbConnected = await testConnection();

  const server = app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`🚀 GearK Backend API đang chạy tại: http://localhost:${PORT}`);
    console.log(`📦 Kết nối MySQL: ${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 3306}`);
    console.log(`🗄️  Cơ sở dữ liệu: ${process.env.DB_NAME || 'geark_db'}`);
    console.log(`🌐 phpMyAdmin: http://localhost/phpmyadmin/index.php?route=/database/structure&db=${process.env.DB_NAME || 'geark_db'}`);
    console.log(`🩺 Kiểm tra Health Check: http://localhost:${PORT}/api/health`);
    console.log('====================================================');

    if (!isDbConnected) {
      console.warn('⚠️  Cảnh báo: Không thể kết nối tới MySQL database.');
      console.warn('👉 Hãy chắc chắn bạn đã khởi động MySQL trong XAMPP / WampServer và đã import file geark_db.sql!');
    }
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('\n🛑 Đang dừng server GearK Backend...');
    server.close(() => {
      console.log('✅ Server đã dừng thành công.');
      process.exit(0);
    });
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

startServer();
