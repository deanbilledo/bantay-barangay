import mongoose from 'mongoose'
import logger from '../utils/logger.js'

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bantay_barangay_malagutay'
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      bufferMaxEntries: 0, // Disable mongoose buffering
      bufferCommands: false, // Disable mongoose buffering
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
    process.exit(1)
  }
}

export default connectDB
