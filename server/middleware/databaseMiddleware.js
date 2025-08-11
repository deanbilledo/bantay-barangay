// Middleware to check database connection
export const requireDatabase = (req, res, next) => {
  if (!req.app.get('dbConnected')) {
    return res.status(503).json({
      success: false,
      message: 'Database not available. Please set up MongoDB connection.',
      error: 'SERVICE_UNAVAILABLE',
      setup: {
        message: 'Database setup required',
        instructions: [
          'Install MongoDB locally, or',
          'Set up MongoDB Atlas (free cloud database)',
          'Update MONGODB_URI in server/.env file',
          'See QUICK_DB_SETUP.md for detailed instructions'
        ]
      }
    })
  }
  next()
}

export default requireDatabase
