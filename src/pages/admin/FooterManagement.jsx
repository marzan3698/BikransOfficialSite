import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import './FooterManagement.css'

function FooterManagement() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [modal, setModal] = useState(null)
  const [showFooter, setShowFooter] = useState(true)
  const [formData, setFormData] = useState({
    icon: '',
    label: '',
    link: '',
    sort_order: 0,
    is_active: 1,
  })

  useEffect(() => {
    loadItems()
    loadFooterVisibility()
  }, [])

  const loadFooterVisibility = async () => {
    try {
      const data = await adminApi.getHeaderSettings()
      setShowFooter(data.show_footer !== undefined ? Boolean(data.show_footer) : true)
    } catch {
      setShowFooter(true)
    }
  }

  const loadItems = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminApi.getFooterItems()
      setItems(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message || 'Failed to load footer items')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = () => {
    setFormData({
      icon: '',
      label: '',
      link: '',
      sort_order: items.length,
      is_active: 1,
    })
    setModal('create')
  }

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      icon: item.icon,
      label: item.label,
      link: item.link,
      sort_order: item.sort_order,
      is_active: item.is_active,
    })
    setModal('edit')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }))
  }

  const handleSubmitCreate = async (e) => {
    e.preventDefault()
    try {
      await adminApi.createFooterItem(formData)
      setModal(null)
      loadItems()
    } catch (err) {
      alert(err.message || 'Failed to create item')
    }
  }

  const handleSubmitEdit = async (e) => {
    e.preventDefault()
    try {
      await adminApi.updateFooterItem(formData.id, formData)
      setModal(null)
      loadItems()
    } catch (err) {
      alert(err.message || 'Failed to update item')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this footer item?')) return
    try {
      await adminApi.deleteFooterItem(id)
      loadItems()
    } catch (err) {
      alert(err.message || 'Failed to delete item')
    }
  }

  const handleToggleFooter = async (e) => {
    const checked = e.target.checked
    setShowFooter(checked)
    try {
      await adminApi.updateFooterVisibility(checked)
    } catch (err) {
      setShowFooter(!checked)
      alert(err.message || 'Failed to update')
    }
  }

  const handleMove = async (index, direction) => {
    const newItems = [...items]
    const swap = direction === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= newItems.length) return
    
    ;[newItems[index], newItems[swap]] = [newItems[swap], newItems[index]]
    const order = newItems.map((item, i) => ({ id: item.id, sort_order: i }))
    
    try {
      await adminApi.reorderFooterItems(order)
      loadItems()
    } catch (err) {
      alert(err.message || 'Failed to reorder items')
    }
  }

  return (
    <div className="footer-management">
      <div className="footer-visibility-bar">
        <label className="footer-toggle-label">
          <input
            type="checkbox"
            checked={showFooter}
            onChange={handleToggleFooter}
            className="footer-toggle-checkbox"
          />
          <span>সাইটে ফুটার দেখান (Enable footer)</span>
        </label>
      </div>
      <div className="page-header">
        <h1 className="page-title">Footer Management</h1>
        <button className="btn-primary" onClick={handleCreate}>Add Item</button>
      </div>

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
                <th>Icon</th>
                <th>Label</th>
                <th>Link</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => (
                <tr key={item.id}>
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
                        disabled={index === items.length - 1}
                      >
                        ▼
                      </button>
                    </div>
                  </td>
                  <td className="icon-cell">{item.icon}</td>
                  <td>{item.label}</td>
                  <td className="link-cell">{item.link}</td>
                  <td>
                    <span className={`badge badge-${item.is_active ? 'active' : 'inactive'}`}>
                      {item.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-sm" onClick={() => handleEdit(item)}>Edit</button>
                    <button className="btn-sm btn-danger" onClick={() => handleDelete(item.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <div className="empty-state">No footer items yet. Add one to get started.</div>
          )}
        </div>
      )}

      {/* Create Modal */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Add Footer Item</h2>
            <form onSubmit={handleSubmitCreate}>
              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="🏠"
                  required
                />
              </div>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder="হোম"
                  required
                />
              </div>
              <div className="form-group">
                <label>Link</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="/ or #products"
                  required
                />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                />
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={!!formData.is_active}
                  onChange={handleInputChange}
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

      {/* Edit Modal */}
      {modal === 'edit' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>Edit Footer Item</h2>
            <form onSubmit={handleSubmitEdit}>
              <div className="form-group">
                <label>Icon (Emoji)</label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="🏠"
                  required
                />
              </div>
              <div className="form-group">
                <label>Label</label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleInputChange}
                  placeholder="হোম"
                  required
                />
              </div>
              <div className="form-group">
                <label>Link</label>
                <input
                  type="text"
                  name="link"
                  value={formData.link}
                  onChange={handleInputChange}
                  placeholder="/ or #products"
                  required
                />
              </div>
              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  name="sort_order"
                  value={formData.sort_order}
                  onChange={handleInputChange}
                />
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={!!formData.is_active}
                  onChange={handleInputChange}
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

export default FooterManagement
