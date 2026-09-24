import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReelContextPresentation from '../../components/ReelContextPresentation';
import ImHungryModal from '../../components/ImHungryModal';
import AuthRequiredModal from '../../components/AuthRequiredModal';
import AddToTrailModal from '../../components/AddToTrailModal';
import { Sparkles, X, Zap } from 'lucide-react';
import '../../styles/home-filter-bar.css';

const Home = () => {
  const [videos, setVideos] = useState([]);
  const [isHungryModalOpen, setIsHungryModalOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auth Modal State for Guest Users
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authActionName, setAuthActionName] = useState('perform this action');

  // Trail Modal State
  const [isTrailModalOpen, setIsTrailModalOpen] = useState(false);
  const [selectedTrailItem, setSelectedTrailItem] = useState(null);

  // Helper check if user is logged in
  const checkIsLoggedIn = () => {
    try {
      const user = JSON.parse(localStorage.getItem('auth_user'));
      return !!user;
    } catch {
      return false;
    }
  };

  // Fetch personalized 6-factor discovery feed
  const fetchDefaultFeed = async () => {
    try {
      setIsLoading(true);
      const guestSessionId = localStorage.getItem('guest_session_id') || '';
      const response = await axios.get(
        `http://localhost:3000/api/discovery/feed?guestSessionId=${encodeURIComponent(guestSessionId)}`,
        { withCredentials: true }
      );
      setVideos(response.data.foodItems ?? []);
    } catch (err) {
      console.error("Discovery feed error, falling back to basic food feed:", err.response?.status);
      try {
        const fallbackRes = await axios.get("http://localhost:3000/api/food", { withCredentials: true });
        setVideos(fallbackRes.data.foodItems ?? []);
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDefaultFeed();
  }, []);

  // Listen for custom trigger from TopNav ("⚡ I'm Hungry" button)
  useEffect(() => {
    const handleOpen = () => setIsHungryModalOpen(true);
    window.addEventListener('open_im_hungry', handleOpen);
    return () => window.removeEventListener('open_im_hungry', handleOpen);
  }, []);

  // Listen for custom auth prompt events from interactive buttons
  useEffect(() => {
    const handleAuthPrompt = (e) => {
      setAuthActionName(e.detail?.actionName || 'perform this action');
      setIsAuthModalOpen(true);
    };
    window.addEventListener('open_auth_prompt', handleAuthPrompt);
    return () => window.removeEventListener('open_auth_prompt', handleAuthPrompt);
  }, []);

  // Submit "I'm Hungry" context filters to backend
  const handleApplyFilters = async (filters) => {
    try {
      setIsLoading(true);
      setActiveFilters(filters);
      const response = await axios.post(
        "http://localhost:3000/api/discovery/im-hungry",
        filters,
        { withCredentials: true }
      );
      setVideos(response.data.foodItems ?? []);
    } catch (err) {
      console.error("Context search error:", err.response?.status);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear context filters and restore default feed
  const handleClearFilters = () => {
    setActiveFilters(null);
    fetchDefaultFeed();
  };

  async function likeVideo(item) {
    if (!checkIsLoggedIn()) {
      setAuthActionName('like dishes');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/like",
        { foodId: item._id },
        { withCredentials: true }
      );
      const delta = response.data.like ? 1 : -1;
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? { ...v, likeCount: Math.max(0, (v.likeCount ?? 0) + delta), isLiked: response.data.like }
            : v
        )
      );
    } catch (err) {
      console.error("Like error:", err.response?.status);
    }
  }

  async function saveVideo(item) {
    if (!checkIsLoggedIn()) {
      setAuthActionName('save favorite dishes');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:3000/api/food/save",
        { foodId: item._id },
        { withCredentials: true }
      );
      const delta = response.data.save ? 1 : -1;
      setVideos((prev) =>
        prev.map((v) =>
          v._id === item._id
            ? { ...v, savesCount: Math.max(0, (v.savesCount ?? 0) + delta), isSaved: response.data.save }
            : v
        )
      );
    } catch (err) {
      console.error("Save error:", err.response?.status);
    }
  }

  const handleOpenAddToTrail = (item) => {
    if (!checkIsLoggedIn()) {
      setAuthActionName('add dishes to food trails');
      setIsAuthModalOpen(true);
      return;
    }
    setSelectedTrailItem(item);
    setIsTrailModalOpen(true);
  };

  return (
    <div className="home-feed-wrapper">
      {/* Active Context Filter Bar */}
      {activeFilters && (
        <div className="active-filter-bar">
          <div className="filter-bar-left">
            <span className="active-filter-title">
              <Zap size={14} className="active-zap" /> ACTIVE CONTEXT:
            </span>
            <div className="active-filter-chips">
              <span className="filter-chip">💰 Max ₹{activeFilters.budget}</span>
              <span className="filter-chip">⏱️ ~{activeFilters.timeAvailable}m</span>
              <span className="filter-chip">📍 {activeFilters.maxDistanceKm} km</span>
              {activeFilters.cravings && activeFilters.cravings.map((c) => (
                <span key={c} className="filter-chip craving">
                  🔥 {c}
                </span>
              ))}
            </div>
          </div>
          <button onClick={handleClearFilters} className="clear-filters-btn">
            <X size={14} /> Clear Filters
          </button>
        </div>
      )}

      {/* Main Reel + Context-Aware Presentation */}
      <ReelContextPresentation
        items={videos}
        onLike={likeVideo}
        onSave={saveVideo}
        onAddToTrail={handleOpenAddToTrail}
        emptyMessage={
          activeFilters
            ? "No food recommendations match your active budget or craving filters."
            : "No food recommendations available."
        }
      />

      {/* Context Collector Modal */}
      <ImHungryModal
        isOpen={isHungryModalOpen}
        onClose={() => setIsHungryModalOpen(false)}
        onSubmitFilters={handleApplyFilters}
        initialFilters={activeFilters}
      />

      {/* Food Trail Modal */}
      <AddToTrailModal
        isOpen={isTrailModalOpen}
        onClose={() => setIsTrailModalOpen(false)}
        item={selectedTrailItem}
      />

      {/* Auth Prompt Modal for Guest Users */}
      <AuthRequiredModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        actionName={authActionName}
      />
    </div>
  );
};

export default Home;