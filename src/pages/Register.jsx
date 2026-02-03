import { useState } from 'react'
import { authApi } from '../services/api'
import './Register.css'

function Register({ onRegisterSuccess, onNavigateToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    pin: '',
    confirmPin: '',
    referralCode: '',
    acceptTerms: false,
  })
  const [errors, setErrors] = useState({})
  const [showPin, setShowPin] = useState(false)
  const [showConfirmPin, setShowConfirmPin] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'নাম দিন'
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'নাম কমপক্ষে ৩ অক্ষর হতে হবে'
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'মোবাইল নম্বর দিন'
    } else if (!/^01[3-9]\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন'
    }

    if (!formData.pin.trim()) {
      newErrors.pin = 'পিন নম্বর দিন'
    } else if (formData.pin.length < 6) {
      newErrors.pin = 'পিন নম্বর ৬ অঙ্কের হতে হবে'
    }

    if (formData.pin !== formData.confirmPin) {
      newErrors.confirmPin = 'পিন নম্বর মিলছে না'
    } else if (!formData.confirmPin.trim()) {
      newErrors.confirmPin = 'পিন নম্বর নিশ্চিত করুন'
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = 'শর্তাবলী গ্রহণ করুন'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11)
    setFormData((prev) => ({ ...prev, phone: value }))
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
  }

  const handlePinChange = (e, field) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setErrors({})
    try {
      const res = await authApi.register({
        name: formData.name,
        email: formData.email || `${formData.phone}@bikrans.local`,
        phone: formData.phone,
        password: formData.pin,
      })
      localStorage.setItem('bikrans_token', res.token)
      onRegisterSuccess(res.user)
    } catch (err) {
      setErrors({ api: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-page">
      <div className="register-container">
        <header className="register-header">
          <button
            type="button"
            className="back-btn"
            onClick={onNavigateToLogin}
            aria-label="Back"
          >
            ←
          </button>
          <h1 className="register-title">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
        </header>

        <div className="register-hero">
          <div className="register-welcome-icon">🎉</div>
          <h2 className="register-welcome-text">নতুন যাত্রা শুরু করুন</h2>
        </div>

        <form onSubmit={handleSubmit} className="register-form">
          {errors.api && <div className="error-banner">{errors.api}</div>}
          <div className="form-group">
            <label htmlFor="name">পুরো নাম</label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="আপনার নাম লিখুন"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="phone">মোবাইল নম্বর</label>
            <div className="input-wrapper">
              <span className="input-prefix">+88</span>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handlePhoneChange}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={errors.phone ? 'error' : ''}
              />
            </div>
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">ইমেইল (ঐচ্ছিক)</label>
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin">পিন নম্বর তৈরি করুন (৬ অঙ্ক)</label>
            <div className="input-wrapper pin-input">
              <input
                id="pin"
                name="pin"
                type={showPin ? 'text' : 'password'}
                value={formData.pin}
                onChange={(e) => handlePinChange(e, 'pin')}
                placeholder="••••••"
                maxLength={6}
                inputMode="numeric"
                className={errors.pin ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-pin"
                onClick={() => setShowPin(!showPin)}
                aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showPin ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.pin && <span className="error-text">{errors.pin}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPin">পিন নম্বর নিশ্চিত করুন</label>
            <div className="input-wrapper pin-input">
              <input
                id="confirmPin"
                name="confirmPin"
                type={showConfirmPin ? 'text' : 'password'}
                value={formData.confirmPin}
                onChange={(e) => handlePinChange(e, 'confirmPin')}
                placeholder="••••••"
                maxLength={6}
                inputMode="numeric"
                className={errors.confirmPin ? 'error' : ''}
              />
              <button
                type="button"
                className="toggle-pin"
                onClick={() => setShowConfirmPin(!showConfirmPin)}
                aria-label={showConfirmPin ? 'Hide PIN' : 'Show PIN'}
              >
                {showConfirmPin ? '🙈' : '👁️'}
              </button>
            </div>
            {errors.confirmPin && (
              <span className="error-text">{errors.confirmPin}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="referralCode">রেফারেল কোড (ঐচ্ছিক)</label>
            <input
              id="referralCode"
              name="referralCode"
              type="text"
              value={formData.referralCode}
              onChange={handleChange}
              placeholder="রেফারেল কোড দিন"
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="acceptTerms"
                checked={formData.acceptTerms}
                onChange={handleChange}
                className="checkbox-input"
              />
              <span className="checkbox-text">
                আমি বিক্রান্সের{' '}
                <a href="#">শর্তাবলী</a> ও <a href="#">গোপনীয়তা নীতি</a>{' '}
                মেনে নিচ্ছি
              </span>
            </label>
            {errors.acceptTerms && (
              <span className="error-text">{errors.acceptTerms}</span>
            )}
          </div>

          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? 'রেজিস্টার হচ্ছে...' : 'রেজিস্টার করুন'}
          </button>
        </form>

        <p className="register-footer">
          ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
          <button
            type="button"
            className="login-link"
            onClick={onNavigateToLogin}
          >
            লগইন করুন
          </button>
        </p>
      </div>
    </div>
  )
}

export default Register
