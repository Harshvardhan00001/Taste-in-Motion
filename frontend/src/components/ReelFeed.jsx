import React, { useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Bookmark, MapPin, Compass, Clock, Flame, UtensilsCrossed, Star } from 'lucide-react'
import '../styles/reels.css'

const ReelFeed = ({
  items = [],
  onLike,
  onSave,
  onAddToTrail,
  emptyMessage = 'No food reels available.'
}) => {
  const videoRefs = useRef(new Map())
  const navigate = useNavigate()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target
          if (!(video instanceof HTMLVideoElement)) return
          if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            video.play().catch(() => {})
          } else {
            video.pause()
          }
        })
      },
      { threshold: [0, 0.25, 0.6, 0.9, 1] }
    )
    videoRefs.current.forEach((vid) => observer.observe(vid))
    return () => observer.disconnect()
  }, [items])

  const setVideoRef = (id) => (el) => {
    if (!el) {
      videoRefs.current.delete(id)
      return
    }
    videoRefs.current.set(id, el)
  }

  const n = (val) => (isNaN(Number(val)) ? 0 : Number(val ?? 0))

  if (items.length === 0) {
    return (
      <div className="reels-page">
        <div className="empty-state">
          <UtensilsCrossed size={36} className="empty-icon" />
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list">
        {items.map((item) => {
          const dishId = item.dish?._id || item.dish || item._id
          const partnerId = item.foodPartner?._id || item.foodPartner
          const partnerName = item.foodPartner?.name || 'Local Kitchen'
          const dishName = item.dish?.name || item.name
          const price = item.price ?? 220
          const prepTime = item.prepTimeMinutes ?? 20
          const distance = item.distanceKm ?? 1.2
          const reasonBadge = item.reasonBadge || '⚡ Context Match'
          const spiceLevel = item.dish?.spiceLevel

          return (
            <section key={item._id} className="reel" role="listitem">
              <video
                ref={setVideoRef(item._id)}
                className="reel-video"
                src={item.video}
                muted
                playsInline
                loop
                preload="metadata"
              />

              <div className="reel-overlay">
                <div className="reel-overlay-gradient" aria-hidden="true" />

                {/* Right-side quick action buttons */}
                <div className="reel-actions">
                  {/* Like Button */}
                  <div className="reel-action-group">
                    <button
                      onClick={onLike ? () => onLike(item) : undefined}
                      className={`reel-action ${item.isLiked ? 'liked' : ''}`}
                      aria-label="Like"
                      title="Like Reel"
                    >
                      <Heart size={22} fill={item.isLiked ? 'currentColor' : 'none'} />
                    </button>
                    <span className="reel-action__count">{n(item.likeCount)}</span>
                  </div>

                  {/* Bookmark / Save Button */}
                  <div className="reel-action-group">
                    <button
                      onClick={onSave ? () => onSave(item) : undefined}
                      className={`reel-action ${item.isSaved ? 'saved' : ''}`}
                      aria-label="Save"
                      title="Save to Collection"
                    >
                      <Bookmark size={22} fill={item.isSaved ? 'currentColor' : 'none'} />
                    </button>
                    <span className="reel-action__count">{n(item.savesCount)}</span>
                  </div>

                  {/* Add to Food Trail Action (PRD 6.2 & 6.7) */}
                  <div className="reel-action-group">
                    <button
                      onClick={
                        onAddToTrail
                          ? () => onAddToTrail(item)
                          : () => navigate(`/trails?addDish=${dishId}`)
                      }
                      className="reel-action trail-btn"
                      aria-label="Add to Trail"
                      title="Add to Food Trail"
                    >
                      <Compass size={22} />
                    </button>
                    <span className="reel-action__count">Trail</span>
                  </div>
                </div>

                {/* Bottom Decision & Context Card (PRD 6.2) */}
                <div className="reel-content">
                  {/* Context-Aware Reason Badge (PRD FR-06) */}
                  <div className="reel-reason-badge">
                    <span>{reasonBadge}</span>
                  </div>

                  {/* Dish Title & Price Pill */}
                  <div className="reel-dish-header">
                    <h2 className="reel-dish-title">{dishName}</h2>
                    <span className="reel-price-pill">₹{price}</span>
                  </div>

                  {/* Situational Context Tags: Distance, Prep Time, Spice */}
                  <div className="reel-context-tags">
                    <span className="context-chip">
                      <Clock size={12} /> {prepTime} mins
                    </span>
                    <span className="context-chip">
                      <MapPin size={12} /> {distance} km
                    </span>
                    {spiceLevel && (
                      <span className={`context-chip spice-${spiceLevel}`}>
                        <Flame size={12} /> {spiceLevel}
                      </span>
                    )}
                  </div>

                  {/* Restaurant Info */}
                  <div className="reel-partner-row">
                    <Link
                      to={partnerId ? `/food-partner/${partnerId}` : '#'}
                      className="partner-link"
                    >
                      <span className="partner-name">{partnerName}</span>
                      {item.foodPartner?.rating && (
                        <span className="partner-rating">
                          <Star size={11} fill="#fbbf24" stroke="#fbbf24" />
                          {item.foodPartner.rating}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Description */}
                  {item.description && (
                    <p className="reel-description" title={item.description}>
                      {item.description}
                    </p>
                  )}

                  {/* Primary Decision Actions (PRD 6.2: View Dish, Compare, Directions) */}
                  <div className="reel-decision-actions">
                    <Link to={`/dish/${dishId}`} className="decision-btn decision-btn-primary">
                      View Dish
                    </Link>
                    <Link to={`/dish/${dishId}?tab=compare`} className="decision-btn decision-btn-secondary">
                      Compare Stores
                    </Link>
                    <Link to={`/map?partnerId=${partnerId}`} className="decision-btn decision-btn-outline" title="Directions on Map">
                      <MapPin size={14} /> Map
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

export default ReelFeed