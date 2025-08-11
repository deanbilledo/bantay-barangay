# 🚀 Quick Database Setup - MongoDB Atlas

Since you don't have MongoDB installed locally, let's use MongoDB Atlas (free cloud database):

## 📝 Step-by-Step Setup

### 1. Create MongoDB Atlas Account (Free)
1. Go to [https://www.mongodb.com/atlas/database](https://www.mongodb.com/atlas/database)
2. Click "Try Free"
3. Sign up with your email or Google account

### 2. Create a Cluster
1. Choose "M0 Sandbox" (FREE tier)
2. Select a region close to you (AWS, Google Cloud, or Azure)
3. Give your cluster a name (e.g., "BantayBarangay")
4. Click "Create"

### 3. Set Up Database User
1. Click "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `bantayuser`
5. Password: `bantay123` (or generate a secure one)
6. Database User Privileges: "Read and write to any database"
7. Click "Add User"

### 4. Configure Network Access
1. Click "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow access from anywhere" (for development)
4. Click "Confirm"

### 5. Get Connection String
1. Go back to "Database" (Clusters)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password

### 6. Update Your Environment
1. Open `server/.env` file
2. Replace the MONGODB_URI line with your Atlas connection string:

```bash
MONGODB_URI=mongodb+srv://bantayuser:bantay123@bantaybarangay.xxxxx.mongodb.net/bantay_barangay_malagutay?retryWrites=true&w=majority
```

Replace `xxxxx` with your actual cluster ID from the connection string.

## ⚡ Quick Alternative - Use Our Test Database

If you want to skip the setup, you can temporarily use this test connection:

```bash
# Add this to your server/.env file temporarily
MONGODB_URI=
```

**⚠️ Warning: This is for testing only! Set up your own database for production.**

## 🔄 Apply the Changes

After updating your `.env` file:

1. **Restart your server**
   ```bash
   # Stop the current dev server (Ctrl+C)
   # Then restart
   npm run dev
   ```

2. **Initialize the database**
   ```bash
   npm run db:setup
   ```

3. **Test the registration**
   - Go to http://localhost:3001/register
   - Fill out the form with the simplified address field
   - Submit and check if it works!

## ✅ Verification

You should see in your server console:
```
✅ MongoDB connected: cluster0-xxx.wduaz91.mongodb.net
🚀 BantayBarangay API Server running on http://localhost:5000
```

If you see connection errors, double-check:
- Connection string format
- Username and password
- Network access settings
- Database name

## 🎯 Next Steps

Once connected:
1. Your registration form now has a simple address field
2. Database will store addresses as simple text strings
3. All data is stored in MongoDB Atlas (cloud)
4. You can view data in MongoDB Atlas dashboard

Need help? The error messages in the console will guide you! 🚀
