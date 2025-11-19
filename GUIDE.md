# DeepFocus - Complete Installation & Usage Guide

## 📋 Table of Contents
1. [Installation](#installation)
2. [First Time Setup](#first-time-setup)
3. [Running the Application](#running-the-application)
4. [Creating Your First Goal](#creating-your-first-goal)
5. [Using the Timer](#using-the-timer)
6. [Understanding Rewards](#understanding-rewards)
7. [Admin Setup](#admin-setup)

---

## 🔧 Installation

### Prerequisites
- ✅ Node.js (v16+) - [Download](https://nodejs.org/)
- ✅ MongoDB (v5+) - [Download](https://www.mongodb.com/try/download/community)
- ✅ Git (optional) - [Download](https://git-scm.com/)

### Quick Install

Open PowerShell in the project directory and run:

```powershell
# Option 1: Use the install script (Recommended)
.\install.ps1

# Option 2: Manual installation
npm install
cd client
npm install
cd ..
```

---

## 🎯 First Time Setup

### 1. Generate a Secure JWT Secret

```powershell
node generate-secret.js
```

Copy the generated secret for the next step.

### 2. Create Environment File

```powershell
# Copy the example file
Copy-Item .env.example .env

# Edit the .env file with your favorite editor
notepad .env
```

Update these values in `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/deepfocus
JWT_SECRET=<paste_the_generated_secret_here>
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Start MongoDB

**If MongoDB is installed as a Windows Service:**
```powershell
net start MongoDB
```

**If MongoDB is not a service:**
```powershell
# Start MongoDB manually (adjust path if needed)
mongod --dbpath C:\data\db
```

**Verify MongoDB is running:**
```powershell
# This should connect successfully
mongosh mongodb://localhost:27017
```

---

## 🚀 Running the Application

### Development Mode (Recommended)

This runs both backend and frontend simultaneously:

```powershell
npm run dev
```

### Production Mode

```powershell
# Build the frontend
npm run build

# Start the server
npm start
```

### Running Separately

**Terminal 1 - Backend:**
```powershell
npm run server
```

**Terminal 2 - Frontend:**
```powershell
npm run client
```

### Access the Application

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:5000
- 📊 **MongoDB**: mongodb://localhost:27017

---

## 👤 Creating Your First Goal

1. **Register an Account**
   - Go to http://localhost:3000/register
   - Enter username, email, and password
   - Click "Sign Up"

2. **Navigate to Goals**
   - Click "Goals" in the navigation bar
   - Click "New Goal" button

3. **Fill in Goal Details**
   - **Name**: e.g., "Learn JavaScript"
   - **Description**: Optional details about your goal
   - **Daily Target**: Minutes per day (e.g., 60)
   - Click "Create"

4. **Your Goal is Ready!**
   - You'll see it on the Dashboard
   - Click on it to start a focus session

---

## ⏱️ Using the Timer

### Starting a Session

1. Click on a goal from the Dashboard or Goals page
2. You'll see the Pomodoro timer interface
3. Adjust settings (optional):
   - Focus Length: How long to focus (default: 25 min)
   - Break Length: Break duration (default: 5 min)
4. Click the **Play button** to start
5. Focus on your task!

### During a Session

- ⏸️ **Pause**: Click the pause button anytime
- 🔄 **Reset**: Reset the timer to start over
- 🔕 **Notifications**: Browser will notify when session ends

### After Completion

- ✅ Session is automatically recorded
- 🔥 Progress updates toward daily goal
- ☕ Break timer starts automatically
- 🪙 Coins are awarded when daily goal is met

---

## 🎁 Understanding Rewards

### Streaks

- **Current Streak**: Days in a row you've completed a goal
- **Longest Streak**: Your best streak ever
- **Reset**: Missing a day resets streak to 0
- **Per Goal**: Each goal has its own streak

### Coins

| Action | Coins Earned |
|--------|-------------|
| Complete daily goal | 10 coins |
| 7-day streak | +50 bonus |
| 14-day streak | +50 bonus |
| 21-day streak | +50 bonus |
| 30-day streak | +200 bonus |

### Ranks

Your rank is based on your **longest streak** across all goals:

| Rank | Required Streak | Color |
|------|----------------|-------|
| Novice | 0-6 days | Gray |
| Beginner | 7-13 days | Blue |
| Intermediate | 14-29 days | Green |
| Advanced | 30-59 days | Yellow |
| Expert | 60-99 days | Orange |
| Master | 100+ days | Purple |

### Calendar

- **Green dots**: Days you completed goals
- **Coin totals**: Hover to see coins earned
- **Streak visualization**: See your consistency patterns

---

## 👨‍💼 Admin Setup

### Creating an Admin Account

**Method 1: Update Existing User**

1. Register normally through the web interface
2. Open MongoDB shell:
   ```powershell
   mongosh mongodb://localhost:27017/deepfocus
   ```
3. Run this command:
   ```javascript
   db.users.updateOne(
     { email: "your@email.com" },
     { $set: { isAdmin: true } }
   )
   ```

**Method 2: Create Admin in MongoDB Compass**

1. Open MongoDB Compass
2. Connect to: `mongodb://localhost:27017`
3. Open `deepfocus` database
4. Open `users` collection
5. Find your user and click Edit
6. Change `isAdmin` to `true`
7. Click Update

### Admin Features

Once you're an admin, you'll see:
- 🛡️ **Admin** link in navigation
- User management dashboard
- System-wide statistics
- Ability to:
  - Grant/revoke admin privileges
  - Delete users
  - View user details
  - Search and filter users

---

## 🎓 Pro Tips

### Maximizing Productivity

1. **Start Small**: Begin with 25-30 minute sessions
2. **Don't Skip Breaks**: Breaks are crucial for focus
3. **Multiple Goals**: Track different activities separately
4. **Daily Ritual**: Same time each day builds habit
5. **Streak Focus**: Aim for 7-day milestone first

### Timer Strategies

**Pomodoro Classic**: 25 min focus, 5 min break
**Deep Work**: 50 min focus, 10 min break
**Sprint**: 15 min focus, 3 min break
**Marathon**: 90 min focus, 15 min break

### Goal Setting

- Make goals **specific** ("Learn React" not "Code")
- Set **realistic** daily targets
- Start with **one goal** until you build the habit
- **Review** weekly in the Calendar view

---

## 🐛 Common Issues

### MongoDB Not Starting

**Problem**: Can't connect to MongoDB

**Solutions**:
1. Check if MongoDB process is running:
   ```powershell
   Get-Process mongod
   ```
2. Start MongoDB service:
   ```powershell
   net start MongoDB
   ```
3. If not a service, start manually:
   ```powershell
   mongod --dbpath C:\data\db
   ```

### Port Already in Use

**Problem**: Error: EADDRINUSE :::5000 or :::3000

**Solution**:
```powershell
# Find process using the port
netstat -ano | findstr :5000

# Kill it (replace <PID> with actual number)
taskkill /PID <PID> /F
```

### Dependencies Not Installing

**Problem**: npm install fails

**Solutions**:
```powershell
# Clear cache
npm cache clean --force

# Delete node_modules
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Reinstall
npm install
```

### React App Won't Start

**Problem**: Frontend shows errors

**Solution**:
```powershell
cd client
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
npm start
```

### JWT Token Errors

**Problem**: "Token is not valid" errors

**Solutions**:
1. Make sure JWT_SECRET in `.env` is set
2. Clear browser localStorage:
   - Open Developer Tools (F12)
   - Go to Application > Local Storage
   - Clear all items
3. Re-login

---

## 📊 Understanding the Dashboard

### Stats Cards

1. **Active Goals**: Number of goals you're tracking
2. **Current Streaks**: Total days across all active streaks
3. **Total Minutes**: Lifetime focus time
4. **This Month**: Days completed this month

### Today's Progress

- Shows progress for each goal today
- Progress bar indicates completion percentage
- Coins earned shown for completed goals

### Goals List

- Quick overview of all goals
- Click to start a session
- Shows current and best streaks

---

## 📱 Features Overview

### Dashboard
✅ Overview of all stats
✅ Today's progress tracking
✅ Quick access to goals
✅ Streak indicators

### Goals
✅ Create unlimited goals
✅ Edit goal details
✅ Track individual statistics
✅ Delete goals

### Timer
✅ Pomodoro technique
✅ Customizable durations
✅ Auto break mode
✅ Session recording
✅ Browser notifications

### Calendar
✅ Visual progress tracking
✅ Completed day highlights
✅ Daily details view
✅ Coin tracking
✅ Monthly overview

### Profile
✅ Update username/email
✅ View current rank
✅ Track total coins
✅ Rank progression guide

### Admin (Admin only)
✅ User management
✅ System statistics
✅ Grant/revoke admin
✅ User search
✅ Delete users

---

## 🔐 Security Notes

1. **JWT Secret**: Use a strong random string in production
2. **MongoDB**: Enable authentication in production
3. **HTTPS**: Use HTTPS in production
4. **Passwords**: Automatically hashed with bcrypt
5. **CORS**: Configured for localhost in development

---

## 📈 Next Steps

1. ✅ Install and setup
2. ✅ Create your first goal
3. ✅ Complete your first session
4. ✅ Build a 7-day streak
5. ✅ Reach Beginner rank
6. ✅ Earn 100 coins
7. ✅ Track multiple goals

---

## 🎉 You're All Set!

Start your focus journey today! Remember:
- **Consistency** > Intensity
- **Small wins** compound over time
- **Celebrate** your streaks

Happy focusing! 🎯🔥
