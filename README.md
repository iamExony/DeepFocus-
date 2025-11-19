# 🎯 DeepFocus

> An advanced Pomodoro focus application with streak tracking, rewards, and gamification to help you build consistent focus habits.

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-5+-green.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

---

## ✨ Features

### 🎯 Goal Management
- Create multiple goals with custom daily targets
- Track progress independently for each goal
- Edit and manage goals easily
- View detailed statistics per goal

### 🔥 Streak Tracking
- Individual streak tracking for each goal
- Automatic streak reset if you miss a day
- Longest streak records
- Visual streak indicators

### ⏱️ Pomodoro Timer
- Classic Pomodoro technique implementation
- Customizable focus and break durations
- Automatic break intervals
- Browser notifications
- Session history tracking

### 📅 Calendar View
- Interactive calendar visualization
- Completed days highlighted
- Daily progress details
- Coin earnings tracking
- Month-over-month progress

### 🏆 Gamification
- **6 Rank Tiers**: Novice → Beginner → Intermediate → Advanced → Expert → Master
- **Coin System**: Earn coins for completing goals
- **Milestone Bonuses**: Extra rewards for 7-day and 30-day streaks
- **Visual Progress**: Track your rank progression

### 👤 User System
- Secure authentication with JWT
- User profiles with stats
- Password hashing with bcrypt
- Persistent sessions

### 👨‍💼 Admin Dashboard
- User management interface
- System-wide statistics
- Grant/revoke admin privileges
- User search and pagination
- Delete users and data

---

## 🚀 Quick Start

### Prerequisites

- [Node.js](https://nodejs.org/) v16 or higher
- [MongoDB](https://www.mongodb.com/try/download/community) v5 or higher
- npm or yarn

### Installation

**Option 1: Automated (Recommended)**

```powershell
# Run the installation script
.\install.ps1

# Start the application
.\start.ps1
```

**Option 2: Manual**

```powershell
# Install dependencies
npm install
cd client
npm install
cd ..

# Generate JWT secret
node generate-secret.js

# Create environment file
Copy-Item .env.example .env
# Edit .env and add your JWT secret

# Start MongoDB
net start MongoDB

# Run the application
npm run dev
```

### Access the Application

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:5000
- 📊 **MongoDB**: mongodb://localhost:27017

---

## 📚 Documentation

- **[Quick Start Guide](QUICKSTART.md)** - Get up and running in 5 minutes
- **[Complete Guide](GUIDE.md)** - Comprehensive usage and features guide
- **[Setup Instructions](SETUP.md)** - Detailed installation and configuration
- **[API Documentation](#api-endpoints)** - Backend API reference

---

## 🎮 How to Use

### 1. Create Your First Goal

1. Register at http://localhost:3000/register
2. Navigate to "Goals"
3. Click "New Goal"
4. Set name and daily target (e.g., 60 minutes)

### 2. Start a Focus Session

1. Click on a goal from the Dashboard
2. Adjust timer settings (default: 25 min focus, 5 min break)
3. Click Play to start your session
4. Focus until the timer completes!

### 3. Build Your Streak

- Complete your daily target to maintain your streak
- Check the Calendar to visualize your progress
- Earn coins and climb the ranks

---

## 🏆 Reward System

### Streaks

Each goal has its own independent streak:
- **Current Streak**: Consecutive days completed
- **Longest Streak**: Your best streak ever
- **Reset**: Missing a day resets to 0

### Coins

| Achievement | Coins |
|------------|-------|
| Complete daily goal | 10 |
| 7-day streak | +50 bonus |
| 14-day streak | +50 bonus |
| 21-day streak | +50 bonus |
| 30-day streak | +200 bonus |

### Ranks

| Rank | Requirement | Color |
|------|-------------|-------|
| 🥉 Novice | 0-6 days | Gray |
| 🥈 Beginner | 7-13 days | Blue |
| 🥇 Intermediate | 14-29 days | Green |
| 🏆 Advanced | 30-59 days | Yellow |
| 💎 Expert | 60-99 days | Orange |
| 👑 Master | 100+ days | Purple |

*Your rank is based on your longest streak across all goals*

---

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express** - Server and API
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **node-cron** - Scheduled tasks

### Frontend
- **React 18** - UI library
- **React Router** - Navigation
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Calendar** - Calendar component
- **Lucide React** - Icons

---

## 📁 Project Structure

```
DeepFocus/
├── server/                    # Backend
│   ├── models/               # Mongoose models
│   │   ├── User.js
│   │   ├── Goal.js
│   │   ├── Session.js
│   │   └── DailyProgress.js
│   ├── routes/               # API routes
│   │   ├── auth.js
│   │   ├── goals.js
│   │   ├── sessions.js
│   │   ├── progress.js
│   │   ├── users.js
│   │   └── admin.js
│   ├── middleware/           # Custom middleware
│   │   └── auth.js
│   ├── utils/                # Helper functions
│   │   ├── rewards.js
│   │   └── streakChecker.js
│   └── index.js              # Server entry point
│
├── client/                    # Frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   └── Navbar.js
│   │   ├── pages/            # Page components
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── Dashboard.js
│   │   │   ├── Goals.js
│   │   │   ├── Timer.js
│   │   │   ├── Calendar.js
│   │   │   ├── Profile.js
│   │   │   └── Admin.js
│   │   ├── context/          # React Context
│   │   │   └── AuthContext.js
│   │   ├── services/         # API services
│   │   │   └── api.js
│   │   ├── App.js            # Main app component
│   │   └── index.js          # Entry point
│   └── package.json
│
├── .env.example              # Environment template
├── .gitignore
├── package.json              # Backend dependencies
├── generate-secret.js        # JWT secret generator
├── install.ps1               # Installation script
├── start.ps1                 # Start script
├── README.md                 # This file
├── QUICKSTART.md             # Quick start guide
├── GUIDE.md                  # Complete guide
└── SETUP.md                  # Setup instructions
```

---

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/register     Register new user
POST   /api/auth/login        Login user
```

### Goals
```
GET    /api/goals             Get all user goals
GET    /api/goals/:id         Get single goal
POST   /api/goals             Create new goal
PUT    /api/goals/:id         Update goal
DELETE /api/goals/:id         Delete goal
GET    /api/goals/:id/stats   Get goal statistics
```

### Sessions
```
POST   /api/sessions          Create focus session
GET    /api/sessions          Get session history
GET    /api/sessions/stats    Get session statistics
```

### Progress
```
GET    /api/progress/daily           Today's progress
GET    /api/progress/goal/:goalId    Progress for specific goal
GET    /api/progress/calendar        Calendar data
GET    /api/progress/stats/overall   Overall statistics
```

### User
```
GET    /api/users/profile     Get user profile
PUT    /api/users/profile     Update profile
```

### Admin (requires admin privileges)
```
GET    /api/admin/users              List all users
GET    /api/admin/users/:id          Get user details
PUT    /api/admin/users/:id          Update user
DELETE /api/admin/users/:id          Delete user
GET    /api/admin/stats/system       System statistics
```

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/deepfocus

# JWT Secret (generate with: node generate-secret.js)
JWT_SECRET=your_secure_random_string_here

# Server
PORT=5000
NODE_ENV=development

# Frontend
FRONTEND_URL=http://localhost:3000
```

### Generate Secure JWT Secret

```powershell
node generate-secret.js
```

---

## 👨‍💼 Creating an Admin User

**Method 1: Via MongoDB Shell**

```javascript
// Connect to MongoDB
mongosh mongodb://localhost:27017/deepfocus

// Update existing user to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

**Method 2: Via MongoDB Compass**

1. Connect to `mongodb://localhost:27017`
2. Open `deepfocus` database
3. Open `users` collection
4. Find your user and set `isAdmin: true`

---

## 🐛 Troubleshooting

### MongoDB Connection Issues

```powershell
# Check if MongoDB is running
Get-Process mongod

# Start MongoDB service
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

### Port Already in Use

```powershell
# Find process using port
netstat -ano | findstr :5000

# Kill process
taskkill /PID <PID> /F
```

### Clear and Reinstall

```powershell
# Clear npm cache
npm cache clean --force

# Delete node_modules
Remove-Item -Recurse -Force node_modules, client/node_modules

# Reinstall
npm install
cd client
npm install
```

---

## 📊 Features in Detail

### Dashboard
- Real-time statistics overview
- Today's progress tracking
- Quick access to all goals
- Streak indicators and coin balance

### Goals Page
- Create, edit, and delete goals
- View detailed statistics per goal
- Track sessions and total time
- Monitor streak history

### Timer Page
- Pomodoro timer interface
- Customizable session lengths
- Automatic break mode
- Progress bar
- Browser notifications
- Session tracking

### Calendar Page
- Monthly/yearly view
- Completed days highlighted
- Click dates for details
- Coin earnings per day
- Multiple goals per day

### Profile Page
- Update username and email
- View current rank
- Track total coins
- Rank progression guide

### Admin Dashboard
- User management
- System statistics
- Search and filter users
- Grant/revoke admin access
- User deletion

---

## 🎯 Tips for Success

1. **Start Small**: Begin with 25-minute sessions
2. **Be Consistent**: Daily practice beats intensity
3. **Don't Skip Breaks**: Breaks are essential for focus
4. **Track Multiple Goals**: Separate different activities
5. **Celebrate Milestones**: Acknowledge your progress
6. **Review Weekly**: Check calendar for patterns
7. **Adjust Targets**: Match goals to your capacity

---

## 📝 Scripts

```powershell
# Development
npm run dev          # Run both frontend and backend
npm run server       # Run backend only
npm run client       # Run frontend only

# Production
npm run build        # Build frontend
npm start            # Start production server

# Installation
npm run install-all  # Install all dependencies

# Utilities
.\install.ps1        # Automated installation
.\start.ps1          # Automated startup with checks
node generate-secret.js  # Generate JWT secret
```

---

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests
- Improve documentation

---

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

- Inspired by Microsoft's Windows Focus app
- Built with the Pomodoro Technique in mind
- Icons by [Lucide](https://lucide.dev/)

---

## 📞 Support

For questions or issues:
1. Check the [Complete Guide](GUIDE.md)
2. Review [Setup Instructions](SETUP.md)
3. Check browser console (F12) for errors
4. Check server logs in terminal

---

## 🎉 Get Started

Ready to build your focus habits? Install DeepFocus now:

```powershell
.\install.ps1
.\start.ps1
```

Visit **http://localhost:3000** and start focusing! 🎯

---

**Happy Focusing!** 🔥
