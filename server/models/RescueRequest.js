import mongoose from 'mongoose'

const rescueRequestSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true,
    required: true
  },
  requester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  contactInfo: {
    name: {
      type: String,
      required: [true, 'Contact name is required'],
      trim: true
    },
    phoneNumber: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [/^(\+63|0)?[0-9]{10}$/, 'Please enter a valid Philippine phone number']
    },
    alternateContact: {
      name: String,
      phoneNumber: String
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: [true, 'GPS coordinates are required'],
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 && // longitude
                 coords[1] >= -90 && coords[1] <= 90      // latitude
        },
        message: 'Invalid coordinates provided'
      }
    }
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
    landmarks: String // Notable landmarks to help responders
  },
  emergencyType: {
    type: String,
    enum: {
      values: ['flood', 'medical', 'trapped', 'evacuation', 'fire', 'landslide', 'other'],
      message: 'Emergency type must be one of: flood, medical, trapped, evacuation, fire, landslide, other'
    },
    required: [true, 'Emergency type is required']
  },
  severity: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high', 'critical'],
      message: 'Severity must be one of: low, medium, high, critical'
    },
    default: 'medium'
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  personsAffected: {
    adults: {
      type: Number,
      default: 0,
      min: [0, 'Number of adults cannot be negative']
    },
    children: {
      type: Number,
      default: 0,
      min: [0, 'Number of children cannot be negative']
    },
    seniors: {
      type: Number,
      default: 0,
      min: [0, 'Number of seniors cannot be negative']
    },
    disabled: {
      type: Number,
      default: 0,
      min: [0, 'Number of disabled persons cannot be negative']
    }
  },
  medicalInfo: {
    hasInjuries: {
      type: Boolean,
      default: false
    },
    injuryDescription: String,
    hasChronicConditions: {
      type: Boolean,
      default: false
    },
    medicationNeeded: String
  },
  photos: [{
    url: String,
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: {
      values: ['pending', 'acknowledged', 'dispatched', 'in_progress', 'completed', 'cancelled'],
      message: 'Status must be one of: pending, acknowledged, dispatched, in_progress, completed, cancelled'
    },
    default: 'pending'
  },
  priority: {
    type: Number,
    min: 1,
    max: 5,
    default: 3 // 1 = lowest, 5 = highest
  },
  assignedTo: {
    responder: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    team: String,
    assignedAt: Date,
    estimatedArrival: Date
  },
  statusHistory: [{
    status: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }],
  notes: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true
    },
    isInternal: {
      type: Boolean,
      default: false // Internal notes are only visible to officials/responders
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  resources: {
    requested: [{
      type: String,
      quantity: Number,
      urgent: Boolean
    }],
    dispatched: [{
      type: String,
      quantity: Number,
      dispatchedAt: Date,
      dispatchedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    }]
  },
  completionInfo: {
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    outcome: {
      type: String,
      enum: ['successful', 'partial', 'unsuccessful', 'referred']
    },
    finalNotes: String
  },
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Create geospatial index for location-based queries
rescueRequestSchema.index({ location: '2dsphere' })

// Compound indexes for better query performance
rescueRequestSchema.index({ status: 1, createdAt: -1 })
rescueRequestSchema.index({ emergencyType: 1, severity: 1 })
rescueRequestSchema.index({ 'assignedTo.responder': 1, status: 1 })
rescueRequestSchema.index({ requester: 1, createdAt: -1 })
rescueRequestSchema.index({ isArchived: 1, createdAt: -1 })

// Virtual for total persons affected
rescueRequestSchema.virtual('totalPersonsAffected').get(function() {
  return this.personsAffected.adults + 
         this.personsAffected.children + 
         this.personsAffected.seniors + 
         this.personsAffected.disabled
})

// Virtual for elapsed time since request
rescueRequestSchema.virtual('elapsedTime').get(function() {
  return Date.now() - this.createdAt.getTime()
})

// Pre-save middleware to generate request number
rescueRequestSchema.pre('save', async function(next) {
  if (this.isNew) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    // Count requests for today
    const startOfDay = new Date(year, now.getMonth(), now.getDate())
    const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1)
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    })
    
    const requestNumber = `RR-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`
    this.requestNumber = requestNumber
  }
  next()
})

// Method to add status update
rescueRequestSchema.methods.updateStatus = function(newStatus, updatedBy, notes) {
  this.statusHistory.push({
    status: this.status, // Save current status before updating
    updatedBy,
    notes
  })
  this.status = newStatus
  
  if (newStatus === 'completed') {
    this.completionInfo.completedAt = new Date()
    this.completionInfo.completedBy = updatedBy
  }
  
  return this.save()
}

// Method to assign responder
rescueRequestSchema.methods.assignResponder = function(responderId, estimatedArrival) {
  this.assignedTo.responder = responderId
  this.assignedTo.assignedAt = new Date()
  if (estimatedArrival) {
    this.assignedTo.estimatedArrival = estimatedArrival
  }
  return this.updateStatus('acknowledged', responderId, 'Responder assigned')
}

// Static method to find requests within radius
rescueRequestSchema.statics.findWithinRadius = function(longitude, latitude, radiusInKm, options = {}) {
  const query = {
    location: {
      $geoWithin: {
        $centerSphere: [[longitude, latitude], radiusInKm / 6378.1]
      }
    },
    isArchived: false,
    ...options
  }
  
  return this.find(query)
    .populate('requester', 'firstName lastName contactNumber')
    .populate('assignedTo.responder', 'firstName lastName contactNumber')
    .sort({ priority: -1, createdAt: -1 })
}

// Static method to get requests by status
rescueRequestSchema.statics.findByStatus = function(status, limit = 50) {
  return this.find({ status, isArchived: false })
    .populate('requester', 'firstName lastName contactNumber')
    .populate('assignedTo.responder', 'firstName lastName contactNumber')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit)
}

const RescueRequest = mongoose.model('RescueRequest', rescueRequestSchema)

export default RescueRequest
