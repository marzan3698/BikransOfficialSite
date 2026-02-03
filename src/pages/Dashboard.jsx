import { useState, useEffect } from 'react'
import {
  MdOndemandVideo,
  MdGroup,
  MdShoppingBag,
  MdEmojiEvents,
  MdDescription,
  MdAutoAwesome,
  MdSchool,
  MdAttachMoney,
  MdPlayArrow,
  MdWork,
  MdTrendingUp,
  MdPayments,
  MdSlideshow,
  MdHome,
  MdPerson,
  MdMenuBook,
  MdAssignment,
  MdLogout,
} from 'react-icons/md'
import { tasksApi } from '../services/api'
import './Dashboard.css'

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

function Dashboard({ user, onLogout, headerSettings = {}, footerItems = [], onNavigate }) {
  const [activeTab, setActiveTab] = useState('home')
  const [showPin, setShowPin] = useState(false)
  const [bannerSlide, setBannerSlide] = useState(0)

  const [tasks, setTasks] = useState([])
  const [tasksPagination, setTasksPagination] = useState({ page: 1, totalPages: 1, total: 0 })
  const [tasksLoading, setTasksLoading] = useState(false)
  const [tasksError, setTasksError] = useState(null)
  const [taskTypeFilter, setTaskTypeFilter] = useState('')
  const [taskStatusFilter, setTaskStatusFilter] = useState('')

  const menuItems = [
    { Icon: MdOndemandVideo, label: 'ফ্রি টিকটক প্রমোশন', color: '#e91e63', id: 'ftmp' },
    { Icon: MdGroup, label: 'সেলস মডারেটর বিজনেস', color: '#4caf50', id: 'smcb' },
    { Icon: MdShoppingBag, label: 'Bikrans ডিস্ট্রিবিউটর বিজনেস', color: '#00bcd4', id: 'bdb' },
    { Icon: MdEmojiEvents, label: 'বিক্রান্স লিডারশিপ বিজনেস', color: '#ff9800', id: 'lb' },
    { Icon: MdDescription, label: 'বিজনেস পলিসি', color: '#9c27b0', id: 'policy' },
    { Icon: MdAutoAwesome, label: 'সফল যারা', color: '#ffc107', id: 'success' },
    { Icon: MdSchool, label: 'ক্যারিয়ার সাপোর্ট', color: '#2196f3', id: 'career' },
    { Icon: MdAttachMoney, label: 'আর্থিক সাপোর্ট', color: '#52B788', id: 'finance' },
  ]

  const banners = [
    { title: 'বিক্রান্স পেমেন্টে নতুন অফার', subtitle: 'NEW YEAR DEALS', cta: 'ট্যাপ করুন' },
    { title: 'সবচেয়ে সহজে আয় শুরু করুন', subtitle: 'FAMC দিয়ে শুরু করুন', cta: 'বিস্তারিত' },
    { title: 'প্রশিক্ষণ ও ক্যারিয়ার', subtitle: 'বিনামূল্যে শিখুন', cta: 'জানুন' },
  ]

  const tutorialOptions = [
    { Icon: MdOndemandVideo, label: 'FTMP ( ফ্রি টিকটক ১মিলিয়ন ভিউ যেভাবে পাবেন )', id: 'ftmp-guide' },
    { Icon: MdSchool, label: 'সেলস মডারেটর প্রোগ্রাম কোর্স', id: 'smc-course' },
    { Icon: MdWork, label: 'ডিস্ট্রিবিউটর হতে চাইলে', id: 'distributor' },
    { Icon: MdTrendingUp, label: 'লিডার হতে হলে যা করণীয়', id: 'leader-guide' },
    { Icon: MdPayments, label: 'স্থায়ী ইনকামের সুযোগ নিন', id: 'income' },
    { Icon: MdSlideshow, label: 'স্বপ্নের পথে বিক্রান্স ( সেমিনার )', id: 'seminar' },
  ]

  useEffect(() => {
    const t = setInterval(() => setBannerSlide((prev) => (prev + 1) % 3), 4000)
    return () => clearInterval(t)
  }, [])

  const loadTasks = (page = 1) => {
    setTasksLoading(true)
    const params = { page, limit: 20 }
    if (taskTypeFilter) params.type = taskTypeFilter
    if (taskStatusFilter) params.status = taskStatusFilter
    tasksApi
      .getMyTasks(params)
      .then((res) => {
        setTasks(res.tasks)
        setTasksPagination(res.pagination)
      })
      .catch(setTasksError)
      .finally(() => setTasksLoading(false))
  }

  useEffect(() => {
    if (activeTab === 'task') loadTasks()
  }, [activeTab])

  useEffect(() => {
    if (activeTab !== 'task') return
    const t = setTimeout(() => loadTasks(1), 300)
    return () => clearTimeout(t)
  }, [activeTab, taskTypeFilter, taskStatusFilter])

  const handleServiceClick = (id) => {
    if (id === 'ftmp') onNavigate?.('user-tasks')
    else alert('শীঘ্রই আসছে')
  }

  const handleLogout = () => {
    if (window.confirm('আপনি লগ আউট করতে চান?')) onLogout?.()
  }

  const handleTaskClick = () => {
    onNavigate?.('user-tasks')
  }

  const typeLabel = (type) => TASK_TYPES.find((t) => t.value === type)?.label || type
  const statusLabel = (status) => TASK_STATUSES.find((s) => s.value === status)?.label || status
  const priorityLabel = (p) => PRIORITIES.find((x) => x.value === p)?.label || p

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString('bn-BD') : '—')
  const formatDateTime = (d) => (d ? new Date(d).toLocaleString('bn-BD') : '—')

  if (!user) return null

  return (
    <div className="dashboard-page">
      <div className="hero-header" style={{ backgroundImage: 'url(/profile-bg.png)' }}>
        <div className="hero-overlay" />
        <div className="hero-top-row">
          <img
            src={headerSettings.logo_image || '/BIKRANS-FINAL.png'}
            alt="Bikrans"
            className="hero-site-logo"
          />
          <button type="button" className="hero-action-btn menu" aria-label="Menu">
            <span>☰</span>
          </button>
        </div>
        <div className="hero-profile-block">
          <div className="hero-avatar">{user?.name?.charAt(0) || 'U'}</div>
          <span className="hero-username">{user?.name || 'ইউজার'}</span>
          <button type="button" className="hero-pin-btn" onClick={() => setShowPin(!showPin)}>
            <span className="hero-pin-btn-text">
              {showPin ? (user?.login_pin || '••••••') : 'পিন দেখুন'}
            </span>
          </button>
          <div className="hero-phone-project-row">
            <span className="hero-phone-wrap">
              <span className="hero-phone">{user?.phone || ''}</span>
            </span>
            <div className="hero-projects">
              {user?.projects?.length > 0 ? (
                user.projects.map((p) => (
                  <span key={p.id} className="hero-project-badge" title={p.name}>
                    {p.code}
                  </span>
                ))
              ) : (
                <span className="hero-projects-empty">কোনো প্রজেক্টে অন্তর্ভুক্ত নন</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-content-wrap">
        {activeTab === 'home' && (
          <div className="services-card">
            <div className="services-grid-4">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className="service-item"
                  onClick={() => handleServiceClick(item.id)}
                >
                  <div className="service-icon-circle" style={{ borderColor: item.color }}>
                    <item.Icon className="service-icon-svg" style={{ color: item.color }} />
                  </div>
                  <span className="service-label">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="dashboard-banner-slider">
              <div className="banner-track" style={{ transform: `translateX(-${bannerSlide * 100}%)` }}>
                {banners.map((b, i) => (
                  <div key={i} className="banner-slide">
                    <div className="banner-content">
                      <div className="banner-text-wrap">
                        <h3 className="banner-title">{b.title}</h3>
                        <span className="banner-subtitle">{b.subtitle}</span>
                        <button type="button" className="banner-cta">{b.cta}</button>
                      </div>
                      <div className="banner-visual">
                        <MdPlayArrow className="banner-icon-svg" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="banner-dots">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`banner-dot ${i === bannerSlide ? 'active' : ''}`}
                    onClick={() => setBannerSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>
            </div>

            <h2 className="dashboard-section-title">টিউটোরিয়াল ও সাহায্য</h2>
            <div className="tutorial-options-list">
              {tutorialOptions.map((opt) => (
                <button key={opt.id} type="button" className="tutorial-option-card">
                  <div className="tutorial-option-icon-wrap">
                    <opt.Icon className="tutorial-option-icon" />
                  </div>
                  <span className="tutorial-option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="dashboard-tab-card profile-tab-card">
            <h2 className="dashboard-section-title">প্রোফাইল</h2>
            <div className="profile-card">
              <div className="profile-avatar">{user?.name?.charAt(0) || 'U'}</div>
              <div className="profile-row">
                <span className="profile-label">নাম</span>
                <span className="profile-value">{user?.name || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">ইমেইল</span>
                <span className="profile-value">{user?.email || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">মোবাইল</span>
                <span className="profile-value">{user?.phone || '—'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">লগইন পিন</span>
                <span className="profile-value">{user?.login_pin ?? '—'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">বয়স</span>
                <span className="profile-value">{user?.age ?? 'প্রদান করা হয়নি'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">লিঙ্গ</span>
                <span className="profile-value">{user?.gender || 'প্রদান করা হয়নি'}</span>
              </div>
              <div className="profile-row">
                <span className="profile-label">WhatsApp নম্বর</span>
                <span className="profile-value">{user?.whatsapp_number || 'প্রদান করা হয়নি'}</span>
              </div>
              {user?.projects?.length > 0 && (
                <div className="profile-row profile-projects">
                  <span className="profile-label">প্রোজেক্ট</span>
                  <div className="profile-value profile-badges">
                    {user.projects.map((p) => (
                      <span key={p.id} className="profile-badge" title={p.name}>
                        {p.code} – {p.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              <div className="profile-row">
                <span className="profile-label">অ্যাকাউন্ট তৈরির তারিখ</span>
                <span className="profile-value">{formatDateTime(user?.created_at)}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'tutorial' && (
          <div className="dashboard-tab-card tutorial-tab-card">
            <h2 className="dashboard-section-title">টিউটোরিয়াল ও সাহায্য</h2>
            <div className="tutorial-options-list">
              {tutorialOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className="tutorial-option-card"
                  onClick={() => alert('শীঘ্রই আসছে')}
                >
                  <div className="tutorial-option-icon-wrap">
                    <opt.Icon className="tutorial-option-icon" />
                  </div>
                  <span className="tutorial-option-label">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'task' && (
          <div className="dashboard-tab-card task-tab-card">
            <h2 className="dashboard-section-title">আমার টাস্ক</h2>
            <div className="dashboard-task-filters">
              <select
                value={taskTypeFilter}
                onChange={(e) => setTaskTypeFilter(e.target.value)}
                className="dashboard-task-filter-select"
              >
                <option value="">সব টাইপ</option>
                {TASK_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <select
                value={taskStatusFilter}
                onChange={(e) => setTaskStatusFilter(e.target.value)}
                className="dashboard-task-filter-select"
              >
                <option value="">সব স্ট্যাটাস</option>
                {TASK_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            {tasksLoading ? (
              <div className="dashboard-task-loading">লোড হচ্ছে...</div>
            ) : tasksError ? (
              <div className="dashboard-task-error">{tasksError.message}</div>
            ) : tasks.length === 0 ? (
              <div className="dashboard-task-empty">কোনো টাস্ক নেই</div>
            ) : (
              <div className="dashboard-task-list">
                {tasks.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="dashboard-task-card"
                    onClick={handleTaskClick}
                  >
                    <div className="dashboard-task-card-header">
                      <h3>{t.title}</h3>
                      <span className={`dashboard-task-badge badge-${t.status}`}>
                        {statusLabel(t.status)}
                      </span>
                    </div>
                    <div className="dashboard-task-card-meta">
                      <span>{typeLabel(t.type)}</span>
                      <span>•</span>
                      <span>{priorityLabel(t.priority)}</span>
                      {t.due_date && (
                        <>
                          <span>•</span>
                          <span>ডিউ: {formatDate(t.due_date)}</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
            {tasksPagination.totalPages > 1 && (
              <div className="dashboard-task-pagination">
                <button
                  type="button"
                  disabled={tasksPagination.page <= 1}
                  onClick={() => loadTasks(tasksPagination.page - 1)}
                >
                  আগে
                </button>
                <span>{tasksPagination.page} / {tasksPagination.totalPages}</span>
                <button
                  type="button"
                  disabled={tasksPagination.page >= tasksPagination.totalPages}
                  onClick={() => loadTasks(tasksPagination.page + 1)}
                >
                  পরবর্তী
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <nav className="dashboard-bottom-nav">
        <button
          type="button"
          className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <MdPerson className="nav-icon-svg" />
          <span className="nav-label">প্রোফাইল</span>
        </button>
        <button
          type="button"
          className={`nav-item ${activeTab === 'tutorial' ? 'active' : ''}`}
          onClick={() => setActiveTab('tutorial')}
        >
          <MdMenuBook className="nav-icon-svg" />
          <span className="nav-label">টিউটোরিয়াল</span>
        </button>
        <button
          type="button"
          className={`nav-item nav-item-center ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => setActiveTab('home')}
        >
          <MdHome className="nav-icon-center" />
          <span className="nav-label nav-label-center">হোম</span>
        </button>
        <button
          type="button"
          className={`nav-item ${activeTab === 'task' ? 'active' : ''}`}
          onClick={() => setActiveTab('task')}
        >
          <MdAssignment className="nav-icon-svg" />
          <span className="nav-label">টাস্ক</span>
        </button>
        <button type="button" className="nav-item nav-item-logout" onClick={handleLogout}>
          <MdLogout className="nav-icon-svg" />
          <span className="nav-label">লগ আউট</span>
        </button>
      </nav>
    </div>
  )
}

export default Dashboard
