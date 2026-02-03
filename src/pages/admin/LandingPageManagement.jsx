import { useState, useEffect } from 'react'
import { adminApi } from '../../services/api'
import './LandingPageManagement.css'

const TABS = [
  { id: 'services', label: 'সার্ভিস সেকশন' },
  { id: 'features', label: 'ফিচার সেকশন' },
  { id: 'cta', label: 'CTA সেকশন' },
]

function LandingPageManagement() {
  const [activeTab, setActiveTab] = useState('services')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Services
  const [servicesTitle, setServicesTitle] = useState('')
  const [servicesItems, setServicesItems] = useState([])
  const [servicesModal, setServicesModal] = useState(null)
  const [servicesForm, setServicesForm] = useState({
    icon: '',
    title: '',
    link_text: 'বিস্তারিত জানুন',
    link_url: '#',
    is_image: 0,
    sort_order: 0,
    is_active: 1,
  })

  // Features
  const [featuresTitle, setFeaturesTitle] = useState('')
  const [featuresItems, setFeaturesItems] = useState([])
  const [featuresModal, setFeaturesModal] = useState(null)
  const [featuresForm, setFeaturesForm] = useState({
    icon: '',
    title: '',
    description: '',
    sort_order: 0,
    is_active: 1,
  })

  // CTA
  const [ctaData, setCtaData] = useState({
    heading: 'আজই শুরু করুন',
    subtitle: 'স্বাস্থ্য ও আয়ের নতুন যাত্রা',
    primary_btn_text: '📞 কল করুন',
    primary_btn_link: '+8801700000000',
    secondary_btn_text: '💬 WhatsApp',
    secondary_btn_link: '8801700000000',
  })
  const [ctaSaving, setCtaSaving] = useState(false)

  const loadServices = async () => {
    try {
      const data = await adminApi.getLandingServices()
      setServicesTitle(data.section_title || '')
      setServicesItems(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      setError(err.message || 'Failed to load services')
    }
  }

  const loadFeatures = async () => {
    try {
      const data = await adminApi.getLandingFeatures()
      setFeaturesTitle(data.section_title || '')
      setFeaturesItems(Array.isArray(data.items) ? data.items : [])
    } catch (err) {
      setError(err.message || 'Failed to load features')
    }
  }

  const loadCta = async () => {
    try {
      const data = await adminApi.getLandingCta()
      setCtaData({
        heading: data.heading ?? 'আজই শুরু করুন',
        subtitle: data.subtitle ?? 'স্বাস্থ্য ও আয়ের নতুন যাত্রা',
        primary_btn_text: data.primary_btn_text ?? '📞 কল করুন',
        primary_btn_link: data.primary_btn_link ?? '+8801700000000',
        secondary_btn_text: data.secondary_btn_text ?? '💬 WhatsApp',
        secondary_btn_link: data.secondary_btn_link ?? '8801700000000',
      })
    } catch (err) {
      setError(err.message || 'Failed to load CTA')
    }
  }

  useEffect(() => {
    setError(null)
    setLoading(true)
    Promise.all([loadServices(), loadFeatures(), loadCta()])
      .finally(() => setLoading(false))
  }, [])

  const handleServicesTitleBlur = async () => {
    if (!servicesTitle.trim()) return
    try {
      await adminApi.updateLandingServicesSettings({ section_title: servicesTitle.trim() })
    } catch (err) {
      alert(err.message || 'Failed to update title')
    }
  }

  const handleFeaturesTitleBlur = async () => {
    if (!featuresTitle.trim()) return
    try {
      await adminApi.updateLandingFeaturesSettings({ section_title: featuresTitle.trim() })
    } catch (err) {
      alert(err.message || 'Failed to update title')
    }
  }

  const openServicesCreate = () => {
    setServicesForm({
      icon: '',
      title: '',
      link_text: 'বিস্তারিত জানুন',
      link_url: '#',
      is_image: 0,
      sort_order: servicesItems.length,
      is_active: 1,
    })
    setServicesModal('create')
  }

  const openServicesEdit = (item) => {
    setServicesForm({
      id: item.id,
      icon: item.icon,
      title: item.title,
      link_text: item.link_text || 'বিস্তারিত জানুন',
      link_url: item.link_url || '#',
      is_image: item.is_image ? 1 : 0,
      sort_order: item.sort_order,
      is_active: item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
    })
    setServicesModal('edit')
  }

  const handleServicesSubmitCreate = async (e) => {
    e.preventDefault()
    try {
      await adminApi.createLandingServiceItem(servicesForm)
      setServicesModal(null)
      loadServices()
    } catch (err) {
      alert(err.message || 'Failed to create')
    }
  }

  const handleServicesSubmitEdit = async (e) => {
    e.preventDefault()
    try {
      await adminApi.updateLandingServiceItem(servicesForm.id, servicesForm)
      setServicesModal(null)
      loadServices()
    } catch (err) {
      alert(err.message || 'Failed to update')
    }
  }

  const handleServicesDelete = async (id) => {
    if (!confirm('Delete this service item?')) return
    try {
      await adminApi.deleteLandingServiceItem(id)
      loadServices()
    } catch (err) {
      alert(err.message || 'Failed to delete')
    }
  }

  const handleServicesMove = async (index, direction) => {
    const list = [...servicesItems]
    const swap = direction === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= list.length) return
    ;[list[index], list[swap]] = [list[swap], list[index]]
    try {
      await adminApi.reorderLandingServiceItems(list.map((item, i) => ({ id: item.id, sort_order: i })))
      loadServices()
    } catch (err) {
      alert(err.message || 'Failed to reorder')
    }
  }

  const openFeaturesCreate = () => {
    setFeaturesForm({
      icon: '',
      title: '',
      description: '',
      sort_order: featuresItems.length,
      is_active: 1,
    })
    setFeaturesModal('create')
  }

  const openFeaturesEdit = (item) => {
    setFeaturesForm({
      id: item.id,
      icon: item.icon,
      title: item.title,
      description: item.description || '',
      sort_order: item.sort_order,
      is_active: item.is_active !== undefined ? (item.is_active ? 1 : 0) : 1,
    })
    setFeaturesModal('edit')
  }

  const handleFeaturesSubmitCreate = async (e) => {
    e.preventDefault()
    try {
      await adminApi.createLandingFeatureItem(featuresForm)
      setFeaturesModal(null)
      loadFeatures()
    } catch (err) {
      alert(err.message || 'Failed to create')
    }
  }

  const handleFeaturesSubmitEdit = async (e) => {
    e.preventDefault()
    try {
      await adminApi.updateLandingFeatureItem(featuresForm.id, featuresForm)
      setFeaturesModal(null)
      loadFeatures()
    } catch (err) {
      alert(err.message || 'Failed to update')
    }
  }

  const handleFeaturesDelete = async (id) => {
    if (!confirm('Delete this feature item?')) return
    try {
      await adminApi.deleteLandingFeatureItem(id)
      loadFeatures()
    } catch (err) {
      alert(err.message || 'Failed to delete')
    }
  }

  const handleFeaturesMove = async (index, direction) => {
    const list = [...featuresItems]
    const swap = direction === 'up' ? index - 1 : index + 1
    if (swap < 0 || swap >= list.length) return
    ;[list[index], list[swap]] = [list[swap], list[index]]
    try {
      await adminApi.reorderLandingFeatureItems(list.map((item, i) => ({ id: item.id, sort_order: i })))
      loadFeatures()
    } catch (err) {
      alert(err.message || 'Failed to reorder')
    }
  }

  const handleCtaSubmit = async (e) => {
    e.preventDefault()
    setCtaSaving(true)
    try {
      await adminApi.updateLandingCta(ctaData)
    } catch (err) {
      alert(err.message || 'Failed to save CTA')
    } finally {
      setCtaSaving(false)
    }
  }

  const handleInput = (setter) => (e) => {
    const { name, value, type, checked } = e.target
    setter((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    }))
  }

  if (loading) {
    return <div className="landing-admin-loading">Loading...</div>
  }

  return (
    <div className="landing-page-management">
      <div className="landing-page-header">
        <h1 className="landing-page-title">ল্যান্ডিং পেজ ডিজাইন</h1>
      </div>
      {error && <div className="landing-admin-error">{error}</div>}

      <div className="landing-tabs">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`landing-tab ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Services Tab */}
      {activeTab === 'services' && (
        <div className="landing-tab-panel">
          <div className="landing-section-block">
            <label>সেকশন হেডিং</label>
            <input
              type="text"
              className="landing-section-title-input"
              value={servicesTitle}
              onChange={(e) => setServicesTitle(e.target.value)}
              onBlur={handleServicesTitleBlur}
              placeholder="সব স্বাস্থ্য সমাধান এক প্ল্যাটফর্মে"
            />
          </div>
          <div className="landing-items-header">
            <h3>সার্ভিস আইটেম</h3>
            <button type="button" className="btn-primary" onClick={openServicesCreate}>
              আইটেম যোগ করুন
            </button>
          </div>
          <div className="landing-table-wrapper">
            <table className="landing-admin-table">
              <thead>
                <tr>
                  <th>ক্রম</th>
                  <th>আইকন/ছবি</th>
                  <th>শিরোনাম</th>
                  <th>লিংক টেক্সট</th>
                  <th>লিংক URL</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {servicesItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <div className="order-btns">
                        <button
                          type="button"
                          className="order-btn"
                          onClick={() => handleServicesMove(index, 'up')}
                          disabled={index === 0}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="order-btn"
                          onClick={() => handleServicesMove(index, 'down')}
                          disabled={index === servicesItems.length - 1}
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="icon-cell">
                      {item.is_image ? (
                        <img src={item.icon} alt="" className="landing-item-thumb" />
                      ) : (
                        <span>{item.icon}</span>
                      )}
                    </td>
                    <td>{item.title}</td>
                    <td>{item.link_text}</td>
                    <td className="link-cell">{item.link_url}</td>
                    <td>
                      <span className={`badge badge-${item.is_active ? 'active' : 'inactive'}`}>
                        {item.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn-sm" onClick={() => openServicesEdit(item)}>
                        সম্পাদনা
                      </button>
                      <button type="button" className="btn-sm btn-danger" onClick={() => handleServicesDelete(item.id)}>
                        মুছুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {servicesItems.length === 0 && (
              <div className="landing-empty">কোনো সার্ভিস আইটেম নেই। যোগ করতে বাটনে ক্লিক করুন।</div>
            )}
          </div>
        </div>
      )}

      {/* Features Tab */}
      {activeTab === 'features' && (
        <div className="landing-tab-panel">
          <div className="landing-section-block">
            <label>সেকশন হেডিং</label>
            <input
              type="text"
              className="landing-section-title-input"
              value={featuresTitle}
              onChange={(e) => setFeaturesTitle(e.target.value)}
              onBlur={handleFeaturesTitleBlur}
              placeholder="কেন বিক্রান্স বেছে নেবেন?"
            />
          </div>
          <div className="landing-items-header">
            <h3>ফিচার আইটেম</h3>
            <button type="button" className="btn-primary" onClick={openFeaturesCreate}>
              আইটেম যোগ করুন
            </button>
          </div>
          <div className="landing-table-wrapper">
            <table className="landing-admin-table">
              <thead>
                <tr>
                  <th>ক্রম</th>
                  <th>আইকন</th>
                  <th>শিরোনাম</th>
                  <th>বিবরণ</th>
                  <th>স্ট্যাটাস</th>
                  <th>অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {featuresItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>
                      <div className="order-btns">
                        <button
                          type="button"
                          className="order-btn"
                          onClick={() => handleFeaturesMove(index, 'up')}
                          disabled={index === 0}
                        >
                          ▲
                        </button>
                        <button
                          type="button"
                          className="order-btn"
                          onClick={() => handleFeaturesMove(index, 'down')}
                          disabled={index === featuresItems.length - 1}
                        >
                          ▼
                        </button>
                      </div>
                    </td>
                    <td className="icon-cell">{item.icon}</td>
                    <td>{item.title}</td>
                    <td className="desc-cell">{item.description}</td>
                    <td>
                      <span className={`badge badge-${item.is_active ? 'active' : 'inactive'}`}>
                        {item.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                      </span>
                    </td>
                    <td>
                      <button type="button" className="btn-sm" onClick={() => openFeaturesEdit(item)}>
                        সম্পাদনা
                      </button>
                      <button type="button" className="btn-sm btn-danger" onClick={() => handleFeaturesDelete(item.id)}>
                        মুছুন
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {featuresItems.length === 0 && (
              <div className="landing-empty">কোনো ফিচার আইটেম নেই। যোগ করতে বাটনে ক্লিক করুন।</div>
            )}
          </div>
        </div>
      )}

      {/* CTA Tab */}
      {activeTab === 'cta' && (
        <div className="landing-tab-panel">
          <form className="landing-cta-form" onSubmit={handleCtaSubmit}>
            <div className="landing-section-block">
              <label>হেডিং</label>
              <input
                type="text"
                name="heading"
                value={ctaData.heading}
                onChange={handleInput(setCtaData)}
                placeholder="আজই শুরু করুন"
              />
            </div>
            <div className="landing-section-block">
              <label>সাবটাইটেল</label>
              <input
                type="text"
                name="subtitle"
                value={ctaData.subtitle}
                onChange={handleInput(setCtaData)}
                placeholder="স্বাস্থ্য ও আয়ের নতুন যাত্রা"
              />
            </div>
            <div className="landing-cta-buttons-grid">
              <div className="landing-section-block">
                <label>প্রাইমারি বাটন টেক্সট</label>
                <input
                  type="text"
                  name="primary_btn_text"
                  value={ctaData.primary_btn_text}
                  onChange={handleInput(setCtaData)}
                  placeholder="📞 কল করুন"
                />
              </div>
              <div className="landing-section-block">
                <label>প্রাইমারি বাটন লিংক (ফোন নম্বর)</label>
                <input
                  type="text"
                  name="primary_btn_link"
                  value={ctaData.primary_btn_link}
                  onChange={handleInput(setCtaData)}
                  placeholder="+8801700000000"
                />
              </div>
              <div className="landing-section-block">
                <label>সেকেন্ডারি বাটন টেক্সট</label>
                <input
                  type="text"
                  name="secondary_btn_text"
                  value={ctaData.secondary_btn_text}
                  onChange={handleInput(setCtaData)}
                  placeholder="💬 WhatsApp"
                />
              </div>
              <div className="landing-section-block">
                <label>সেকেন্ডারি বাটন লিংক (WhatsApp নম্বর)</label>
                <input
                  type="text"
                  name="secondary_btn_link"
                  value={ctaData.secondary_btn_link}
                  onChange={handleInput(setCtaData)}
                  placeholder="8801700000000"
                />
              </div>
            </div>
            <div className="landing-form-actions">
              <button type="submit" className="btn-primary" disabled={ctaSaving}>
                {ctaSaving ? 'সেভ হচ্ছে...' : 'সেভ করুন'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services Create/Edit Modal */}
      {servicesModal && (
        <div className="modal-overlay" onClick={() => setServicesModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{servicesModal === 'create' ? 'সার্ভিস আইটেম যোগ করুন' : 'সার্ভিস সম্পাদনা'}</h2>
            <form onSubmit={servicesModal === 'create' ? handleServicesSubmitCreate : handleServicesSubmitEdit}>
              <div className="form-group">
                <label>আইকন (ইমোজি অথবা ছবির URL)</label>
                <input
                  type="text"
                  value={servicesForm.icon}
                  onChange={(e) => setServicesForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="💼 বা /zdia.png"
                  required
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={!!servicesForm.is_image}
                    onChange={(e) => setServicesForm((p) => ({ ...p, is_image: e.target.checked ? 1 : 0 }))}
                  />
                  ছবি হিসেবে ব্যবহার করুন (URL)
                </label>
              </div>
              <div className="form-group">
                <label>শিরোনাম</label>
                <input
                  type="text"
                  value={servicesForm.title}
                  onChange={(e) => setServicesForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Z-DIA"
                  required
                />
              </div>
              <div className="form-group">
                <label>লিংক টেক্সট</label>
                <input
                  type="text"
                  value={servicesForm.link_text}
                  onChange={(e) => setServicesForm((p) => ({ ...p, link_text: e.target.value }))}
                  placeholder="বিস্তারিত জানুন"
                />
              </div>
              <div className="form-group">
                <label>লিংক URL</label>
                <input
                  type="text"
                  value={servicesForm.link_url}
                  onChange={(e) => setServicesForm((p) => ({ ...p, link_url: e.target.value }))}
                  placeholder="#"
                />
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={!!servicesForm.is_active}
                  onChange={(e) => setServicesForm((p) => ({ ...p, is_active: e.target.checked ? 1 : 0 }))}
                />
                সক্রিয়
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setServicesModal(null)}>বাতিল</button>
                <button type="submit" className="btn-primary">
                  {servicesModal === 'create' ? 'যোগ করুন' : 'সেভ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Features Create/Edit Modal */}
      {featuresModal && (
        <div className="modal-overlay" onClick={() => setFeaturesModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{featuresModal === 'create' ? 'ফিচার আইটেম যোগ করুন' : 'ফিচার সম্পাদনা'}</h2>
            <form onSubmit={featuresModal === 'create' ? handleFeaturesSubmitCreate : handleFeaturesSubmitEdit}>
              <div className="form-group">
                <label>আইকন (ইমোজি)</label>
                <input
                  type="text"
                  value={featuresForm.icon}
                  onChange={(e) => setFeaturesForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="🏆"
                  required
                />
              </div>
              <div className="form-group">
                <label>শিরোনাম</label>
                <input
                  type="text"
                  value={featuresForm.title}
                  onChange={(e) => setFeaturesForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="মানসম্মত পণ্য"
                  required
                />
              </div>
              <div className="form-group">
                <label>বিবরণ</label>
                <input
                  type="text"
                  value={featuresForm.description}
                  onChange={(e) => setFeaturesForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="প্রাকৃতিক উপাদানে তৈরি"
                  required
                />
              </div>
              <label className="checkbox-row">
                <input
                  type="checkbox"
                  checked={!!featuresForm.is_active}
                  onChange={(e) => setFeaturesForm((p) => ({ ...p, is_active: e.target.checked ? 1 : 0 }))}
                />
                সক্রিয়
              </label>
              <div className="modal-actions">
                <button type="button" onClick={() => setFeaturesModal(null)}>বাতিল</button>
                <button type="submit" className="btn-primary">
                  {featuresModal === 'create' ? 'যোগ করুন' : 'সেভ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPageManagement
