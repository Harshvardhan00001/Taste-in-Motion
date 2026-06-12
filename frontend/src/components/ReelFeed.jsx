import React, { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import '../styles/reels.css'

const ReelFeed = ({ items = [], onLike, onSave, emptyMessage = 'No videos yet.' }) => {
  const videoRefs = useRef(new Map())

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
    if (!el) { videoRefs.current.delete(id); return }
    videoRefs.current.set(id, el)
  }

  // Safe number helper — prevents NaN from undefined fields
  const n = (val) => (isNaN(Number(val)) ? 0 : Number(val ?? 0))

  if (items.length === 0) {
    return (
      <div className="reels-page">
        <div className="empty-state">
          <p>{emptyMessage}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="reels-page">
      <div className="reels-feed" role="list">
        {items.map((item) => (
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

              {/* Right-side actions */}
              <div className="reel-actions">
                {/* Like */}
                <div className="reel-action-group">
                  <button
                    onClick={onLike ? () => onLike(item) : undefined}
                    className={`reel-action ${item.isLiked ? 'liked' : ''}`}
                    aria-label="Like"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24"
                      fill={item.isLiked ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 22l7.8-8.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
                    </svg>
                  </button>
                  <span className="reel-action__count">{n(item.likeCount)}</span>
                </div>

                {/* Save */}
                <div className="reel-action-group">
                  <button
                    onClick={onSave ? () => onSave(item) : undefined}
                    className={`reel-action ${item.isSaved ? 'saved' : ''}`}
                    aria-label="Save"
                  >
                    <svg width="22" height="22" viewBox="0 0 24 24"
                      fill={item.isSaved ? 'currentColor' : 'none'}
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
                    </svg>
                  </button>
                  <span className="reel-action__count">{n(item.savesCount)}</span>
                </div>

                {/* Comments */}
                <div className="reel-action-group">
                  <button className="reel-action" aria-label="Comments">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2"
                      strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
                    </svg>
                  </button>
                  <span className="reel-action__count">
                    {n(item.commentsCount ?? (Array.isArray(item.comments) ? item.comments.length : 0))}
                  </span>
                </div>
              </div>

              {/* Bottom content */}
              <div className="reel-content">
                <p className="reel-description" title={item.description}>
                  {item.description}
                </p>
                {item.foodPartner && (
                  <Link className="reel-btn" to={`/food-partner/${item.foodPartner}`}>
                    Visit store
                  </Link>
                )}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

export default ReelFeed