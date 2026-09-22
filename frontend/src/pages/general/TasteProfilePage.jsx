import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Flame, Compass, IndianRupee, MapPin, Sparkles, Utensils, Activity, Info } from 'lucide-react';
import '../../styles/taste-profile.css';

const TasteProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const guestSessionId = localStorage.getItem('guest_session_id') || 'guest_default';
        const response = await axios.get(
          `http://localhost:3000/api/taste-profile?guestSessionId=${guestSessionId}`,
          { withCredentials: true }
        );
        setProfile(response.data.profile);
      } catch (err) {
        console.error('Error fetching taste profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const affinities = profile?.cuisineAffinities || {
    'North Indian': 0.88,
    'Street Food': 0.82,
    'Pan-Asian': 0.65,
    'Italian': 0.60,
    'South Indian': 0.52
  };

  const summaryBadge = profile?.summaryBadge || 'Spicy North Indian Explorer • Avg ₹280';
  const spicePref = profile?.spicePreference || 'spicy';
  const avgBudget = profile?.averageBudget || 280;
  const distanceKm = profile?.distanceToleranceKm || 5.0;
  const totalInteractions = profile?.totalInteractions || 12;

  const getSpiceBadgeClass = (level) => {
    return spicePref === level ? 'spice-flame-active' : '';
  };

  return (
    <div className="taste-profile-page">
      <div className="taste-profile-container">
        {/* Header Hero Card */}
        <div className="profile-hero-card">
          <div className="hero-top-row">
            <div className="hero-persona-tag">
              <Sparkles size={14} className="sparkle-icon" /> DYNAMIC TASTE PERSONA
            </div>
            <div className="interactions-pill">
              <Activity size={12} /> {totalInteractions} Interactions Tracked
            </div>
          </div>

          <h1 className="hero-persona-badge">{summaryBadge}</h1>
          <p className="hero-description">
            Your taste profile is continuously updated in real-time based on your reel completions, saves, likes, and context constraints without requiring manual surveys.
          </p>
        </div>

        {/* 2-Column Grid: Affinities & Comfort Zones */}
        <div className="profile-grid">
          {/* Left Column: Cuisine Affinities */}
          <div className="profile-card cuisine-affinities-card">
            <div className="card-header-row">
              <div className="card-title-group">
                <Utensils size={18} className="card-icon" />
                <h2 className="card-title">Learned Cuisine Affinities</h2>
              </div>
              <span className="card-subtitle">Derived from implicit behavior</span>
            </div>

            <div className="affinities-list">
              {Object.entries(affinities).map(([cuisine, score]) => {
                const percentage = Math.round(Number(score) > 1 ? Number(score) : Number(score) * 100);
                return (
                  <div key={cuisine} className="affinity-row">
                    <div className="affinity-label-bar">
                      <span className="cuisine-name">{cuisine}</span>
                      <span className="cuisine-score">{percentage}% Fit</span>
                    </div>
                    <div className="affinity-progress-bg">
                      <div
                        className="affinity-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Comfort Zones & Spice Gauge */}
          <div className="profile-right-stack">
            {/* Spice Preference Flame Gauge */}
            <div className="profile-card spice-gauge-card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <Flame size={18} className="card-icon flame-icon" />
                  <h2 className="card-title">Spice Heat Comfort Level</h2>
                </div>
              </div>

              <div className="spice-levels-grid">
                <div className={`spice-level-box ${getSpiceBadgeClass('mild')}`}>
                  <span className="spice-flame-icon">🌱</span>
                  <span className="spice-label">Mild</span>
                </div>
                <div className={`spice-level-box ${getSpiceBadgeClass('medium')}`}>
                  <span className="spice-flame-icon">🌶️</span>
                  <span className="spice-label">Medium</span>
                </div>
                <div className={`spice-level-box ${getSpiceBadgeClass('spicy')}`}>
                  <span className="spice-flame-icon">🔥</span>
                  <span className="spice-label">Spicy</span>
                </div>
                <div className={`spice-level-box ${getSpiceBadgeClass('extra-spicy')}`}>
                  <span className="spice-flame-icon">💥</span>
                  <span className="spice-label">Extra Spicy</span>
                </div>
              </div>
            </div>

            {/* Budget & Distance Comfort Zones */}
            <div className="profile-card zones-card">
              <div className="card-header-row">
                <div className="card-title-group">
                  <Compass size={18} className="card-icon" />
                  <h2 className="card-title">Situational Comfort Zones</h2>
                </div>
              </div>

              <div className="zones-grid">
                <div className="zone-item budget-zone">
                  <span className="zone-label">
                    <IndianRupee size={13} /> TYPICAL SPEND TARGET
                  </span>
                  <span className="zone-value">₹{avgBudget}</span>
                  <span className="zone-subtext">Avg per meal decision</span>
                </div>

                <div className="zone-item distance-zone">
                  <span className="zone-label">
                    <MapPin size={13} /> TRANSIT RADIUS
                  </span>
                  <span className="zone-value">{distanceKm} km</span>
                  <span className="zone-subtext">Comfortable range</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Explainer Note */}
        <div className="telemetry-explainer-note">
          <Info size={16} className="info-icon" />
          <span>
            <strong>How it works:</strong> Watching reels to completion increases cuisine affinity by +10%, saving or liking dishes adds +15%, and skipping quickly decays affinity by -2% to keep recommendations aligned with your active taste drift.
          </span>
        </div>
      </div>
    </div>
  );
};

export default TasteProfilePage;
