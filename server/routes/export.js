const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Session = require('../models/Session');
const DailyProgress = require('../models/DailyProgress');

// Custom auth middleware that accepts token from header or query string
const exportAuth = async (req, res, next) => {
  try {
    let token = req.header('Authorization')?.replace('Bearer ', '');
    
    // Also check query string for direct download links
    if (!token && req.query.token) {
      token = req.query.token;
    }
    
    if (!token) {
      return res.status(401).json({ message: 'No authentication token, access denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Export sessions as CSV
router.get('/csv', exportAuth, async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.userId })
      .populate('goalId', 'name category')
      .sort({ completedAt: -1 });

    // CSV header
    let csv = 'Date,Goal,Category,Duration (minutes),Type,Notes\n';

    // CSV rows
    sessions.forEach(session => {
      const date = new Date(session.completedAt).toISOString().split('T')[0];
      const goalName = session.goalId?.name || 'Unknown';
      const category = session.goalId?.category || 'other';
      const notes = (session.notes || '').replace(/"/g, '""'); // Escape quotes
      
      csv += `"${date}","${goalName}","${category}",${session.durationMinutes},"${session.sessionType}","${notes}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=deepfocus-sessions.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Export all user data as JSON
router.get('/json', exportAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password -emailVerificationToken');
    const goals = await Goal.find({ userId: req.userId });
    const sessions = await Session.find({ userId: req.userId }).sort({ completedAt: -1 });
    const dailyProgress = await DailyProgress.find({ userId: req.userId }).sort({ date: -1 });

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        totalCoins: user.totalCoins,
        rank: user.rank,
        createdAt: user.createdAt
      },
      statistics: {
        totalGoals: goals.length,
        activeGoals: goals.filter(g => g.isActive).length,
        totalSessions: sessions.length,
        totalMinutes: sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
        completedDays: dailyProgress.filter(p => p.isCompleted).length
      },
      goals: goals.map(g => ({
        name: g.name,
        description: g.description,
        category: g.category,
        dailyTargetMinutes: g.dailyTargetMinutes,
        currentStreak: g.currentStreak,
        longestStreak: g.longestStreak,
        totalSessionsCompleted: g.totalSessionsCompleted,
        totalMinutesCompleted: g.totalMinutesCompleted,
        isActive: g.isActive,
        createdAt: g.createdAt
      })),
      sessions: sessions.map(s => ({
        goalId: s.goalId,
        durationMinutes: s.durationMinutes,
        sessionType: s.sessionType,
        notes: s.notes,
        completedAt: s.completedAt
      })),
      dailyProgress: dailyProgress.map(p => ({
        goalId: p.goalId,
        date: p.date,
        minutesCompleted: p.minutesCompleted,
        targetMinutes: p.targetMinutes,
        isCompleted: p.isCompleted,
        coinsEarned: p.coinsEarned
      }))
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=deepfocus-export.json');
    res.json(exportData);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
