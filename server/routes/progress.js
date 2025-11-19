const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const DailyProgress = require('../models/DailyProgress');
const Goal = require('../models/Goal');

// Get daily progress for all goals
router.get('/daily', auth, async (req, res) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();
    targetDate.setHours(0, 0, 0, 0);

    const progress = await DailyProgress.find({
      userId: req.userId,
      date: targetDate
    }).populate('goalId', 'name dailyTargetMinutes');

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get progress for specific goal
router.get('/goal/:goalId', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Verify goal belongs to user
    const goal = await Goal.findOne({ _id: req.params.goalId, userId: req.userId });
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    const query = {
      userId: req.userId,
      goalId: req.params.goalId
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const progress = await DailyProgress.find(query)
      .sort({ date: -1 })
      .limit(90); // Last 90 days max

    res.json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get calendar data (completed days for all goals)
router.get('/calendar', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = {
      userId: req.userId,
      isCompleted: true
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const completedDays = await DailyProgress.find(query)
      .populate('goalId', 'name')
      .sort({ date: -1 });

    // Group by date
    const calendarData = {};
    completedDays.forEach(day => {
      const dateKey = day.date.toISOString().split('T')[0];
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = [];
      }
      calendarData[dateKey].push({
        goalId: day.goalId._id,
        goalName: day.goalId.name,
        minutesCompleted: day.minutesCompleted,
        coinsEarned: day.coinsEarned
      });
    });

    res.json(calendarData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get overall statistics
router.get('/stats/overall', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId, isActive: true });
    
    const totalStreakDays = goals.reduce((sum, goal) => sum + goal.currentStreak, 0);
    const longestStreak = Math.max(...goals.map(g => g.longestStreak || 0), 0);
    const totalMinutes = goals.reduce((sum, goal) => sum + goal.totalMinutesCompleted, 0);
    const totalSessions = goals.reduce((sum, goal) => sum + goal.totalSessionsCompleted, 0);

    // Get this month's completed days
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const monthEnd = new Date();
    monthEnd.setMonth(monthEnd.getMonth() + 1);
    monthEnd.setDate(0);
    monthEnd.setHours(23, 59, 59, 999);

    const thisMonthCompleted = await DailyProgress.countDocuments({
      userId: req.userId,
      date: { $gte: monthStart, $lte: monthEnd },
      isCompleted: true
    });

    res.json({
      totalActiveGoals: goals.length,
      totalStreakDays,
      longestStreak,
      totalMinutes,
      totalSessions,
      thisMonthCompletedDays: thisMonthCompleted
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
