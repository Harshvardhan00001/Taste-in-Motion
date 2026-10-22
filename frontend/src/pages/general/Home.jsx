import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ReelContextPresentation from '../../components/ReelContextPresentation';
import ImHungryModal from '../../components/ImHungryModal';
import AuthRequiredModal from '../../components/AuthRequiredModal';
import AddToTrailModal from '../../components/AddToTrailModal';
import { Flame, X, SlidersHorizontal } from 'lucide-react';
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

  // Helper to get guest likes & saves
  const getGuestLikes = () => {
    try { return JSON.parse(localStorage.getItem('guest_likes') || '[]'); } catch { return []; }
  };
  const getGuestSaves = () => {
    try { return JSON.parse(localStorage.getItem('guest_saves') || '[]'); } catch { return []; }
  };

  const mergeGuestInteractions = (items) => {
    const guestLikes = new Set(getGuestLikes());
    const guestSaves = new Set(getGuestSaves());
    return items.map((v) => ({
      ...v,
      isLiked: !!v.isLiked || guestLikes.has(v._id),
      isSaved: !!v.isSaved || guestSaves.has(v._id)
    }));
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
      setVideos(mergeGuestInteractions(response.data.foodItems ?? []));
    } catch (err) {
      console.error("Discovery feed error, falling back to basic food feed:", err.response?.status);
      try {
        const fallbackRes = await axios.get("http://localhost:3000/api/food", { withCredentials: true });
        setVideos(mergeGuestInteractions(fallbackRes.data.foodItems ?? []));
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
      setVideos(mergeGuestInteractions(response.data.foodItems ?? []));
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
    const isCurrentlyLiked = !!item.isLiked;
    const newLiked = !isCurrentlyLiked;
    const delta = newLiked ? 1 : -1;

    // 1. Optimistic immediate UI update
    setVideos((prev) =>
      prev.map((v) =>
        v._id === item._id
          ? {
              ...v,
              likeCount: Math.max(0, (v.likeCount ?? 0) + delta),
              isLiked: newLiked
            }
          : v
      )
    );

    // 2. Persist in guest localStorage
    try {
      const guestLikes = new Set(getGuestLikes());
      if (newLiked) {
        guestLikes.add(item._id);
      } else {
        guestLikes.delete(item._id);
      }
      localStorage.setItem('guest_likes', JSON.stringify([...guestLikes]));
    } catch {}

    // 3. Sync to backend database if logged in
    if (checkIsLoggedIn()) {
      try {
        await axios.post(
          "http://localhost:3000/api/food/like",
          { foodId: item._id },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Backend like sync failed (kept local state):", err.response?.status);
      }
    }
  }

  async function saveVideo(item) {
    const isCurrentlySaved = !!item.isSaved;
    const newSaved = !isCurrentlySaved;
    const delta = newSaved ? 1 : -1;

    // 1. Optimistic immediate UI update
    setVideos((prev) =>
      prev.map((v) =>
        v._id === item._id
          ? {
              ...v,
              savesCount: Math.max(0, (v.savesCount ?? 0) + delta),
              isSaved: newSaved
            }
          : v
      )
    );

    // 2. Persist in guest localStorage
    try {
      const guestSaves = new Set(getGuestSaves());
      if (newSaved) {
        guestSaves.add(item._id);
      } else {
        guestSaves.delete(item._id);
      }
      localStorage.setItem('guest_saves', JSON.stringify([...guestSaves]));
    } catch {}

    // 3. Sync to backend database if logged in
    if (checkIsLoggedIn()) {
      try {
        await axios.post(
          "http://localhost:3000/api/food/save",
          { foodId: item._id },
          { withCredentials: true }
        );
      } catch (err) {
        console.error("Backend save sync failed (kept local state):", err.response?.status);
      }
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
              <SlidersHorizontal size={13} className="active-filter-icon" /> FILTERED TASTE:
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
        onOpenHungry={() => setIsHungryModalOpen(true)}
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