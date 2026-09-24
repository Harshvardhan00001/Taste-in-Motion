import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Flame,
  Clock,
  MapPin,
  Star,
  Sparkles,
  Play,
  Navigation,
  CheckCircle2,
  Compass,
  Store,
  Layers,
  TrendingDown,
  Zap,
  Info
} from 'lucide-react';
import AddToTrailModal from '../../components/AddToTrailModal';
import '../../styles/dish-detail.css';

const DishDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const tabParam = searchParams.get('tab') === 'compare' ? 'compare' : 'overview';
  const [activeTab, setActiveTab] = useState(tabParam);

  const [dishData, setDishData] = useState(null);
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isTrailModalOpen, setIsTrailModalOpen] = useState(false);
  const [selectedTrailItem, setSelectedTrailItem] = useState(null);

  // Sync tab with URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  useEffect(() => {
    const fetchDishAndComparison = async () => {
      try {
        setLoading(true);
        const [detailsRes, compareRes] = await Promise.all([
          axios.get(`http://localhost:3000/api/dishes/${id}`, { withCredentials: true }),
          axios.get(`http://localhost:3000/api/dishes/${id}/compare`, { withCredentials: true })
        ]);

        setDishData(detailsRes.data);
        setCompareData(compareRes.data);
      } catch (err) {
        console.error('Error fetching dish details or comparison:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDishAndComparison();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="dish-detail-page">
        <div className="dish-loading-state">
          <div className="dish-spinner" />
          <p>Loading dish profile & multi-restaurant comparisons...</p>
        </div>
      </div>
    );
  }

  if (!dishData || !dishData.dish) {
    return (
      <div className="dish-detail-page">
        <div className="dish-empty-state">
          <h2>Dish Not Found</h2>
          <p>The canonical dish you are looking for does not exist or has been removed.</p>
          <button className="dish-back-btn" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Back to Home
          </button>
        </div>
      </div>
    );
  }

  const { dish, videos = [], priceSummary = {} } = dishData;
  const benchmark = compareData?.benchmark || { minPrice: priceSummary.minPrice || 220, avgPrice: priceSummary.avgPrice || 240, maxPrice: priceSummary.maxPrice || 260 };
  const restaurants = compareData?.restaurants || [];

  return (
    <div className="dish-detail-page">
      {/* Back button */}
      <button className="dish-back-btn" onClick={() => navigate(-1)}>
        <ArrowLeft size={14} /> Back
      </button>

      {/* Hero Showcase Card */}
      <div className="dish-hero-card">
        <div className="hero-banner-inner">
          {/* Media box */}
          <div className="hero-media-wrapper">
            <img
              src={
                dish.imageUrl ||
                'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
              }
              alt={dish.name}
              className="hero-media-img"
            />
            {videos.length > 0 && (
              <button
                className="hero-play-floating-btn"
                onClick={() => navigate('/')}
                title="Watch Video Reel"
              >
                <Play size={12} fill="currentColor" /> Watch Reel
              </button>
            )}
          </div>

          {/* Details column */}
          <div className="hero-details-col">
            <div>
              <div className="hero-kicker-row">
                <span className="hero-category-chip">{dish.cuisine || 'CUISINE'}</span>
                {dish.spiceLevel && (
                  <span className={`hero-spice-chip spice-${dish.spiceLevel}`}>
                    <Flame size={11} /> {dish.spiceLevel.toUpperCase()}
                  </span>
                )}
                {dish.isVegetarian && (
                  <span className="hero-veg-chip">VEGETARIAN</span>
                )}
                <span className="hero-tag-pill">{dish.mealType || 'all-day'}</span>
              </div>

              <h1 className="hero-dish-title">{dish.name}</h1>
              <p className="hero-description">{dish.description}</p>

              {dish.tags && dish.tags.length > 0 && (
                <div className="hero-tags-row">
                  {dish.tags.map((tag, idx) => (
                    <span key={idx} className="hero-tag-pill">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Price & availability summary */}
            <div className="hero-price-summary-bar">
              <div className="summary-price-box">
                <span className="summary-label">PRICE RANGE</span>
                <span className="summary-value">
                  ₹{benchmark.minPrice} - ₹{benchmark.maxPrice}
                </span>
              </div>
              <div className="summary-stores-chip">
                <Store size={14} />
                <span>{restaurants.length} {restaurants.length === 1 ? 'Store' : 'Stores'} Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="dish-tabs-row">
        <button
          className={`dish-tab-btn ${activeTab === 'compare' ? 'active' : ''}`}
          onClick={() => handleTabChange('compare')}
        >
          <Layers size={16} /> Compare Stores ({restaurants.length})
        </button>
        <button
          className={`dish-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => handleTabChange('overview')}
        >
          <Info size={16} /> Overview & Video Reels ({videos.length})
        </button>
      </div>

      {/* Tab 1: Compare Stores */}
      {activeTab === 'compare' && (
        <div className="compare-tab-content">
          {/* City Price Benchmark Card */}
          <div className="benchmark-card">
            <div className="benchmark-top-row">
              <h3 className="benchmark-title">
                <Zap size={16} className="text-orange-500" /> City Price Benchmark
              </h3>
              {benchmark.priceRangeSpread > 0 && (
                <span className="benchmark-spread-pill">
                  ₹{benchmark.priceRangeSpread} Price Spread Across Stores
                </span>
              )}
            </div>

            {/* Visual Gauge Track */}
            <div className="benchmark-gauge-wrapper">
              <div className="benchmark-track-bg">
                <div className="benchmark-track-gradient" />
              </div>
              <div className="benchmark-labels-row">
                <div className="benchmark-point left">
                  <span className="point-label">BEST DEAL</span>
                  <span className="point-val">₹{benchmark.minPrice}</span>
                </div>
                <div className="benchmark-point center">
                  <span className="point-label">CITY AVERAGE</span>
                  <span className="point-val">₹{benchmark.avgPrice}</span>
                </div>
                <div className="benchmark-point right">
                  <span className="point-label">PREMIUM</span>
                  <span className="point-val">₹{benchmark.maxPrice}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Side-by-Side Comparison Cards */}
          <div className="comparison-grid">
            {restaurants.map((item, idx) => (
              <div
                key={idx}
                className={`comparison-card ${item.isBestValue ? 'is-best-value' : ''} ${item.isFastest ? 'is-fastest' : ''}`}
              >
                <div>
                  <div className="comparison-header-row">
                    <div>
                      <h4 className="comp-partner-title">{item.restaurantName}</h4>
                      <p className="comp-address">{item.address}</p>
                    </div>
                    <div className="comp-rating-badge">
                      <Star size={12} fill="#fbbf24" stroke="#fbbf24" />
                      <span>{item.rating}</span>
                    </div>
                  </div>

                  {/* Highlights Badges */}
                  <div className="comp-badges-row">
                    {item.isBestValue && (
                      <span className="comp-badge-pill badge-value">
                        <TrendingDown size={11} /> Best Value
                      </span>
                    )}
                    {item.isFastest && (
                      <span className="comp-badge-pill badge-speed">
                        ⚡ Fastest Prep
                      </span>
                    )}
                    {item.isSpecialty && (
                      <span className="comp-badge-pill badge-signature">
                        <Sparkles size={11} /> Chef's Signature
                      </span>
                    )}
                  </div>

                  {/* Price & Timing Metrics */}
                  <div className="comp-metrics-grid">
                    <div className="metric-block">
                      <span className="metric-title">DISH PRICE</span>
                      <span className="metric-val-price">₹{item.price}</span>
                      <span className="metric-sub">{item.valueTag}</span>
                    </div>

                    <div className="metric-block">
                      <span className="metric-title">ESTIMATED TIME</span>
                      <span className="metric-val-time">
                        <Clock size={13} /> ~{item.estimatedTotalMinutes}m
                      </span>
                      <span className="metric-sub">
                        {item.distanceKm} km • {item.prepTimeMinutes}m prep
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="comp-actions-group">
                  <Link
                    to={`/map?partnerId=${item.restaurantId}`}
                    className="comp-btn comp-btn-primary"
                  >
                    <Navigation size={13} /> View on Map
                  </Link>

                  <button
                    className="comp-btn comp-btn-outline"
                    onClick={() => {
                      try {
                        const user = JSON.parse(localStorage.getItem('auth_user'));
                        if (!user) {
                          window.dispatchEvent(
                            new CustomEvent('open_auth_prompt', {
                              detail: { actionName: 'add dishes to food trails' }
                            })
                          );
                          return;
                        }
                        setSelectedTrailItem({
                          dish: dish,
                          dishId: dish._id,
                          restaurantId: item.restaurantId,
                          restaurantName: item.restaurantName,
                          price: item.price,
                          prepTimeMinutes: item.prepTimeMinutes
                        });
                        setIsTrailModalOpen(true);
                      } catch {
                        navigate('/user/login');
                      }
                    }}
                  >
                    <Compass size={13} /> + Food Trail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Overview & Associated Video Reels */}
      {activeTab === 'overview' && (
        <div className="overview-tab-content">
          <h3 className="text-lg font-bold mb-4 text-white">Video Reels Featuring This Dish</h3>
          {videos.length === 0 ? (
            <p className="text-slate-400">No video reels uploaded for this dish yet.</p>
          ) : (
            <div className="reels-gallery-grid">
              {videos.map((vid) => (
                <div
                  key={vid._id}
                  className="reel-card-item"
                  onClick={() => navigate('/')}
                  title="Watch Reel on Home Feed"
                >
                  <video
                    src={vid.video}
                    className="reel-card-video"
                    muted
                    playsInline
                    preload="metadata"
                  />
                  <div className="reel-card-overlay">
                    <span className="reel-card-partner">{vid.foodPartner?.name || 'Local Kitchen'}</span>
                    <div className="reel-card-stats">
                      <span>❤️ {vid.likeCount || 0}</span>
                      <span>🔖 {vid.savesCount || 0}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add To Trail Modal */}
      <AddToTrailModal
        isOpen={isTrailModalOpen}
        onClose={() => setIsTrailModalOpen(false)}
        item={selectedTrailItem}
      />
    </div>
  );
};

export default DishDetail;
