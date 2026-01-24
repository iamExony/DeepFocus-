const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Import routes
const authRoutes = require('./routes/auth');
const goalRoutes = require('./routes/goals');
const sessionRoutes = require('./routes/sessions');
const progressRoutes = require('./routes/progress');
const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/users');
const exportRoutes = require('./routes/export');

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use('/api/export', exportRoutes);

// Streak checker - runs daily at midnight
const streakChecker = require('./utils/streakChecker');
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily streak checker...');
  await streakChecker.checkAndResetStreaks();
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

// Only listen if run directly (not if imported by Vercel)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
