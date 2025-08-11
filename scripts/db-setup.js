#!/usr/bin/env node

/**
 * Database Setup Script for BantayBarangay
 * This script helps initialize the database with default data
 */

import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '../server/.env') })

// Import models
import User from '../server/models/User.js'
import Alert from '../server/models/Alert.js'

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
}

const log = (message, color = colors.reset) => {
  console.log(`${color}${message}${colors.reset}`)
}

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bantay_barangay_malagutay'
    
    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    log('✅ Connected to MongoDB', colors.green)
    return true
  } catch (error) {
    log(`❌ Database connection error: ${error.message}`, colors.red)
    return false
  }
}

const createAdminUser = async () => {
  try {
    log('\n📝 Creating admin user...', colors.cyan)
    
    const adminExists = await User.findOne({ email: 'admin@malagutay.gov.ph' })
    if (adminExists) {
      log('⚠️  Admin user already exists', colors.yellow)
      return
    }

    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@malagutay.gov.ph',
      password: hashedPassword,
      firstName: 'System',
      lastName: 'Administrator',
      contactNumber: '09171234567',
      address: 'Barangay Hall, Malagutay, Loon, Bohol',
      role: 'admin',
      isVerified: true,
      isActive: true
    })

    await adminUser.save()
    log('✅ Admin user created successfully', colors.green)
    log('📧 Email: admin@malagutay.gov.ph', colors.cyan)
    log('🔑 Password: admin123', colors.cyan)
    log('⚠️  Please change the password after first login!', colors.yellow)
    
  } catch (error) {
    log(`❌ Error creating admin user: ${error.message}`, colors.red)
  }
}

const createSampleResponders = async () => {
  try {
    log('\n👥 Creating sample responders...', colors.cyan)
    
    const responders = [
      {
        username: 'responder1',
        email: 'responder1@malagutay.gov.ph',
        password: await bcrypt.hash('responder123', 12),
        firstName: 'Juan',
        lastName: 'Dela Cruz',
        contactNumber: '09171234568',
        address: 'Sitio Centro, Malagutay, Loon, Bohol',
        role: 'responder',
        isVerified: true,
        isActive: true
      },
      {
        username: 'responder2',
        email: 'responder2@malagutay.gov.ph',
        password: await bcrypt.hash('responder123', 12),
        firstName: 'Maria',
        lastName: 'Santos',
        contactNumber: '09171234569',
        address: 'Sitio Poblacion, Malagutay, Loon, Bohol',
        role: 'responder',
        isVerified: true,
        isActive: true
      }
    ]

    for (const responderData of responders) {
      const exists = await User.findOne({ email: responderData.email })
      if (!exists) {
        const responder = new User(responderData)
        await responder.save()
        log(`✅ Created responder: ${responderData.firstName} ${responderData.lastName}`, colors.green)
      } else {
        log(`⚠️  Responder ${responderData.email} already exists`, colors.yellow)
      }
    }
    
  } catch (error) {
    log(`❌ Error creating responders: ${error.message}`, colors.red)
  }
}

const createSampleAlert = async () => {
  try {
    log('\n📢 Creating sample alert...', colors.cyan)
    
    const alertExists = await Alert.findOne({ title: 'System Test Alert' })
    if (alertExists) {
      log('⚠️  Sample alert already exists', colors.yellow)
      return
    }

    const admin = await User.findOne({ role: 'admin' })
    if (!admin) {
      log('❌ Admin user not found, skipping alert creation', colors.red)
      return
    }

    const sampleAlert = new Alert({
      title: 'System Test Alert',
      message: 'This is a test alert to verify the system is working properly. You can safely ignore this message.',
      type: 'info',
      priority: 'medium',
      createdBy: admin._id,
      targetAudience: ['resident', 'responder'],
      isActive: true
    })

    await sampleAlert.save()
    log('✅ Sample alert created successfully', colors.green)
    
  } catch (error) {
    log(`❌ Error creating sample alert: ${error.message}`, colors.red)
  }
}

