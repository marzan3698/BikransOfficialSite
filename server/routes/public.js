import express from 'express'
import { getPublicLanding, getPublicProjects } from '../controllers/landingController.js'

const router = express.Router()

router.get('/landing', getPublicLanding)
router.get('/projects', getPublicProjects)

export default router
