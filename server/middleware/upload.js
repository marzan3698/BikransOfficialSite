import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'sliders')
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 1 * 1024 * 1024 // 1MB

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `temp_${Date.now()}${path.extname(file.originalname) || '.jpg'}`),
})

const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, WebP allowed'), false)
  }
}

export const uploadSlider = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_SIZE },
}).single('image')

// Logo upload configuration
const LOGO_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'logos')
const LOGO_ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/svg+xml']
const LOGO_MAX_SIZE = 500 * 1024 // 500KB

if (!fs.existsSync(LOGO_UPLOAD_DIR)) {
  fs.mkdirSync(LOGO_UPLOAD_DIR, { recursive: true })
}

const logoStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LOGO_UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `temp_${Date.now()}${path.extname(file.originalname) || '.png'}`),
})

const logoFileFilter = (req, file, cb) => {
  if (LOGO_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, SVG allowed'), false)
  }
}

export const uploadLogo = multer({
  storage: logoStorage,
  fileFilter: logoFileFilter,
  limits: { fileSize: LOGO_MAX_SIZE },
}).single('logo')

// Task attachment upload (video, audio, image, document)
const TASK_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'tasks')
const TASK_MAX_SIZE = 50 * 1024 * 1024 // 50MB
const TASK_ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'video/mp4',
  'video/webm',
  'video/quicktime',
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/webm',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]

if (!fs.existsSync(TASK_UPLOAD_DIR)) {
  fs.mkdirSync(TASK_UPLOAD_DIR, { recursive: true })
}

const taskStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TASK_UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}_${(file.originalname || 'file').replace(/[^a-zA-Z0-9.-]/g, '_')}`),
})

const taskFileFilter = (req, file, cb) => {
  if (TASK_ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('File type not allowed. Use video, audio, image, or document.'), false)
  }
}

export const uploadTaskAttachment = multer({
  storage: taskStorage,
  fileFilter: taskFileFilter,
  limits: { fileSize: TASK_MAX_SIZE },
}).single('file')

// Landing service icon (small icons for service cards)
const LANDING_UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'landing')
const LANDING_ICON_MAX_SIZE = 500 * 1024 // 500KB
const LANDING_ICON_TYPES = ['image/jpeg', 'image/png', 'image/webp']

if (!fs.existsSync(LANDING_UPLOAD_DIR)) {
  fs.mkdirSync(LANDING_UPLOAD_DIR, { recursive: true })
}

const landingIconStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LANDING_UPLOAD_DIR),
  filename: (req, file, cb) =>
    cb(null, `temp_${Date.now()}${path.extname(file.originalname) || '.png'}`),
})

const landingIconFilter = (req, file, cb) => {
  if (LANDING_ICON_TYPES.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Only JPG, PNG, WebP allowed'), false)
  }
}

export const uploadLandingServiceIcon = multer({
  storage: landingIconStorage,
  fileFilter: landingIconFilter,
  limits: { fileSize: LANDING_ICON_MAX_SIZE },
}).single('icon')
