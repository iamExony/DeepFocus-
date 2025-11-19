const express = require('express');
const router = express.Router();
const { adminAuth } = require('../middleware/auth');
const User = require('../models/User');
const Goal = require('../models/Goal');
const Session = require('../models/Session');
const DailyProgress = require('../models/DailyProgress');

// Get all users
router.get('/users', adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get user details
router.get('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const goals = await Goal.find({ userId: user._id });
    const totalSessions = await Session.countDocuments({ userId: user._id });
    const completedDays = await DailyProgress.countDocuments({ 
      userId: user._id, 
      isCompleted: true 
    });

    res.json({
      user,
      stats: {
        totalGoals: goals.length,
        totalSessions,
        completedDays
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update user (admin can change admin status)
router.put('/users/:id', adminAuth, async (req, res) => {
  try {
    const { isAdmin } = req.body;
    
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (isAdmin !== undefined) {
      user.isAdmin = isAdmin;
    }

    await user.save();
    
    const userResponse = user.toObject();
    delete userResponse.password;
    
    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete user
router.delete('/users/:id', adminAuth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete all related data
    await Goal.deleteMany({ userId: user._id });
    await Session.deleteMany({ userId: user._id });
    await DailyProgress.deleteMany({ userId: user._id });
    await User.findByIdAndDelete(user._id);
    
    res.json({ message: 'User and all related data deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get system statistics
router.get('/stats/system', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalGoals = await Goal.countDocuments();
    const totalSessions = await Session.countDocuments();
    const activeGoals = await Goal.countDocuments({ isActive: true });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await User.countDocuments({ 
      createdAt: { $gte: sevenDaysAgo } 
    });
    
    const recentSessions = await Session.countDocuments({ 
      completedAt: { $gte: sevenDaysAgo } 
    });

    res.json({
      totalUsers,
      totalGoals,
      totalSessions,
      activeGoals,
      recentUsers,
      recentSessions
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
