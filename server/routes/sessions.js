const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Session = require('../models/Session');
const Goal = require('../models/Goal');
const DailyProgress = require('../models/DailyProgress');
const User = require('../models/User');
const { calculateRank, calculateCoinsForCompletion } = require('../utils/rewards');

// Create new session
router.post('/', auth, async (req, res) => {
  try {
    const { goalId, durationMinutes, sessionType, notes } = req.body;

    // Verify goal belongs to user
    const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Create session
    const session = new Session({
      userId: req.userId,
      goalId,
      durationMinutes,
      sessionType: sessionType || 'focus',
      notes: notes || ''
    });

    await session.save();

    // Update goal statistics if it's a focus session
    if (sessionType === 'focus') {
      goal.totalSessionsCompleted += 1;
      goal.totalMinutesCompleted += durationMinutes;

      // Update daily progress
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let dailyProgress = await DailyProgress.findOne({
        userId: req.userId,
        goalId,
        date: today
      });

      if (!dailyProgress) {
        dailyProgress = new DailyProgress({
          userId: req.userId,
          goalId,
          date: today,
          targetMinutes: goal.dailyTargetMinutes,
          minutesCompleted: 0
        });
      }

      dailyProgress.minutesCompleted += durationMinutes;

      // Check if daily goal is completed
      if (!dailyProgress.isCompleted && dailyProgress.minutesCompleted >= dailyProgress.targetMinutes) {
        dailyProgress.isCompleted = true;

        // Update streak
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const yesterdayProgress = await DailyProgress.findOne({
          goalId,
          date: yesterday,
          isCompleted: true
        });

        // Increment streak if completed yesterday or if starting new streak
        if (yesterdayProgress || goal.currentStreak === 0) {
          goal.currentStreak += 1;
          if (goal.currentStreak > goal.longestStreak) {
            goal.longestStreak = goal.currentStreak;
          }
        } else {
          goal.currentStreak = 1;
        }

        goal.lastCompletedDate = today;

        // Calculate and award coins
        const coinsEarned = calculateCoinsForCompletion(goal.currentStreak);
        dailyProgress.coinsEarned = coinsEarned;

        // Update user coins and rank
        const user = await User.findById(req.userId);
        user.totalCoins += coinsEarned;
        
        // Calculate rank based on longest streak across all goals
        const userGoals = await Goal.find({ userId: req.userId });
        const maxStreak = Math.max(...userGoals.map(g => g.longestStreak || 0));
        user.rank = calculateRank(maxStreak);
        
        await user.save();
      }

      await dailyProgress.save();
      await goal.save();
    }

    res.status(201).json({
      session,
      goal,
      message: 'Session completed successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user's session history
router.get('/', auth, async (req, res) => {
  try {
    const { goalId, startDate, endDate, limit = 50 } = req.query;

    const query = { userId: req.userId };
    
    if (goalId) {
      query.goalId = goalId;
    }

    if (startDate || endDate) {
      query.completedAt = {};
      if (startDate) query.completedAt.$gte = new Date(startDate);
      if (endDate) query.completedAt.$lte = new Date(endDate);
    }

    const sessions = await Session.find(query)
      .populate('goalId', 'name')
      .sort({ completedAt: -1 })
      .limit(parseInt(limit));

    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get session statistics
router.get('/stats', auth, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    const sessions = await Session.find({
      userId: req.userId,
      completedAt: { $gte: daysAgo },
      sessionType: 'focus'
    });

    const totalMinutes = sessions.reduce((sum, session) => sum + session.durationMinutes, 0);
    const totalSessions = sessions.length;

    res.json({
      totalMinutes,
      totalSessions,
      averageSessionLength: totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0,
      period: parseInt(period)
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update session notes
router.put('/:id', auth, async (req, res) => {
  try {
    const { notes } = req.body;
    
    const session = await Session.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (notes !== undefined) {
      session.notes = notes.substring(0, 500); // Limit to 500 chars
    }

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
