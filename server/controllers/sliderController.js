import { query } from '../config/database.js'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'sliders')
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_SIZE = 1 * 1024 * 1024 // 1MB

function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true })
  }
}

export async function getPublicSliders(req, res) {
  try {
    const sliders = await query(
      'SELECT id, image, title, subtitle, link FROM sliders WHERE is_active = 1 ORDER BY sort_order ASC'
    )
    res.json(sliders)
  } catch (err) {
    console.error('Get sliders error:', err)
    res.status(500).json({ error: 'Failed to get sliders' })
  }
}

export async function getAdminSliders(req, res) {
  try {
    const sliders = await query(
      'SELECT * FROM sliders ORDER BY sort_order ASC'
    )
    res.json(sliders)
  } catch (err) {
    console.error('Get admin sliders error:', err)
    res.status(500).json({ error: 'Failed to get sliders' })
  }
}

export async function createSlider(req, res) {
  try {
    ensureUploadDir()
    const { title, subtitle, link, sort_order, is_active } = req.body
    let imagePath = ''

    if (req.file) {
      const ext = path.extname(req.file.originalname) || '.jpg'
      const newName = `slide_${Date.now()}${ext}`
      const destPath = path.join(UPLOAD_DIR, newName)
      fs.renameSync(req.file.path, destPath)
      imagePath = `/uploads/sliders/${newName}`
    } else {
      return res.status(400).json({ error: 'Image is required' })
    }

    await query(
      'INSERT INTO sliders (image, title, subtitle, link, sort_order, is_active) VALUES (?, ?, ?, ?, ?, ?)',
      [
        imagePath,
        title || '',
        subtitle || '',
        link || '',
        parseInt(sort_order) || 0,
        is_active === '0' || is_active === false ? 0 : 1,
      ]
    )

    const rows = await query('SELECT * FROM sliders WHERE id = LAST_INSERT_ID()')
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create slider error:', err)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ error: 'Failed to create slider' })
  }
}

export async function updateSlider(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { title, subtitle, link, sort_order, is_active } = req.body
    const updates = []
    const params = []

    if (req.file) {
      ensureUploadDir()
      const ext = path.extname(req.file.originalname) || '.jpg'
      const newName = `slide_${Date.now()}${ext}`
      const destPath = path.join(UPLOAD_DIR, newName)
      fs.renameSync(req.file.path, destPath)
      updates.push('image = ?')
      params.push(`/uploads/sliders/${newName}`)

      const oldRows = await query('SELECT image FROM sliders WHERE id = ?', [id])
      if (oldRows[0]?.image?.startsWith('/uploads/')) {
        const oldPath = path.join(process.cwd(), 'public', oldRows[0].image)
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath)
      }
    }
    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (subtitle !== undefined) {
      updates.push('subtitle = ?')
      params.push(subtitle)
    }
    if (link !== undefined) {
      updates.push('link = ?')
      params.push(link)
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?')
      params.push(parseInt(sort_order))
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?')
      params.push(is_active === '0' || is_active === false ? 0 : 1)
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }

    params.push(id)
    await query(`UPDATE sliders SET ${updates.join(', ')} WHERE id = ?`, params)

    const rows = await query('SELECT * FROM sliders WHERE id = ?', [id])
    res.json(rows[0])
  } catch (err) {
    console.error('Update slider error:', err)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ error: 'Failed to update slider' })
  }
}

export async function deleteSlider(req, res) {
  try {
    const id = parseInt(req.params.id)
    const rows = await query('SELECT image FROM sliders WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Slider not found' })
    }
    await query('DELETE FROM sliders WHERE id = ?', [id])
    if (rows[0]?.image?.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), 'public', rows[0].image)
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
    }
    res.json({ message: 'Slider deleted' })
  } catch (err) {
    console.error('Delete slider error:', err)
    res.status(500).json({ error: 'Failed to delete slider' })
  }
}

export async function reorderSliders(req, res) {
  try {
    const { order } = req.body
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be array of {id, sort_order}' })
    }
    for (const { id, sort_order } of order) {
      await query('UPDATE sliders SET sort_order = ? WHERE id = ?', [sort_order, id])
    }
    res.json({ message: 'Reordered' })
  } catch (err) {
    console.error('Reorder error:', err)
    res.status(500).json({ error: 'Failed to reorder' })
  }
}

