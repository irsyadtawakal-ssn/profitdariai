import { TrackEventPayload, PixelEventType, PixelEventData } from '@/lib/types/pixel';

// Get atau create session ID
const getSessionId = (): string => {
  if (typeof window === 'undefined') return '';

  let sessionId = sessionStorage.getItem('pixel_session_id');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('pixel_session_id', sessionId);
  }
  return sessionId;
};

export const trackPixelEvent = async (
  eventType: PixelEventType,
  data?: PixelEventData
) => {
  if (typeof window === 'undefined') return; // SSR check

  try {
    const payload: TrackEventPayload = {
      event_type: eventType,
      session_id: getSessionId(),
      event_data: data || {},
      page_url: typeof window !== 'undefined' ? window.location.href : '',
    };

    // Send ke API
    await fetch('/api/events/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    console.error('Failed to track pixel event:', error);
  }
};

export const trackFormSubmit = async (formData?: PixelEventData) => {
  await trackPixelEvent('form_submit', {
    ...formData,
    timestamp: new Date().toISOString(),
  });
};

export const trackPendingPayment = async (paymentData?: PixelEventData) => {
  await trackPixelEvent('pending_payment', {
    ...paymentData,
    timestamp: new Date().toISOString(),
  });
};

export const trackCheckoutComplete = async (checkoutData?: PixelEventData) => {
  await trackPixelEvent('checkout_complete', {
    ...checkoutData,
    timestamp: new Date().toISOString(),
  });
};
