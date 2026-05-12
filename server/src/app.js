const express = require('express');
const cors = require('cors');
const compression = require('compression');
require('dotenv').config();
const { generalLimiter, authLimiter, aiLimiter, logger, securityHeaders } = require('./middleware/security');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const messageRoutes = require('./routes/messages');
const aiProxy = require('./aiProxy');
const gameRoutes = require('./routes/game');

const app = express();
app.use(securityHeaders);
app.use(logger);
app.use(compression());
app.use(generalLimiter);
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'Сердцевина API', version: '1.0.0', timestamp: new Date().toISOString() }));
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/messages', messageRoutes);
app.use('/ai', aiLimiter, aiProxy);
app.use('/api/game', gameRoutes);
app.use((req, res) => res.status(404).json({ error: 'Не найдено' }));
module.exports = app;
