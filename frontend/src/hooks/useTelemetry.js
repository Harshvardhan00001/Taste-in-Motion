import { useCallback } from 'react';
import axios from 'axios';

// Helper to get or create guestSessionId
const getGuestSessionId = () => {
  try {
    let id = localStorage.getItem('guest_session_id');
    if (!id) {
      id = 'guest_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      localStorage.setItem('guest_session_id', id);
    }
    return id;
  } catch {
    return 'guest_fallback_session';
  }
};

export const useTelemetry = () => {
  const trackEvent = useCallback(async (eventType, entityId = null, entityType = 'video', context = {}) => {
    try {
      const guestSessionId = getGuestSessionId();
      await axios.post(
        'http://localhost:3000/api/events',
        {
          eventType,
          entityId,
          entityType,
          guestSessionId,
          context
        },
        { withCredentials: true }
      );
    } catch (err) {
      // Silent telemetry logging error
      console.warn('Telemetry event warning:', eventType, err.response?.status || err.message);
    }
  }, []);

  return { trackEvent, getGuestSessionId };
};

export default useTelemetry;
