import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  contactNumber: {
    type: String,
    required: [true, 'Contact number is required'],
    match: [/^(\+63|0)?[0-9]{10}$/, 'Please enter a valid Philippine phone number']
  },
  role: {
    type: String,
    enum: {
      values: ['admin', 'official', 'resident', 'responder'],
      message: 'Role must be one of: admin, official, resident, responder'
    },
    default: 'resident'
  },
  address: {
    street: String,
    sitio: String,
    barangay: {
      type: String,
      default: 'Malagutay'
    },
    municipality: {
      type: String,
      default: 'Loon'
    },
    province: {
      type: String,
      default: 'Bohol'
    },
    zipCode: {
      type: String,
      default: '6316'
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [123.8014, 9.8063] // Default to Loon, Bohol coordinates
    }
  },
  profilePicture: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLogin: Date,
  preferences: {
    notifications: {
      email: {
        type: Boolean,
        default: true
      },
      sms: {
        type: Boolean,
        default: true
      },
      push: {
        type: Boolean,
        default: true
      }
    },
    language: {
      type: String,
      enum: ['en', 'fil'],
      default: 'en'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Create geospatial index for location-based queries
userSchema.index({ location: '2dsphere' })

// Indexes for better query performance
userSchema.index({ email: 1 })
userSchema.index({ username: 1 })
userSchema.index({ role: 1 })
userSchema.index({ isActive: 1 })

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`
})

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next()

  try {
    // Hash password with cost of 12
    const saltRounds = 12
    this.password = await bcrypt.hash(this.password, saltRounds)
    next()
  } catch (error) {
    next(error)
  }
})

// Instance method to check password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date()
  return this.save({ validateBeforeSave: false })
}

// Static method to find users by role
userSchema.statics.findByRole = function(role) {
  return this.find({ role, isActive: true })
}

// Static method to find users within radius (for emergency notifications)
userSchema.statics.findWithinRadius = function(longitude, latitude, radiusInKm) {
  return this.find({
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInKm / 6378.1] // Earth radius in km
      }
    },
    isActive: true
  })
}

const User = mongoose.model('User', userSchema)

export default User
