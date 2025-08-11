import logger from '../utils/logger.js'

// Configure Socket.IO
export const configureSocket = (io) => {
  // Middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token
    // TODO: Implement JWT verification for socket connections
    next()
  })

  // Handle connections
  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.id}`)

    // Join user to their personal room
    socket.on('join-user-room', (userId) => {
      socket.join(`user-${userId}`)
      logger.info(`User ${userId} joined personal room`)
    })

    // Join user to barangay room for alerts
    socket.on('join-barangay-room', () => {
      socket.join('barangay-malagutay')
      logger.info('User joined barangay room')
    })

    // Handle rescue request updates
    socket.on('rescue-request-update', (data) => {
      // Broadcast to relevant users (officials, responders)
      socket.to('officials').emit('rescue-request-update', data)
    })

    // Handle alert acknowledgments
    socket.on('alert-acknowledge', (data) => {
      // Broadcast acknowledgment to officials
      socket.to('officials').emit('alert-acknowledged', data)
    })

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`User disconnected: ${socket.id}`)
    })
  })

  return io
}

// Emit functions for use in controllers
export const emitToUser = (io, userId, event, data) => {
  io.to(`user-${userId}`).emit(event, data)
}

export const emitToBarangay = (io, event, data) => {
  io.to('barangay-malagutay').emit(event, data)
}

export const emitToOfficials = (io, event, data) => {
  io.to('officials').emit(event, data)
}
