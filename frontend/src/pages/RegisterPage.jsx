import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authAPI } from '../services/api'
import { Building2, Eye, EyeOff, Mail, Lock, User, Phone, MapPin } from 'lucide-react'
import toast from 'react-hot-toast'
import styles from './AuthPage.module.css'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [form, setForm] = useState({
    fullName: '', email: '', password: '', phoneNumber: '', address: ''
  })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)
    try {
      const { data } = await authAPI.register(form)
      const { token, ...userData } = data.data
      login(userData, token)
      toast.success('Account created! Welcome to BankEase 🎉')
      navigate('/dashboard')
    } catch (err) {
      const errData = err.response?.data
      if (errData?.data && typeof errData.data === 'object') {
        const firstError = Object.values(errData.data)[0]
        toast.error(firstError)
      } else {
        toast.error(errData?.message || 'Registration failed')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={`${styles.card} ${styles.cardWide}`}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}><Building2 size={28} /></div>
          <h1 className={styles.brandName}>BankEase</h1>
          <p className={styles.brandTagline}>Open your account in seconds</p>
        </div>

        <h2 className={styles.title}>Create Account</h2>
        <p className={styles.subtitle}>Fill in details to get your free demo account</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.row2}>
            <div className={styles.field}>
              <label className={styles.label}>Full Name *</label>
              <div className={styles.inputWrap}>
                <User className={styles.inputIcon} size={16} />
                <input className={styles.input} type="text" name="fullName"
                  placeholder="Ravi Kumar" value={form.fullName} onChange={handleChange} required />
              </div>
            </div>
            <div className={styles.field}>
              <label className={styles.label}>Phone Number</label>
              <div className={styles.inputWrap}>
                <Phone className={styles.inputIcon} size={16} />
                <input className={styles.input} type="tel" name="phoneNumber"
                  placeholder="9876543210" value={form.phoneNumber} onChange={handleChange} />
              </div>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email Address *</label>
            <div className={styles.inputWrap}>
              <Mail className={styles.inputIcon} size={16} />
              <input className={styles.input} type="email" name="email"
                placeholder="you@example.com" value={form.email} onChange={handleChange} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password *</label>
            <div className={styles.inputWrap}>
              <Lock className={styles.inputIcon} size={16} />
              <input className={styles.input} type={showPass ? 'text' : 'password'}
                name="password" placeholder="Minimum 6 characters"
                value={form.password} onChange={handleChange} required />
              <button type="button" className={styles.togglePass} onClick={() => setShowPass(p => !p)}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Address</label>
            <div className={styles.inputWrap}>
              <MapPin className={styles.inputIcon} size={16} />
              <input className={styles.input} type="text" name="address"
                placeholder="123, MG Road, Bangalore" value={form.address} onChange={handleChange} />
            </div>
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <span className={styles.spinner} /> : 'Open Account'}
          </button>
        </form>

        <p className={styles.switchText}>
          Already have an account?{' '}
          <Link to="/login" className={styles.switchLink}>Sign in</Link>
        </p>

        <div className={styles.demoNote}>
          🎁 New accounts receive ₹10,000 demo balance automatically!
        </div>
      </div>
    </div>
  )
}

