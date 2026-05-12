const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Match = require('../models/Match');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ error: 'Нет токена' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret-key');
    req.user = await User.findById(decoded.userId);
    next();
  } catch {
    res.status(401).json({ error: 'Авторизация' });
  }
};

// GET /api/messages/:matchId
router.get('/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match || !match.users.includes(req.user._id)) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    
    const messages = await Message.find({ match: req.params.matchId })
      .populate('sender', 'name')
      .sort({ createdAt: 1 });
    
    res.json({ count: messages.length, messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/messages/:matchId
router.post('/:matchId', auth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId);
    if (!match || !match.users.includes(req.user._id)) {
      return res.status(403).json({ error: 'Нет доступа' });
    }
    
    const message = await Message.create({
      match: req.params.matchId,
      sender: req.user._id,
      text: req.body.text,
    });
    
    res.json(message);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
