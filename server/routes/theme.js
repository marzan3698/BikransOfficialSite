import express from 'express'
import {
  getHeaderSettings,
  getFooterNavItems,
} from '../controllers/themeController.js'

const router = express.Router()

// Public routes (no authentication required)
router.get('/header', getHeaderSettings)
router.get('/footer', getFooterNavItems)

export default router
