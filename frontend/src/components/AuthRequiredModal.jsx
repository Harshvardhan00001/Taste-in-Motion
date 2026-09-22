import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, LogIn, UserPlus, X, ShieldAlert } from 'lucide-react';
import '../styles/auth-modal.css';

const AuthRequiredModal = ({ isOpen, onClose, actionName = 'perform this action' }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <div className="auth-modal-icon-disc">
            <Lock size={22} className="lock-icon" />
          </div>
          <button className="auth-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        <div className="auth-modal-body">
          <h2 className="auth-modal-title">Sign In Required</h2>
          <p className="auth-modal-description">
            Please log in or create an account to <strong>{actionName}</strong>, save favorite dishes, and access full ordering capabilities.
          </p>
          <div className="guest-note-badge">
            <ShieldAlert size={13} />
            <span>Guests can watch reels & explore food recommendations!</span>
          </div>
        </div>

        <div className="auth-modal-actions">
          <button
            className="auth-btn auth-btn-primary"
            onClick={() => {
              onClose();
              navigate('/user/login');
            }}
          >
            <LogIn size={15} /> Sign In
          </button>

          <button
            className="auth-btn auth-btn-secondary"
            onClick={() => {
              onClose();
              navigate('/user/register');
            }}
          >
            <UserPlus size={15} /> Create Account
          </button>
        </div>

        <div className="auth-modal-footer">
          <button className="continue-guest-btn" onClick={onClose}>
            Continue Browsing as Guest
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthRequiredModal;
