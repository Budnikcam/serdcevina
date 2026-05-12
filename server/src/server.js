const app = require('./app');
const connectDB = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Подключаем БД и запускаем сервер
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Сервер: http://localhost:${PORT}`);
    console.log(`🤖 AI: http://localhost:8000`);
  });
});
