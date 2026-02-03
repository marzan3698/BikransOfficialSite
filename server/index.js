import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.js'
import adminRoutes from './routes/admin.js'
import slidersRoutes from './routes/sliders.js'
import themeRoutes from './routes/theme.js'
import tasksRoutes from './routes/tasks.js'
import publicRoutes from './routes/public.js'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const app = express()
const PORT = process.env.PORT || 3001

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json())
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/sliders', slidersRoutes)
app.use('/api/theme', themeRoutes)
app.use('/api/tasks', tasksRoutes)
app.use('/api/public', publicRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Bikrans API is running' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
