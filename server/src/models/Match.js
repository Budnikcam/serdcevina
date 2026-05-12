const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  compatibility: { type: Number, default: 0 },
  aiAnalysis: {
    strengths: [String],
    weaknesses: [String],
    advice: [String],
    topics: [String],
    rawAnalysis: String,
  },
  status: { 
    type: String, 
    enum: ['pending', 'matched', 'rejected', 'expired'],
    default: 'pending'
  },
  initiator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  matchedAt: Date,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Match', matchSchema);
