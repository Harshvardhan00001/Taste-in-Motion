import React, { useState, useEffect, useRef } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  Flame,
  Compass,
  MapPin,
  Bookmark,
  BarChart3,
  PlusCircle,
  LogOut,
  ChevronDown,
  User,
  UtensilsCrossed
} from 'lucide-react'
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
  const roleBadge = user?.role === 'partner' ? 'Kitchen Partner' : 'Food Explorer'
  const initials = getInitials(displayName)

  return (
    <header className="top-nav">
      <div className="top-nav__inner">
        {/* Brand Logo */}
        <Link to="/" className="top-nav__logo">
          <div className="top-nav__logo-icon">
            <UtensilsCrossed size={18} strokeWidth={2.4} />
          </div>
          <div className="top-nav__logo-text">
            <span>Taste</span>
            <span className="top-nav__logo-suffix">in motion</span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="top-nav__desktop-menu" aria-label="Main Navigation">
          <NavLink to="/" end className={({ isActive }) => `top-nav__link ${isActive ? 'is-active' : ''}`}>
            Feed
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `top-nav__link ${isActive ? 'is-active' : ''}`}>
            Map
          </NavLink>
          <NavLink to="/trails" className={({ isActive }) => `top-nav__link ${isActive ? 'is-active' : ''}`}>
            Food Trails
          </NavLink>
          <NavLink to="/saved" className={({ isActive }) => `top-nav__link ${isActive ? 'is-active' : ''}`}>
            Saved
          </NavLink>
          <NavLink to="/taste-profile" className={({ isActive }) => `top-nav__link ${isActive ? 'is-active' : ''}`}>
            Taste Profile
          </NavLink>
        </nav>

        {/* Right Section: I'm Hungry + Profile / Auth */}
        <div className="top-nav__right-group">
          {/* Craving Discovery Quick Launcher */}
          <button
            className="top-nav__hungry-btn"
            onClick={() => {
              if (window.location.pathname !== '/') {
                navigate('/');
                setTimeout(() => window.dispatchEvent(new Event('open_im_hungry')), 120);
              } else {
                window.dispatchEvent(new Event('open_im_hungry'));
              }
            }}
            title="Open situational context search"
          >
            <Flame size={14} className="hungry-flame-icon" />
            <span>I'm Hungry</span>
          </button>

          {/* User Profile or Auth Buttons */}
          <div className="top-nav__user-section" ref={menuRef}>
            {user ? (
              <div className="top-nav__profile-trigger" onClick={() => setMenuOpen(o => !o)}>
                <div className="top-nav__avatar">{initials}</div>
                <div className="top-nav__user-meta">
                  <span className="top-nav__user-name">{displayName.split(' ')[0]}</span>
                  <span className="top-nav__role-badge">{roleBadge}</span>
                </div>
                <ChevronDown
                  size={14}
                  className={`top-nav__chevron ${menuOpen ? 'is-rotated' : ''}`}
                />

                {menuOpen && (
                  <div className="top-nav__dropdown">
                    <div className="top-nav__dropdown-header">
                      <div className="top-nav__avatar top-nav__avatar--lg">{initials}</div>
                      <div className="top-nav__dropdown-info">
                        <div className="top-nav__dropdown-name">{displayName}</div>
                        <div className="top-nav__dropdown-role">{roleBadge}</div>
                      </div>
                    </div>

                    <div className="top-nav__dropdown-divider" />

                    {user.role === 'partner' && (
                      <div className="top-nav__dropdown-group">
                        <div className="top-nav__dropdown-label">Partner Tools</div>
                        <Link
                          to="/partner/analytics"
                          className="top-nav__dropdown-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          <BarChart3 size={15} />
                          <span>Analytics Cockpit</span>
                        </Link>
                        <Link
                          to="/create-food"
                          className="top-nav__dropdown-item"
                          onClick={() => setMenuOpen(false)}
                        >
                          <PlusCircle size={15} />
                          <span>Upload Food Video</span>
                        </Link>
                      </div>
                    )}

                    <div className="top-nav__dropdown-group">
                      <div className="top-nav__dropdown-label">Explore & Curate</div>
                      <Link
                        to="/trails"
                        className="top-nav__dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Compass size={15} />
                        <span>Food Trails</span>
                      </Link>
                      <Link
                        to="/saved"
                        className="top-nav__dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Bookmark size={15} />
                        <span>Saved Dishes</span>
                      </Link>
                      <Link
                        to="/taste-profile"
                        className="top-nav__dropdown-item"
                        onClick={() => setMenuOpen(false)}
                      >
                        <Flame size={15} />
                        <span>Taste Profile</span>
                      </Link>
                    </div>

                    <div className="top-nav__dropdown-divider" />

                    <button
                      className="top-nav__dropdown-item top-nav__dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      <LogOut size={15} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="top-nav__auth-links">
                <Link to="/user/login" className="top-nav__login-btn">
                  Sign In
                </Link>
                <Link to="/register" className="top-nav__register-btn">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default TopNav