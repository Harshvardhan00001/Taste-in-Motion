import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import '../styles/top-nav.css'

const TopNav = () => {
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user')) } catch { return null }
  })
  const menuRef = useRef(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Listen for login/logout events from other components
  useEffect(() => {
    const sync = () => {
      try { setUser(JSON.parse(localStorage.getItem('auth_user'))) } catch { setUser(null) }
    }
    window.addEventListener('auth_changed', sync)
    return () => window.removeEventListener('auth_changed', sync)
  }, [])

  const handleLogout = async () => {
    try {
      const url = user?.role === 'partner'
        ? 'http://localhost:3000/api/auth/food-partner/logout'
        : 'http://localhost:3000/api/auth/user/logout'
      await axios.get(url, { withCredentials: true })
    } catch {}
    localStorage.removeItem('auth_user')
    setUser(null)
    window.dispatchEvent(new Event('auth_changed'))
    navigate('/user/login')
    setMenuOpen(false)
  }

  const getInitials = (name) => {
    if (!name) return '?'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  const displayName = user?.fullName || user?.name || user?.email || ''
  const roleBadge = user?.role === 'partner' ? 'Partner' : 'User'
  const initials = getInitials(displayName)

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        {/* Logo */}
        <Link to="/" className="top-nav__logo">
          🍽️ <span>Taste</span>
        </Link>

        {/* Right side */}
        <div className="top-nav__right" ref={menuRef}>
          {user ? (
            <div className="top-nav__profile" onClick={() => setMenuOpen(o => !o)}>
              <div className="top-nav__avatar">{initials}</div>
              <div className="top-nav__user-info">
                <span className="top-nav__name">{displayName.split(' ')[0]}</span>
                <span className="top-nav__role">{roleBadge}</span>
              </div>
              <svg className={`top-nav__chevron ${menuOpen ? 'open' : ''}`}
                width="14" height="14" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M6 9l6 6 6-6"/>
              </svg>

              {menuOpen && (
                <div className="top-nav__dropdown">
                  <div className="top-nav__dropdown-header">
                    <div className="top-nav__avatar top-nav__avatar--lg">{initials}</div>
                    <div>
                      <div className="top-nav__dropdown-name">{displayName}</div>
                      <div className="top-nav__dropdown-role">{roleBadge}</div>
                    </div>
                  </div>
                  <div className="top-nav__dropdown-divider" />
                  {user.role === 'partner' && (
                    <Link to="/create-food" className="top-nav__dropdown-item"
                      onClick={() => setMenuOpen(false)}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                      </svg>
                      Upload Food
                    </Link>
                  )}
                  <Link to="/saved" className="top-nav__dropdown-item"
                    onClick={() => setMenuOpen(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z"/>
                    </svg>
                    Saved
                  </Link>
                  <div className="top-nav__dropdown-divider" />
                  <button className="top-nav__dropdown-item top-nav__dropdown-item--danger"
                    onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                      <polyline points="16 17 21 12 16 7"/>
                      <line x1="21" y1="12" x2="9" y2="12"/>
                    </svg>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="top-nav__auth-links">
              <Link to="/user/login" className="top-nav__login-btn">Login</Link>
              <Link to="/register" className="top-nav__register-btn">Register</Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopNav