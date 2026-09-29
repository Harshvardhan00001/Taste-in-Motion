import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import {
  BarChart3,
  TrendingUp,
  Eye,
  PlayCircle,
  Zap,
  Navigation,
  Bookmark,
  Heart,
  Store,
  RefreshCw,
  Search,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import '../../styles/partner-analytics.css';

const PartnerAnalytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('vcr'); // 'vcr' | 'views' | 'saves' | 'directions'

  const activePartnerId = searchParams.get('partnerId') || '';

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = 'http://localhost:3000/api/partner/analytics';
      if (activePartnerId) {
        url += `?partnerId=${activePartnerId}`;
      }
      const res = await axios.get(url, { withCredentials: true });
      setAnalyticsData(res.data);
    } catch (err) {
      console.error('Error fetching partner analytics:', err);
      setError('Unable to load analytics. Please ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [activePartnerId]);

  const handlePartnerChange = (e) => {
    const newId = e.target.value;
    if (newId) {
      setSearchParams({ partnerId: newId });
    } else {
      setSearchParams({});
    }
  };

  const partner = analyticsData?.partner;
  const kpis = analyticsData?.kpis;
  const funnel = analyticsData?.funnel || [];
  const dailyTrend = analyticsData?.dailyTrend || [];
  const contentPerformance = analyticsData?.contentPerformance || [];
  const allPartners = analyticsData?.allPartners || [];

  // Filter and sort content
  const filteredContent = contentPerformance
    .filter((item) => {
      const q = searchQuery.toLowerCase();
      return (
        item.dishName?.toLowerCase().includes(q) ||
        item.cuisine?.toLowerCase().includes(q) ||
        item.title?.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      if (sortBy === 'vcr') return b.vcr - a.vcr;
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'saves') return b.saves - a.saves;
      if (sortBy === 'directions') return b.directions - a.directions;
      return 0;
    });

  // Calculate max values for bar chart scaling
  const maxTrendViews = Math.max(...dailyTrend.map((d) => d.views), 10);
  const maxTrendIntent = Math.max(...dailyTrend.map((d) => d.intentActions), 5);

  return (
    <div className="analytics-cockpit">
      {/* Header */}
      <header className="cockpit-header">
        <div className="cockpit-header__inner">
          <div className="cockpit-kicker-row">
            <div className="cockpit-kicker">
              <BarChart3 size={13} /> RESTAURANT PARTNER COCKPIT
            </div>

            {/* Restaurant Switcher */}
            {allPartners.length > 0 && (
              <div className="partner-select-wrap">
                <span className="partner-select-label">Partner View:</span>
                <select
                  className="partner-select-dropdown"
                  value={partner?.id || ''}
                  onChange={handlePartnerChange}
                >
                  {allPartners.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.city || 'Delhi NCR'})
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="cockpit-title-row">
            <div>
              <h1 className="cockpit-restaurant-name">
                {partner?.name || 'Restaurant Performance Cockpit'}
              </h1>
              <div className="cockpit-restaurant-meta">
                <span>📍 {partner?.address || partner?.city || 'Delhi NCR'}</span>
                <span>⭐ {partner?.rating || 4.5} rating</span>
                <span>🍽️ {partner?.totalMeals || 450} lifetime orders</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <div className="cockpit-period-switcher">
                <button
                  className={`period-btn ${selectedPeriod === '7d' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('7d')}
                >
                  Last 7 Days
                </button>
                <button
                  className={`period-btn ${selectedPeriod === '30d' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('30d')}
                >
                  Last 30 Days
                </button>
                <button
                  className={`period-btn ${selectedPeriod === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedPeriod('all')}
                >
                  All Time
                </button>
              </div>

              <button
                className="period-btn"
                onClick={fetchAnalytics}
                title="Refresh Analytics"
                style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="cockpit-content">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
            Aggregating telemetry events and calculating conversion funnels...
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: '#f87171' }}>
            <AlertCircle size={32} style={{ margin: '0 auto 12px' }} />
            <p>{error}</p>
          </div>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="kpi-grid">
              {/* KPI 1: Impressions & Views */}
              <div className="kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Total Video Views</span>
                  <div className="kpi-card__icon-box views">
                    <Eye size={18} />
                  </div>
                </div>
                <div className="kpi-card__value">{kpis?.totalViews?.toLocaleString()}</div>
                <div className="kpi-card__sub">
                  <span className="trend-badge-positive">
                    <TrendingUp size={12} /> +18.4%
                  </span>
                  <span>vs previous period</span>
                </div>
              </div>

              {/* KPI 2: Video Completion Rate */}
              <div className="kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Video Completion (VCR)</span>
                  <div className="kpi-card__icon-box vcr">
                    <PlayCircle size={18} />
                  </div>
                </div>
                <div className="kpi-card__value">{kpis?.vcrPercentage}%</div>
                <div className="kpi-card__sub">
                  <span className="trend-badge-positive">Top 10%</span>
                  <span>retention in your neighborhood</span>
                </div>
              </div>

              {/* KPI 3: High-Intent Actions */}
              <div className="kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Intent Conversion</span>
                  <div className="kpi-card__icon-box intent">
                    <Zap size={18} />
                  </div>
                </div>
                <div className="kpi-card__value">{kpis?.intentConversionRate}%</div>
                <div className="kpi-card__sub">
                  <span>{kpis?.totalHighIntentActions} high-intent user interactions</span>
                </div>
              </div>

              {/* KPI 4: Footfall Intent */}
              <div className="kpi-card">
                <div className="kpi-card__top">
                  <span className="kpi-card__label">Direct Footfall Intent</span>
                  <div className="kpi-card__icon-box footfall">
                    <Navigation size={18} />
                  </div>
                </div>
                <div className="kpi-card__value">
                  {kpis?.totalDirections + kpis?.totalSaves + kpis?.totalTrailAdds}
                </div>
                <div className="kpi-card__sub">
                  <span>Directions, Saves & Trail Inclusions</span>
                </div>
              </div>
            </div>

            {/* Middle Section: Funnel & 7-Day Trend Chart */}
            <div className="analytics-mid-grid">
              {/* Funnel Panel */}
              <div className="dashboard-panel">
                <div className="panel-header-row">
                  <h3 className="panel-title">
                    <Zap size={16} color="#ff5722" /> Full-Funnel Video Conversion
                  </h3>
                  <span className="panel-tag">ATTENTION DROP-OFF</span>
                </div>

                <div className="funnel-container">
                  {funnel.map((step, idx) => (
                    <div key={idx} className="funnel-step">
                      <div className="funnel-step__meta">
                        <span className="funnel-step__title">
                          {idx + 1}. {step.stage}
                        </span>
                        <span className="funnel-step__numbers">
                          {step.count.toLocaleString()} ({step.percentage}%)
                        </span>
                      </div>

                      <div className="funnel-bar-bg">
                        <div
                          className={`funnel-bar-fill stage-${idx}`}
                          style={{ width: `${Math.min(100, step.percentage)}%` }}
                        />
                      </div>
                      <span className="funnel-step__sub">{step.subtext}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 7-Day Trend Chart */}
              <div className="dashboard-panel">
                <div className="panel-header-row">
                  <h3 className="panel-title">
                    <TrendingUp size={16} color="#38bdf8" /> 7-Day Performance Velocity
                  </h3>
                  <span className="panel-tag">VIEWS VS FOOTFALL INTENT</span>
                </div>

                <div className="trend-bars-container">
                  {dailyTrend.map((d, idx) => {
                    const viewsHeight = Math.max(12, Math.round((d.views / maxTrendViews) * 140));
                    const intentHeight = Math.max(8, Math.round((d.intentActions / maxTrendIntent) * 120));

                    return (
                      <div key={idx} className="trend-col">
                        <div className="trend-bar-pair">
                          <div
                            className="trend-bar views"
                            style={{ height: `${viewsHeight}px` }}
                            title={`Views: ${d.views}`}
                          />
                          <div
                            className="trend-bar intent"
                            style={{ height: `${intentHeight}px` }}
                            title={`High-Intent Actions: ${d.intentActions}`}
                          />
                        </div>
                        <span className="trend-day-label">{d.day}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="trend-legend-row">
                  <div>
                    <span className="legend-dot" style={{ background: '#38bdf8' }} /> Video Views
                  </div>
                  <div>
                    <span className="legend-dot" style={{ background: '#ff5722' }} /> High-Intent Actions
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Content Performance Matrix */}
            <div className="content-matrix-panel">
              <div className="matrix-controls-row">
                <div>
                  <h3 className="panel-title" style={{ marginBottom: 4 }}>
                    Dish & Video Engagement Matrix
                  </h3>
                  <p style={{ color: '#94a3b8', fontSize: '0.82rem', margin: 0 }}>
                    Granular breakdown of retention, completion rate, and intent generated per food item.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    className="matrix-search-box"
                    placeholder="Search dishes or cuisines..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />

                  <select
                    className="matrix-search-box"
                    style={{ minWidth: '150px', cursor: 'pointer' }}
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="vcr">Sort: VCR (High to Low)</option>
                    <option value="views">Sort: Total Views</option>
                    <option value="saves">Sort: Saves</option>
                    <option value="directions">Sort: Directions</option>
                  </select>
                </div>
              </div>

              {filteredContent.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '36px 0', color: '#94a3b8' }}>
                  No food videos match your filter.
                </div>
              ) : (
                <div className="matrix-table-wrap">
                  <table className="matrix-table">
                    <thead>
                      <tr>
                        <th>Food Item & Video</th>
                        <th>Views</th>
                        <th>Video Completion Rate</th>
                        <th>Saves</th>
                        <th>Directions</th>
                        <th>Performance Tier</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredContent.map((item) => (
                        <tr key={item.id}>
                          {/* Dish preview */}
                          <td>
                            <div className="dish-cell-wrap">
                              <video
                                src={item.videoUrl}
                                className="dish-cell-thumb"
                                muted
                                playsInline
                              />
                              <div className="dish-cell-meta">
                                <span className="dish-cell-name">{item.dishName}</span>
                                <span className="dish-cell-cuisine">{item.cuisine}</span>
                              </div>
                            </div>
                          </td>

                          {/* Views */}
                          <td>
                            <strong>{item.views.toLocaleString()}</strong>
                          </td>

                          {/* VCR */}
                          <td>
                            <div className="vcr-cell">
                              <div className="vcr-val-row">
                                <span style={{ color: item.vcr >= 60 ? '#10b981' : '#fbbf24' }}>
                                  {item.vcr}%
                                </span>
                                <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                  {item.completions} completions
                                </span>
                              </div>
                              <div className="vcr-progress-bg">
                                <div
                                  className="vcr-progress-fill"
                                  style={{
                                    width: `${item.vcr}%`,
                                    background:
                                      item.vcr >= 65
                                        ? '#10b981'
                                        : item.vcr >= 50
                                        ? '#38bdf8'
                                        : '#fbbf24'
                                  }}
                                />
                              </div>
                            </div>
                          </td>

                          {/* Saves */}
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Bookmark size={12} color="#ff784e" /> {item.saves}
                            </span>
                          </td>

                          {/* Directions */}
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <Navigation size={12} color="#38bdf8" /> {item.directions}
                            </span>
                          </td>

                          {/* Performance badge */}
                          <td>
                            <span className={`status-pill-badge ${item.badgeClass}`}>
                              {item.badge}
                            </span>
                          </td>

                          {/* Actions */}
                          <td>
                            {item.dishId ? (
                              <Link to={`/dish/${item.dishId}`} className="action-link-btn">
                                View Dish <ArrowUpRight size={11} style={{ display: 'inline' }} />
                              </Link>
                            ) : (
                              <Link to="/" className="action-link-btn">
                                View Feed
                              </Link>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default PartnerAnalytics;
