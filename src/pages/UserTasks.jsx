import { useState, useEffect } from 'react'
import { tasksApi } from '../services/api'
import './UserTasks.css'

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

function UserTasks({ user, onNavigate, headerSettings = {}, onLogout }) {
  const [tasks, setTasks] = useState([])
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selectedTaskId, setSelectedTaskId] = useState(null)
  const [detailTask, setDetailTask] = useState(null)
  const [commentText, setCommentText] = useState('')
  const [uploadingFile, setUploadingFile] = useState(false)

  const loadTasks = (page = 1) => {
    setLoading(true)
    const params = { page, limit: 20 }
    if (typeFilter) params.type = typeFilter
    if (statusFilter) params.status = statusFilter
    tasksApi
      .getMyTasks(params)
      .then((res) => {
        setTasks(res.tasks)
        setPagination(res.pagination)
      })
      .catch(setError)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    const t = setTimeout(() => loadTasks(1), 300)
    return () => clearTimeout(t)
  }, [typeFilter, statusFilter])

  useEffect(() => {
    if (selectedTaskId) {
      tasksApi
        .getTask(selectedTaskId)
        .then(setDetailTask)
        .catch((err) => {
          alert(err.message)
          setSelectedTaskId(null)
        })
    } else {
      setDetailTask(null)
      setCommentText('')
    }
  }, [selectedTaskId])

  const handleBack = () => {
    onNavigate?.('dashboard')
  }

  const handleViewTask = (id) => {
    setSelectedTaskId(id)
  }

  const handleCloseDetail = () => {
    setSelectedTaskId(null)
    setDetailTask(null)
    setCommentText('')
  }

  const handleStatusChange = async (status) => {
    if (!detailTask) return
    try {
      await tasksApi.updateStatus(detailTask.id, status)
      setDetailTask((prev) => (prev ? { ...prev, status } : null))
      loadTasks(pagination.page)
    } catch (err) {
      alert(err.message)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!commentText.trim() || !detailTask) return
    try {
      await tasksApi.addComment(detailTask.id, commentText.trim())
      const task = await tasksApi.getTask(detailTask.id)
      setDetailTask(task)
      setCommentText('')
    } catch (err) {
      alert(err.message)
    }
  }

  const handleUploadFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file || !detailTask) return
    setUploadingFile(true)
    const formData = new FormData()
    formData.append('file', file)
    try {
      await tasksApi.addAttachment(detailTask.id, formData)
      const task = await tasksApi.getTask(detailTask.id)
      setDetailTask(task)
    } catch (err) {
      alert(err.message)
    } finally {
      setUploadingFile(false)
      e.target.value = ''
    }
  }

  const handleDeleteAttachment = async (attachmentId) => {
    if (!detailTask || !confirm('এই ফাইল ডিলিট করতে চান?')) return
    try {
      await tasksApi.deleteAttachment(detailTask.id, attachmentId)
      const task = await tasksApi.getTask(detailTask.id)
      setDetailTask(task)
    } catch (err) {
      alert(err.message)
    }
  }

  const typeLabel = (type) => TASK_TYPES.find((t) => t.value === type)?.label || type
  const statusLabel = (status) => TASK_STATUSES.find((s) => s.value === status)?.label || status
  const priorityLabel = (p) => PRIORITIES.find((x) => x.value === p)?.label || p

  const fileUrl = (path) => (path.startsWith('http') ? path : path)

  if (!user) return null

  return (
    <div className="user-tasks-page">
      <header className="user-tasks-header">
        <button type="button" className="back-btn" onClick={handleBack} aria-label="Back">
          ‹
        </button>
        <img
          src={headerSettings.logo_image || '/BIKRANS-FINAL.png'}
          alt="Bikrans"
          className="user-tasks-logo"
        />
        <h1 className="user-tasks-title">আমার টাস্ক</h1>
      </header>

      {!selectedTaskId ? (
        <>
          <div className="user-tasks-filters">
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
            <div className="user-tasks-loading">লোড হচ্ছে...</div>
          ) : error ? (
            <div className="user-tasks-error">{error.message}</div>
          ) : tasks.length === 0 ? (
            <div className="user-tasks-empty">কোনো টাস্ক নেই</div>
          ) : (
            <div className="user-tasks-list">
              {tasks.map((t) => (
                <div
                  key={t.id}
                  className="user-task-card"
                  onClick={() => handleViewTask(t.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && handleViewTask(t.id)}
                >
                  <div className="user-task-card-header">
                    <h3>{t.title}</h3>
                    <span className={`badge badge-${t.status}`}>{statusLabel(t.status)}</span>
                  </div>
                  <div className="user-task-card-meta">
                    <span>{typeLabel(t.type)}</span>
                    <span>•</span>
                    <span>{priorityLabel(t.priority)}</span>
                    {t.due_date && (
                      <>
                        <span>•</span>
                        <span>ডিউ: {new Date(t.due_date).toLocaleDateString('bn-BD')}</span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="user-tasks-pagination">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => loadTasks(pagination.page - 1)}
              >
                আগে
              </button>
              <span>
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => loadTasks(pagination.page + 1)}
              >
                পরবর্তী
              </button>
            </div>
          )}
        </>
      ) : detailTask ? (
        <div className="user-task-detail">
          <div className="user-task-detail-header">
            <button type="button" className="back-btn" onClick={handleCloseDetail}>
              ‹ টাস্ক লিস্ট
            </button>
            <h2>{detailTask.title}</h2>
          </div>
          <div className="user-task-detail-meta">
            <span>{typeLabel(detailTask.type)}</span>
            <span>প্রায়োরিটি: {priorityLabel(detailTask.priority)}</span>
            {detailTask.due_date && (
              <span>ডিউ: {new Date(detailTask.due_date).toLocaleDateString('bn-BD')}</span>
            )}
          </div>
          <div className="user-task-detail-status">
            <label>স্ট্যাটাস পরিবর্তন:</label>
            <select
              value={detailTask.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="status-select"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          {detailTask.description && (
            <div className="user-task-detail-description">
              <strong>বিবরণ:</strong>
              <p>{detailTask.description}</p>
            </div>
          )}

          <div className="user-task-detail-section">
            <h3>ফাইল ও মিডিয়া</h3>
            <label className="upload-label">
              <input
                type="file"
                accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                onChange={handleUploadFile}
                disabled={uploadingFile}
              />
              {uploadingFile ? 'আপলোড হচ্ছে...' : 'ভিডিও/অডিও/ছবি/ফাইল আপলোড করুন'}
            </label>
            <div className="attachments-list">
              {(detailTask.attachments || []).map((a) => (
                <div key={a.id} className="attachment-item">
                  <a href={fileUrl(a.file_path)} target="_blank" rel="noopener noreferrer">
                    {a.file_name}
                  </a>
                  <span className="attachment-meta">{a.file_type} • {a.uploaded_by_name}</span>
                  {a.uploaded_by === user.id && (
                    <button
                      type="button"
                      className="btn-sm btn-danger"
                      onClick={() => handleDeleteAttachment(a.id)}
                    >
                      ডিলিট
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="user-task-detail-section">
            <h3>কমেন্ট</h3>
            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                placeholder="মেসেজ লিখুন..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                rows={2}
              />
              <button type="submit" className="btn-sm btn-primary">
                পাঠান
              </button>
            </form>
            <div className="comments-list">
              {(detailTask.comments || []).map((c) => (
                <div key={c.id} className="comment-item">
                  <strong>{c.user_name}</strong>
                  <span className="comment-date">
                    {new Date(c.created_at).toLocaleString('bn-BD')}
                  </span>
                  <p>{c.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="user-tasks-loading">লোড হচ্ছে...</div>
      )}
    </div>
  )
}

export default UserTasks
