import { useState } from 'react'
import { authApi } from '../services/api'
import './Login.css'

function Login({ onLoginSuccess, onNavigateToRegister }) {
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [errors, setErrors] = useState({})
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)

  const validateForm = () => {
    const newErrors = {}
    
    if (!phone.trim()) {
      newErrors.phone = 'মোবাইল নম্বর দিন'
    } else if (!/^01[3-9]\d{8}$/.test(phone.replace(/\s/g, ''))) {
      newErrors.phone = 'সঠিক ১১ সংখ্যার মোবাইল নম্বর দিন'
    }
    
    if (!pin.trim()) {
      newErrors.pin = 'পিন নম্বর দিন'
    } else if (pin.length < 6) {
      newErrors.pin = 'পিন নম্বর ৬ অঙ্কের হতে হবে'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return
    setLoading(true)
    setErrors({})
    try {
      const res = await authApi.login(phone, pin)
      localStorage.setItem('bikrans_token', res.token)
      onLoginSuccess(res.user)
    } catch (err) {
      setErrors({ api: err.message })
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 11)
    setPhone(value)
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: '' }))
  }

  const handlePinChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6)
    setPin(value)
    if (errors.pin) setErrors((prev) => ({ ...prev, pin: '' }))
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <img src="/BIKRANS-FINAL.png" alt="Bikrans" className="login-logo" />
        <div className="login-hero">
          <div className="login-welcome-icon">👋</div>
          <h1 className="login-welcome">বিক্রান্সে স্বাগতম!</h1>
          <p className="login-subtitle">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {errors.api && <div className="error-banner">{errors.api}</div>}
          <div className="form-group">
            <label htmlFor="phone">মোবাইল নম্বর</label>
            <div className="input-wrapper">
              <span className="input-prefix">+88</span>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="01XXXXXXXXX"
                maxLength={11}
                className={errors.phone ? 'error' : ''}
                autoComplete="tel"
              />
            </div>
            {errors.phone && <span className="error-text">{errors.phone}</span>}
          </div>

          {errors.api && <div className="error-banner">{errors.api}</div>}
          <div className="form-group">
            <label htmlFor="pin">পিন নম্বর</label>
            <div className="input-wrapper pin-input">
              <input
                id="pin"
                type={showPin ? 'text' : 'password'}
                value={pin}
                onChange={handlePinChange}
                placeholder="••••••"
                maxLength={6}
                className={errors.pin ? 'error' : ''}
                inputMode="numeric"
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

          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'লগইন হচ্ছে...' : 'লগইন'}
          </button>

          <a href="#" className="forgot-link">পিন ভুলে গেছেন?</a>
        </form>

        <div className="login-divider">
          <span>অথবা</span>
        </div>

        <button type="button" className="btn-register-outline" onClick={onNavigateToRegister}>
          নতুন অ্যাকাউন্ট তৈরি করুন
        </button>

        <p className="login-terms">
          লগইন করে আপনি আমাদের{' '}
          <a href="#">শর্তাবলী</a> ও <a href="#">গোপনীয়তা নীতি</a> মেনে নিচ্ছেন
        </p>
      </div>
    </div>
  )
}

export default Login
