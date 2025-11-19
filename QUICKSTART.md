# 🎯 DeepFocus - Quick Start Guide

## What is DeepFocus?

DeepFocus is an advanced productivity application that helps you build focus habits through:
- **Multiple Goals**: Create different goals for various activities
- **Pomodoro Technique**: Time-boxed focus sessions with breaks
- **Streak Tracking**: Individual streaks for each goal
- **Gamification**: Earn coins and ranks for consistency
- **Visual Calendar**: See your progress at a glance
- **Admin Dashboard**: Manage users and view statistics

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Dependencies

Open PowerShell in the DeepFocus directory and run:

```powershell
# Run the installation script
.\install.ps1

# OR manually:
npm install
cd client
npm install
cd ..
```

### Step 2: Configure Environment

1. Create `.env` file from template:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` and set:
   ```
   MONGODB_URI=mongodb://localhost:27017/deepfocus
   JWT_SECRET=your_very_secure_random_string_here
   PORT=5000
   ```

### Step 3: Start MongoDB

```powershell
# If MongoDB service is installed
net start MongoDB

# Or start manually
mongod --dbpath C:\data\db
```

### Step 4: Run the Application

```powershell
npm run dev
```

Visit **http://localhost:3000** in your browser!

---

## 📱 User Guide

### Creating Your First Goal

1. **Register** an account at http://localhost:3000/register
2. Click **"Goals"** in the navigation
3. Click **"New Goal"**
4. Fill in:
   - Goal Name (e.g., "Learn JavaScript")
   - Description (optional)
   - Daily Target in minutes (e.g., 60)
5. Click **"Create"**

### Starting a Focus Session

1. Go to **Dashboard**
2. Click on a goal card
3. Adjust timer settings if needed
4. Click the **Play button** to start
5. Focus until the timer completes!

### Building Streaks

- Complete your daily target to maintain your streak
- Miss a day and your streak resets to 0
- Check the **Calendar** to see your progress

### Earning Rewards

| Achievement | Coins Earned |
|-------------|--------------|
| Daily goal completion | 10 coins |
| 7-day streak milestone | +50 bonus coins |
| 30-day streak milestone | +200 bonus coins |

### Rank Progression

| Rank | Required Streak |
|------|----------------|
| 🥉 Novice | 0-6 days |
| 🥈 Beginner | 7-13 days |
| 🥇 Intermediate | 14-29 days |
| 🏆 Advanced | 30-59 days |
| 💎 Expert | 60-99 days |
| 👑 Master | 100+ days |

---

## 👨‍💼 Admin Guide

### Creating an Admin Account

**Option 1: Via MongoDB**

```javascript
// Connect to MongoDB
use deepfocus

// Update existing user to admin
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

**Option 2: During Registration**

1. Register normally
2. Connect to MongoDB and run the command above

### Admin Features

- **User Management**: View all users, search, and pagination
- **System Statistics**: Track total users, goals, and sessions
- **Admin Privileges**: Grant or revoke admin access
- **User Deletion**: Remove users and all their data

---

## 🛠️ Troubleshooting

### MongoDB Connection Failed

**Problem**: Cannot connect to MongoDB

**Solution**:
1. Verify MongoDB is running: `Get-Process mongod`
2. Check connection string in `.env`
3. Test connection: `mongosh "mongodb://localhost:27017/deepfocus"`

### Port Already in Use

**Problem**: Error: EADDRINUSE :::5000

**Solution**:
```powershell
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID)
taskkill /PID <PID> /F
```

### Frontend Won't Start

**Problem**: React app fails to start

**Solution**:
```powershell
cd client
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

### Dependencies Issues

**Solution**:
```powershell
# Clear npm cache
npm cache clean --force

# Reinstall everything
Remove-Item -Recurse -Force node_modules, client/node_modules
npm run install-all
```

---

## 📊 Project Structure

```
DeepFocus/
├── server/                 # Backend
│   ├── models/            # Database models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   ├── utils/             # Helper functions
│   └── index.js           # Server entry
├── client/                # Frontend
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── context/      # React context
│   │   ├── services/     # API services
│   │   └── App.js        # Main app
│   └── package.json
├── package.json           # Backend dependencies
├── .env                   # Environment config
└── README.md
```

---

## 🔥 Tips for Success

1. **Start Small**: Begin with a 25-minute daily target
2. **Be Consistent**: Focus on maintaining streaks
3. **Use Breaks**: Don't skip breaks - they're important!
4. **Track Multiple Goals**: Create separate goals for different activities
5. **Check Calendar**: Visualize your progress regularly
6. **Aim for Ranks**: Work towards higher ranks systematically

---

## 🎨 Customization

### Timer Settings

- Adjust focus session length (default: 25 min)
- Customize break duration (default: 5 min)
- Settings are per-session

### Goal Targets

- Set different daily targets for each goal
- Update targets anytime in Goals page
- Target is in minutes

---

## 📝 API Documentation

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Goals
- `GET /api/goals` - Get all user goals
- `POST /api/goals` - Create new goal
- `PUT /api/goals/:id` - Update goal
- `DELETE /api/goals/:id` - Delete goal

### Sessions
- `POST /api/sessions` - Record focus session
- `GET /api/sessions` - Get session history

### Progress
- `GET /api/progress/daily` - Today's progress
- `GET /api/progress/calendar` - Calendar data
- `GET /api/progress/stats/overall` - Overall statistics

### Admin (requires admin privileges)
- `GET /api/admin/users` - List all users
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/stats/system` - System statistics

---

## 🤝 Support

For issues, check:
1. Browser console (F12)
2. Server logs in terminal
3. MongoDB logs
4. `SETUP.md` for detailed instructions

---

## 🎉 You're Ready!

Start building your focus habits with DeepFocus! Remember:
- Consistency beats intensity
- Small daily wins compound over time
- Celebrate your streaks! 🔥

**Happy focusing!** 🎯
