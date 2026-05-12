const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();

const { generalLimiter, authLimiter, aiLimiter, logger, securityHeaders } = require('./middleware/security');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');

const app = express();

// Безопасность
app.use(securityHeaders);
app.use(logger);
app.use(compression());
app.use(generalLimiter);

// CORS
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check (без ограничений)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Сердцевина API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage().heapUsed / 1024 / 1024,
  });
});

// API Routes с ограничениями
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);

// AI Proxy с ограничениями
app.use('/ai', aiLimiter, async (req, res) => {
  try {
    const axios = require('axios');
    const response = await axios({
      method: req.method,
      url: `http://localhost:8000${req.url}`,
      data: req.body,
      timeout: 30000,
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'AI сервис недоступен' });
  }
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Маршрут не найден' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Внутренняя ошибка сервера' : err.message,
  });
});

module.exports = app;
