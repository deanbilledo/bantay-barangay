import express from 'express'
import { protect } from '../middleware/authMiddleware.js'

const router = express.Router()

// Placeholder routes - to be implemented
router.post('/', protect, (req, res) => {
  res.json({ success: true, message: 'Upload routes working' })
})

export default router
