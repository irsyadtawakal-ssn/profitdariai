import { createClient } from '@supabase/supabase-js';
import { EventAnalytics } from '@/lib/types/pixel';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '7', 10);

    // Query events dari N hari terakhir
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data: events, error } = await supabase
      .from('pixel_events')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database query error:', error);
      return Response.json({ error: 'Failed to fetch events' }, { status: 500 });
    }

    // Calculate analytics
    const analytics = calculateAnalytics(events || []);

    return Response.json({ success: true, data: analytics }, { status: 200 });
  } catch (error) {
    console.error('Analytics error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function calculateAnalytics(events: any[]): EventAnalytics {
  const formSubmits = events.filter(e => e.event_type === 'form_submit').length;
  const pendingPayments = events.filter(e => e.event_type === 'pending_payment').length;
  const checkoutCompletes = events.filter(e => e.event_type === 'checkout_complete').length;

  // Calculate conversion rates
  const formToPendingRate = formSubmits > 0 ? (pendingPayments / formSubmits) * 100 : 0;
  const pendingToCheckoutRate = pendingPayments > 0 ? (checkoutCompletes / pendingPayments) * 100 : 0;
  const overallConversionRate = formSubmits > 0 ? (checkoutCompletes / formSubmits) * 100 : 0;

  // Group events by date
  const eventsByDate: Record<string, any> = {};
  events.forEach(event => {
    const date = new Date(event.created_at).toISOString().split('T')[0];
    if (!eventsByDate[date]) {
      eventsByDate[date] = { date, form_submit: 0, pending_payment: 0, checkout_complete: 0 };
    }
    eventsByDate[date][event.event_type]++;
  });

  return {
    total_form_submit: formSubmits,
    total_pending_payment: pendingPayments,
    total_checkout_complete: checkoutCompletes,
    form_to_pending_rate: Math.round(formToPendingRate * 100) / 100,
    pending_to_checkout_rate: Math.round(pendingToCheckoutRate * 100) / 100,
    overall_conversion_rate: Math.round(overallConversionRate * 100) / 100,
    events_by_date: Object.values(eventsByDate).sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    ),
  };
}
