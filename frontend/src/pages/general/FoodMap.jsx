import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  MapPin,
  Clock,
  Flame,
  Star,
  Play,
  Navigation,
  Sparkles,
  X,
  Compass,
  Crosshair,
  Layers,
  Utensils
} from 'lucide-react';
import '../../styles/map.css';

// Default center: Delhi Connaught Place
const DEFAULT_CENTER = { lat: 28.6315, lng: 77.2167 };

const CATEGORIES = [
  { id: 'all', label: 'All Places' },
  { id: 'spicy', label: '🔥 Spicy' },
  { id: 'fast', label: '⏱️ Fast (<15m)' },
  { id: 'budget', label: '💰 Under ₹250' },
  { id: 'veg', label: '🥗 Pure Veg' }
];

const FoodMap = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const partnerIdParam = searchParams.get('partnerId');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersLayerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const [pins, setPins] = useState([]);
  const [selectedPin, setSelectedPin] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [userLocation, setUserLocation] = useState(DEFAULT_CENTER);
  const [loading, setLoading] = useState(true);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Create Map instance
    const map = L.map(mapContainerRef.current, {
      center: [DEFAULT_CENTER.lat, DEFAULT_CENTER.lng],
      zoom: 13,
      zoomControl: true,
      attributionControl: true
    });

    // Dark Matter CartoDB Basemap
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://openstreetmap.org">OSM</a>',
      maxZoom: 19,
      subdomains: 'abcd'
    }).addTo(map);

    // Layer group for marker pins
    markersLayerRef.current = L.layerGroup().addTo(map);

    // User location marker
    const userPulseIcon = L.divIcon({
      className: 'user-pulse-container',
      html: '<div class="user-pulse-marker"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    userMarkerRef.current = L.marker([DEFAULT_CENTER.lat, DEFAULT_CENTER.lng], {
      icon: userPulseIcon,
      zIndexOffset: 500
    }).addTo(map);

    // Click anywhere on map to deselect
    map.on('click', () => {
      setSelectedPin(null);
    });

    mapInstanceRef.current = map;

    // Try getting user's real browser location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
          if (userMarkerRef.current) {
            userMarkerRef.current.setLatLng([loc.lat, loc.lng]);
          }
        },
        () => {
          // Fallback gracefully to default center
        },
        { timeout: 5000 }
      );
    }

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Fetch Nearby Map Pins from Backend
  const fetchMapPins = useCallback(async () => {
    try {
      setLoading(true);
      let url = `http://localhost:3000/api/discovery/map/nearby?lat=${userLocation.lat}&lng=${userLocation.lng}&category=${activeCategory}`;
      const response = await axios.get(url, { withCredentials: true });
      const fetchedPins = response.data.pins ?? [];
      setPins(fetchedPins);

      // If partnerId parameter is present in URL, auto-select that pin
      if (partnerIdParam && fetchedPins.length > 0) {
        const matchingPin = fetchedPins.find(p => p.partnerId?.toString() === partnerIdParam);
        if (matchingPin) {
          setSelectedPin(matchingPin);
          if (mapInstanceRef.current && matchingPin.coordinates) {
            mapInstanceRef.current.flyTo([matchingPin.coordinates[1], matchingPin.coordinates[0]], 15, {
              duration: 1.2
            });
          }
        }
      }
    } catch (err) {
      console.error('Error fetching map pins:', err);
    } finally {
      setLoading(false);
    }
  }, [userLocation, activeCategory, partnerIdParam]);

  useEffect(() => {
    fetchMapPins();
  }, [fetchMapPins]);

  // Render Marker Pins on Map
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    pins.forEach((pin) => {
      if (!pin.coordinates || pin.coordinates.length < 2) return;
      const [lng, lat] = pin.coordinates;
      const isSelected = selectedPin?.partnerId === pin.partnerId;

      const emoji =
        pin.topDish?.spiceLevel === 'spicy' || pin.topDish?.spiceLevel === 'extra-spicy'
          ? '🔥'
          : pin.topDish?.isVegetarian
          ? '🥗'
          : '🍽️';
      const price = pin.topDish?.price || 220;

      const icon = L.divIcon({
        className: 'custom-food-pin-container',
        html: `
          <div class="food-pin-wrapper ${isSelected ? 'active-pin' : ''}">
            <div class="food-pin-pill">
              <span class="pin-emoji">${emoji}</span>
              <span class="pin-price">₹${price}</span>
            </div>
            <div class="food-pin-arrow"></div>
          </div>
        `,
        iconSize: [80, 42],
        iconAnchor: [40, 42]
      });

      const marker = L.marker([lat, lng], { icon });

      marker.on('click', (e) => {
        L.DomEvent.stopPropagation(e);
        setSelectedPin(pin);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo([lat, lng]);
        }
      });

      marker.addTo(markersLayerRef.current);
    });
  }, [pins, selectedPin]);

  // Recenter to user location
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 14, { duration: 0.8 });
    }
  };

  return (
    <div className="food-map-page">
      {/* Top Filter Chips Bar */}
      <div className="map-header-bar">
        <div className="map-filter-scroll">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              className={`map-filter-btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button className="map-locate-btn" onClick={handleRecenter} title="My Location" aria-label="My Location">
          <Crosshair size={18} />
        </button>
      </div>

      {/* Main Map Container */}
      <div ref={mapContainerRef} className="map-canvas-container" />

      {/* Floating Bottom Preview Card when a Pin is selected */}
      {selectedPin && (
        <div className="map-preview-drawer">
          <button
            className="drawer-close-btn"
            onClick={() => setSelectedPin(null)}
            aria-label="Close Preview"
          >
            <X size={16} />
          </button>

          <div className="drawer-content-grid">
            {/* Thumbnail / Media Box */}
            <div className="drawer-media-box">
              <img
                src={
                  selectedPin.topDish?.imageUrl ||
                  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80'
                }
                alt={selectedPin.topDish?.name || 'Dish preview'}
                className="drawer-media-img"
              />
              {selectedPin.topDish?.videoUrl && (
                <div className="drawer-play-pill">
                  <Play size={9} fill="currentColor" /> Reel
                </div>
              )}
            </div>

            {/* Information Column */}
            <div className="drawer-info-col">
              <div>
                <div className="drawer-kicker">
                  <span>{selectedPin.topDish?.cuisine || 'STREET FOOD'}</span>
                  {selectedPin.topDish?.isSpecialty && <span>• SIGNATURE</span>}
                </div>

                <div className="drawer-title-row">
                  <h3 className="drawer-dish-title">
                    {selectedPin.topDish?.name || 'Featured Dish'}
                  </h3>
                  <span className="drawer-price-pill">
                    ₹{selectedPin.topDish?.price || 220}
                  </span>
                </div>

                <div className="drawer-meta-chips">
                  <span className="drawer-meta-item">
                    <MapPin size={11} /> {selectedPin.distanceKm} km
                  </span>
                  <span className="drawer-meta-item">
                    <Clock size={11} /> ~{selectedPin.topDish?.prepTimeMinutes || 20}m prep
                  </span>
                  {selectedPin.topDish?.spiceLevel && (
                    <span className="drawer-meta-item">
                      <Flame size={11} /> {selectedPin.topDish.spiceLevel}
                    </span>
                  )}
                </div>
              </div>

              {/* Partner Name & Rating */}
              <div className="drawer-partner-row">
                <span className="drawer-partner-name">{selectedPin.restaurantName}</span>
                <span className="drawer-partner-rating">
                  <Star size={11} fill="#fbbf24" stroke="#fbbf24" /> {selectedPin.rating}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="drawer-actions-row">
            {selectedPin.topDish?.dishId ? (
              <Link
                to={`/dish/${selectedPin.topDish.dishId}`}
                className="drawer-btn drawer-btn-primary"
              >
                View Dish
              </Link>
            ) : (
              <button
                className="drawer-btn drawer-btn-primary"
                onClick={() => navigate('/')}
              >
                Explore Reels
              </button>
            )}

            {selectedPin.topDish?.dishId && (
              <Link
                to={`/dish/${selectedPin.topDish.dishId}?tab=compare`}
                className="drawer-btn drawer-btn-secondary"
              >
                Compare Stores
              </Link>
            )}

            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedPin.coordinates[1]},${selectedPin.coordinates[0]}`}
              target="_blank"
              rel="noopener noreferrer"
              className="drawer-btn drawer-btn-icon"
              title="Google Maps Directions"
              aria-label="Google Maps Directions"
            >
              <Navigation size={15} />
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default FoodMap;
