const Goal = require('../models/Goal');
const DailyProgress = require('../models/DailyProgress');

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

      // If no progress yesterday and goal has a streak, reset it
      if (!yesterdayProgress && goal.currentStreak > 0) {
        goal.currentStreak = 0;
        await goal.save();
        console.log(`Reset streak for goal: ${goal.name}`);
      }
    }
  } catch (error) {
    console.error('Error checking streaks:', error);
  }
};

module.exports = { checkAndResetStreaks };
