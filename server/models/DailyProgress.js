const mongoose = require('mongoose');

const dailyProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  goalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Goal',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  minutesCompleted: {
    type: Number,
    default: 0
  },
  targetMinutes: {
    type: Number,
    required: true
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  coinsEarned: {
    type: Number,
    default: 0
  }
});

// Compound index to ensure one progress record per goal per day
dailyProgressSchema.index({ userId: 1, goalId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyProgress', dailyProgressSchema);
