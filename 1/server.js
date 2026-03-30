const mongoose = require('mongoose');
const { logInfo, logError } = require('./utils/logger');
require('dotenv').config();

const app = require('./app');

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  logInfo('MongoDB connected successfully');
  console.log('✅ MongoDB connected');
})
.catch(err => {
  logError(err, null, { type: 'database_connection_error' });
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// معالجة الأخطاء غير الملتقطة
process.on('uncaughtException', (err) => {
  logError(err, null, { type: 'uncaught_exception' });
  console.error('❌ Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logError(err, null, { type: 'unhandled_rejection' });
  console.error('❌ Unhandled Rejection:', err);
  process.exit(1);
});

// إغلاق أنيق للخادم
process.on('SIGTERM', () => {
  logInfo('SIGTERM received, shutting down gracefully');
  console.log('🔄 SIGTERM received, shutting down gracefully');
  
  mongoose.connection.close(() => {
    logInfo('MongoDB connection closed');
    console.log('✅ MongoDB connection closed');
    process.exit(0);
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logInfo(`Server running on port ${PORT}`, {
    port: PORT,
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
  console.log(`🚀 Server running on port ${PORT}`);
});

module.exports = server;
