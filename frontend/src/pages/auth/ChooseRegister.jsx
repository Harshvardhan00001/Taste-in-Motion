import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Store, ArrowRight } from 'lucide-react';
import '../../styles/auth-shared.css';

const ChooseRegister = () => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="choose-register-title" style={{ maxWidth: '460px' }}>
        <header>
          <span className="auth-logo">Taste in Motion</span>
          <h1 id="choose-register-title" className="auth-title">Create an Account</h1>
          <p className="auth-subtitle">Select how you'd like to experience Taste in Motion.</p>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Option 1: Food Explorer */}
          <Link
            to="/user/register"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(255, 87, 34, 0.12), rgba(245, 158, 11, 0.08))',
              border: '1px solid rgba(255, 87, 34, 0.35)',
              transition: 'all 160ms ease',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'var(--color-accent-gradient)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#ffffff',
                  boxShadow: '0 4px 12px rgba(255, 87, 34, 0.35)',
                  flexShrink: 0
                }}
              >
                <Utensils size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>Food Explorer</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Discover dish reels, bookmark favorites & join crawls
                </div>
              </div>
            </div>
            <ArrowRight size={18} color="var(--color-accent)" />
          </Link>

          {/* Option 2: Kitchen Partner */}
          <Link
            to="/food-partner/register"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px 18px',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--color-border)',
              transition: 'all 160ms ease',
              color: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid var(--color-border-hover)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#ffffff',
                  flexShrink: 0
                }}
              >
                <Store size={20} />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 800, fontSize: '0.98rem' }}>Kitchen Partner</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                  Upload food reels, analyze performance & reach diners
                </div>
              </div>
            </div>
            <ArrowRight size={18} color="var(--color-text-muted)" />
          </Link>
        </div>

        <div className="auth-alt-action">
          Already have an account? <Link to="/user/login">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ChooseRegister;
