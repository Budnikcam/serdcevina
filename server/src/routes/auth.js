const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// POST /api/auth/register
router.post('/register', [
  body('email').isEmail().withMessage('Некорректный email'),
  body('password').isLength({ min: 6 }).withMessage('Пароль минимум 6 символов'),
  body('name').notEmpty().withMessage('Имя обязательно'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, age, gender, bio, interests, lookingFor, aiAnalysis } = req.body;

    // Проверка email
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Пользователь с таким email уже существует' });
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10);

    // Создаём пользователя
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      age: parseInt(age),
      gender,
      bio,
      interests: interests || [],
      lookingFor,
      aiAnalysis: aiAnalysis ? {
        rawAnalysis: aiAnalysis,
        analyzedAt: new Date(),
      } : undefined,
      isBot: false,
      isOnline: true,
      lastActive: new Date(),
      photos: [`https://i.pravatar.cc/400?u=${email}`],
    });

    // Токен
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Регистрация успешна!',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        aiAnalysis: user.aiAnalysis,
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Неверный email или пароль' });
    }

    // Обновляем онлайн
    user.isOnline = true;
    user.lastActive = new Date();
    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        aiAnalysis: user.aiAnalysis,
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

module.exports = router;
