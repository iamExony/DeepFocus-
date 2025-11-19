const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
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
  durationMinutes: {
    type: Number,
    required: true
  },
  completedAt: {
    type: Date,
    default: Date.now
  },
  sessionType: {
    type: String,
    enum: ['focus', 'break'],
    default: 'focus'
  }
});

// Index for efficient date-based queries
sessionSchema.index({ userId: 1, completedAt: -1 });
sessionSchema.index({ goalId: 1, completedAt: -1 });

module.exports = mongoose.model('Session', sessionSchema);
