import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import './TaskManagement.css'

const TASK_TYPES = [
  { value: 'tiktok_video', label: 'TikTok ভিডিও টাস্ক' },
  { value: 'facebook_moderator', label: 'ফেসবুক মডারেটর টাস্ক' },
]
const TASK_STATUSES = [
  { value: 'pending', label: 'পেন্ডিং' },
  { value: 'in_progress', label: 'চলছে' },
  { value: 'submitted', label: 'জমা দেওয়া' },
  { value: 'revision', label: 'রিভিশন' },
  { value: 'completed', label: 'সম্পন্ন' },
  { value: 'cancelled', label: 'বাতিল' },
]
const PRIORITIES = [
  { value: 'low', label: 'নিম্ন' },
  { value: 'medium', label: 'মাঝারি' },
  { value: 'high', label: 'উচ্চ' },
]

function TaskManagement() {
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [users, setUsers] = useState([])
  const [modal, setModal] = useState(null) // null | 'create' | taskId (number)
  const [detailTask, setDetailTask] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    url: '',
    type: 'tiktok_video',
    assigned_user_id: '',
    due_date: '',
    priority: 'medium',
  })
  const [commentText, setCommentText] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [filePreview, setFilePreview] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewAttachment, setPreviewAttachment] = useState(null)

  const loadTasks = (page = 1) => {
    setError(null)
    setLoading(true)
    const params = { page, limit: 20 }
    if (typeFilter) params.type = typeFilter
    if (statusFilter) params.status = statusFilter
    adminApi
      .getTasks(params)
      .then((res) => {
        setTasks(res.tasks)
        setPagination(res.pagination)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  const loadUsers = () => {
    adminApi.getUsers({ limit: 500 }).then((res) => setUsers(res.users)).catch(() => {})
  }

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadTasks(1), 300)
    return () => clearTimeout(t)
  }, [typeFilter, statusFilter])

  useEffect(() => {
    if (modal === 'create') loadUsers()
  }, [modal])

  const handleCreate = () => {
    setFormData({
      title: '',
      description: '',
      url: '',
      type: 'tiktok_video',
      assigned_user_id: '',
      due_date: '',
      priority: 'medium',
    })
    setModal('create')
  }

  const handleSubmitCreate = async (e) => {
    e.preventDefault()
    if (!formData.assigned_user_id) {
      alert('অনুগ্রহ করে একজন ইউজার সিলেক্ট করুন')
      return
    }
    try {
      await adminApi.createTask({
        ...formData,
        assigned_user_id: parseInt(formData.assigned_user_id),
        due_date: formData.due_date || undefined,
        url: formData.url?.trim() || undefined,
      })
      setModal(null)
      loadTasks(pagination.page)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleViewTask = async (id) => {
    setModal(id)
    setDetailTask(null)
    try {
      const task = await adminApi.getTask(id)
      setDetailTask(task)
    } catch (err) {
      alert(err.message)
      setModal(null)
    }
  }

  const closeDetail = () => {
    setModal(null)
    setDetailTask(null)
    setCommentText('')
  }

  const handleUpdateTask = async (field, value) => {
    if (!detailTask) return
    try {
      const updated = await adminApi.updateTask(detailTask.id, { [field]: value })
      setDetailTask((prev) => (prev ? { ...prev, ...updated } : null))
      loadTasks(pagination.page)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleDeleteTask = async () => {
    if (!detailTask || !confirm('এই টাস্ক ডিলিট করতে চান?')) return
    try {
      await adminApi.deleteTask(detailTask.id)
      closeDetail()
      loadTasks(pagination.page)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !detailTask) return
    try {
      await adminApi.addTaskComment(detailTask.id, commentText.trim())
      const task = await adminApi.getTask(detailTask.id)
      setDetailTask(task)
      setCommentText('')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleFileSelect = (file) => {
    if (!file) return
    setSelectedFile(file)
    // Generate preview for images/videos
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      const reader = new FileReader()
      reader.onload = (e) => setFilePreview({ type: file.type, url: e.target.result, name: file.name })
      reader.readAsDataURL(file)
    } else {
      setFilePreview({ type: file.type, url: null, name: file.name })
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true)
    else if (e.type === 'dragleave') setDragActive(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0])
  }

  const handleUploadAttachment = async () => {
    if (!selectedFile || !detailTask) return
    setUploadingFile(true)
    const formData = new FormData()
    formData.append('file', selectedFile)
    try {
      await adminApi.addTaskAttachment(detailTask.id, formData)
      const task = await adminApi.getTask(detailTask.id)
      setDetailTask(task)
      setSelectedFile(null)
      setFilePreview(null)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploadingFile(false)
    }
  }

  const clearFilePreview = () => {
    setSelectedFile(null)
    setFilePreview(null)
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (!detailTask || !confirm('এই ফাইল ডিলিট করতে চান?')) return
    try {
      await adminApi.deleteTaskAttachment(detailTask.id, attachmentId)
      const task = await adminApi.getTask(detailTask.id)
      setDetailTask(task)
    } catch (err) {
      alert(err.message)
    }
  }

  const typeLabel = (type) => TASK_TYPES.find((t) => t.value === type)?.label || type
  const statusLabel = (status) => TASK_STATUSES.find((s) => s.value === status)?.label || status
  const priorityLabel = (p) => PRIORITIES.find((x) => x.value === p)?.label || p

  const fileUrl = (path) =>
    !path ? '' : path.startsWith('http') ? path : `${window.location.origin}${path}`

  const openPreview = (a) => (e) => {
    if (e.target.closest('button')) return
    setPreviewAttachment(a)
  }
  const closePreview = () => setPreviewAttachment(null)

  return (
    <div className="task-management">
      <div className="page-header">
        <h1 className="page-title">টাস্ক ম্যানেজমেন্ট</h1>
        <button className="btn-primary" onClick={handleCreate}>
          নতুন টাস্ক তৈরী করুন
        </button>
      </div>

      <div className="filters">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">সব টাইপ</option>
          {TASK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="filter-select"
        >
          <option value="">সব স্ট্যাটাস</option>
          {TASK_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">লোড হচ্ছে...</div>
      ) : error ? (
        <div className="admin-error">
          <p>{error.message}</p>
          <button type="button" className="btn btn-primary" onClick={() => loadTasks(1)}>
            আবার চেষ্টা করুন
          </button>
        </div>
      ) : (
        <>
          <div className="table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>শিরোনাম</th>
                  <th>টাইপ</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাসাইন ইউজার</th>
                  <th>প্রায়োরিটি</th>
                  <th>তারিখ</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((t) => (
                  <tr key={t.id}>
                    <td>{t.title}</td>
                    <td>{typeLabel(t.type)}</td>
                    <td>
                      <span className={`badge badge-${t.status}`}>{statusLabel(t.status)}</span>
                    </td>
                    <td>{t.assigned_user_name ? `${t.assigned_user_name} (${t.assigned_user_phone})` : '—'}</td>
                    <td>{priorityLabel(t.priority)}</td>
                    <td>{t.created_at ? new Date(t.created_at).toLocaleDateString('bn-BD') : '—'}</td>
                    <td>
                      <button className="btn-sm" onClick={() => handleViewTask(t.id)}>
                        দেখুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                disabled={pagination.page <= 1}
                onClick={() => loadTasks(pagination.page - 1)}
              >
                আগে
              </button>
              <span>
                পৃষ্ঠা {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadTasks(pagination.page + 1)}
              >
                পরবর্তী
              </button>
            </div>
          )}
        </>
      )}

      {/* Create Task Modal */}
      {modal === 'create' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal task-modal" onClick={(e) => e.stopPropagation()}>
            <h2>নতুন টাস্ক তৈরী করুন</h2>
            <form onSubmit={handleSubmitCreate}>
              <input
                required
                placeholder="টাস্কের শিরোনাম"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
              <textarea
                placeholder="বিবরণ (ঐচ্ছিক)"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
              <label>URL (ঐচ্ছিক)</label>
              <input
                type="url"
                placeholder="যেকোনো লিংক দিন (যেমন: https://...)"
                value={formData.url}
                onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              />
              <label>টাস্ক টাইপ</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              >
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
              <label>ইউজার অ্যাসাইন করুন *</label>
              <select
                required
                value={formData.assigned_user_id}
                onChange={(e) => setFormData({ ...formData, assigned_user_id: e.target.value })}
              >
                <option value="">সিলেক্ট করুন</option>
                {users.filter((u) => u.role === 'user').map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.phone})
                  </option>
                ))}
              </select>
              <label>প্রায়োরিটি</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
              <label>ডিউ ডেট (ঐচ্ছিক)</label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
              <div className="modal-actions">
                <button type="button" onClick={() => setModal(null)}>
                  বাতিল
                </button>
                <button type="submit" className="btn-primary">
                  তৈরী করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Detail Modal */}
      {modal && typeof modal === 'number' && detailTask && (
        <div className="modal-overlay" onClick={closeDetail}>
          <div className="modal task-detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className="task-detail-header">
              <div className="task-detail-title-row">
                <span className={`task-id-badge priority-${detailTask.priority}`}>#{detailTask.id}</span>
                <h2>{detailTask.title}</h2>
              </div>
              <button type="button" className="modal-close" onClick={closeDetail}>×</button>
            </div>

            {/* Info Grid */}
            <div className="task-info-grid">
              <div className="task-info-item">
                <span className="info-label">টাইপ</span>
                <span className="info-value">{typeLabel(detailTask.type)}</span>
              </div>
              <div className="task-info-item">
                <span className="info-label">স্ট্যাটাস</span>
                <select
                  value={detailTask.status}
                  onChange={(e) => handleUpdateTask('status', e.target.value)}
                  className="status-select-mini"
                >
                  {TASK_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="task-info-item">
                <span className="info-label">প্রায়োরিটি</span>
                <span className={`priority-badge priority-${detailTask.priority}`}>{priorityLabel(detailTask.priority)}</span>
              </div>
              <div className="task-info-item">
                <span className="info-label">অ্যাসাইন</span>
                <span className="info-value">{detailTask.assigned_user_name}</span>
              </div>
              <div className="task-info-item">
                <span className="info-label">ফোন</span>
                <span className="info-value">{detailTask.assigned_user_phone}</span>
              </div>
              <div className="task-info-item">
                <span className="info-label">ইমেইল</span>
                <span className="info-value text-sm">{detailTask.assigned_user_email || '—'}</span>
              </div>
              <div className="task-info-item">
                <span className="info-label">তৈরি করেছেন</span>
                <span className="info-value">{detailTask.created_by_name}</span>
              </div>
              <div className="task-info-item">
                <span className="info-label">তৈরির তারিখ</span>
                <span className="info-value text-sm">{detailTask.created_at ? new Date(detailTask.created_at).toLocaleString('bn-BD') : '—'}</span>
              </div>
              {detailTask.due_date && (
                <div className="task-info-item">
                  <span className="info-label">ডিউ ডেট</span>
                  <span className="info-value">{new Date(detailTask.due_date).toLocaleDateString('bn-BD')}</span>
                </div>
              )}
              <div className="task-info-item">
                <span className="info-label">আপডেট</span>
                <span className="info-value text-sm">{detailTask.updated_at ? new Date(detailTask.updated_at).toLocaleString('bn-BD') : '—'}</span>
              </div>
              {(detailTask.url != null && detailTask.url !== '') && (
                <div className="task-info-item task-info-item-full">
                  <span className="info-label">URL</span>
                  <a href={detailTask.url.startsWith('http') ? detailTask.url : `https://${detailTask.url}`} target="_blank" rel="noopener noreferrer" className="info-value info-link">
                    {detailTask.url.length > 40 ? detailTask.url.slice(0, 40) + '...' : detailTask.url}
                  </a>
                </div>
              )}
            </div>

            {detailTask.description && (
              <div className="task-detail-description">
                <span className="info-label">বিবরণ</span>
                <p>{detailTask.description}</p>
              </div>
            )}

            {/* Modern Upload Section */}
            <div className="task-detail-section">
              <h3>অ্যাটাচমেন্ট ({(detailTask.attachments || []).length})</h3>
              <div
                className={`upload-dropzone ${dragActive ? 'drag-active' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                {filePreview ? (
                  <div className="file-preview-container">
                    {filePreview.type.startsWith('image/') && (
                      <img src={filePreview.url} alt="Preview" className="file-preview-img" />
                    )}
                    {filePreview.type.startsWith('video/') && (
                      <video src={filePreview.url} className="file-preview-video" controls />
                    )}
                    {!filePreview.type.startsWith('image/') && !filePreview.type.startsWith('video/') && (
                      <div className="file-preview-icon">📄</div>
                    )}
                    <span className="file-preview-name">{filePreview.name}</span>
                    <div className="file-preview-actions">
                      <button type="button" className="btn-xs" onClick={clearFilePreview}>বাতিল</button>
                      <button type="button" className="btn-xs btn-primary" onClick={handleUploadAttachment} disabled={uploadingFile}>
                        {uploadingFile ? 'আপলোড...' : 'আপলোড'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="upload-dropzone-label">
                    <input
                      type="file"
                      accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                      onChange={(e) => handleFileSelect(e.target.files?.[0])}
                      disabled={uploadingFile}
                    />
                    <span className="upload-icon">📁</span>
                    <span className="upload-text">ড্র্যাগ করুন অথবা ক্লিক করুন</span>
                    <span className="upload-hint">ইমেজ, ভিডিও, অডিও, PDF</span>
                  </label>
                )}
              </div>
              {(detailTask.attachments || []).length > 0 && (
                <div className="attachments-grid">
                  {(detailTask.attachments || []).map((a) => (
                    <div key={a.id} className="attachment-card attachment-card-clickable" onClick={openPreview(a)}>
                      <div className="attachment-thumb">
                        {a.file_type === 'image' && <img src={fileUrl(a.file_path)} alt={a.file_name} />}
                        {a.file_type === 'video' && <span className="thumb-icon">🎬</span>}
                        {a.file_type === 'audio' && <span className="thumb-icon">🎵</span>}
                        {a.file_type === 'document' && <span className="thumb-icon">📄</span>}
                      </div>
                      <div className="attachment-info">
                        <span className="attachment-name">{a.file_name.length > 18 ? a.file_name.slice(0, 18) + '...' : a.file_name}</span>
                        <span className="attachment-by">{a.uploaded_by_name}</span>
                      </div>
                      <button type="button" className="btn-xs btn-danger" onClick={(e) => { e.stopPropagation(); handleDeleteAttachment(a.id); }}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Comments Section */}
            <div className="task-detail-section">
              <h3>কমেন্ট ({(detailTask.comments || []).length})</h3>
              <form onSubmit={handleAddComment} className="comment-form-inline">
                <input
                  type="text"
                  placeholder="মেসেজ লিখুন..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn-xs btn-primary">পাঠান</button>
              </form>
              {(detailTask.comments || []).length > 0 && (
                <div className="comments-list-compact">
                  {(detailTask.comments || []).map((c) => (
                    <div key={c.id} className="comment-row">
                      <span className="comment-author">{c.user_name}</span>
                      <span className="comment-text">{c.message}</span>
                      <span className="comment-time">{new Date(c.created_at).toLocaleString('bn-BD')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="task-detail-footer">
              <button type="button" className="btn-xs btn-danger" onClick={handleDeleteTask}>ডিলিট</button>
              <button type="button" className="btn-xs" onClick={closeDetail}>বন্ধ</button>
            </div>
          </div>
        </div>
      )}

      {/* Media/File Preview Overlay */}
      {previewAttachment && (
        <div className="preview-overlay" onClick={closePreview}>
          <div className="preview-content" onClick={(e) => e.stopPropagation()}>
            <div className="preview-header">
              <span className="preview-title">{previewAttachment.file_name}</span>
              <button type="button" className="preview-close" onClick={closePreview}>×</button>
            </div>
            <div className="preview-body">
              {previewAttachment.file_type === 'image' && (
                <img src={fileUrl(previewAttachment.file_path)} alt={previewAttachment.file_name} className="preview-media preview-img" />
              )}
              {previewAttachment.file_type === 'video' && (
                <video src={fileUrl(previewAttachment.file_path)} controls className="preview-media preview-video" />
              )}
              {previewAttachment.file_type === 'audio' && (
                <div className="preview-audio-wrap">
                  <audio src={fileUrl(previewAttachment.file_path)} controls className="preview-audio" />
                </div>
              )}
              {previewAttachment.file_type === 'document' && (
                <div className="preview-document">
                  {/\.pdf$/i.test(previewAttachment.file_name) ? (
                    <iframe
                      src={fileUrl(previewAttachment.file_path)}
                      title={previewAttachment.file_name}
                      className="preview-pdf"
                    />
                  ) : (
                    <p className="preview-doc-hint">ডকুমেন্ট প্রিভিউ সাপোর্টেড নয়। ডাউনলোড বা নতুন ট্যাবে খুলুন।</p>
                  )}
                  <div className="preview-doc-actions">
                    <a href={fileUrl(previewAttachment.file_path)} target="_blank" rel="noopener noreferrer" className="btn-xs btn-primary">
                      নতুন ট্যাবে খুলুন
                    </a>
                    <a href={fileUrl(previewAttachment.file_path)} download={previewAttachment.file_name} className="btn-xs">
                      ডাউনলোড
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskManagement
