import express from 'express'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Placeholder routes - to be implemented
router.get('/', protect, (req, res) => {
  res.json({ success: true, message: 'Notification routes working', data: [] })
})

export default router
