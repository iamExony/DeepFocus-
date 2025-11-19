# DeepFocus Setup Guide

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## Installation Steps

### 1. Install Dependencies

```powershell
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 2. Set Up Environment Variables

Create a `.env` file in the root directory:

```powershell
Copy-Item .env.example .env
```

Edit the `.env` file and update the values:
- `MONGODB_URI`: Your MongoDB connection string
- `JWT_SECRET`: A secure random string for JWT tokens
- `PORT`: Backend server port (default: 5000)

### 3. Start MongoDB

Make sure MongoDB is running on your system:

```powershell
# If MongoDB is installed as a service
net start MongoDB

# Or start MongoDB manually
mongod --dbpath <path-to-data-directory>
```

### 4. Run the Application

```powershell
# Development mode (runs both backend and frontend)
npm run dev

# Or run separately:

# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run client
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Creating an Admin User

To create an admin user, you have two options:

### Option 1: Register normally then update in database

1. Register a new account through the web interface
2. Connect to MongoDB and run:

```javascript
db.users.updateOne(
  { email: "your@email.com" },
  { $set: { isAdmin: true } }
)
```

### Option 2: Create directly in database

```javascript
// In MongoDB shell or MongoDB Compass
use deepfocus

db.users.insertOne({
  username: "admin",
  email: "admin@deepfocus.com",
  password: "$2a$10$YourHashedPasswordHere", // Use bcrypt to hash
  isAdmin: true,
  totalCoins: 0,
  rank: "Novice",
  createdAt: new Date()
})
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running
- Check the connection string in `.env`
- Verify MongoDB is accessible on the specified port

### Port Already in Use
- Change the PORT in `.env` file
- Or kill the process using the port

### Module Not Found Errors
- Delete `node_modules` folders and run `npm install` again
- Clear npm cache: `npm cache clean --force`

## Features Overview

### For Users:
- Create multiple focus goals with custom daily targets
- Track progress with Pomodoro timer
- Build streaks by completing daily goals
- Earn coins and ranks based on consistency
- View progress on interactive calendar
- Monitor statistics and achievements

### For Admins:
- View system-wide statistics
- Manage user accounts
- Grant/revoke admin privileges
- Delete users and their data

## Rank System

- **Novice**: 0-6 days streak
- **Beginner**: 7-13 days streak
- **Intermediate**: 14-29 days streak
- **Advanced**: 30-59 days streak
- **Expert**: 60-99 days streak
- **Master**: 100+ days streak

## Coin Rewards

- Daily goal completion: 10 coins
- 7-day streak milestone: +50 coins
- 30-day streak milestone: +200 coins

## Default Pomodoro Settings

- Focus session: 25 minutes
- Break duration: 5 minutes
- Customizable per session

## API Endpoints

See the backend routes for full API documentation:
- `/api/auth` - Authentication
- `/api/goals` - Goal management
- `/api/sessions` - Focus sessions
- `/api/progress` - Progress tracking
- `/api/users` - User profile
- `/api/admin` - Admin operations

## Support

For issues or questions, check the logs:
- Backend: Console output
- Frontend: Browser console
- MongoDB: MongoDB logs
