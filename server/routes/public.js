import express from 'express'
import { getPublicLanding } from '../controllers/landingController.js'

const router = express.Router()

router.get('/landing', getPublicLanding)

export default router