const setupIndexes = async () => {
  try {
    log('\n🔍 Setting up database indexes...', colors.cyan)
    
    // User indexes
    await User.collection.createIndex({ email: 1 }, { unique: true })
    await User.collection.createIndex({ username: 1 }, { unique: true })
    await User.collection.createIndex({ contactNumber: 1 })
    await User.collection.createIndex({ role: 1 })
    await User.collection.createIndex({ isActive: 1 })
    
    // Alert indexes
    await Alert.collection.createIndex({ type: 1 })
    await Alert.collection.createIndex({ priority: 1 })
    await Alert.collection.createIndex({ isActive: 1 })
    await Alert.collection.createIndex({ createdAt: -1 })
    
    log('✅ Database indexes created successfully', colors.green)
    
  } catch (error) {
    log(`❌ Error creating indexes: ${error.message}`, colors.red)
  }
}

const checkConnection = async () => {
  try {
    log('\n🔍 Testing database connection...', colors.cyan)
    
    // Simple ping
    await mongoose.connection.db.admin().ping()
    log('✅ Database connection is healthy', colors.green)
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray()
    log(`📊 Found ${collections.length} collections:`, colors.cyan)
    collections.forEach(col => {
      log(`   - ${col.name}`, colors.blue)
    })
    
    // Check user count
    const userCount = await User.countDocuments()
    log(`👥 Total users: ${userCount}`, colors.cyan)
    
    const alertCount = await Alert.countDocuments()
    log(`📢 Total alerts: ${alertCount}`, colors.cyan)
    
  } catch (error) {
    log(`❌ Error checking connection: ${error.message}`, colors.red)
  }
}

const main = async () => {
  log('🚀 BantayBarangay Database Setup', colors.bright + colors.green)
  log('================================', colors.green)
  
  const connected = await connectDB()
  if (!connected) {
    log('\n💡 Database Setup Tips:', colors.yellow)
    log('1. Make sure MongoDB is running locally, or', colors.cyan)
    log('2. Update MONGODB_URI in your .env file with Atlas connection string', colors.cyan)
    log('3. For local MongoDB, install from: https://www.mongodb.com/try/download/community', colors.cyan)
    process.exit(1)
  }

  try {
    await setupIndexes()
    await createAdminUser()
    await createSampleResponders()
    await createSampleAlert()
    await checkConnection()
    
    log('\n🎉 Database setup completed successfully!', colors.bright + colors.green)
    log('\n📝 Next steps:', colors.yellow)
    log('1. Start your server: npm run dev', colors.cyan)
    log('2. Open your browser: http://localhost:3001', colors.cyan)
    log('3. Login as admin with: admin@malagutay.gov.ph / admin123', colors.cyan)
    log('4. Change the admin password after first login', colors.cyan)
    
  } catch (error) {
    log(`\n❌ Setup failed: ${error.message}`, colors.red)
  } finally {
    await mongoose.disconnect()
    log('\n👋 Database connection closed', colors.cyan)
  }
}

// Handle command line arguments
const args = process.argv.slice(2)
if (args.includes('--help') || args.includes('-h')) {
  log('🚀 BantayBarangay Database Setup', colors.bright + colors.green)
  log('================================', colors.green)
  log('')
  log('Usage: node db-setup.js [options]', colors.cyan)
  log('')
  log('Options:', colors.yellow)
  log('  --help, -h     Show this help message', colors.cyan)
  log('  --check        Only check database connection', colors.cyan)
  log('')
  log('Environment Variables:', colors.yellow)
  log('  MONGODB_URI    MongoDB connection string', colors.cyan)
  log('                 Default: mongodb://localhost:27017/bantay_barangay_malagutay', colors.cyan)
  process.exit(0)
}

if (args.includes('--check')) {
  const connected = await connectDB()
  if (connected) {
    await checkConnection()
    await mongoose.disconnect()
  }
  process.exit(0)
}

// Run main setup
main().catch(error => {
  log(`\n💥 Unexpected error: ${error.message}`, colors.red)
  process.exit(1)
})
