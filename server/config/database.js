import mongoose from 'mongoose'
import logger from '../utils/logger.js'

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || ''
    
    const conn = await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    })

    // Connection event listeners
    mongoose.connection.on('connected', () => {
      logger.info(`MongoDB connected: ${conn.connection.host}`)
      console.log(`✅ MongoDB connected: ${conn.connection.host}`)
    })

    mongoose.connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`)
      console.error(`❌ MongoDB connection error: ${err}`)
    })

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected')
      console.log('⚠️  MongoDB disconnected')
    })

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', async () => {
      await mongoose.connection.close()
      logger.info('MongoDB connection closed through app termination')
      console.log('MongoDB connection closed through app termination')
      process.exit(0)
    })

    return conn
  } catch (error) {
    logger.error(`Database connection error: ${error.message}`)
    console.error(`❌ Database connection error: ${error.message}`)
    console.log('\n💡 Database Setup Required:')
    console.log('1. Install MongoDB locally, or')
    console.log('2. Set up MongoDB Atlas (free cloud database)')
    console.log('3. See QUICK_DB_SETUP.md for instructions')
    console.log('4. Update MONGODB_URI in server/.env\n')
    
    // Don't exit the process, let the server run without database
    // This allows the frontend to load even without database connection
    return null
  }
}

export default connectDB
