import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  Compass,
  Sparkles,
  MapPin,
  Clock,
  Navigation,
  Trash2,
  Share2,
  Plus,
  Route,
  ChevronRight,
  Utensils,
  Check,
  X
} from 'lucide-react';
import '../../styles/trails.css';

const FoodTrails = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState('curated'); // 'curated' | 'my' | 'all'
  const [trails, setTrails] = useState([]);
  const [selectedTrail, setSelectedTrail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTrailTitle, setNewTrailTitle] = useState('');
  const [newTrailDesc, setNewTrailDesc] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem('auth_user') || 'null');
    } catch {
      return null;
    }
  })();

  // Fetch trails based on active tab
  useEffect(() => {
    const fetchTrails = async () => {
      try {
        setIsLoading(true);
        let url = 'http://localhost:3000/api/trails';
        if (activeTab === 'curated') {
          url += '?filter=curated';
        } else if (activeTab === 'my') {
          url += `?filter=my&userId=${currentUser?._id || ''}`;
        }

        const res = await axios.get(url, { withCredentials: true });
        const list = res.data.trails || [];
        setTrails(list);

        // Check if query param trailId exists
        const queryTrailId = searchParams.get('trailId');
        if (queryTrailId) {
          const matched = list.find((t) => t._id === queryTrailId);
          if (matched) {
            setSelectedTrail(matched);
          } else {
            // Fetch directly by id if not in current tab list
            try {
              const singleRes = await axios.get(`http://localhost:3000/api/trails/${queryTrailId}`);
              if (singleRes.data.trail) {
                setSelectedTrail(singleRes.data.trail);
              } else if (list.length > 0) {
                setSelectedTrail(list[0]);
              }
            } catch {
              if (list.length > 0) setSelectedTrail(list[0]);
            }
          }
        } else if (list.length > 0) {
          setSelectedTrail(list[0]);
        } else {
          setSelectedTrail(null);
        }
      } catch (err) {
        console.error('Error fetching trails:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrails();
  }, [activeTab]);

  const handleSelectTrail = (trail) => {
    setSelectedTrail(trail);
    setSearchParams({ trailId: trail._id });
  };

  const handleCreateTrail = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      window.dispatchEvent(
        new CustomEvent('open_auth_prompt', {
          detail: { actionName: 'create custom food trails' }
        })
      );
      setIsCreateModalOpen(false);
      return;
    }

    if (!newTrailTitle.trim()) return;

    try {
      const res = await axios.post(
        'http://localhost:3000/api/trails',
        {
          title: newTrailTitle.trim(),
          description: newTrailDesc.trim(),
          isPublic: true
        },
        { withCredentials: true }
      );

      const created = res.data.trail;
      setTrails((prev) => [created, ...prev]);
      setSelectedTrail(created);
      setIsCreateModalOpen(false);
      setNewTrailTitle('');
      setNewTrailDesc('');
      setActionNotice('Food trail created! Start adding stops from reels or dish pages.');
      setTimeout(() => setActionNotice(''), 4000);
    } catch (err) {
      console.error('Failed to create trail:', err);
    }
  };

  const handleRemoveStop = async (stopIndex) => {
    if (!selectedTrail) return;
    try {
      const res = await axios.delete(
        `http://localhost:3000/api/trails/${selectedTrail._id}/stops/${stopIndex}`,
        { withCredentials: true }
      );
      const updated = res.data.trail;
      setSelectedTrail(updated);
      setTrails((prev) => prev.map((t) => (t._id === updated._id ? updated : t)));
      setActionNotice('Stop removed. Route and budget recalculated.');
      setTimeout(() => setActionNotice(''), 3000);
    } catch (err) {
      console.error('Failed to remove stop:', err);
    }
  };

  const handleShareTrail = () => {
    if (!selectedTrail) return;
    const shareUrl = `${window.location.origin}/trails?trailId=${selectedTrail._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  return (
    <div className="trails-page">
      {/* Hero Header */}
      <section className="trails-hero">
        <div className="trails-hero__inner">
          <div className="trails-kicker">
            <Route size={14} /> MULTI-STOP FOOD TRAILS
          </div>
          <h1 className="trails-title">Curated Food Crawls & Crawl Creator</h1>
          <p className="trails-subtitle">
            Plan multi-course culinary adventures across Delhi NCR. Watch dynamic route calculations,
            price budgets, and timing update seamlessly as you customize stops.
          </p>

          <div className="trails-header-actions">
            <div className="trails-tabs">
              <button
                className={`trails-tab-btn ${activeTab === 'curated' ? 'active' : ''}`}
                onClick={() => setActiveTab('curated')}
              >
                <Sparkles size={14} /> Curated Crawls
              </button>
              <button
                className={`trails-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
                onClick={() => setActiveTab('all')}
              >
                <Compass size={14} /> Community Crawls
              </button>
              {currentUser && (
                <button
                  className={`trails-tab-btn ${activeTab === 'my' ? 'active' : ''}`}
                  onClick={() => setActiveTab('my')}
                >
                  <Utensils size={14} /> My Food Trails
                </button>
              )}
            </div>

            <button
              className="create-trail-btn"
              onClick={() => {
                if (!currentUser) {
                  window.dispatchEvent(
                    new CustomEvent('open_auth_prompt', {
                      detail: { actionName: 'create custom food trails' }
                    })
                  );
                } else {
                  setIsCreateModalOpen(true);
                }
              }}
            >
              <Plus size={16} /> Create Custom Crawl
            </button>
          </div>
        </div>
      </section>

      {/* Action Notification Toast */}
      {actionNotice && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '16px auto 0',
            padding: '10px 20px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            borderRadius: '10px',
            color: '#10b981',
            fontSize: '0.88rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Check size={16} /> {actionNotice}
        </div>
      )}

      {/* Main Grid View */}
      <main className="trails-content">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            Loading food trails & itineraries...
          </div>
        ) : trails.length === 0 ? (
          <div className="trails-empty-card">
            <Compass size={48} className="empty-icon" />
            <h3 style={{ color: '#fff', fontSize: '1.2rem', marginBottom: 6 }}>No trails found</h3>
            <p style={{ margin: '0 0 16px 0' }}>
              {activeTab === 'my'
                ? "You haven't created any custom food crawls yet."
                : 'No trails available in this category.'}
            </p>
            {activeTab === 'my' && (
              <button className="create-trail-btn" onClick={() => setIsCreateModalOpen(true)}>
                <Plus size={16} /> Create Your First Trail
              </button>
            )}
          </div>
        ) : (
          <div className="trails-grid">
            {/* Left Column: Trails List */}
            <div className="trails-sidebar">
              <span className="sidebar-title">
                {activeTab === 'curated'
                  ? 'Handpicked Crawls'
                  : activeTab === 'my'
                  ? 'Your Created Trails'
                  : 'All Public Crawls'}
              </span>

              {trails.map((trail) => {
                const isSelected = selectedTrail?._id === trail._id;
                return (
                  <div
                    key={trail._id}
                    className={`trail-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelectTrail(trail)}
                  >
                    <div className="trail-card__image-wrap">
                      <img
                        src={
                          trail.coverImage ||
                          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80'
                        }
                        alt={trail.title}
                        className="trail-card__image"
                      />
                      {trail.isCurated && (
                        <div className="trail-card__curated-badge">
                          <Sparkles size={11} /> CURATED
                        </div>
                      )}
                    </div>

                    <div className="trail-card__body">
                      <h3 className="trail-card__title">{trail.title}</h3>
                      <p className="trail-card__desc">{trail.description}</p>

                      <div className="trail-card__metrics">
                        <div className="trail-card__metric-item">
                          <span>📍</span>
                          <span>{trail.stops?.length || 0} stops</span>
                        </div>
                        <div className="trail-card__metric-item">
                          <span>💰</span>
                          <span>₹{trail.totalEstimatedCost || 0}</span>
                        </div>
                        <div className="trail-card__metric-item">
                          <span>⏱️</span>
                          <span>~{trail.totalEstimatedDurationMinutes || 0}m</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Active Trail Timeline View */}
            {selectedTrail && (
              <div className="trail-detail-view">
                {/* Header */}
                <div className="detail-header">
                  <div className="detail-header__top">
                    <div>
                      <h2 className="detail-header__title">{selectedTrail.title}</h2>
                      <p className="detail-header__desc">{selectedTrail.description}</p>
                    </div>

                    <div className="detail-header__actions">
                      <button
                        className="icon-action-btn"
                        onClick={handleShareTrail}
                        title="Copy link to crawl"
                      >
                        {copiedLink ? <Check size={14} color="#10b981" /> : <Share2 size={14} />}
                        {copiedLink ? 'Copied' : 'Share'}
                      </button>
                      <Link to="/map" className="icon-action-btn" title="View stops on interactive map">
                        <Navigation size={14} /> Full Map
                      </Link>
                    </div>
                  </div>

                  {/* Dynamic Summary Dashboard */}
                  <div className="trail-summary-dashboard">
                    <div className="summary-metric-box">
                      <span className="summary-metric-label">TOTAL STOPS</span>
                      <span className="summary-metric-val">
                        {selectedTrail.stops?.length || 0}
                      </span>
                    </div>

                    <div className="summary-metric-box">
                      <span className="summary-metric-label">TOTAL BUDGET</span>
                      <span className="summary-metric-val price">
                        ₹{selectedTrail.totalEstimatedCost || 0}
                      </span>
                    </div>

                    <div className="summary-metric-box">
                      <span className="summary-metric-label">ROUTE DISTANCE</span>
                      <span className="summary-metric-val distance">
                        {selectedTrail.totalDistanceKm || 0} km
                      </span>
                    </div>

                    <div className="summary-metric-box">
                      <span className="summary-metric-label">EST. CRAWL TIME</span>
                      <span className="summary-metric-val duration">
                        ~{selectedTrail.totalEstimatedDurationMinutes || 0}m
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Stops */}
                <div className="timeline-stops-container">
                  {(!selectedTrail.stops || selectedTrail.stops.length === 0) ? (
                    <div className="trails-empty-card" style={{ padding: '36px 16px' }}>
                      <p>No stops added to this food trail yet.</p>
                      <p style={{ fontSize: '0.85rem' }}>
                        Browse reels on the Home feed or inspect dishes to click <strong>+ Trail</strong>!
                      </p>
                    </div>
                  ) : (
                    <div className="timeline-stops-list">
                      {selectedTrail.stops.map((stop, idx) => {
                        const dish = stop.dish;
                        const restaurant = stop.restaurant;
                        const courseType = stop.courseType || 'starter';

                        return (
                          <React.Fragment key={stop._id || idx}>
                            <div className="timeline-stop-card">
                              {/* Order Badge */}
                              <div className="stop-order-badge">{stop.order || idx + 1}</div>

                              {/* Details */}
                              <div className="stop-details-col">
                                <div className="stop-top-meta">
                                  <span className={`course-badge ${courseType}`}>
                                    {courseType}
                                  </span>
                                  {dish?.cuisine && (
                                    <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                      • {dish.cuisine}
                                    </span>
                                  )}
                                </div>

                                <Link
                                  to={dish?._id ? `/dish/${dish._id}` : '#'}
                                  className="stop-dish-name"
                                >
                                  {dish?.name || 'Curated Specialty'}
                                </Link>

                                <div className="stop-restaurant-meta">
                                  <MapPin size={12} />
                                  <span className="stop-restaurant-name">
                                    {restaurant?.name || 'Local Favorite'}
                                  </span>
                                  {restaurant?.address && (
                                    <span>({restaurant.address})</span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: 4 }}>
                                  <span className="stop-price-tag">₹{stop.estimatedPrice}</span>
                                  <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                                    ⏱️ ~{stop.prepTimeMinutes}m prep
                                  </span>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="stop-actions-col">
                                {restaurant?._id && (
                                  <Link
                                    to={`/map?partnerId=${restaurant._id}`}
                                    className="stop-dir-btn"
                                    title="View location on map"
                                  >
                                    <Navigation size={12} /> Route
                                  </Link>
                                )}

                                {/* Remove stop allowed for non-curated or creator */}
                                {!selectedTrail.isCurated && (
                                  <button
                                    className="stop-remove-btn"
                                    onClick={() => handleRemoveStop(idx)}
                                    title="Remove this stop"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Transit connector to next stop */}
                            {idx < selectedTrail.stops.length - 1 && (
                              <div className="transit-connector">
                                <span className="transit-chip">
                                  🚶 Transit to Stop {idx + 2}
                                </span>
                              </div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Trail Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="trail-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">
                <Plus size={20} color="#ff5722" /> Create Custom Food Crawl
              </h3>
              <button
                className="modal-close-btn"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateTrail}>
              <div className="modal-body">
                <div>
                  <label className="form-group-label">Trail Title</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. South Delhi Momos & Chaat Crawl"
                    value={newTrailTitle}
                    onChange={(e) => setNewTrailTitle(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-group-label">Description (Optional)</label>
                  <textarea
                    className="input-text"
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="Tell friends what this food crawl is all about..."
                    value={newTrailDesc}
                    onChange={(e) => setNewTrailDesc(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setIsCreateModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary-submit">
                  Create Food Trail
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodTrails;
