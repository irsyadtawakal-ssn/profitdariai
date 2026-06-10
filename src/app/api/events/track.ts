import { createAdminClient } from '@/lib/supabase/admin';
import { TrackEventPayload } from '@/lib/types/pixel';

export async function POST(request: Request) {
  try {
    const body: TrackEventPayload = await request.json();

    const { event_type, user_email, user_id, session_id, event_data, page_url } = body;

    // Validate event_type
    const validEventTypes = ['form_submit', 'pending_payment', 'checkout_complete'];
    if (!validEventTypes.includes(event_type)) {
      return Response.json(
        { error: 'Invalid event_type' },
        { status: 400 }
      );
    }

    // Create admin client
    const supabase = createAdminClient();

    // Insert ke database
    const { data, error } = await supabase
      .from('pixel_events')
      .insert([
        {
          event_type,
          user_email: user_email || null,
          user_id: user_id || null,
          session_id: session_id || null,
          event_data: event_data || {},
          page_url: page_url || null,
        },
      ])
      .select();

    if (error) {
      console.error('Database insert error:', error);
      return Response.json({ error: 'Failed to track event' }, { status: 500 });
    }

    return Response.json({ success: true, data }, { status: 200 });
  } catch (error) {
    console.error('Track event error:', error);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
