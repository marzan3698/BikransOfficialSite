import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import './HeaderManagement.css'

function HeaderManagement() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  
  const [settings, setSettings] = useState({
    logo_image: '/BIKRANS-FINAL.png',
    logo_height: 36,
    header_height: 56,
    header_bg_color: '#ffffff',
    show_search_btn: true,
    app_btn_text: 'বিক্রান্স অ্যাপ',
    app_btn_link: '',
    app_btn_bg_color: '#52B788',
    show_menu_btn: true,
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getHeaderSettings()
      setSettings({
        ...data,
        show_search_btn: Boolean(data.show_search_btn),
        show_menu_btn: Boolean(data.show_menu_btn),
      })
    } catch (err) {
      setError(err.message || 'Failed to load header settings')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleLogoUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('logo', file)

    setLogoUploading(true)
    setError(null)

    try {
      const result = await adminApi.uploadLogo(formData)
      setSettings((prev) => ({ ...prev, logo_image: result.logo_path }))
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Logo upload failed')
    } finally {
      setLogoUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      await adminApi.updateHeaderSettings(settings)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError(err.message || 'Failed to update settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="admin-loading">Loading...</div>
  }

  return (
    <div className="header-management">
      <div className="page-header">
        <h1 className="page-title">Header Management</h1>
      </div>

      {error && <div className="admin-error">{error}</div>}
      {success && <div className="admin-success">Settings saved successfully!</div>}

      <form onSubmit={handleSubmit} className="header-form">
        {/* Logo Upload */}
        <div className="form-section">
          <h2>Logo Settings</h2>
          
          <div className="logo-preview-box">
            <img 
              src={settings.logo_image} 
              alt="Logo Preview" 
              style={{ height: `${settings.logo_height}px` }}
              className="logo-preview"
            />
          </div>

          <div className="form-group">
            <label>Upload New Logo</label>
            <input 
              type="file" 
              accept="image/png,image/jpeg,image/svg+xml"
              onChange={handleLogoUpload}
              disabled={logoUploading}
            />
            <small>Max 500KB, PNG/JPG/SVG</small>
          </div>

          <div className="form-group">
            <label htmlFor="logo_height">
              Logo Height: {settings.logo_height}px
            </label>
            <input
              type="range"
              id="logo_height"
              name="logo_height"
              min="24"
              max="60"
              value={settings.logo_height}
              onChange={handleInputChange}
            />
          </div>
        </div>

        {/* Header Settings */}
        <div className="form-section">
          <h2>Header Settings</h2>

          <div className="form-group">
            <label htmlFor="header_height">
              Header Height: {settings.header_height}px
            </label>
            <input
              type="range"
              id="header_height"
              name="header_height"
              min="48"
              max="80"
              value={settings.header_height}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="header_bg_color">Background Color</label>
            <div className="color-input-group">
              <input
                type="color"
                id="header_bg_color"
                name="header_bg_color"
                value={settings.header_bg_color}
                onChange={handleInputChange}
              />
              <input
                type="text"
                value={settings.header_bg_color}
                onChange={(e) => setSettings({ ...settings, header_bg_color: e.target.value })}
                className="color-text-input"
              />
            </div>
          </div>
        </div>

        {/* Button Settings */}
        <div className="form-section">
          <h2>Action Buttons</h2>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="show_search_btn"
                checked={settings.show_search_btn}
                onChange={handleInputChange}
              />
              Show Search Button
            </label>
          </div>

          <div className="form-group">
            <label htmlFor="app_btn_text">App Button Text</label>
            <input
              type="text"
              id="app_btn_text"
              name="app_btn_text"
              value={settings.app_btn_text}
              onChange={handleInputChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="app_btn_link">App Button Link (optional)</label>
            <input
              type="text"
              id="app_btn_link"
              name="app_btn_link"
              value={settings.app_btn_link}
              onChange={handleInputChange}
              placeholder="/login or https://..."
            />
          </div>

          <div className="form-group">
            <label htmlFor="app_btn_bg_color">App Button Color</label>
            <div className="color-input-group">
              <input
                type="color"
                id="app_btn_bg_color"
                name="app_btn_bg_color"
                value={settings.app_btn_bg_color}
                onChange={handleInputChange}
              />
              <input
                type="text"
                value={settings.app_btn_bg_color}
                onChange={(e) => setSettings({ ...settings, app_btn_bg_color: e.target.value })}
                className="color-text-input"
              />
            </div>
          </div>

          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="show_menu_btn"
                checked={settings.show_menu_btn}
                onChange={handleInputChange}
              />
              Show Menu Button
            </label>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={saving || logoUploading}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default HeaderManagement
