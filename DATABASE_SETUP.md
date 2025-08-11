# 🗄️ Database Setup Guide for BantayBarangay

This guide helps you set up the database for the BantayBarangay disaster response system.

## 📋 Prerequisites

- Node.js 18+ installed
- npm or yarn package manager
- Internet connection (for MongoDB Atlas option)

## 🚀 Quick Setup

### Option 1: MongoDB Atlas (Cloud - Recommended for Production)

1. **Create MongoDB Atlas Account**
   - Go to [MongoDB Atlas](https://www.mongodb.com/atlas/database)
   - Sign up for a free account
   - Create a new cluster

2. **Get Connection String**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your actual password

3. **Update Environment Variables**
   ```bash
   # Edit server/.env file
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/bantay_barangay_malagutay?retryWrites=true&w=majority
   ```

4. **Initialize Database**
   ```bash
   npm run db:setup
   ```

### Option 2: Local MongoDB (Recommended for Development)

1. **Install MongoDB Community Server**
   - Download from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Follow installation instructions for Windows
   - Start MongoDB service

2. **Verify Installation**
   ```bash
   mongosh --version
   ```

3. **Use Default Configuration**
   ```bash
   # The .env file already has local MongoDB configured
   MONGODB_URI=mongodb://localhost:27017/bantay_barangay_malagutay
   ```

4. **Initialize Database**
   ```bash
   npm run db:setup
   ```

## 🔧 Database Setup Commands

### Setup Database with Sample Data
```bash
npm run db:setup
```
This command will:
- Connect to your MongoDB instance
- Create necessary indexes
- Create an admin user
- Create sample responder accounts
- Create a test alert
- Verify the setup

### Check Database Connection
```bash
npm run db:check
```
This command only checks if the database connection is working.

### Manual Setup
```bash
cd scripts
node db-setup.js --help
```

## 👥 Default Accounts Created

After running `npm run db:setup`, you'll have these accounts:

### Admin Account
- **Email**: admin@malagutay.gov.ph
- **Password**: admin123
- **Role**: Administrator
- ⚠️ **Important**: Change password after first login!

### Sample Responders
- **Email**: responder1@malagutay.gov.ph
- **Password**: responder123
- **Role**: Emergency Responder

- **Email**: responder2@malagutay.gov.ph  
- **Password**: responder123
- **Role**: Emergency Responder

## 🔍 Database Structure

### Collections Created
- **users**: User accounts (residents, responders, admins)
- **alerts**: Emergency alerts and announcements
- **rescuerequests**: Emergency rescue requests (created during app usage)

### Indexes Created
- User email (unique)
- User username (unique)
- User contact number
- User role and status
- Alert type and priority
- Alert creation date

## 🛠️ Troubleshooting

### Connection Issues

1. **Local MongoDB not running**
   ```bash
   # Windows: Start MongoDB service
   net start MongoDB
   
   # Check if MongoDB is listening
   netstat -an | findstr :27017
   ```

2. **Atlas connection issues**
   - Verify connection string format
   - Check if your IP is whitelisted in Atlas
   - Ensure password doesn't contain special characters

3. **Authentication errors**
   - Verify username/password in connection string
   - Check database user permissions in Atlas

### Common Error Messages

**"Database connection error: option buffermaxentries is not supported"**
- ✅ **Fixed**: Updated to use modern Mongoose options

**"MongoServerError: bad auth"**
- Check your MongoDB Atlas username and password
- Ensure the database user has read/write permissions

**"ECONNREFUSED"**
- MongoDB service is not running
- Wrong port or host in connection string

**"MongoNetworkError"**
- Network connectivity issues
- Firewall blocking connection
- Wrong connection string format

## 🔒 Security Notes

### Development Environment
- Default admin password is `admin123`
- Sample data is created for testing
- Local MongoDB has no authentication by default

### Production Environment
- Always change default passwords
- Use strong, unique passwords
- Enable MongoDB authentication
- Use SSL/TLS connections
- Restrict network access
- Regular backups

## 📊 Database Monitoring

### Check Database Status
```bash
# Connect to MongoDB shell
mongosh

# Show databases
show dbs

# Use your database
use bantay_barangay_malagutay

# Show collections
show collections

# Count documents
db.users.countDocuments()
db.alerts.countDocuments()
```

### View Sample Data
```bash
# View admin user
db.users.findOne({role: "admin"})

# View all alerts
db.alerts.find().pretty()

# View responders
db.users.find({role: "responder"}).pretty()
```

## 🔄 Reset Database

To completely reset your database:

```bash
# Connect to MongoDB shell
mongosh

# Drop the database
use bantay_barangay_malagutay
db.dropDatabase()

# Re-run setup
npm run db:setup
```

## 📞 Support

If you encounter issues:

1. Check the server logs in `server/logs/app.log`
2. Verify your environment variables in `server/.env`
3. Test database connection with `npm run db:check`
4. Review this guide for common solutions

## 🌐 Environment Variables Reference

```bash
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/bantay_barangay_malagutay

# JWT Configuration  
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d

# Server Configuration
NODE_ENV=development
PORT=5000
```

## ✅ Verification Steps

After setup, verify everything works:

1. **Database Connection**
   ```bash
   npm run db:check
   ```

2. **Start Application**
   ```bash
   npm run dev
   ```

3. **Test Registration**
   - Go to http://localhost:3001/register
   - Register a new account
   - Check if data appears in database

4. **Test Login**
   - Login with admin account
   - Verify dashboard loads correctly

5. **Test Features**
   - Create a test alert
   - View user management
   - Check responsive design

Your BantayBarangay database is now ready! 🎉
