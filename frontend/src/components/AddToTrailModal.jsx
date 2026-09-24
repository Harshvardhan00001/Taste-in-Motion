import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { X, Compass, Plus, Check, MapPin, Sparkles } from 'lucide-react';
import '../styles/trails.css';

const COURSE_TYPES = [
  { id: 'starter', label: 'Starter', icon: '🥟' },
  { id: 'main', label: 'Main Course', icon: '🍕' },
  { id: 'dessert', label: 'Dessert', icon: '🍰' },
  { id: 'snack', label: 'Snack', icon: '🥨' },
  { id: 'drink', label: 'Beverage', icon: '🥤' }
];

const AddToTrailModal = ({ isOpen, onClose, item, onSuccess }) => {
  const navigate = useNavigate();
  const [trails, setTrails] = useState([]);
  const [selectedTrailId, setSelectedTrailId] = useState('new');
  const [newTrailTitle, setNewTrailTitle] = useState('');
  const [courseType, setCourseType] = useState('starter');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successResult, setSuccessResult] = useState(null);

  // Extract dish and restaurant details safely from reel or detail item
  const dishId = item?.dish?._id || item?.dishId || item?._id;
  const dishName = item?.dish?.name || item?.name || 'Dish Item';
  const restaurantId =
    item?.restaurantId ||
    item?.foodpartner?._id ||
    (typeof item?.foodpartner === 'string' ? item.foodpartner : null) ||
    item?.partner?._id ||
    (typeof item?.partner === 'string' ? item.partner : null);
  const restaurantName =
    item?.foodpartner?.name ||
    item?.partner?.name ||
    item?.restaurantName ||
    'Selected Restaurant';
  const estimatedPrice = item?.price || item?.benchmark?.minPrice || 250;
  const prepTime = item?.prepTimeMinutes || item?.prepTime || 20;

  useEffect(() => {
    if (!isOpen) {
      setSuccessResult(null);
      setErrorMsg('');
      return;
    }

    const user = JSON.parse(localStorage.getItem('auth_user') || 'null');
    if (!user) {
      window.dispatchEvent(
        new CustomEvent('open_auth_prompt', {
          detail: { actionName: 'add dishes to food trails' }
        })
      );
      onClose();
      return;
    }

    // Fetch user's existing trails
    const fetchUserTrails = async () => {
      try {
        const res = await axios.get(
          `http://localhost:3000/api/trails?filter=my&userId=${user._id}`,
          { withCredentials: true }
        );
        const myTrails = res.data.trails || [];
        setTrails(myTrails);
        if (myTrails.length > 0) {
          setSelectedTrailId(myTrails[0]._id);
        } else {
          setSelectedTrailId('new');
        }
      } catch (err) {
        console.error('Error fetching user trails:', err);
      }
    };

    fetchUserTrails();
    setNewTrailTitle(`${user.fullName ? user.fullName.split(' ')[0] : 'My'}'s Epic Food Crawl`);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (selectedTrailId === 'new') {
        if (!newTrailTitle.trim()) {
          setErrorMsg('Please enter a title for your new food trail');
          setIsSubmitting(false);
          return;
        }

        const res = await axios.post(
          'http://localhost:3000/api/trails',
          {
            title: newTrailTitle.trim(),
            description: `A custom curated food trail starting with ${dishName} at ${restaurantName}.`,
            initialStop: {
              dishId,
              restaurantId,
              courseType,
              estimatedPrice,
              prepTimeMinutes: prepTime
            }
          },
          { withCredentials: true }
        );

        setSuccessResult({
          trailId: res.data.trail._id,
          title: res.data.trail.title,
          message: 'Created new food trail & added stop!'
        });
        if (onSuccess) onSuccess(res.data.trail);
      } else {
        const res = await axios.post(
          `http://localhost:3000/api/trails/${selectedTrailId}/stops`,
          {
            dishId,
            restaurantId,
            courseType,
            estimatedPrice,
            prepTimeMinutes: prepTime
          },
          { withCredentials: true }
        );

        setSuccessResult({
          trailId: res.data.trail._id,
          title: res.data.trail.title,
          message: 'Stop successfully added to your trail!'
        });
        if (onSuccess) onSuccess(res.data.trail);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to add stop to food trail.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="trail-modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            <Compass size={20} color="#ff5722" /> Add to Food Trail
          </h3>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {successResult ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                background: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                color: '#10b981'
              }}
            >
              <Check size={28} />
            </div>
            <h4 style={{ fontSize: '1.2rem', fontWeight: 800, margin: '0 0 8px 0', color: '#fff' }}>
              {successResult.message}
            </h4>
            <p style={{ color: '#94a3b8', fontSize: '0.88rem', margin: '0 0 24px 0' }}>
              Added <strong>{dishName}</strong> to "{successResult.title}".
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                className="btn-primary-submit"
                onClick={() => {
                  onClose();
                  navigate(`/trails?trailId=${successResult.trailId}`);
                }}
              >
                View Food Trail Timeline
              </button>
              <button className="btn-secondary" onClick={onClose}>
                Keep Exploring
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="modal-body">
              {/* Dish Preview */}
              <div className="dish-preview-card">
                <Sparkles size={18} color="#ff5722" />
                <div className="dish-preview-info">
                  <span className="dish-preview-name">{dishName}</span>
                  <span className="dish-preview-store">
                    <MapPin size={11} style={{ display: 'inline', marginRight: 4 }} />
                    {restaurantName} • ₹{estimatedPrice}
                  </span>
                </div>
              </div>

              {/* Course Selection */}
              <div>
                <label className="form-group-label">Course Type in Crawl</label>
                <div className="course-options-grid">
                  {COURSE_TYPES.map((course) => (
                    <button
                      key={course.id}
                      type="button"
                      className={`course-option-btn ${courseType === course.id ? 'selected' : ''}`}
                      onClick={() => setCourseType(course.id)}
                    >
                      <span>{course.icon}</span>
                      <span>{course.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Select or Create Trail */}
              <div>
                <label className="form-group-label">Select Destination Trail</label>
                <div className="trail-select-options">
                  <div
                    className={`trail-radio-item ${selectedTrailId === 'new' ? 'selected' : ''}`}
                    onClick={() => setSelectedTrailId('new')}
                  >
                    <div>
                      <span className="trail-radio-title">✨ Create a New Food Trail</span>
                      <div className="trail-radio-stops">Start an itinerary from scratch</div>
                    </div>
                    {selectedTrailId === 'new' && <Check size={16} color="#ff5722" />}
                  </div>

                  {trails.map((t) => (
                    <div
                      key={t._id}
                      className={`trail-radio-item ${selectedTrailId === t._id ? 'selected' : ''}`}
                      onClick={() => setSelectedTrailId(t._id)}
                    >
                      <div>
                        <span className="trail-radio-title">{t.title}</span>
                        <div className="trail-radio-stops">
                          {t.stops?.length || 0} stops • ₹{t.totalEstimatedCost || 0}
                        </div>
                      </div>
                      {selectedTrailId === t._id && <Check size={16} color="#ff5722" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* New Trail Input if 'new' selected */}
              {selectedTrailId === 'new' && (
                <div>
                  <label className="form-group-label">New Trail Name</label>
                  <input
                    type="text"
                    className="input-text"
                    placeholder="e.g. South Delhi Midnight Sweet Tooth Crawl"
                    value={newTrailTitle}
                    onChange={(e) => setNewTrailTitle(e.target.value)}
                    required
                  />
                </div>
              )}

              {errorMsg && (
                <div style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 500 }}>
                  {errorMsg}
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </button>
              <button type="submit" className="btn-primary-submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving Stop...' : 'Add Stop to Crawl'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AddToTrailModal;
