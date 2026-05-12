const UserLevel = require('../models/UserLevel');
const Achievement = require('../models/Achievement');
const User = require('../models/User');

class GameService {
  static async claimDailyBonus(userId) {
    let level = await UserLevel.findOne({ user: userId });
    if (!level) level = await UserLevel.create({ user: userId });

    const today = new Date().toDateString();
    if (level.dailyBonusDate?.toDateString() === today) {
      return { claimed: false, message: 'Уже получен' };
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    level.streak = level.lastLoginDate?.toDateString() === yesterday.toDateString() 
      ? level.streak + 1 : 1;

    const baseXP = 50;
    const streakBonus = Math.min(level.streak * 10, 100);
    const totalXP = baseXP + streakBonus + level.level * 5;

    const bonuses = [{ type: 'xp', amount: totalXP, icon: '⭐' }];
    if (level.streak % 3 === 0) bonuses.push({ type: 'super_like', amount: 1, icon: '💎' });
    if (level.streak % 7 === 0) bonuses.push({ type: 'boost', amount: 1, icon: '🚀' });
    if (level.streak % 30 === 0) bonuses.push({ type: 'premium_day', amount: 1, icon: '👑' });

    level.xp += totalXP;
    level.dailyBonusDate = new Date();
    level.lastLoginDate = new Date();
    
    while (level.xp >= level.xpToNextLevel) {
      level.xp -= level.xpToNextLevel;
      level.level += 1;
      level.xpToNextLevel = Math.floor(100 * Math.pow(1.5, level.level - 1));
    }
    await level.save();

    if (level.streak === 3) await this.unlockAchievement(userId, 'daily_login_3');
    if (level.streak === 7) await this.unlockAchievement(userId, 'daily_login_7');
    if (level.streak === 30) await this.unlockAchievement(userId, 'daily_login_30');

    return { claimed: true, streak: level.streak, level: level.level, xp: level.xp, xpToNext: level.xpToNextLevel, bonuses, totalXP };
  }

  static async activateSpark(userId) {
    const user = await User.findById(userId);
    const oppositeGender = user.gender === 'male' ? 'female' : 'male';
    const onlineUsers = await User.find({ gender: oppositeGender, isOnline: true, _id: { $ne: userId } }).limit(20);
    if (!onlineUsers.length) return { success: false, message: 'Никого онлайн' };

    const candidates = onlineUsers.map(u => ({ user: u, score: Math.random() * 40 + 60 }));
    candidates.sort((a, b) => b.score - a.score);
    const best = candidates[0];

    const Match = require('../models/Match');
    const match = await Match.create({
      users: [userId, best.user._id], initiator: userId, status: 'matched',
      compatibility: Math.floor(best.score), matchedAt: new Date(), isSpark: true,
    });

    await UserLevel.findOneAndUpdate({ user: userId }, { $inc: { sparksUsed: 1, xp: 30, totalMatches: 1 } }, { upsert: true });
    await this.unlockAchievement(userId, 'spark_used');

    return { success: true, match: { name: best.user.name, age: best.user.age, city: best.user.city, compatibility: Math.floor(best.score) }, matchId: match._id };
  }

  static async joinParty(userId) {
    const user = await User.findById(userId);
    let partyUsers = await User.find({ _id: { $ne: userId }, isOnline: true }).limit(5);
    if (partyUsers.length < 2) {
      const bots = await User.find({ isBot: true, isOnline: true }).limit(5);
      partyUsers.push(...bots);
    }
    const shuffled = partyUsers.sort(() => Math.random() - 0.5);
    const matches = [];
    for (let i = 0; i < Math.min(shuffled.length, 3); i++) {
      matches.push({ user: { name: shuffled[i].name, age: shuffled[i].age, city: shuffled[i].city, interests: shuffled[i].interests?.slice(0, 3) }, compatibility: Math.floor(Math.random() * 30) + 70 });
    }

    await UserLevel.findOneAndUpdate({ user: userId }, { $inc: { partiesJoined: 1, xp: 50 } }, { upsert: true });
    await this.unlockAchievement(userId, 'party_joined');
    return { success: true, party: matches };
  }

  static async unlockAchievement(userId, type) {
    const existing = await Achievement.findOne({ user: userId, type });
    if (existing) return null;

    const list = {
      first_like: { title: 'Первая симпатия', desc: 'Первый лайк', icon: '❤️', xp: 50 },
      first_match: { title: 'Это мэтч!', desc: 'Первое совпадение', icon: '💕', xp: 100 },
      first_message: { title: 'Первое слово', desc: 'Первое сообщение', icon: '💬', xp: 50 },
      ten_likes: { title: 'Симпатяга', desc: '10 лайков', icon: '👍', xp: 100 },
      fifty_likes: { title: 'Сердцеед', desc: '50 лайков', icon: '😍', xp: 300 },
      hundred_likes: { title: 'Звезда', desc: '100 лайков', icon: '⭐', xp: 500 },
      five_matches: { title: 'Везунчик', desc: '5 мэтчей', icon: '🍀', xp: 200 },
      twenty_matches: { title: 'Магнит', desc: '20 мэтчей', icon: '🧲', xp: 500 },
      profile_complete: { title: 'Душа нараспашку', desc: 'Профиль заполнен', icon: '✨', xp: 100 },
      photo_added: { title: 'Фотомодель', desc: 'Фото добавлено', icon: '📸', xp: 50 },
      ai_analysis: { title: 'Познай себя', desc: 'ИИ-анализ', icon: '🤖', xp: 150 },
      daily_login_3: { title: 'Верный', desc: '3 дня подряд', icon: '🔥', xp: 100 },
      daily_login_7: { title: 'Неделя', desc: '7 дней подряд', icon: '📅', xp: 250 },
      daily_login_30: { title: 'Месяц', desc: '30 дней', icon: '👑', xp: 1000 },
      messages_sent_10: { title: 'Болтун', desc: '10 сообщений', icon: '💬', xp: 100 },
      messages_sent_50: { title: 'Оратор', desc: '50 сообщений', icon: '🎤', xp: 500 },
      spark_used: { title: 'Искра', desc: 'Spark использован', icon: '⚡', xp: 100 },
      party_joined: { title: 'Тусовщик', desc: 'Вечеринка', icon: '🎉', xp: 150 },
      premium: { title: 'VIP', desc: 'Premium', icon: '💎', xp: 500 },
      level_5: { title: 'Бывалый', desc: '5 уровень', icon: '📈', xp: 300 },
      level_10: { title: 'Легенда', desc: '10 уровень', icon: '🏆', xp: 1000 },
    };

    const ach = list[type];
    if (!ach) return null;

    const achievement = await Achievement.create({ user: userId, type, title: ach.title, description: ach.desc, icon: ach.icon, xpReward: ach.xp });
    await UserLevel.findOneAndUpdate({ user: userId }, { $inc: { xp: ach.xp } }, { upsert: true });
    return achievement;
  }

  static async checkAchievements(userId) {
    const level = await UserLevel.findOne({ user: userId });
    if (!level) return [];
    const types = [];
    if (level.totalLikes >= 1) types.push('first_like');
    if (level.totalLikes >= 10) types.push('ten_likes');
    if (level.totalLikes >= 50) types.push('fifty_likes');
    if (level.totalLikes >= 100) types.push('hundred_likes');
    if (level.totalMatches >= 1) types.push('first_match');
    if (level.totalMatches >= 5) types.push('five_matches');
    if (level.totalMatches >= 20) types.push('twenty_matches');
    if (level.totalMessages >= 1) types.push('first_message');
    if (level.totalMessages >= 10) types.push('messages_sent_10');
    if (level.totalMessages >= 50) types.push('messages_sent_50');
    if (level.level >= 5) types.push('level_5');
    if (level.level >= 10) types.push('level_10');
    const results = [];
    for (const t of types) {
      const a = await this.unlockAchievement(userId, t);
      if (a) results.push(a);
    }
    return results;
  }

  static async getLeaderboard(limit = 100) {
    const leaders = await UserLevel.find().populate('user', 'name age city photos').sort({ level: -1, xp: -1 }).limit(limit);
    return leaders.map((l, i) => ({ rank: i + 1, userId: l.user?._id, name: l.user?.name || 'Аноним', age: l.user?.age, city: l.user?.city, level: l.level, xp: l.xp, totalMatches: l.totalMatches, streak: l.streak }));
  }

  static async getUserGameProfile(userId) {
    const level = await UserLevel.findOne({ user: userId });
    const achievements = await Achievement.find({ user: userId });
    const leaderboard = await this.getLeaderboard(100);
    const rank = leaderboard.findIndex(l => l.userId?.toString() === userId.toString()) + 1;
    return {
      level: level?.level || 1, xp: level?.xp || 0, xpToNext: level?.xpToNextLevel || 100,
      streak: level?.streak || 0, totalLikes: level?.totalLikes || 0, totalMatches: level?.totalMatches || 0,
      totalMessages: level?.totalMessages || 0, sparksUsed: level?.sparksUsed || 0, partiesJoined: level?.partiesJoined || 0,
      achievements: achievements.map(a => ({ title: a.title, description: a.description, icon: a.icon })),
      rank: rank || '100+', totalPlayers: leaderboard.length,
    };
  }
}

module.exports = GameService;
