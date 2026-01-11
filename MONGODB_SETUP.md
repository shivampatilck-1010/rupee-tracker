# MongoDB Setup Instructions for Rupee Tracker

## Prerequisites
- MongoDB must be installed and running locally
- The connection URL is: `mongodb://localhost:27017`

## Installation Steps

### Option 1: Using Windows (Recommended)
1. **Download MongoDB Community Edition** from https://www.mongodb.com/try/download/community
2. **Install MongoDB** using the installer with default settings
3. **MongoDB should start as a service** on port 27017

### Option 2: Using Docker (Alternative)
```bash
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Option 3: Using MongoDB Atlas Cloud (Alternative)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Get your connection string (looks like: `mongodb+srv://username:password@cluster.mongodb.net/dbname`)
4. Set environment variable: `MONGODB_URL=your_connection_string`

## Configuration

### Environment Variable
Create a `.env` file in the project root:
```
MONGODB_URL=mongodb://localhost:27017
```

Or set it directly in PowerShell:
```powershell
$env:MONGODB_URL='mongodb://localhost:27017'
```

## How It Works

The app now:
1. Connects to MongoDB on startup
2. Creates collections for `users`, `expenses`, and `sessions`
3. Auto-creates unique indexes on `username` and `email`
4. Stores all user data and expenses in MongoDB

## Build & Run

```bash
# Install dependencies
npm install

# Build
npm run build

# Run (with MongoDB running)
npm start
```

## Troubleshooting

If you get "connection refused" error:
1. Make sure MongoDB is installed and running
2. Check if MongoDB service is active:
   ```powershell
   Get-Service -Name "MongoDB"
   ```
3. If not running, start it:
   ```powershell
   Start-Service -Name "MongoDB"
   ```

## Data Persistence

All user accounts, expenses, and sessions will now be stored in MongoDB and persist across server restarts!
