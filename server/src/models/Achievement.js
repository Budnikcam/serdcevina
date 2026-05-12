const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'first_like', 'first_match', 'first_message',
      'ten_likes', 'fifty_likes', 'hundred_likes',
      'five_matches', 'twenty_matches',
      'profile_complete', 'photo_added', 'ai_analysis',
      'daily_login_3', 'daily_login_7', 'daily_login_30',
      'messages_sent_10', 'messages_sent_50',
      'spark_used', 'party_joined',
      'premium', 'level_5', 'level_10',
    ],
    required: true,
  },
  title: String,
  description: String,
  icon: String,
  xpReward: Number,
  unlockedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Achievement', achievementSchema);
