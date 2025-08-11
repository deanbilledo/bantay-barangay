import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { asyncHandler } from './errorMiddleware.js'

// Protect routes - check for valid JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token

  // Check for token in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1]

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      // Get user from token (exclude password)
      req.user = await User.findById(decoded.id).select('-password')

      if (!req.user) {
        res.status(401)
        throw new Error('User not found')
      }

      if (!req.user.isActive) {
        res.status(401)
        throw new Error('Account is deactivated')
      }

      next()
    } catch (error) {
      console.error(error)
      res.status(401)
      throw new Error('Not authorized, token failed')
    }
  }

  if (!token) {
    res.status(401)
    throw new Error('Not authorized, no token')
  }
})

// Admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized as admin')
  }
}

// Official middleware (admin or official)
const official = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'official')) {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized as official')
  }
}

// Responder middleware (admin, official, or responder)
const responder = (req, res, next) => {
  if (req.user && ['admin', 'official', 'responder'].includes(req.user.role)) {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized as responder')
  }
}

// Check if user owns resource or is authorized
const ownerOrAuthorized = (req, res, next) => {
  if (req.user && (
    req.user._id.toString() === req.params.userId ||
    ['admin', 'official'].includes(req.user.role)
  )) {
    next()
  } else {
    res.status(403)
    throw new Error('Not authorized to access this resource')
  }
}

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  })
}

export {
  protect,
  admin,
  official,
  responder,
  ownerOrAuthorized,
  generateToken
}
