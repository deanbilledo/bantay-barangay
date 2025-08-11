import mongoose from 'mongoose'

const alertSchema = new mongoose.Schema({
  alertId: {
    type: String,
    unique: true,
    required: true
  },
  title: {
    type: String,
    required: [true, 'Alert title is required'],
    trim: true,
    maxlength: [200, 'Alert title cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Alert message is required'],
    trim: true,
    maxlength: [2000, 'Alert message cannot exceed 2000 characters']
  },
  alertType: {
    type: String,
    enum: {
      values: ['flood', 'landslide', 'storm', 'earthquake', 'fire', 'health', 'security', 'general', 'evacuation'],
      message: 'Alert type must be one of: flood, landslide, storm, earthquake, fire, health, security, general, evacuation'
    },
    required: [true, 'Alert type is required']
  },
  severity: {
    type: String,
    enum: {
      values: ['info', 'watch', 'warning', 'critical'],
      message: 'Severity must be one of: info, watch, warning, critical'
    },
    required: [true, 'Alert severity is required']
  },
  targetArea: {
    type: {
      type: String,
      enum: ['specific', 'barangay_wide'],
      default: 'barangay_wide'
    },
    areas: [{
      type: String // Specific sitios or areas
    }],
    radius: {
      center: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number] // [longitude, latitude]
      },
      radiusKm: {
        type: Number,
        min: 0.1,
        max: 50
      }
    }
  },
  affectedLocation: {
    type: {
      type: String,
      enum: ['Point', 'Polygon'],
      default: 'Point'
    },
    coordinates: {
      type: mongoose.Schema.Types.Mixed // Can be [lon, lat] for Point or [[[lon, lat]...]] for Polygon
    }
  },
  instructions: {
    immediate: [String], // Immediate actions to take
    preparation: [String], // Preparation instructions
    evacuation: {
      required: {
        type: Boolean,
        default: false
      },
      centers: [{
        name: String,
        address: String,
        coordinates: [Number],
        capacity: Number,
        contact: String
      }],
      routes: [String] // Safe evacuation routes
    }
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  authorizedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  scheduledAt: {
    type: Date,
    default: null // For scheduled alerts
  },
  expiresAt: {
    type: Date,
    required: true
  },
  channels: {
    sms: {
      enabled: {
        type: Boolean,
        default: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      recipients: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        phoneNumber: String,
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'failed'],
          default: 'pending'
        },
        sentAt: Date,
        deliveredAt: Date
      }]
    },
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date,
      recipients: [{
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
        },
        email: String,
        status: {
          type: String,
          enum: ['pending', 'sent', 'delivered', 'failed'],
          default: 'pending'
        },
        sentAt: Date,
        deliveredAt: Date
      }]
    },
    push: {
      enabled: {
        type: Boolean,
        default: true
      },
      sent: {
        type: Boolean,
        default: false
      },
      sentAt: Date
    },
    web: {
      enabled: {
        type: Boolean,
        default: true
      },
      displayed: {
        type: Boolean,
        default: false
      }
    }
  },
  statistics: {
    totalRecipients: {
      type: Number,
      default: 0
    },
    smssSent: {
      type: Number,
      default: 0
    },
    emailsSent: {
      type: Number,
      default: 0
    },
    pushNotificationsSent: {
      type: Number,
      default: 0
    },
    acknowledgments: [{
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      acknowledgedAt: {
        type: Date,
        default: Date.now
      },
      location: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point'
        },
        coordinates: [Number]
      }
    }]
  },
  media: [{
    type: {
      type: String,
      enum: ['image', 'video', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    filename: String,
    size: Number,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  relatedIncidents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Incident'
  }],
  updateHistory: [{
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    updateType: {
      type: String,
      enum: ['created', 'modified', 'published', 'deactivated', 'extended', 'cancelled']
    },
    changes: mongoose.Schema.Types.Mixed,
    updatedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Create geospatial index for location-based queries
alertSchema.index({ 'affectedLocation': '2dsphere' })
alertSchema.index({ 'targetArea.radius.center': '2dsphere' })

// Compound indexes for better query performance
alertSchema.index({ isActive: 1, isPublished: 1, expiresAt: 1 })
alertSchema.index({ alertType: 1, severity: 1, createdAt: -1 })
alertSchema.index({ createdBy: 1, createdAt: -1 })
alertSchema.index({ 'targetArea.areas': 1, isActive: 1 })

// Virtual for checking if alert is expired
alertSchema.virtual('isExpired').get(function() {
  return new Date() > this.expiresAt
})

// Virtual for time remaining
alertSchema.virtual('timeRemaining').get(function() {
  const now = new Date()
  const remaining = this.expiresAt.getTime() - now.getTime()
  return remaining > 0 ? remaining : 0
})

// Pre-save middleware to generate alert ID
alertSchema.pre('save', async function(next) {
  if (this.isNew) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    
    // Count alerts for today
    const startOfDay = new Date(year, now.getMonth(), now.getDate())
    const endOfDay = new Date(year, now.getMonth(), now.getDate() + 1)
    
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay }
    })
    
    const alertId = `ALT-${year}${month}${day}-${String(count + 1).padStart(3, '0')}`
    this.alertId = alertId
  }
  next()
})

