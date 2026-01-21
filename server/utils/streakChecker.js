const Goal = require('../models/Goal');
const DailyProgress = require('../models/DailyProgress');
const User = require('../models/User');

const checkAndResetStreaks = async () => {
  try {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const goals = await Goal.find({ isActive: true });

    for (const goal of goals) {
      // Check if goal was completed yesterday
      const yesterdayProgress = await DailyProgress.findOne({
        goalId: goal._id,
        date: yesterday,
        isCompleted: true
      });

      // If no progress yesterday and goal has a streak or is active, handle penalty
      if (!yesterdayProgress) {
        // Reset streak if there was one
        if (goal.currentStreak > 0) {
          goal.currentStreak = 0;
          await goal.save();
          console.log(`Reset streak for goal: ${goal.name}`);
        }

        // Deduct 1 coin from user for missing the goal
        const user = await User.findById(goal.userId);
        if (user && user.totalCoins > 0) {
          user.totalCoins = Math.max(0, user.totalCoins - 1);
          await user.save();
          console.log(`Deducted 1 coin from user ${user.email} for missing goal: ${goal.name}`);
        }
      }
    }
  } catch (error) {
    console.error('Error checking streaks:', error);
  }
};

module.exports = { checkAndResetStreaks };
