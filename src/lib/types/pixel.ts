export type PixelEventType = 'form_submit' | 'pending_payment' | 'checkout_complete';

export interface PixelEventData {
  user_email?: string;
  user_id?: string;
  session_id?: string;
  amount?: number;
  product_count?: number;
  [key: string]: any;  // Allow additional fields
}

export interface TrackEventPayload {
  event_type: PixelEventType;
  user_email?: string;
  user_id?: string;
  session_id?: string;
  event_data?: PixelEventData;
  page_url?: string;
}

export interface PixelEvent {
  id: string;
  event_type: PixelEventType;
  user_email: string | null;
  user_id: string | null;
  session_id: string | null;
  event_data: PixelEventData | null;
  created_at: string;
  page_url: string | null;
}

export interface EventAnalytics {
  total_form_submit: number;
  total_pending_payment: number;
  total_checkout_complete: number;
  form_to_pending_rate: number;
  pending_to_checkout_rate: number;
  overall_conversion_rate: number;
  events_by_date: Array<{
    date: string;
    form_submit: number;
    pending_payment: number;
    checkout_complete: number;
  }>;
}
