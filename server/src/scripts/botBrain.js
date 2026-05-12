const mongoose = require('mongoose');
const User = require('../models/User');
const Match = require('../models/Match');
const Message = require('../models/Message');
const axios = require('axios');
require('dotenv').config();

const AI_URL = '/ai';

class BotBrain {
  constructor() {
    this.bots = [];
    this.realUsers = [];
  }

  async init() {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/Сердцевина');
    console.log('🧠 BotBrain подключён к MongoDB');
    
    // Загружаем ботов и реальных пользователей
    this.bots = await User.find({ isBot: true });
    this.realUsers = await User.find({ isBot: false });
    
    console.log(`👥 Ботов: ${this.bots.length}, Реальных: ${this.realUsers.length}`);
  }

  // Бот лайкает случайного пользователя
  async botLike() {
    const bot = this.bots[Math.floor(Math.random() * this.bots.length)];
    if (!bot || Math.random() > bot.botConfig.likeChance) return null;
    
    const target = this.realUsers[Math.floor(Math.random() * this.realUsers.length)];
    if (!target) return null;
    
    // Проверяем, не лайкал ли уже
    const existingMatch = await Match.findOne({
      users: { $all: [bot._id, target._id] }
    });
    
    if (existingMatch) return null;
    
    // Создаём мэтч
    const match = await Match.create({
      users: [bot._id, target._id],
      initiator: bot._id,
      compatibility: Math.floor(Math.random() * 30) + 70, // 70-100%
      status: 'pending',
    });
    
    // Обновляем счётчики
    await User.findByIdAndUpdate(bot._id, { $inc: { likesGiven: 1 } });
    await User.findByIdAndUpdate(target._id, { $inc: { likesReceived: 1 } });
    
    console.log(`❤️ ${bot.name} лайкнул(а) ${target.name} (${match.compatibility}%)`);
    return match;
  }

  // Бот отвечает на сообщение
  async botReply(matchId) {
    const match = await Match.findById(matchId).populate('users');
    if (!match) return null;
    
    const bot = match.users.find(u => u.isBot);
    const realUser = match.users.find(u => !u.isBot);
    
    if (!bot || !realUser) return null;
    if (Math.random() > bot.botConfig.replyChance) return null;
    
    // Генерируем ответ через AI
    try {
      const response = await axios.post(`${AI_URL}/generate-message`, {
        my_profile: {
          name: bot.name,
          age: bot.age,
          bio: bot.bio,
          interests: bot.interests,
          looking_for: bot.lookingFor,
        },
        their_profile: {
          name: realUser.name,
          age: realUser.age,
          bio: realUser.bio,
          interests: realUser.interests,
          looking_for: realUser.lookingFor,
        },
        context: 'Продолжи диалог естественно, как реальный человек. 1-2 предложения. Без приветствий.',
        model: 'auto'
      });
      
      const text = response.data.messages.replace(/\*\*/g, '').split('\n')[0].trim();
      
      const message = await Message.create({
        match: match._id,
        sender: bot._id,
        text: text || 'Привет! Как дела? 😊',
        isAIGenerated: true,
      });
      
      console.log(`💬 ${bot.name} → ${realUser.name}: "${message.text}"`);
      return message;
    } catch (error) {
      console.error('Ошибка генерации:', error.message);
      return null;
    }
  }

  // Обновление онлайна ботов
  async updateOnline() {
    for (const bot of this.bots) {
      const shouldBeOnline = Math.random() < bot.botConfig.activityLevel;
      if (bot.isOnline !== shouldBeOnline) {
        await User.findByIdAndUpdate(bot._id, { 
          isOnline: shouldBeOnline,
          lastActive: new Date()
        });
      }
    }
  }

  // Главный цикл
  async tick() {
    console.log('\n🔄 Такт бота...');
    
    // 1. Несколько лайков
    const likesCount = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < likesCount; i++) {
      await this.botLike();
    }
    
    // 2. Ответы на существующие мэтчи
    const pendingMatches = await Match.find({ status: 'matched' }).populate('users');
    const messagesToReply = pendingMatches.filter(m => 
      m.users.some(u => u.isBot) && Math.random() > 0.5
    );
    
    for (const match of messagesToReply.slice(0, 2)) {
      await this.botReply(match._id);
    }
    
    // 3. Обновление онлайна
    await this.updateOnline();
    
    console.log(`✅ Выполнено: ${likesCount} лайков, ${Math.min(messagesToReply.length, 2)} ответов`);
  }

  // Запуск цикла
  startLoop(intervalMs = 30000) {
    console.log(`⏰ Запуск цикла ботов (каждые ${intervalMs / 1000} сек)`);
    
    this.tick(); // Первый запуск сразу
    setInterval(() => this.tick(), intervalMs);
  }
}

// Запуск
if (require.main === module) {
  const brain = new BotBrain();
  brain.init().then(() => {
    brain.startLoop(30000); // Каждые 30 секунд
  });
}

module.exports = BotBrain;
