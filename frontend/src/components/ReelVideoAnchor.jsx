import React, { useRef, useState, useEffect } from 'react';
import { Heart, Bookmark, Play, Pause, Volume2, VolumeX, Sparkles } from 'lucide-react';
import useTelemetry from '../hooks/useTelemetry';

const ReelVideoAnchor = ({ item, onLike, onSave }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const { trackEvent } = useTelemetry();

  const completedLoggedRef = useRef(false);
  const startTimeRef = useRef(Date.now());

  const dishName = item.dish?.name || item.name;
  const price = item.price ?? 220;
  const distance = item.distanceKm ?? 1.2;
  const prepTime = item.prepTimeMinutes ?? 20;
  const reasonBadge = item.reasonBadge || '⚡ Context Match';
  const videoId = item._id;

  useEffect(() => {
    completedLoggedRef.current = false;
    startTimeRef.current = Date.now();

    // Log VIDEO_VIEW event
    trackEvent('VIDEO_VIEW', videoId, 'video', { budget: price });

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }

    return () => {
      // Cleanup on unmount or item change: check if skipped (<3s dwell time)
      const dwellSeconds = (Date.now() - startTimeRef.current) / 1000;
      if (dwellSeconds < 3 && !completedLoggedRef.current) {
        trackEvent('VIDEO_SKIP', videoId, 'video', { dwellTimeSeconds: dwellSeconds });
      }
    };
  }, [videoId, item.video, trackEvent, price]);

  const handleTimeUpdate = () => {
    if (!videoRef.current || completedLoggedRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0 && currentTime / duration >= 0.8) {
      completedLoggedRef.current = true;
      trackEvent('VIDEO_COMPLETE', videoId, 'video', {
        dwellTimeSeconds: currentTime,
        watchPercentage: Math.round((currentTime / duration) * 100)
      });
    }
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const n = (val) => (isNaN(Number(val)) ? 0 : Number(val ?? 0));

  return (
    <div className="reel-video-anchor" onClick={togglePlay}>
      <video
        ref={videoRef}
        src={item.video}
        className="anchor-video-element"
        playsInline
        muted={isMuted}
        loop
        preload="metadata"
        onTimeUpdate={handleTimeUpdate}
      />

      {/* Floating Gradient */}
      <div className="anchor-gradient-overlay" />

      {/* Top Floating Badge */}
      <div className="anchor-top-bar">
        <div className="anchor-reason-chip">
          <Sparkles size={12} />
          <span>{reasonBadge}</span>
        </div>
        <button className="anchor-icon-btn" onClick={toggleMute} aria-label={isMuted ? 'Unmute' : 'Mute'}>
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>
      </div>

      {/* Center Play Overlay when paused */}
      {!isPlaying && (
        <div className="anchor-center-play">
          <div className="center-play-disc">
            <Play size={24} className="play-icon-offset" />
          </div>
        </div>
      )}

      {/* Clean Minimal Overlay (PRD Section 3) */}
      <div className="anchor-bottom-overlay">
        <div className="anchor-minimal-info">
          <h3 className="anchor-dish-name">{dishName}</h3>
          <div className="anchor-pills-row">
            <span className="anchor-pill anchor-price-pill">₹{price}</span>
            <span className="anchor-pill">{distance} km</span>
            <span className="anchor-pill">~{prepTime}m</span>
          </div>
        </div>

        {/* Action icons on side */}
        <div className="anchor-action-buttons" onClick={(e) => e.stopPropagation()}>
          <div className="anchor-action-item">
            <button
              onClick={(e) => {
                e.stopPropagation();
                try {
                  const user = JSON.parse(localStorage.getItem('auth_user'));
                  if (!user) {
                    window.dispatchEvent(new CustomEvent('open_auth_prompt', { detail: { actionName: 'like dishes' } }));
                    return;
                  }
                } catch {}
                trackEvent('LIKE', videoId, 'video');
                if (onLike) onLike(item);
              }}
              className={`anchor-action-btn ${item.isLiked ? 'liked' : ''}`}
              aria-label="Like"
            >
              <Heart size={18} fill={item.isLiked ? 'currentColor' : 'none'} />
            </button>
            <span className="anchor-count">{n(item.likeCount)}</span>
          </div>

          <div className="anchor-action-item">
            <button
              onClick={(e) => {
                e.stopPropagation();
                try {
                  const user = JSON.parse(localStorage.getItem('auth_user'));
                  if (!user) {
                    window.dispatchEvent(new CustomEvent('open_auth_prompt', { detail: { actionName: 'save favorite dishes' } }));
                    return;
                  }
                } catch {}
                trackEvent('SAVE', videoId, 'video');
                if (onSave) onSave(item);
              }}
              className={`anchor-action-btn ${item.isSaved ? 'saved' : ''}`}
              aria-label="Save"
            >
              <Bookmark size={18} fill={item.isSaved ? 'currentColor' : 'none'} />
            </button>
            <span className="anchor-count">{n(item.savesCount)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReelVideoAnchor;
