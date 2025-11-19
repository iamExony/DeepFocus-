# ✅ DeepFocus Setup Checklist

Use this checklist to ensure everything is set up correctly.

## Prerequisites
- [ ] Node.js v16+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] MongoDB v5+ installed
- [ ] Git installed (optional)

## Installation
- [ ] Ran `.\install.ps1` OR manually installed dependencies
- [ ] Backend dependencies installed (`node_modules` folder exists)
- [ ] Frontend dependencies installed (`client/node_modules` folder exists)
- [ ] No installation errors

## Configuration
- [ ] Created `.env` file from `.env.example`
- [ ] Generated JWT secret (`node generate-secret.js`)
- [ ] Updated `JWT_SECRET` in `.env` file
- [ ] Verified `MONGODB_URI` in `.env` file
- [ ] Checked `PORT` setting (default: 5000)

## Database
- [ ] MongoDB is installed
- [ ] MongoDB service is running (`net start MongoDB` or `mongod`)
- [ ] Can connect to MongoDB (`mongosh mongodb://localhost:27017`)
- [ ] Database `deepfocus` will be created automatically

## First Run
- [ ] Ran `npm run dev` OR `.\start.ps1`
- [ ] Backend started successfully on port 5000
- [ ] Frontend started successfully on port 3000
- [ ] No startup errors in console
- [ ] Can access http://localhost:3000

## User Setup
- [ ] Successfully registered a new account
- [ ] Successfully logged in
- [ ] Can see the Dashboard
- [ ] Navigation bar appears correctly

## Feature Testing
- [ ] Created first goal
- [ ] Goal appears on Dashboard
- [ ] Started a focus session
- [ ] Timer counts down correctly
- [ ] Session completed and recorded
- [ ] Progress updated on Dashboard
- [ ] Calendar shows completed day
- [ ] Profile shows correct information

## Admin Setup (Optional)
- [ ] Connected to MongoDB
- [ ] Updated user to admin in database
- [ ] Admin link appears in navigation
- [ ] Can access Admin dashboard
- [ ] Can see system statistics
- [ ] Can manage users

## Verification
- [ ] No console errors in browser (F12)
- [ ] No errors in server terminal
- [ ] Database is being updated correctly
- [ ] Sessions are being recorded
- [ ] Streaks are calculating correctly
- [ ] Coins are being awarded

## Troubleshooting Used (if needed)
- [ ] Cleared npm cache
- [ ] Reinstalled dependencies
- [ ] Restarted MongoDB
- [ ] Checked port availability
- [ ] Verified .env configuration
- [ ] Checked MongoDB connection

## Ready to Use!
- [ ] All features working correctly
- [ ] Understanding how to use the app
- [ ] Ready to build focus habits!

---

## Quick Reference

### Start Application
```powershell
.\start.ps1
# OR
npm run dev
```

### Stop Application
Press `Ctrl + C` in the terminal

### Access Points
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- MongoDB: mongodb://localhost:27017

### Make User Admin
```javascript
// In MongoDB shell
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

### Generate New JWT Secret
```powershell
node generate-secret.js
```

### Reinstall Everything
```powershell
Remove-Item -Recurse -Force node_modules, client/node_modules
npm install
cd client
npm install
```

---

## Support

If you're stuck on any checkbox:
1. Read the error message carefully
2. Check [GUIDE.md](GUIDE.md) for detailed help
3. Check [SETUP.md](SETUP.md) for configuration help
4. Look in the Troubleshooting section

---

## Success! 🎉

If all checkboxes are ticked, you're ready to go!

Start building your focus habits with DeepFocus! 🎯🔥
