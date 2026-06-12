import React, { useState } from 'react'
import '../../styles/auth-shared.css'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const FoodPartnerLogin = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const response = await axios.post("http://localhost:3000/api/auth/food-partner/login", {
        email: e.target.email.value,
        password: e.target.password.value
      }, { withCredentials: true })

      // ✅ Save partner to localStorage so TopNav shows the name
      localStorage.setItem('auth_user', JSON.stringify({
        ...response.data.user,
        role: 'partner'
      }))
      window.dispatchEvent(new Event('auth_changed'))
      navigate('/create-food')
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
          <h1 className="auth-title">Partner login</h1>
          <p className="auth-subtitle">Access your dashboard and manage your food content.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error">{error}</div>}
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" required />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="••••••••" autoComplete="current-password" required />
          </div>
          <button className="auth-submit" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In as Partner'}
          </button>
        </form>
        <div className="auth-alt-action">New partner? <Link to="/food-partner/register">Create an account</Link></div>
        <div className="auth-alt-action">Are you a user? <Link to="/user/login">User login</Link></div>
      </div>
    </div>
  )
}

export default FoodPartnerLogin