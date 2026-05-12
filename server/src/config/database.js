const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://localhost:27017/Сердцевина'
    );
    console.log(`✅ MongoDB подключена: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Ошибка MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
