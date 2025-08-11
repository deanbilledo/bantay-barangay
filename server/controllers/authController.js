import crypto from 'crypto'
import User from '../models/User.js'
import { asyncHandler } from '../middleware/errorMiddleware.js'
import { generateToken } from '../middleware/authMiddleware.js'
import logger from '../utils/logger.js'
import { sendEmail } from '../services/emailService.js'

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const {
    username,
    email,
    password,
    firstName,
    lastName,
    contactNumber,
    address,
    role = 'resident'
  } = req.body

  // Check if user already exists
  const userExists = await User.findOne({
    $or: [{ email }, { username }]
  })

  if (userExists) {
    res.status(400)
    throw new Error('User already exists with this email or username')
  }

  // Create verification token
  const verificationToken = crypto.randomBytes(32).toString('hex')

  // Create user
  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
    contactNumber,
    address,
    role: role === 'admin' ? 'resident' : role, // Prevent admin registration
    verificationToken
  })

  if (user) {
    // Send verification email
    try {
      await sendEmail({
        to: user.email,
        subject: 'Verify Your BantayBarangay Account',
        template: 'emailVerification',
        data: {
          name: user.firstName,
          verificationUrl: `${process.env.CLIENT_URL}/verify-email/${verificationToken}`
        }
      })
    } catch (error) {
      logger.error('Failed to send verification email:', error)
    }

    logger.info(`New user registered: ${user.email}`)

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email to verify your account.',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified
        }
      }
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body

  // Check for user (include password for comparison)
  const user = await User.findOne({ email }).select('+password')

  if (user && (await user.matchPassword(password))) {
    if (!user.isActive) {
      res.status(401)
      throw new Error('Account is deactivated. Please contact administrator.')
    }

    // Update last login
    await user.updateLastLogin()

    // Generate token
    const token = generateToken(user._id)

    logger.info(`User logged in: ${user.email}`)

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    })

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin
        },
        token
      }
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Public
const logoutUser = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  })

  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

// @desc    Get current user
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  res.json({
    success: true,
    data: {
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        contactNumber: user.contactNumber,
        address: user.address,
        role: user.role,
        isVerified: user.isVerified,
        lastLogin: user.lastLogin,
        preferences: user.preferences,
        createdAt: user.createdAt
      }
    }
  })
})

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)

  if (user) {
    user.firstName = req.body.firstName || user.firstName
    user.lastName = req.body.lastName || user.lastName
    user.contactNumber = req.body.contactNumber || user.contactNumber
    
    if (req.body.address) {
      user.address = { ...user.address, ...req.body.address }
    }

    if (req.body.preferences) {
      user.preferences = { ...user.preferences, ...req.body.preferences }
    }

    const updatedUser = await user.save()

    logger.info(`User profile updated: ${user.email}`)

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          contactNumber: updatedUser.contactNumber,
          address: updatedUser.address,
          role: updatedUser.role,
          preferences: updatedUser.preferences
        }
      }
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body

  const user = await User.findById(req.user._id).select('+password')

  if (user && (await user.matchPassword(currentPassword))) {
    user.password = newPassword
    await user.save()

    logger.info(`Password changed for user: ${user.email}`)

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } else {
    res.status(400)
    throw new Error('Current password is incorrect')
  }
})

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex')
  
  user.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex')
  
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes

  await user.save({ validateBeforeSave: false })

  try {
    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - BantayBarangay',
      template: 'passwordReset',
      data: {
        name: user.firstName,
        resetUrl: `${process.env.CLIENT_URL}/reset-password/${resetToken}`
      }
    })

    logger.info(`Password reset email sent to: ${user.email}`)

    res.json({
      success: true,
      message: 'Password reset email sent'
    })
  } catch (error) {
    user.passwordResetToken = undefined
    user.passwordResetExpires = undefined
    await user.save({ validateBeforeSave: false })

    logger.error('Error sending password reset email:', error)
    res.status(500)
    throw new Error('Email could not be sent')
  }
})

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body

  // Get hashed token
  const passwordResetToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex')

  const user = await User.findOne({
    passwordResetToken,
    passwordResetExpires: { $gt: Date.now() }
  })

  if (!user) {
    res.status(400)
    throw new Error('Invalid or expired reset token')
  }

  // Set new password
  user.password = password
  user.passwordResetToken = undefined
  user.passwordResetExpires = undefined

  await user.save()

  logger.info(`Password reset successful for user: ${user.email}`)

  res.json({
    success: true,
    message: 'Password reset successful'
  })
})

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
// @access  Public
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.params

  const user = await User.findOne({ verificationToken: token })

  if (!user) {
    res.status(400)
    throw new Error('Invalid verification token')
  }

  user.isVerified = true
  user.verificationToken = undefined

  await user.save()

  logger.info(`Email verified for user: ${user.email}`)

  res.json({
    success: true,
    message: 'Email verified successfully'
  })
})

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
const resendVerification = asyncHandler(async (req, res) => {
  const { email } = req.body

  const user = await User.findOne({ email })

  if (!user) {
    res.status(404)
    throw new Error('User not found')
  }

  if (user.isVerified) {
    res.status(400)
    throw new Error('Email is already verified')
  }

  // Generate new verification token
  const verificationToken = crypto.randomBytes(32).toString('hex')
  user.verificationToken = verificationToken

  await user.save()

  try {
    await sendEmail({
      to: user.email,
      subject: 'Verify Your BantayBarangay Account',
      template: 'emailVerification',
      data: {
        name: user.firstName,
        verificationUrl: `${process.env.CLIENT_URL}/verify-email/${verificationToken}`
      }
    })

    logger.info(`Verification email resent to: ${user.email}`)

    res.json({
      success: true,
      message: 'Verification email sent'
    })
  } catch (error) {
    logger.error('Error sending verification email:', error)
    res.status(500)
    throw new Error('Email could not be sent')
  }
})

export {
  registerUser,
  loginUser,
  logoutUser,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerification
}
