import { useState, useEffect } from 'react'
import { slidersApi, authApi, themeApi, landingApi } from './services/api'
import './App.css'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import TikTokCampaign from './pages/TikTokCampaign'
import UserTasks from './pages/UserTasks'
import AdminLogin from './pages/admin/AdminLogin'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import UserManagement from './pages/admin/UserManagement'
import Analytics from './pages/admin/Analytics'
import Settings from './pages/admin/Settings'
import SliderManagement from './pages/admin/SliderManagement'
import HeaderManagement from './pages/admin/HeaderManagement'
import FooterManagement from './pages/admin/FooterManagement'
import TaskManagement from './pages/admin/TaskManagement'
import LandingPageManagement from './pages/admin/LandingPageManagement'

function getInitialPage() {
  const path = window.location.pathname
  if (path === '/admin-panel') return 'admin-login'
  if (path === '/tiktok-campaign') return 'tiktok-campaign'
  if (path === '/user-profile') return 'login'
  return 'home'
}

function App() {
  const [currentPage, setCurrentPage] = useState(getInitialPage)
  const [user, setUser] = useState(null)
  const [adminUser, setAdminUser] = useState(null)
  const [adminTab, setAdminTab] = useState('dashboard')
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  
  // Theme settings
  const [headerSettings, setHeaderSettings] = useState({
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
  const [footerItems, setFooterItems] = useState([
    { id: 1, icon: '🏠', label: 'হোম', link: '/' },
    { id: 2, icon: '🛍️', label: 'পণ্য', link: '#' },
    { id: 3, icon: '💼', label: 'ক্যারিয়ার', link: '#' },
    { id: 4, icon: '👤', label: 'প্রোফাইল', link: '/login' },
  ])

  // Restore session on page load (admin and regular user)
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem('bikrans_token')
      const path = window.location.pathname

      if (token) {
        try {
          const userData = await authApi.me()
          if (userData) {
            if (path === '/admin-panel' && (userData.role === 'admin' || userData.role === 'manager')) {
              setAdminUser(userData)
              setCurrentPage('admin-panel')
            } else if (path === '/user-profile' || userData.role === 'user') {
              setUser(userData)
              if (path !== '/user-profile') window.history.replaceState({}, '', '/user-profile')
              setCurrentPage('dashboard')
            }
          }
        } catch {
          localStorage.removeItem('bikrans_token')
        }
      }
      setIsCheckingAuth(false)
    }
    restoreSession()
  }, [])

  useEffect(() => {
    const handlePopState = (e) => {
      const path = window.location.pathname
      if (path === '/admin-panel') {
        setCurrentPage(adminUser ? 'admin-panel' : 'admin-login')
      } else if (path === '/tiktok-campaign') {
        setCurrentPage('tiktok-campaign')
      } else if (path === '/user-profile') {
        const statePage = e?.state?.page
        setCurrentPage(user ? (statePage === 'user-tasks' ? 'user-tasks' : 'dashboard') : 'login')
      } else {
        setCurrentPage('home')
      }
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [adminUser, user])

  const defaultBanners = [
    { image: '/banner1.png', title: 'প্রাকৃতিক স্বাস্থ্য সমাধান', subtitle: 'বিক্রান্সের সাথে সুস্থ জীবন' },
    { image: '/banner2.png', title: 'Z-DIA ডায়াবেটিস সাপোর্ট', subtitle: 'প্রাকৃতিক উপাদানে তৈরি' },
    { image: '/banner3.png', title: 'ক্যারিয়ার গড়ুন বিক্রান্সে', subtitle: 'আয়ের নতুন সুযোগ' },
  ]
  const [banners, setBanners] = useState(defaultBanners)

  const defaultLanding = {
    services: {
      section_title: 'সব স্বাস্থ্য সমাধান এক প্ল্যাটফর্মে',
      items: [
        { icon: '/zdia.png', title: 'Z-DIA', link: 'বিস্তারিত জানুন', link_url: '#', isImage: true },
        { icon: '/vita-force.png', title: 'Vita Force', link: 'বিস্তারিত জানুন', link_url: '#', isImage: true },
        { icon: '💼', title: 'ক্যারিয়ার', link: 'বিস্তারিত জানুন', link_url: '#', isImage: false },
        { icon: '🎯', title: 'ডিস্ট্রিবিউটর', link: 'বিস্তারিত জানুন', link_url: '#', isImage: false },
      ],
    },
    features: {
      section_title: 'কেন বিক্রান্স বেছে নেবেন?',
      items: [
        { icon: '🏆', title: 'মানসম্মত পণ্য', description: 'প্রাকৃতিক উপাদানে তৈরি' },
        { icon: '🚀', title: 'দ্রুত ডেলিভারি', description: 'সারাদেশে ডেলিভারি' },
        { icon: '💰', title: 'আয়ের সুযোগ', description: 'ডিস্ট্রিবিউটর হিসেবে আয়' },
        { icon: '🤝', title: 'সার্বক্ষণিক সাপোর্ট', description: '২৪/৭ গ্রাহক সেবা' },
      ],
    },
    cta: {
      heading: 'আজই শুরু করুন',
      subtitle: 'স্বাস্থ্য ও আয়ের নতুন যাত্রা',
      primary_btn_text: '📞 কল করুন',
      primary_btn_link: '+8801700000000',
      secondary_btn_text: '💬 WhatsApp',
      secondary_btn_link: '8801700000000',
    },
  }
  const [landingData, setLandingData] = useState(null)

  // Load theme settings on mount
  useEffect(() => {
    themeApi.getHeader()
      .then((data) => {
        setHeaderSettings({
          ...data,
          show_search_btn: Boolean(data.show_search_btn),
          show_menu_btn: Boolean(data.show_menu_btn),
        })
      })
      .catch(() => {})

    themeApi.getFooter()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setFooterItems(data)
        }
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (currentPage !== 'home') return
    slidersApi.getPublic()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setBanners(data.map((s) => ({
            image: s.image,
            title: s.title,
            subtitle: s.subtitle || '',
            link: s.link || '',
          })))
        }
      })
      .catch(() => {})
  }, [currentPage])

  useEffect(() => {
    if (currentPage !== 'home') return
    landingApi.getPublic()
      .then((data) => {
        if (data && (data.services || data.features || data.cta)) {
          setLandingData(data)
        }
      })
      .catch(() => {})
  }, [currentPage])

  const landing = landingData || defaultLanding
  const services = landing.services?.items ?? defaultLanding.services.items
  const features = landing.features?.items ?? defaultLanding.features.items
  const servicesTitle = landing.services?.section_title ?? defaultLanding.services.section_title
  const featuresTitle = landing.features?.section_title ?? defaultLanding.features.section_title
  const cta = landing.cta ?? defaultLanding.cta

  useEffect(() => {
    if (banners.length > 0 && currentSlide >= banners.length) {
      setCurrentSlide(0)
    }
  }, [banners.length, currentSlide])

  useEffect(() => {
    if (!isAutoPlaying || banners.length === 0) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [isAutoPlaying, banners.length])

  const goToSlide = (index) => setCurrentSlide(index)
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % banners.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length)

  const handleLoginSuccess = async (userData) => {
    setUser(userData)
    window.history.pushState({}, '', '/user-profile')
    setCurrentPage('dashboard')
    try {
      const fullProfile = await authApi.me()
      setUser(fullProfile)
    } catch (_) {}
  }

  const handleRegisterSuccess = async (userData) => {
    setUser(userData)
    window.history.pushState({}, '', '/user-profile')
    setCurrentPage('dashboard')
    try {
      const fullProfile = await authApi.me()
      setUser(fullProfile)
    } catch (_) {}
  }

  const handleNavigateToRegister = () => setCurrentPage('register')
  const handleNavigateToLogin = () => setCurrentPage('login')

  const handleAdminLoginSuccess = (userData) => {
    setAdminUser(userData)
    setCurrentPage('admin-panel')
    window.history.pushState(null, '', '/admin-panel')
  }

  const handleAdminLogout = () => {
    localStorage.removeItem('bikrans_token')
    setAdminUser(null)
    setCurrentPage('home')
    window.history.pushState(null, '', '/')
  }

  const handleAdminBack = () => {
    setCurrentPage('home')
    window.history.pushState(null, '', '/')
  }

  const handleNavigateToCampaign = () => {
    setCurrentPage('tiktok-campaign')
    window.history.pushState(null, '', '/tiktok-campaign')
  }

  const handleCampaignBack = () => {
    setCurrentPage('home')
    window.history.pushState(null, '', '/')
  }

  // Show loading while checking auth
  if (isCheckingAuth && window.location.pathname === '/admin-panel') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#0d1117', color: '#fff' }}>
        Loading...
      </div>
    )
  }

  // Admin login page (only at /admin-panel)
  if (currentPage === 'admin-login') {
    return (
      <AdminLogin
        onLoginSuccess={handleAdminLoginSuccess}
        onBack={handleAdminBack}
      />
    )
  }

  // Admin panel
  if (currentPage === 'admin-panel' && adminUser) {
    const adminContent = {
      dashboard: <AdminDashboard />,
      users: <UserManagement currentUser={adminUser} />,
      tasks: <TaskManagement />,
      analytics: <Analytics />,
      'theme-sliders': <SliderManagement />,
      'theme-header': <HeaderManagement />,
      'theme-footer': <FooterManagement />,
      'theme-landing': <LandingPageManagement />,
      settings: <Settings />,
    }
    return (
      <AdminLayout
        user={adminUser}
        onLogout={handleAdminLogout}
        activeTab={adminTab}
        onTabChange={setAdminTab}
      >
        {adminContent[adminTab] || <AdminDashboard />}
      </AdminLayout>
    )
  }

  // Login page
  if (currentPage === 'login') {
    if (user) {
      window.history.pushState({}, '', '/user-profile')
      setCurrentPage('dashboard')
      return null
    }
    return (
      <Login
        onLoginSuccess={handleLoginSuccess}
        onNavigateToRegister={handleNavigateToRegister}
      />
    )
  }

  // Registration page
  if (currentPage === 'register') {
    if (user) {
      window.history.pushState({}, '', '/user-profile')
      setCurrentPage('dashboard')
      return null
    }
    return (
      <Register
        onRegisterSuccess={handleRegisterSuccess}
        onNavigateToLogin={handleNavigateToLogin}
      />
    )
  }

  // User tasks page (ফ্রি টিকটক প্রমোশন)
  if (currentPage === 'user-tasks' && user) {
    const handleUserLogout = () => {
      localStorage.removeItem('bikrans_token')
      setUser(null)
      window.history.pushState({}, '', '/')
      setCurrentPage('home')
    }
    const handleUserNavigate = (page) => {
      if (page === 'home') window.history.pushState({}, '', '/')
      if (page === 'dashboard') window.history.pushState({}, '', '/user-profile')
      setCurrentPage(page === 'dashboard' ? 'dashboard' : page)
    }
    return (
      <UserTasks
        user={user}
        onNavigate={handleUserNavigate}
        headerSettings={headerSettings}
        onLogout={handleUserLogout}
      />
    )
  }

  // Dashboard page
  if (currentPage === 'dashboard' && user) {
    const handleUserLogout = () => {
      localStorage.removeItem('bikrans_token')
      setUser(null)
      window.history.pushState({}, '', '/')
      setCurrentPage('home')
    }
    const handleDashboardNavigate = (page) => {
      if (page === 'home') window.history.pushState({}, '', '/')
      if (page === 'user-tasks') window.history.pushState({ page: 'user-tasks' }, '', '/user-profile')
      setCurrentPage(page)
    }
    return (
      <Dashboard
        user={user}
        onLogout={handleUserLogout}
        headerSettings={headerSettings}
        footerItems={footerItems}
        onNavigate={handleDashboardNavigate}
      />
    )
  }

  // TikTok Campaign page
  if (currentPage === 'tiktok-campaign') {
    const handleCampaignAutoLogin = (token, userData) => {
      localStorage.setItem('bikrans_token', token)
      setUser(userData)
    }
    return (
      <TikTokCampaign 
        onBack={handleCampaignBack} 
        headerSettings={headerSettings}
        footerItems={footerItems}
        onNavigateToLogin={() => setCurrentPage('login')}
        onAutoLogin={handleCampaignAutoLogin}
        onGoToDashboard={() => { window.history.pushState({}, '', '/user-profile'); setCurrentPage('dashboard') }}
      />
    )
  }

  // Home page
  return (
    <div className="app">
      <header 
        className="header" 
        style={{ 
          backgroundColor: headerSettings.header_bg_color,
          height: `${headerSettings.header_height}px`
        }}
      >
        <div className="header-content">
          <img 
            src={headerSettings.logo_image} 
            alt="Bikrans" 
            className="logo"
            style={{ height: `${headerSettings.logo_height}px` }}
          />
          <div className="header-actions">
            {headerSettings.show_search_btn && (
              <button className="icon-btn"><span>🔍</span></button>
            )}
            {!user && (
              <button
                className="app-btn"
                onClick={() => setCurrentPage('login')}
                style={{ background: headerSettings.app_btn_bg_color }}
              >
                লগইন
              </button>
            )}
            {headerSettings.show_menu_btn && (
              <button className="icon-btn menu-btn"><span>☰</span></button>
            )}
          </div>
        </div>
      </header>

      <section className="hero-carousel">
        <div className="carousel-container">
          <div
            className="carousel-track"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {banners.map((banner, index) => (
              <div key={index} className="carousel-slide">
                <img src={banner.image} alt={banner.title} className="slide-image" />
              </div>
            ))}
          </div>
        </div>
        <div className="banner-text">
          <h1>{banners[currentSlide]?.title}</h1>
          <p>{banners[currentSlide]?.subtitle}</p>
          {banners[currentSlide]?.link ? (
            <a href={banners[currentSlide].link} className="detail-btn">বিস্তারিত</a>
          ) : (
            <button className="detail-btn">বিস্তারিত</button>
          )}
        </div>
        <div className="carousel-controls">
          <button className="carousel-arrow" onClick={prevSlide}>‹</button>
          <div className="carousel-dots">
            {banners.map((_, index) => (
              <button
                key={index}
                className={`dot ${currentSlide === index ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
              />
            ))}
          </div>
          <button className="carousel-arrow" onClick={nextSlide}>›</button>
          <button
            className="play-pause-btn"
            onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          >
            {isAutoPlaying ? '⏸' : '▶'}
          </button>
        </div>
      </section>

      <section className="services-section">
        <h2 className="section-title">{servicesTitle}</h2>
        <div className="services-grid">
          {services.map((service, index) => (
            <div key={service.id ?? index} className="service-card">
              <div className="service-icon-wrapper">
                {service.isImage ? (
                  <img src={service.icon} alt={service.title} className="service-img" />
                ) : (
                  <span className="service-emoji">{service.icon}</span>
                )}
              </div>
              <h3 className="service-title">{service.title}</h3>
              <a href={service.link_url || '#'} className="service-link">{service.link}</a>
            </div>
          ))}
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">{featuresTitle}</h2>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={feature.id ?? index} className="feature-card">
              <span className="feature-icon">{feature.icon}</span>
              <div className="feature-content">
                <h4>{feature.title}</h4>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>{cta.heading}</h2>
          <p>{cta.subtitle}</p>
          <div className="cta-buttons">
            <a href={`tel:${cta.primary_btn_link || ''}`} className="cta-btn primary">{cta.primary_btn_text}</a>
            <a href={`https://wa.me/${(cta.secondary_btn_link || '').replace(/^\+/, '')}`} className="cta-btn secondary">{cta.secondary_btn_text}</a>
          </div>
        </div>
      </section>

      <nav className="bottom-nav">
        {footerItems.map((item, index) => (
          <a 
            key={item.id} 
            href={item.link} 
            className={`nav-item ${index === 0 ? 'active' : ''}`}
            onClick={(e) => {
              if (item.link === '/login') {
                e.preventDefault()
                setCurrentPage('login')
              } else if (item.link === '/tiktok-campaign') {
                e.preventDefault()
                handleNavigateToCampaign()
              } else if (item.link === '/' || item.link === '#home') {
                e.preventDefault()
              }
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </a>
        ))}
      </nav>
    </div>
  )
}

export default App
