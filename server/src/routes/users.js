const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Match = require('../models/Match');
const jwt = require('jsonwebtoken');

// Middleware авторизации
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Нет токена' });
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.user = await User.findById(decoded.userId);
    if (!req.user) return res.status(401).json({ error: 'Пользователь не найден' });
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Неверный токен' });
  }
};

// GET /api/users/discover — анкеты для свайпа
router.get('/discover', auth, async (req, res) => {
  try {
    const { gender, minAge, maxAge, city } = req.query;
    const filter = { _id: { $ne: req.user._id } }; // Исключаем себя
    
    if (gender) filter.gender = gender;
    else filter.gender = req.user.gender === 'male' ? 'female' : 'male';
    
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = parseInt(minAge);
      if (maxAge) filter.age.$lte = parseInt(maxAge);
    }
    if (city) filter.city = city;

    // Получаем ID уже просмотренных/лайкнутых
    const existingMatches = await Match.find({
      users: req.user._id,
      status: { $in: ['matched', 'rejected'] }
    });
    const excludeIds = existingMatches.flatMap(m => m.users);
    filter._id.$nin = [...excludeIds, req.user._id];

    const users = await User.find(filter)
      .select('-password -email -settings -botConfig')
      .sort({ lastActive: -1 })
      .limit(50);

    // Перемешиваем
    const shuffled = users.sort(() => Math.random() - 0.5);

    res.json({
      count: shuffled.length,
      users: shuffled.map(u => ({
        id: u._id,
        name: u.name,
        age: u.age,
        city: u.city,
        bio: u.bio,
        interests: u.interests,
        lookingFor: u.lookingFor,
        photos: u.photos,
        aiTraits: u.aiAnalysis?.traits?.join(', ') || '',
        compatibility: Math.floor(Math.random() * 30) + 65,
        isOnline: u.isOnline,
        isVerified: u.isVerified,
        isBot: u.isBot,
        aiAnalysis: u.aiAnalysis,
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/me — свой профиль
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUT /api/users/me — обновить профиль
router.put('/me', auth, async (req, res) => {
  try {
    const allowed = ['name', 'age', 'city', 'bio', 'interests', 'lookingFor', 'photos'];
    const updates = {};
    allowed.forEach(key => {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    });
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/like/:userId — лайкнуть
router.post('/like/:userId', auth, async (req, res) => {
  try {
    const targetId = req.params.userId;
    
    // Проверяем существующий мэтч
    let match = await Match.findOne({
      users: { $all: [req.user._id, targetId] }
    });
    
    if (match) {
      return res.json({ match, message: 'Уже лайкнули' });
    }
    
    // Проверяем, лайкнул ли нас этот пользователь
    const reverseMatch = await Match.findOne({
      users: { $all: [targetId, req.user._id] },
      status: 'pending',
      initiator: targetId,
    });
    
    if (reverseMatch) {
      // Это мэтч! Обновляем статус
      reverseMatch.status = 'matched';
      reverseMatch.matchedAt = new Date();
      reverseMatch.compatibility = Math.floor(Math.random() * 30) + 70;
      await reverseMatch.save();
      
      // Обновляем счётчики
      await User.findByIdAndUpdate(req.user._id, { $inc: { matches: 1, likesGiven: 1 } });
      await User.findByIdAndUpdate(targetId, { $inc: { matches: 1, likesReceived: 1 } });
      
      return res.json({ match: reverseMatch, message: '💕 Это мэтч!' });
    }
    
    // Создаём новый лайк
    match = await Match.create({
      users: [req.user._id, targetId],
      initiator: req.user._id,
      status: 'pending',
      compatibility: Math.floor(Math.random() * 30) + 65,
    });
    
    await User.findByIdAndUpdate(req.user._id, { $inc: { likesGiven: 1 } });
    
    res.json({ match, message: '❤️ Лайк отправлен' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/users/pass/:userId — пропустить
router.post("/pass/:userId", auth, async (req, res) => {
  try {
    const existing = await Match.findOne({
      users: { $all: [req.user._id, req.params.userId] }
    });
    if (!existing) {
      await Match.create({
        users: [req.user._id, req.params.userId],
        initiator: req.user._id,
        status: "rejected",
      });
    } else {
      existing.status = "rejected";
      await existing.save();
    }
    res.json({ message: "Пропущено" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/matches — получить мэтчи
router.get('/matches', auth, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user._id,
      status: 'matched',
    }).populate('users', '-password -email -settings -botConfig');
    
    const result = matches.map(m => {
      const partner = m.users.find(u => u._id.toString() !== req.user._id.toString());
      return {
        id: m._id,
        user: partner,
        compatibility: m.compatibility,
        matchedAt: m.matchedAt,
        aiAnalysis: m.aiAnalysis,
      };
    });
    
    res.json({ count: result.length, matches: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/users/favorites — избранное (это по сути pending мэтчи)
router.get('/favorites', auth, async (req, res) => {
  try {
    const matches = await Match.find({
      users: req.user._id,
      status: 'pending',
      initiator: { $ne: req.user._id }, // Нас лайкнули
    }).populate('users', '-password -email -settings -botConfig');
    
    const result = matches.map(m => {
      const partner = m.users.find(u => u._id.toString() !== req.user._id.toString());
      return {
        id: m._id,
        user: partner,
        compatibility: m.compatibility,
      };
    });
    
    res.json({ count: result.length, favorites: result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
