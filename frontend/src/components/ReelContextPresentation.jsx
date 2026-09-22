import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, UtensilsCrossed, Sparkles } from 'lucide-react';
import ReelVideoAnchor from './ReelVideoAnchor';
import FoodDecisionPanel from './FoodDecisionPanel';
import '../styles/reel-context-presentation.css';

const ReelContextPresentation = ({
  items = [],
  onLike,
  onSave,
  onAddToTrail,
  emptyMessage = 'No food recommendations match your current criteria.'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Keyboard Navigation (Arrow keys)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (items.length === 0) return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        nextReel();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        prevReel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [items, currentIndex]);

  // Reset index ONLY if item IDs actually change (e.g. "I'm Hungry" filter applied), NOT on like/save state toggles
  const itemsKey = items.map((i) => i._id || i.id).join(',');
  const prevItemsKeyRef = useRef(itemsKey);

  useEffect(() => {
    if (prevItemsKeyRef.current !== itemsKey) {
      prevItemsKeyRef.current = itemsKey;
      setCurrentIndex(0);
    }
  }, [itemsKey]);

  const nextReel = () => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % items.length);
  };

  const prevReel = () => {
    if (items.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  };

  if (items.length === 0) {
    return (
      <div className="reel-presentation-page">
        <div className="presentation-empty-state">
          <UtensilsCrossed size={40} className="empty-icon" />
          <p>{emptyMessage}</p>
        </div>
      </div>
    );
  }

  const currentItem = items[currentIndex];
  const formattedIndex = String(currentIndex + 1).padStart(2, '0');
  const formattedTotal = String(items.length).padStart(2, '0');

  return (
    <div className="reel-presentation-page">
      <div className="presentation-container">
        {/* Navigation Bar (PRD Section 10: 01 / 10, Synchronized Switching) */}
        <div className="presentation-nav-bar">
          <div className="nav-bar-left">
            <span className="brand-discovery-tag">
              <Sparkles size={13} /> DISCOVERY EXPERIENCE
            </span>
            <button
              className="presentation-hungry-btn"
              onClick={() => window.dispatchEvent(new Event('open_im_hungry'))}
              title="Open situational context collector"
            >
              ⚡ I'm Hungry
            </button>
          </div>

          <div className="nav-bar-center">
            <span className="reel-counter-text">
              <strong className="current-idx">{formattedIndex}</strong>
              <span className="counter-slash">/</span>
              <span className="total-idx">{formattedTotal}</span>
            </span>

            <div className="nav-dots-row">
              {items.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`presentation-dot ${idx === currentIndex ? 'active' : ''}`}
                  aria-label={`Go to reel ${idx + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="nav-bar-right">
            <button onClick={prevReel} className="reel-arrow-btn" aria-label="Previous reel">
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextReel} className="reel-arrow-btn" aria-label="Next reel">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Master Two-Column Desktop / One-Column Mobile Layout (PRD Section 2 & 17) */}
        <div className="presentation-main-card">
          {/* Mobile-Only Header: Category & Dish Name (PRD Section 17) */}
          <div className="mobile-dish-header">
            <span className="mobile-category-pill">
              {(currentItem.dish?.cuisine || 'STREET FOOD').toUpperCase()}
            </span>
            <h2 className="mobile-dish-title">{currentItem.dish?.name || currentItem.name}</h2>
          </div>

          {/* Left Column: 9:16 Vertical Food Reel (PRD Section 3) */}
          <div className="presentation-left-col">
            <div className="video-anchor-sticky">
              <ReelVideoAnchor
                key={currentItem._id || currentIndex}
                item={currentItem}
                onLike={onLike}
                onSave={onSave}
              />
            </div>
          </div>

          {/* Right Column: Structured Food Information & Decision Panel (PRD Section 4) */}
          <div className="presentation-right-col">
            <FoodDecisionPanel
              key={currentItem._id || currentIndex}
              item={currentItem}
              onLike={onLike}
              onSave={onSave}
              onAddToTrail={onAddToTrail}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelContextPresentation;
