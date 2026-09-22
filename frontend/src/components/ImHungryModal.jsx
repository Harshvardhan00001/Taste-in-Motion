import React, { useState } from 'react';
import { X, Sparkles, Zap, Clock, MapPin, IndianRupee, RotateCcw } from 'lucide-react';
import '../styles/im-hungry.css';

const BUDGET_PRESETS = [
  { label: '₹150 Quick Bite', value: 150 },
  { label: '₹300 Standard', value: 300 },
  { label: '₹600 Treat', value: 600 },
  { label: 'No Limit', value: 1500 }
];

const TIME_PRESETS = [
  { label: '15m Grab & Go', value: 15 },
  { label: '30m Fast Meal', value: 30 },
  { label: '45m Dine Out', value: 45 },
  { label: '60m+ Relaxed', value: 60 }
];

const DISTANCE_PRESETS = [
  { label: '1 km Walking', value: 1 },
  { label: '3 km Bike', value: 3 },
  { label: '5 km Drive', value: 5 },
  { label: '10 km City', value: 10 }
];

const CRAVING_CHIPS = [
  '🔥 Spicy',
  '🧀 Cheesy',
  '🍲 Comfort',
  '🥗 Healthy',
  '🍗 Crispy',
  '🍰 Sweet',
  '🍜 Street Food',
  '🌶️ North Indian',
  '🍕 Italian'
];

const ImHungryModal = ({ isOpen, onClose, onSubmitFilters, initialFilters = null }) => {
  const [budget, setBudget] = useState(initialFilters?.budget || 300);
  const [timeAvailable, setTimeAvailable] = useState(initialFilters?.timeAvailable || 45);
  const [maxDistanceKm, setMaxDistanceKm] = useState(initialFilters?.maxDistanceKm || 5);
  const [selectedCravings, setSelectedCravings] = useState(initialFilters?.cravings || ['Spicy']);

  if (!isOpen) return null;

  const toggleCraving = (craving) => {
    const rawTag = craving.replace(/[^\w\s]/gi, '').trim();
    if (selectedCravings.includes(rawTag)) {
      setSelectedCravings(selectedCravings.filter((c) => c !== rawTag));
    } else {
      setSelectedCravings([...selectedCravings, rawTag]);
    }
  };

  const handleReset = () => {
    setBudget(300);
    setTimeAvailable(45);
    setMaxDistanceKm(5);
    setSelectedCravings([]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmitFilters({
      budget: Number(budget),
      timeAvailable: Number(timeAvailable),
      maxDistanceKm: Number(maxDistanceKm),
      cravings: selectedCravings
    });
    onClose();
  };

  return (
    <div className="im-hungry-overlay" onClick={onClose}>
      <div className="im-hungry-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="im-hungry-header">
          <div className="header-title-row">
            <div className="header-badge">
              <Zap size={14} className="zap-icon" />
              <span>SITUATIONAL CONTEXT</span>
            </div>
            <h2 className="im-hungry-title">⚡ I'm Hungry Right Now</h2>
          </div>
          <button className="im-hungry-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="im-hungry-form">
          {/* 1. Budget Selector */}
          <div className="im-hungry-section">
            <div className="section-label-bar">
              <span className="section-label">
                <IndianRupee size={14} /> MAX BUDGET
              </span>
              <span className="section-value-tag">₹{budget}</span>
            </div>

            <div className="range-slider-container">
              <input
                type="range"
                min="100"
                max="1000"
                step="50"
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="im-hungry-slider"
              />
              <div className="slider-ticks">
                <span>₹100</span>
                <span>₹500</span>
                <span>₹1000+</span>
              </div>
            </div>

            <div className="preset-pills-grid">
              {BUDGET_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setBudget(p.value)}
                  className={`preset-pill ${budget === p.value ? 'active' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Time Available Selector */}
          <div className="im-hungry-section">
            <div className="section-label-bar">
              <span className="section-label">
                <Clock size={14} /> TIME AVAILABLE (PREP + TRANSIT)
              </span>
              <span className="section-value-tag">~{timeAvailable} mins</span>
            </div>
            <div className="preset-pills-grid">
              {TIME_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setTimeAvailable(p.value)}
                  className={`preset-pill ${timeAvailable === p.value ? 'active' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Distance Radius Selector */}
          <div className="im-hungry-section">
            <div className="section-label-bar">
              <span className="section-label">
                <MapPin size={14} /> DISTANCE RADIUS
              </span>
              <span className="section-value-tag">{maxDistanceKm} km</span>
            </div>
            <div className="preset-pills-grid">
              {DISTANCE_PRESETS.map((p) => (
                <button
                  type="button"
                  key={p.label}
                  onClick={() => setMaxDistanceKm(p.value)}
                  className={`preset-pill ${maxDistanceKm === p.value ? 'active' : ''}`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Cravings / Mood Chips */}
          <div className="im-hungry-section">
            <div className="section-label-bar">
              <span className="section-label">
                <Sparkles size={14} /> CRAVINGS & MOOD (MULTI-SELECT)
              </span>
            </div>
            <div className="cravings-chips-wrap">
              {CRAVING_CHIPS.map((chip) => {
                const rawTag = chip.replace(/[^\w\s]/gi, '').trim();
                const isSelected = selectedCravings.includes(rawTag);
                return (
                  <button
                    type="button"
                    key={chip}
                    onClick={() => toggleCraving(chip)}
                    className={`craving-chip ${isSelected ? 'selected' : ''}`}
                  >
                    {chip}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="im-hungry-footer">
            <button type="button" onClick={handleReset} className="reset-btn">
              <RotateCcw size={14} /> Reset
            </button>

            <button type="submit" className="submit-hungry-btn">
              <Zap size={16} /> ⚡ Find What to Eat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ImHungryModal;
