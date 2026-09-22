import React from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  MapPin,
  Flame,
  Star,
  Compass,
  Bookmark,
  Store,
  Navigation,
  Sparkles
} from 'lucide-react';

const FoodDecisionPanel = ({ item, onLike, onSave, onAddToTrail }) => {
  const dishName = item.dish?.name || item.name;
  const category = (item.dish?.cuisine || 'STREET FOOD').toUpperCase();
  const spiceLevel = item.dish?.spiceLevel;
  const description = item.description || item.dish?.description || 'Delicious handcrafted local dish prepared fresh on order.';
  const price = item.price ?? 220;
  const distance = item.distanceKm ?? 1.4;
  const prepTime = item.prepTimeMinutes ?? 20;
  const totalMins = item.estimatedTotalMinutes ?? (prepTime + Math.round(distance * 4));
  const dishId = item.dish?._id || item.dish || item._id;
  const reasonBadge = item.reasonBadge;

  const partnerObj = typeof item.foodPartner === 'object' ? item.foodPartner : null;
  const partnerId = partnerObj?._id || item.foodPartner;
  const partnerName = partnerObj?.name || 'Local Kitchen Partner';
  const partnerRating = partnerObj?.rating || 4.8;
  const partnerAddress = partnerObj?.address || 'Connaught Place, New Delhi';

  // "Why Recommended?" explainability bullets (PRD Section 6)
  const whyRecommended = item.whyRecommended || [
    `Matches ${spiceLevel || 'medium'} spice preference`,
    `Within ₹300 budget target`,
    `${distance} km from location (~${totalMins}m)`,
    `Chef's recommended pick`
  ];

  // Taste Match metrics (PRD Section 14)
  const tasteMatch = item.tasteMatch || {
    totalScore: 92,
    factors: [
      { label: 'SPICE', percentage: 88 },
      { label: category, percentage: 84 },
      { label: 'BUDGET', percentage: 95 }
    ]
  };

  return (
    <div className="food-decision-panel">
      {/* Category & Cuisine Header (PRD Section 4) */}
      <div className="panel-kicker-row">
        <span className="panel-category-badge">{category}</span>
        {spiceLevel && (
          <span className={`panel-spice-chip spice-${spiceLevel}`}>
            <Flame size={11} /> {spiceLevel.toUpperCase()}
          </span>
        )}
        {reasonBadge && (
          <span className="panel-reason-pill" title={reasonBadge}>
            <Sparkles size={11} /> {reasonBadge}
          </span>
        )}
      </div>

      {/* Dish Name (PRD Section 5) */}
      <h2 className="panel-dish-title">{dishName}</h2>

      {/* Short Description */}
      <p className="panel-description">{description}</p>

      {/* Context Snapshot Grid (PRD Section 7: Budget, Distance, Time) */}
      <div className="panel-context-grid">
        <div className="context-card context-price">
          <span className="context-label">BUDGET</span>
          <span className="context-value">₹{price}</span>
        </div>
        <div className="context-card">
          <span className="context-label">DISTANCE</span>
          <span className="context-value">
            <MapPin size={12} /> {distance} km
          </span>
        </div>
        <div className="context-card">
          <span className="context-label">TIME</span>
          <span className="context-value">
            <Clock size={12} /> ~{totalMins} min
          </span>
        </div>
      </div>

      {/* Side-by-Side 2-Column Subgrid: Why Recommended + Taste Match */}
      <div className="panel-why-taste-grid">
        {/* "Why Recommended?" Section (PRD Section 6 - P0 Feature) */}
        <div className="panel-section why-recommended-card">
          <div className="section-title-row">
            <Sparkles size={14} className="title-icon spark-icon" />
            <h3 className="panel-section-title">WHY RECOMMENDED?</h3>
          </div>
          <ul className="why-list">
            {whyRecommended.slice(0, 4).map((reason, idx) => (
              <li key={idx} className="why-item">
                <CheckCircle2 size={14} className="why-check-icon" />
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Taste Match Breakdown (PRD Section 14) */}
        <div className="panel-section taste-match-card">
          <div className="section-title-row justify-between">
            <span className="panel-section-title">TASTE MATCH</span>
            <span className="match-score-badge">{tasteMatch.totalScore}%</span>
          </div>
          <div className="taste-factors-list">
            {tasteMatch.factors.map((factor, idx) => (
              <div key={idx} className="factor-row">
                <div className="factor-label-bar">
                  <span>{factor.label}</span>
                  <span>{factor.percentage}%</span>
                </div>
                <div className="factor-progress-bg">
                  <div
                    className="factor-progress-fill"
                    style={{ width: `${factor.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Restaurant Card (PRD Section 9) */}
      <div className="panel-section restaurant-info-card">
        <div className="restaurant-top-row">
          <div className="restaurant-meta">
            <span className="restaurant-label">RESTAURANT</span>
            <h4 className="restaurant-name">{partnerName}</h4>
            <p className="restaurant-address">{partnerAddress}</p>
          </div>
          <div className="restaurant-rating-badge">
            <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
            <span>{partnerRating}</span>
          </div>
        </div>
        <div className="restaurant-status-row">
          <span className="status-pill open-now">● Open Now</span>
          <span className="status-pill">{distance} km away</span>
        </div>
      </div>

      {/* Primary Actions (PRD Section 8) */}
      <div className="panel-actions-group">
        <div className="actions-main-row">
          <Link
            to={`/dish/${dishId}`}
            className="panel-btn panel-btn-primary"
            onClick={(e) => {
              try {
                const user = JSON.parse(localStorage.getItem('auth_user'));
                if (!user) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('open_auth_prompt', { detail: { actionName: 'view dish details & order' } }));
                }
              } catch {}
            }}
          >
            View Dish
          </Link>
          <Link
            to={partnerId ? `/food-partner/${partnerId}` : '#'}
            className="panel-btn panel-btn-secondary"
            onClick={(e) => {
              try {
                const user = JSON.parse(localStorage.getItem('auth_user'));
                if (!user) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('open_auth_prompt', { detail: { actionName: 'view restaurant profiles' } }));
                }
              } catch {}
            }}
          >
            <Store size={13} /> Restaurant
          </Link>
        </div>

        <div className="actions-sub-row">
          <Link
            to={`/map?partnerId=${partnerId}`}
            className="panel-btn panel-btn-outline"
            onClick={(e) => {
              try {
                const user = JSON.parse(localStorage.getItem('auth_user'));
                if (!user) {
                  e.preventDefault();
                  window.dispatchEvent(new CustomEvent('open_auth_prompt', { detail: { actionName: 'get directions' } }));
                }
              } catch {}
            }}
          >
            <Navigation size={13} /> Directions
          </Link>
          <button
            onClick={() => {
              try {
                const user = JSON.parse(localStorage.getItem('auth_user'));
                if (!user) {
                  window.dispatchEvent(new CustomEvent('open_auth_prompt', { detail: { actionName: 'save favorite dishes' } }));
                  return;
                }
              } catch {}
              if (onSave) onSave(item);
            }}
            className={`panel-btn panel-btn-outline ${item.isSaved ? 'active-saved' : ''}`}
          >
            <Bookmark size={13} fill={item.isSaved ? 'currentColor' : 'none'} />
            {item.isSaved ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={() => {
              try {
                const user = JSON.parse(localStorage.getItem('auth_user'));
                if (!user) {
                  window.dispatchEvent(new CustomEvent('open_auth_prompt', { detail: { actionName: 'add dishes to food trails' } }));
                  return;
                }
              } catch {}
              if (onAddToTrail) onAddToTrail(item);
            }}
            className="panel-btn panel-btn-outline"
          >
            <Compass size={13} /> + Trail
          </button>
        </div>
      </div>
    </div>
  );
};

export default FoodDecisionPanel;
