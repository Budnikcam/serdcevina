const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const morgan = require('morgan');

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 200,
  message: { error: 'Слишком много запросов. Попробуйте позже.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10, // 10 попыток входа/регистрации
  message: { error: 'Слишком много попыток. Подождите 15 минут.' },
});

const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30, // 30 AI запросов в минуту
  message: { error: 'AI лимит исчерпан. Подождите минуту.' },
});

// Логирование
const logger = morgan('combined');

// CSP и другие заголовки безопасности
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      imgSrc: ["'self'", 'data:', 'https:', 'http:'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", 'http://localhost:*'],
    },
  },
  crossOriginEmbedderPolicy: false,
});

module.exports = { generalLimiter, authLimiter, aiLimiter, logger, securityHeaders };
