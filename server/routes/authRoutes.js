import express from 'express'
import { body } from 'express-validator'
import {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  changePassword,
  verifyEmail,
  resendVerification
} from '../controllers/authController.js'
import { protect } from '../middleware/authMiddleware.js'
import { validateRequest } from '../middleware/validationMiddleware.js'

const router = express.Router()

// Registration validation rules
const registerValidation = [
  body('username')
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name is required and cannot exceed 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name is required and cannot exceed 50 characters'),
  body('contactNumber')
    .matches(/^(\+63|0)?[0-9]{10}$/)
    .withMessage('Please enter a valid Philippine phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.sitio')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Sitio cannot exceed 50 characters')
]

// Login validation rules
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please enter a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
]

// Password validation rules
const passwordValidation = [
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters')
]

// Profile update validation rules
const profileUpdateValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('First name cannot exceed 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Last name cannot exceed 50 characters'),
  body('contactNumber')
    .optional()
    .matches(/^(\+63|0)?[0-9]{10}$/)
    .withMessage('Please enter a valid Philippine phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.sitio')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Sitio cannot exceed 50 characters')
]

// Public routes
router.post('/register', registerValidation, validateRequest, registerUser)
router.post('/login', loginValidation, validateRequest, loginUser)
router.post('/logout', logoutUser)
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], validateRequest, forgotPassword)
router.post('/reset-password/:token', passwordValidation, validateRequest, resetPassword)
router.get('/verify-email/:token', verifyEmail)
router.post('/resend-verification', [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email')
], validateRequest, resendVerification)

// Protected routes
router.get('/me', protect, getMe)
router.put('/profile', protect, profileUpdateValidation, validateRequest, updateProfile)
router.put('/change-password', protect, [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
], validateRequest, changePassword)

export default router
