# MongoDB Atlas Setup Guide

This guide will help you connect your DeepFocus application to MongoDB Atlas cloud database and view your data online.

## What is MongoDB Atlas?

MongoDB Atlas is a cloud-hosted MongoDB service. Instead of running MongoDB locally on your computer, you can use Atlas to:
- Access your database from anywhere
- Get automatic backups
- Use professional hosting infrastructure
- View and manage data through a web interface

## Creating a MongoDB Atlas Account

### Step 1: Sign Up

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with your email or Google/GitHub account
3. Complete the registration process

### Step 2: Create a Free Cluster

1. After logging in, click **"Build a Database"** or **"Create"**
2. Choose **"M0 FREE"** tier (this is completely free)
3. Select a cloud provider and region:
   - Choose a region close to your location for better speed
   - AWS, Google Cloud, or Azure all work fine
4. Name your cluster (or keep the default name "Cluster0")
5. Click **"Create Cluster"** (this takes 3-5 minutes)

## Configuring Database Access

### Step 3: Create Database User

1. In the left sidebar, click **"Database Access"** under Security
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Set a username and strong password
   - **IMPORTANT:** Save these credentials - you'll need them later
   - Example: username: `deepfocususer`, password: `YourSecurePassword123!`
5. Under "Database User Privileges", select **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Whitelist IP Address

1. In the left sidebar, click **"Network Access"** under Security
2. Click **"Add IP Address"**
3. You have two options:
   - **Allow Access from Anywhere**: Click this button, then **"Confirm"**
     - This is easiest for development
     - IP address will show as `0.0.0.0/0`
   - **Add Current IP Address**: Only allows your current computer
     - More secure but may need updating if your IP changes
4. Click **"Confirm"**

## Getting Your Connection String

### Step 5: Get Connection String

1. Go back to **"Database"** in the left sidebar (or click "Databases" at top)
2. Find your cluster and click **"Connect"**
3. Select **"Connect your application"**
4. Make sure **"Driver"** is set to **"Node.js"** and version is **"4.1 or later"**
5. Copy the connection string - it looks like:
   ```
   mongodb+srv://deepfocususer:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. **Replace `<password>`** with your actual database user password
   - Example: If your password is `YourSecurePassword123!`, replace `<password>` with that

## Connecting DeepFocus to Atlas

### Step 6: Update Your .env File

1. Open the `.env` file in your `server` folder
2. Find the line that says:
   ```
   MONGODB_URI=mongodb://localhost:27017/deepfocus
   ```
3. Replace it with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://deepfocususer:YourSecurePassword123!@cluster0.xxxxx.mongodb.net/deepfocus?retryWrites=true&w=majority
   ```
   - Notice we added `/deepfocus` before the `?` to specify the database name
4. Save the file

### Step 7: Restart Your Server

1. Stop your server if it's running (press `Ctrl+C` in the terminal)
2. Start it again:
   ```powershell
   cd server
   npm start
   ```
3. You should see: `Connected to MongoDB`

## Viewing Your Database in Atlas

### Method 1: Using Atlas Web Interface (Easiest)

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click **"Database"** in the left sidebar
3. Find your cluster and click **"Browse Collections"**
4. You'll see your database name (`deepfocus`) in the list
5. Click on it to expand and see all collections:
   - `users` - User accounts
   - `goals` - User goals
   - `sessions` - Focus sessions
   - `dailyprogresses` - Daily completion tracking

#### Viewing Data

- Click any collection name to see documents
- Each document is displayed in JSON format
- You can:
  - **Search**: Use the filter bar at top
  - **Sort**: Click column headers
  - **Edit**: Click a document to modify it
  - **Delete**: Click the trash icon
  - **Insert**: Click "Insert Document" to add new data

### Method 2: Using MongoDB Compass (Desktop App)

MongoDB Compass is a free desktop application for viewing and managing MongoDB databases.

#### Install Compass

1. Download from [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Install the application

#### Connect to Atlas

1. Open MongoDB Compass
2. You'll see "New Connection" screen
3. Paste your connection string from Step 5:
   ```
   mongodb+srv://deepfocususer:YourSecurePassword123!@cluster0.xxxxx.mongodb.net/
   ```
4. Click **"Connect"**
5. You'll see all your databases in the left sidebar
6. Click `deepfocus` to expand and see collections

#### Compass Features

- **Visual Schema**: See the structure of your data
- **Query Bar**: Write queries to filter data
- **Aggregation Pipeline**: Create complex data transformations
- **Performance**: View slow queries and indexes
- **Documents**: View, edit, add, delete documents with a GUI

## Sample Queries

### In Atlas Web Interface

Click on a collection, then use the filter bar:

**Find all users with Expert rank:**
```json
{ "rank": "Expert" }
```

**Find goals with streak > 7:**
```json
{ "currentStreak": { "$gt": 7 } }
```

**Find sessions from a specific date:**
```json
{ "completedAt": { "$gte": { "$date": "2024-01-01T00:00:00.000Z" } } }
```

### In MongoDB Compass

Same queries work in the filter bar at the top of any collection view.

## Common Issues

### "Authentication Failed"

- Double-check your username and password in the connection string
- Make sure you replaced `<password>` with your actual password
- Passwords with special characters may need URL encoding

### "Could not connect to any servers"

- Check that your IP is whitelisted in Network Access
- Verify your internet connection
- Try allowing access from anywhere (0.0.0.0/0)

### "Database not showing up"

- Make sure you've created at least one user/goal in the app
- MongoDB Atlas only shows databases that have data
- Try creating a test account in DeepFocus

## Switching Between Local and Atlas

You can easily switch between local MongoDB and Atlas:

**Use Local MongoDB:**
```
MONGODB_URI=mongodb://localhost:27017/deepfocus
```

**Use MongoDB Atlas:**
```
MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/deepfocus?retryWrites=true&w=majority
```

Just change the `MONGODB_URI` in your `.env` file and restart the server.

## Best Practices

1. **Never commit your .env file**: Your connection string contains your password
2. **Use strong passwords**: For your database user
3. **Regular backups**: Atlas provides automatic backups on paid tiers
4. **Monitor usage**: Free tier has 512 MB storage limit
5. **Create indexes**: For better query performance on large datasets

## Next Steps

- Explore your data in the Atlas web interface
- Set up email alerts for cluster issues
- Review MongoDB Atlas documentation: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- Consider upgrading to paid tier for more storage and features

## Support

- MongoDB Atlas Documentation: [https://docs.atlas.mongodb.com/](https://docs.atlas.mongodb.com/)
- MongoDB University (free courses): [https://university.mongodb.com/](https://university.mongodb.com/)
- Community Forums: [https://www.mongodb.com/community/forums/](https://www.mongodb.com/community/forums/)
