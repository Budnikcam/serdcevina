const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Основное
  name: { type: String, required: true },
  age: { type: Number, required: true, min: 18, max: 100 },
  gender: { type: String, enum: ['male', 'female'], required: true },
  city: { type: String, default: 'Москва' },
  
  // Профиль
  bio: { type: String, default: '' },
  interests: [{ type: String }],
  lookingFor: { type: String, default: '' },
  photos: [{ type: String }],
  
  // Аутентификация
  email: { type: String, unique: true, sparse: true },
  password: { type: String },
  
  // ИИ-анализ
  aiAnalysis: {
    personalityType: String,
    traits: [String],
    values: [String],
    communicationStyle: String,
    idealPartner: String,
    rawAnalysis: String,
    analyzedAt: Date
  },
  
  // Флаги
  isBot: { type: Boolean, default: false },
  isPremium: { type: Boolean, default: false },
  isOnline: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },
  
  // Игровые механики
  likesReceived: { type: Number, default: 0 },
  likesGiven: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  
  // Настройки
  settings: {
    maxDistance: { type: Number, default: 50 },
    ageRange: { type: [Number], default: [18, 45] },
    showOnline: { type: Boolean, default: true },
    notifications: { type: Boolean, default: true },
  },
  
  // Бот-специфичные поля
  botConfig: {
    activityLevel: { type: Number, default: 0.5 }, // 0-1, как часто активен
    replyChance: { type: Number, default: 0.7 },    // шанс ответить
    likeChance: { type: Number, default: 0.3 },     // шанс лайкнуть
    personality: { type: String },                   // тип личности бота
    conversationStyle: { type: String },             // стиль общения
    interestsWeight: { type: Map, of: Number },      // веса интересов
  },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
