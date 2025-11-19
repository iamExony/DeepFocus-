const calculateRank = (maxStreak) => {
  if (maxStreak >= 100) return 'Master';
  if (maxStreak >= 60) return 'Expert';
  if (maxStreak >= 30) return 'Advanced';
  if (maxStreak >= 14) return 'Intermediate';
  if (maxStreak >= 7) return 'Beginner';
  return 'Novice';
};

const calculateCoinsForCompletion = (streak) => {
  let coins = 10; // Base coins for daily completion
  
  // Bonus for 7-day streak
  if (streak % 7 === 0 && streak > 0) {
    coins += 50;
  }
  
  // Bonus for 30-day streak
  if (streak % 30 === 0 && streak > 0) {
    coins += 200;
  }
  
  return coins;
};

module.exports = { calculateRank, calculateCoinsForCompletion };