// Method to publish alert
alertSchema.methods.publish = function(publishedBy) {
  this.isPublished = true
  this.authorizedBy = publishedBy
  this.updateHistory.push({
    updatedBy: publishedBy,
    updateType: 'published',
    notes: 'Alert published to recipients'
  })
  return this.save()
}

// Method to acknowledge alert by user
alertSchema.methods.acknowledge = function(userId, location) {
  const existingAck = this.statistics.acknowledgments.find(
    ack => ack.userId.toString() === userId.toString()
  )
  
  if (!existingAck) {
    this.statistics.acknowledgments.push({
      userId,
      location,
      acknowledgedAt: new Date()
    })
    return this.save()
  }
  
  return this
}

// Method to extend alert expiration
alertSchema.methods.extend = function(newExpiryDate, extendedBy, reason) {
  const oldExpiry = this.expiresAt
  this.expiresAt = newExpiryDate
  this.updateHistory.push({
    updatedBy: extendedBy,
    updateType: 'extended',
    changes: {
      oldExpiryDate: oldExpiry,
      newExpiryDate: newExpiryDate
    },
    notes: reason
  })
  return this.save()
}

// Method to deactivate alert
alertSchema.methods.deactivate = function(deactivatedBy, reason) {
  this.isActive = false
  this.updateHistory.push({
    updatedBy: deactivatedBy,
    updateType: 'deactivated',
    notes: reason
  })
  return this.save()
}

// Static method to find active alerts for a specific area
alertSchema.statics.findActiveForArea = function(area) {
  const now = new Date()
  return this.find({
    isActive: true,
    isPublished: true,
    expiresAt: { $gt: now },
    $or: [
      { 'targetArea.type': 'barangay_wide' },
      { 'targetArea.areas': area }
    ]
  }).sort({ severity: -1, createdAt: -1 })
}

// Static method to find alerts within radius
alertSchema.statics.findWithinRadius = function(longitude, latitude, radiusInKm) {
  const now = new Date()
  return this.find({
    isActive: true,
    isPublished: true,
    expiresAt: { $gt: now },
    $or: [
      { 'targetArea.type': 'barangay_wide' },
      {
        'targetArea.radius.center': {
          $geoWithin: {
            $centerSphere: [[longitude, latitude], radiusInKm / 6378.1]
          }
        }
      }
    ]
  }).sort({ severity: -1, createdAt: -1 })
}

// Static method to get alert statistics
alertSchema.statics.getStatistics = function(dateRange) {
  const matchStage = {}
  if (dateRange) {
    matchStage.createdAt = {
      $gte: dateRange.start,
      $lte: dateRange.end
    }
  }
  
  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        byType: {
          $push: {
            type: '$alertType',
            severity: '$severity'
          }
        },
        totalRecipients: { $sum: '$statistics.totalRecipients' },
        totalSMSSent: { $sum: '$statistics.smssSent' },
        totalEmailsSent: { $sum: '$statistics.emailsSent' }
      }
    }
  ])
}

const Alert = mongoose.model('Alert', alertSchema)

export default Alert
