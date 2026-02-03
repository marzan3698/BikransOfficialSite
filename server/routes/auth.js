import express from 'express'
import { login, register, logout, me, registerValidation, campaignRegister, campaignRegisterValidation } from '../controllers/authController.js'
import { authMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/login', login)
router.post('/register', registerValidation, register)
router.post('/campaign-register', campaignRegisterValidation, campaignRegister)
router.post('/logout', authMiddleware, logout)
router.get('/me', authMiddleware, me)

export default router
