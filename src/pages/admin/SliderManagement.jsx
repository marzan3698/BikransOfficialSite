import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import './SliderManagement.css'

const IMAGE_SPEC = 'ছবির আকার: ১২০০ x ৫০০ px (সর্বনিম্ন ৯৬০ x ৪০০ px), সর্বোচ্চ ১ MB, JPG/PNG/WebP'

function SliderManagement() {
  const [sliders, setSliders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link: '',
    sort_order: 0,
    is_active: 1,
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)

  const loadSliders = () => {
    setLoading(true)
    setError(null)
    adminApi.getSliders()
      .then((data) => {
        setSliders(Array.isArray(data) ? data : [])
      })
      .catch((err) => {
        setError(err.message || 'Failed to load sliders')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadSliders()
  }, [])

  const handleCreate = () => {
    setFormData({ title: '', subtitle: '', link: '', sort_order: sliders.length, is_active: 1 })
    setImageFile(null)
    setImagePreview(null)
    setModal('create')
  }

  const handleEdit = (s) => {
    setFormData({
      id: s.id,
      title: s.title,
      subtitle: s.subtitle || '',
      link: s.link || '',
      sort_order: s.sort_order,
      is_active: s.is_active,
    })
    setImageFile(null)
    setImagePreview(s.image)
    setModal('edit')
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmitCreate = async (e) => {
    e.preventDefault()
    if (!imageFile) {
      alert('ছবি নির্বাচন করুন')
      return
    }
    const fd = new FormData()
    fd.append('image', imageFile)
    fd.append('title', formData.title)
    fd.append('subtitle', formData.subtitle)
    fd.append('link', formData.link)
    fd.append('sort_order', formData.sort_order)
    fd.append('is_active', formData.is_active)
    try {
      await adminApi.createSlider(fd)
      setModal(null)
      loadSliders()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    const fd = new FormData()
    if (imageFile) fd.append('image', imageFile)
    fd.append('title', formData.title)
    fd.append('subtitle', formData.subtitle)
    fd.append('link', formData.link)
    fd.append('sort_order', formData.sort_order)
    fd.append('is_active', formData.is_active)
    try {
      await adminApi.updateSlider(formData.id, fd)
      setModal(null)
      loadSliders()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('এই স্লাইডারটি মুছে ফেলবেন?')) return
    try {
      await adminApi.deleteSlider(id)
      loadSliders()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleMove = async (index, direction) => {
    const newSliders = [...sliders]
    const swap = direction === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= newSliders.length) return
    ;[newSliders[index], newSliders[swap]] = [newSliders[swap], newSliders[index]]
    const order = newSliders.map((s, i) => ({ id: s.id, sort_order: i }))
    try {
      await adminApi.reorderSliders(order)
      loadSliders()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="slider-management">
      <div className="page-header">
        <h1 className="page-title">Slider Management</h1>
        <button className="btn-primary" onClick={handleCreate}>Add Slider</button>
      </div>

      <p className="image-spec">{IMAGE_SPEC}</p>

      {loading ? (
        <div className="admin-loading">Loading...</div>
      ) : error ? (
        <div className="admin-error">{error}</div>
      ) : (
        <div className="table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Image</th>
                <th>Title</th>
                <th>Subtitle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sliders.map((s, index) => (
                <tr key={s.id}>
                  <td>
                    <div className="order-btns">
                      <button
                        className="order-btn"
                        onClick={() => handleMove(index, 'up')}
                        disabled={index === 0}
                      >
                        ▲
                      </button>
                      <button
                        className="order-btn"
                        onClick={() => handleMove(index, 'down')}
                        disabled={index === sliders.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td>
                    <img src={s.image} alt={s.title} className="slider-thumb" />
                  </td>
                  <td>{s.title}</td>
                  <td>{s.subtitle}</td>
                  <td>
                    <span className={`badge badge-${s.is_active ? 'active' : 'inactive'}`}>
                      {s.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(s)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(s.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sliders.length === 0 && (
            <div className="empty-state">No sliders yet. Add one to get started.</div>
          )}
        </div>
      )}

      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Slider</h2>
            <p className="modal-spec">{IMAGE_SPEC}</p>
            <form onSubmit={handleSubmitCreate}>
              <div className="form-group">
                <label>Image *</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} required />
                {imagePreview && <img src={imagePreview} alt="Preview" className="form-preview" />}
              </div>
              <input
                required
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <input
                placeholder="Subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
              <input
                placeholder="Link (optional)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
              <input
                type="number"
                placeholder="Sort order"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={!!formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                />
                Active
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {modal === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Slider</h2>
            <p className="modal-spec">{IMAGE_SPEC}</p>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Image (leave empty to keep current)</label>
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} />
                {imagePreview && <img src={imagePreview} alt="Preview" className="form-preview" />}
              </div>
              <input
                required
                placeholder="Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <input
                placeholder="Subtitle"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              />
              <input
                placeholder="Link (optional)"
                value={formData.link}
                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
              />
              <input
                type="number"
                placeholder="Sort order"
                value={formData.sort_order}
                onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
              />
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={!!formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked ? 1 : 0 })}
                />
                Active
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SliderManagement
