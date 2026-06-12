import React, { useState } from 'react'
import '../../styles/auth-shared.css'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const UserLogin = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post("http://localhost:3000/api/auth/user/login", {
        email: e.target.email.value,
        password: e.target.password.value
      }, { withCredentials: true })

      // ✅ Save user to localStorage so TopNav shows the name
      localStorage.setItem('auth_user', JSON.stringify({
        ...response.data.user,
        role: 'user'
      }))
      window.dispatchEvent(new Event('auth_changed'))
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card">
        <header>
          <span className="auth-logo">🍽️ Taste in Motion</span>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your food journey.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" required />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
        <div className="auth-alt-action">New here? <Link to="/user/register">Create account</Link></div>
        <div className="auth-alt-action">Are you a partner? <Link to="/food-partner/login">Partner login</Link></div>
      </div>
    </div>
  )
}

export default UserLogin