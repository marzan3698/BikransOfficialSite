import { query } from '../config/database.js'
import path from 'path'
import fs from 'fs'

const DEFAULT_SERVICES_TITLE = 'সব স্বাস্থ্য সমাধান এক প্ল্যাটফর্মে'
const DEFAULT_FEATURES_TITLE = 'কেন বিক্রান্স বেছে নেবেন?'

// ===== PUBLIC: get all landing content (no auth) =====
export async function getPublicLanding(req, res) {
  try {
    const [servicesSettings] = await query('SELECT section_title FROM landing_services_settings LIMIT 1')
    const services = await query(
      'SELECT id, icon, title, link_text, link_url, is_image AS isImage FROM landing_services WHERE is_active = 1 ORDER BY sort_order ASC'
    )
    const [featuresSettings] = await query('SELECT section_title FROM landing_features_settings LIMIT 1')
    const features = await query(
      'SELECT id, icon, title, description FROM landing_features WHERE is_active = 1 ORDER BY sort_order ASC'
    )
    const [cta] = await query('SELECT * FROM landing_cta LIMIT 1')

    res.json({
      services: {
        section_title: servicesSettings?.section_title ?? DEFAULT_SERVICES_TITLE,
        items: services.map((s) => ({
          id: s.id,
          icon: s.icon,
          title: s.title,
          link: s.link_text,
          link_url: s.link_url || '#',
          isImage: Boolean(s.isImage),
        })),
      },
      features: {
        section_title: featuresSettings?.section_title ?? DEFAULT_FEATURES_TITLE,
        items: features,
      },
      cta: cta
        ? {
          heading: cta.heading,
          subtitle: cta.subtitle,
          primary_btn_text: cta.primary_btn_text,
          primary_btn_link: cta.primary_btn_link,
          secondary_btn_text: cta.secondary_btn_text,
          secondary_btn_link: cta.secondary_btn_link,
        }
        : {
          heading: 'আজই শুরু করুন',
          subtitle: 'স্বাস্থ্য ও আয়ের নতুন যাত্রা',
          primary_btn_text: '📞 কল করুন',
          primary_btn_link: '+8801700000000',
          secondary_btn_text: '💬 WhatsApp',
          secondary_btn_link: '8801700000000',
        },
    })
  } catch (err) {
    console.error('Get public landing error:', err)
    res.status(500).json({ error: 'Failed to get landing content' })
  }
}


export async function getPublicProjects(req, res) {
  try {
    const projects = await query('SELECT id, code, name FROM projects ORDER BY created_at DESC')
    res.json(projects)
  } catch (err) {
    console.error('Get public projects error:', err)
    res.status(500).json({ error: 'Failed to get projects' })
  }
}

const LANDING_ICON_DIR = path.join(process.cwd(), 'public', 'uploads', 'landing')

// ===== SERVICES SECTION (admin) =====
export async function uploadServiceIcon(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' })
    }
    const ext = path.extname(req.file.originalname) || '.png'
    const newName = `icon_${Date.now()}${ext}`
    const destPath = path.join(LANDING_ICON_DIR, newName)
    fs.renameSync(req.file.path, destPath)
    const iconUrl = `/uploads/landing/${newName}`
    res.json({ success: true, url: iconUrl })
  } catch (err) {
    console.error('Upload service icon error:', err)
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.status(500).json({ error: 'Failed to upload image' })
  }
}

export async function getServicesSection(req, res) {
  try {
    const settings = await query('SELECT * FROM landing_services_settings LIMIT 1')
    const items = await query('SELECT * FROM landing_services ORDER BY sort_order ASC')
    const row = settings[0]
    res.json({
      section_title: row?.section_title ?? DEFAULT_SERVICES_TITLE,
      items: items || [],
    })
  } catch (err) {
    console.error('Get services section error:', err)
    res.status(500).json({ error: 'Failed to get services section' })
  }
}

export async function updateServicesSettings(req, res) {
  try {
    const { section_title } = req.body
    const rows = await query('SELECT id FROM landing_services_settings LIMIT 1')
    if (rows.length === 0) {
      await query('INSERT INTO landing_services_settings (section_title) VALUES (?)', [
        section_title ?? DEFAULT_SERVICES_TITLE,
      ])
    } else {
      await query('UPDATE landing_services_settings SET section_title = ? WHERE id = ?', [
        section_title ?? DEFAULT_SERVICES_TITLE,
        rows[0].id,
      ])
    }
    const [updated] = await query('SELECT * FROM landing_services_settings LIMIT 1')
    res.json(updated)
  } catch (err) {
    console.error('Update services settings error:', err)
    res.status(500).json({ error: 'Failed to update services settings' })
  }
}

