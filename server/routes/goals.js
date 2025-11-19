const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const Goal = require('../models/Goal');
const DailyProgress = require('../models/DailyProgress');

// Get all goals for user
router.get('/', auth, async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.userId, isActive: true })
      .sort({ createdAt: -1 });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get single goal
router.get('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Create new goal
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, dailyTargetMinutes } = req.body;

    const goal = new Goal({
      userId: req.userId,
      name,
      description,
      dailyTargetMinutes
    });

    await goal.save();
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Update goal
router.put('/:id', auth, async (req, res) => {
  try {
    const { name, description, dailyTargetMinutes, isActive } = req.body;
    
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    if (name) goal.name = name;
    if (description !== undefined) goal.description = description;
    if (dailyTargetMinutes) goal.dailyTargetMinutes = dailyTargetMinutes;
    if (isActive !== undefined) goal.isActive = isActive;

    await goal.save();
    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Delete goal (soft delete)
router.delete('/:id', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    goal.isActive = false;
    await goal.save();
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get goal statistics
router.get('/:id/stats', auth, async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }

    // Get last 30 days progress
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentProgress = await DailyProgress.find({
      goalId: goal._id,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: -1 });

    res.json({
      goal,
      recentProgress
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
