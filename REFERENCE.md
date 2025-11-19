# 🚀 DeepFocus - Quick Reference Card

## Installation (One-Time Setup)

```powershell
# 1. Install dependencies
.\install.ps1

# 2. Generate JWT secret
node generate-secret.js

# 3. Create .env file (if not exists)
Copy-Item .env.example .env
# Edit .env and paste your JWT secret

# 4. Start MongoDB
net start MongoDB
```

## Daily Use

```powershell
# Start the application
.\start.ps1
# OR
npm run dev

# Access at: http://localhost:3000
```

## Key Features

| Feature | What It Does |
|---------|-------------|
| **Goals** | Create focus goals with daily targets |
| **Timer** | Pomodoro timer with auto breaks |
| **Streaks** | Track consecutive completion days |
| **Calendar** | Visual progress tracking |
| **Coins** | Earn rewards for consistency |
| **Ranks** | Progress through 6 rank levels |

## Reward System

```
✅ Daily goal complete → 10 coins
🔥 7-day streak      → +50 coins
🔥 30-day streak     → +200 coins
```

## Ranks

```
🥉 Novice       (0-6 days)
🥈 Beginner     (7-13 days)
🥇 Intermediate (14-29 days)
🏆 Advanced     (30-59 days)
💎 Expert       (60-99 days)
👑 Master       (100+ days)
```

## Common Commands

```powershell
# Start development mode
npm run dev

# Start backend only
npm run server

# Start frontend only
npm run client

# Build for production
npm run build

# Generate new JWT secret
node generate-secret.js

# Install all dependencies
npm run install-all
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| MongoDB not running | `net start MongoDB` |
| Port in use | `netstat -ano \| findstr :5000` then `taskkill /PID <PID> /F` |
| Dependencies error | Delete `node_modules`, run `npm install` |
| JWT error | Regenerate secret with `node generate-secret.js` |
| Frontend error | `cd client; npm install` |

## URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:5000
- **MongoDB**: mongodb://localhost:27017

## File Structure

```
DeepFocus/
├── server/        → Backend code
├── client/        → Frontend code
├── .env           → Configuration
├── install.ps1    → Installation script
└── start.ps1      → Start script
```

## Make User Admin

```javascript
// In MongoDB shell:
mongosh mongodb://localhost:27017/deepfocus

db.users.updateOne(
  { email: "user@email.com" },
  { $set: { isAdmin: true } }
)
```

## Tips

1. Start with 25-minute sessions
2. Don't skip breaks
3. Aim for 7-day streaks first
4. Track multiple goals separately
5. Review calendar weekly

## Support Documents

- `README.md` - Overview and features
- `QUICKSTART.md` - 5-minute quick start
- `GUIDE.md` - Complete usage guide
- `SETUP.md` - Detailed setup
- `CHECKLIST.md` - Setup checklist

---

**🎯 Ready to Focus? → Run `.\start.ps1`**