export async function createServiceItem(req, res) {
  try {
    const { icon, title, link_text, link_url, is_image, sort_order, is_active } = req.body
    if (!icon || !title) {
      return res.status(400).json({ error: 'Icon and title are required' })
    }
    const result = await query(
      `INSERT INTO landing_services (icon, title, link_text, link_url, is_image, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        icon,
        title,
        link_text ?? 'বিস্তারিত জানুন',
        link_url ?? '#',
        is_image ? 1 : 0,
        sort_order ?? 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    )
    const insertId = result?.insertId ?? result
    const rows = await query('SELECT * FROM landing_services WHERE id = ?', [insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create service item error:', err)
    res.status(500).json({ error: 'Failed to create service item' })
  }
}

export async function updateServiceItem(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { icon, title, link_text, link_url, is_image, sort_order, is_active } = req.body
    const rows = await query('SELECT id FROM landing_services WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service item not found' })
    }
    const updates = []
    const params = []
    if (icon !== undefined) {
      updates.push('icon = ?')
      params.push(icon)
    }
    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (link_text !== undefined) {
      updates.push('link_text = ?')
      params.push(link_text)
    }
    if (link_url !== undefined) {
      updates.push('link_url = ?')
      params.push(link_url)
    }
    if (is_image !== undefined) {
      updates.push('is_image = ?')
      params.push(is_image ? 1 : 0)
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?')
      params.push(parseInt(sort_order))
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?')
      params.push(is_active ? 1 : 0)
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }
    params.push(id)
    await query(`UPDATE landing_services SET ${updates.join(', ')} WHERE id = ?`, params)
    const [item] = await query('SELECT * FROM landing_services WHERE id = ?', [id])
    res.json(item)
  } catch (err) {
    console.error('Update service item error:', err)
    res.status(500).json({ error: 'Failed to update service item' })
  }
}

export async function deleteServiceItem(req, res) {
  try {
    const id = parseInt(req.params.id)
    const rows = await query('SELECT id FROM landing_services WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Service item not found' })
    }
    await query('DELETE FROM landing_services WHERE id = ?', [id])
    res.json({ message: 'Service item deleted' })
  } catch (err) {
    console.error('Delete service item error:', err)
    res.status(500).json({ error: 'Failed to delete service item' })
  }
}

export async function reorderServiceItems(req, res) {
  try {
    const { order } = req.body
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be array of {id, sort_order}' })
    }
    for (const { id, sort_order } of order) {
      await query('UPDATE landing_services SET sort_order = ? WHERE id = ?', [sort_order, id])
    }
    res.json({ message: 'Service items reordered' })
  } catch (err) {
    console.error('Reorder service items error:', err)
    res.status(500).json({ error: 'Failed to reorder service items' })
  }
}

// ===== FEATURES SECTION (admin) =====
export async function getFeaturesSection(req, res) {
  try {
    const settings = await query('SELECT * FROM landing_features_settings LIMIT 1')
    const items = await query('SELECT * FROM landing_features ORDER BY sort_order ASC')
    const row = settings[0]
    res.json({
      section_title: row?.section_title ?? DEFAULT_FEATURES_TITLE,
      items: items || [],
    })
  } catch (err) {
    console.error('Get features section error:', err)
    res.status(500).json({ error: 'Failed to get features section' })
  }
}

export async function updateFeaturesSettings(req, res) {
  try {
    const { section_title } = req.body
    const rows = await query('SELECT id FROM landing_features_settings LIMIT 1')
    if (rows.length === 0) {
      await query('INSERT INTO landing_features_settings (section_title) VALUES (?)', [
        section_title ?? DEFAULT_FEATURES_TITLE,
      ])
    } else {
      await query('UPDATE landing_features_settings SET section_title = ? WHERE id = ?', [
        section_title ?? DEFAULT_FEATURES_TITLE,
        rows[0].id,
      ])
    }
    const [updated] = await query('SELECT * FROM landing_features_settings LIMIT 1')
    res.json(updated)
  } catch (err) {
    console.error('Update features settings error:', err)
    res.status(500).json({ error: 'Failed to update features settings' })
  }
}

export async function createFeatureItem(req, res) {
  try {
    const { icon, title, description, sort_order, is_active } = req.body
    if (!icon || !title || !description) {
      return res.status(400).json({ error: 'Icon, title and description are required' })
    }
    const result = await query(
      `INSERT INTO landing_features (icon, title, description, sort_order, is_active) VALUES (?, ?, ?, ?, ?)`,
      [
        icon,
        title,
        description,
        sort_order ?? 0,
        is_active !== undefined ? (is_active ? 1 : 0) : 1,
      ]
    )
    const insertId = result?.insertId ?? result
    const rows = await query('SELECT * FROM landing_features WHERE id = ?', [insertId])
    res.status(201).json(rows[0])
  } catch (err) {
    console.error('Create feature item error:', err)
    res.status(500).json({ error: 'Failed to create feature item' })
  }
}

export async function updateFeatureItem(req, res) {
  try {
    const id = parseInt(req.params.id)
    const { icon, title, description, sort_order, is_active } = req.body
    const rows = await query('SELECT id FROM landing_features WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Feature item not found' })
    }
    const updates = []
    const params = []
    if (icon !== undefined) {
      updates.push('icon = ?')
      params.push(icon)
    }
    if (title !== undefined) {
      updates.push('title = ?')
      params.push(title)
    }
    if (description !== undefined) {
      updates.push('description = ?')
      params.push(description)
    }
    if (sort_order !== undefined) {
      updates.push('sort_order = ?')
      params.push(parseInt(sort_order))
    }
    if (is_active !== undefined) {
      updates.push('is_active = ?')
      params.push(is_active ? 1 : 0)
    }
    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' })
    }
    params.push(id)
    await query(`UPDATE landing_features SET ${updates.join(', ')} WHERE id = ?`, params)
    const [item] = await query('SELECT * FROM landing_features WHERE id = ?', [id])
    res.json(item)
  } catch (err) {
    console.error('Update feature item error:', err)
    res.status(500).json({ error: 'Failed to update feature item' })
  }
}

export async function deleteFeatureItem(req, res) {
  try {
    const id = parseInt(req.params.id)
    const rows = await query('SELECT id FROM landing_features WHERE id = ?', [id])
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Feature item not found' })
    }
    await query('DELETE FROM landing_features WHERE id = ?', [id])
    res.json({ message: 'Feature item deleted' })
  } catch (err) {
    console.error('Delete feature item error:', err)
    res.status(500).json({ error: 'Failed to delete feature item' })
  }
}

export async function reorderFeatureItems(req, res) {
  try {
    const { order } = req.body
    if (!Array.isArray(order)) {
      return res.status(400).json({ error: 'Order must be array of {id, sort_order}' })
    }
    for (const { id, sort_order } of order) {
      await query('UPDATE landing_features SET sort_order = ? WHERE id = ?', [sort_order, id])
    }
    res.json({ message: 'Feature items reordered' })
  } catch (err) {
    console.error('Reorder feature items error:', err)
    res.status(500).json({ error: 'Failed to reorder feature items' })
  }
}

// ===== CTA SECTION (admin) =====
export async function getCtaSection(req, res) {
  try {
    const rows = await query('SELECT * FROM landing_cta LIMIT 1')
    if (rows.length === 0) {
      return res.json({
        heading: 'আজই শুরু করুন',
        subtitle: 'স্বাস্থ্য ও আয়ের নতুন যাত্রা',
        primary_btn_text: '📞 কল করুন',
        primary_btn_link: '+8801700000000',
        secondary_btn_text: '💬 WhatsApp',
        secondary_btn_link: '8801700000000',
      })
    }
    res.json(rows[0])
  } catch (err) {
    console.error('Get CTA section error:', err)
    res.status(500).json({ error: 'Failed to get CTA section' })
  }
}

export async function updateCtaSection(req, res) {
  try {
    const {
      heading,
      subtitle,
      primary_btn_text,
      primary_btn_link,
      secondary_btn_text,
      secondary_btn_link,
    } = req.body

    const rows = await query('SELECT id FROM landing_cta LIMIT 1')
    if (rows.length === 0) {
      await query(
        `INSERT INTO landing_cta (heading, subtitle, primary_btn_text, primary_btn_link, secondary_btn_text, secondary_btn_link)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          heading ?? 'আজই শুরু করুন',
          subtitle ?? 'স্বাস্থ্য ও আয়ের নতুন যাত্রা',
          primary_btn_text ?? '📞 কল করুন',
          primary_btn_link ?? '+8801700000000',
          secondary_btn_text ?? '💬 WhatsApp',
          secondary_btn_link ?? '8801700000000',
        ]
      )
    } else {
      const updates = []
      const params = []
      if (heading !== undefined) {
        updates.push('heading = ?')
        params.push(heading)
      }
      if (subtitle !== undefined) {
        updates.push('subtitle = ?')
        params.push(subtitle)
      }
      if (primary_btn_text !== undefined) {
        updates.push('primary_btn_text = ?')
        params.push(primary_btn_text)
      }
      if (primary_btn_link !== undefined) {
        updates.push('primary_btn_link = ?')
        params.push(primary_btn_link)
      }
      if (secondary_btn_text !== undefined) {
        updates.push('secondary_btn_text = ?')
        params.push(secondary_btn_text)
      }
      if (secondary_btn_link !== undefined) {
        updates.push('secondary_btn_link = ?')
        params.push(secondary_btn_link)
      }
      if (updates.length > 0) {
        params.push(rows[0].id)
        await query(`UPDATE landing_cta SET ${updates.join(', ')} WHERE id = ?`, params)
      }
    }
    const [updated] = await query('SELECT * FROM landing_cta LIMIT 1')
    res.json(updated || rows[0])
  } catch (err) {
    console.error('Update CTA section error:', err)
    res.status(500).json({ error: 'Failed to update CTA section' })
  }
}
