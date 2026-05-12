const mongoose = require('mongoose');

const userLevelSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true },
  level: { type: Number, default: 1 },
  xp: { type: Number, default: 0 },
  xpToNextLevel: { type: Number, default: 100 },
  streak: { type: Number, default: 0 }, // дней подряд
  lastLoginDate: Date,
  dailyBonusClaimed: { type: Boolean, default: false },
  dailyBonusDate: Date,
  
  // Статистика
  totalLikes: { type: Number, default: 0 },
  totalMatches: { type: Number, default: 0 },
  totalMessages: { type: Number, default: 0 },
  sparksUsed: { type: Number, default: 0 },
  partiesJoined: { type: Number, default: 0 },
  
  createdAt: { type: Date, default: Date.now },
});

// Расчёт XP до следующего уровня
userLevelSchema.methods.calculateXPToNext = function() {
  return Math.floor(100 * Math.pow(1.5, this.level - 1));
};

// Добавление XP и проверка уровня
userLevelSchema.methods.addXP = async function(amount) {
  this.xp += amount;
  
  while (this.xp >= this.xpToNextLevel) {
    this.xp -= this.xpToNextLevel;
    this.level += 1;
    this.xpToNextLevel = this.calculateXPToNext();
  }
  
  return this.save();
};

module.exports = mongoose.model('UserLevel', userLevelSchema);
