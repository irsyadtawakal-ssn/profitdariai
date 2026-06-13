import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = (await createServerClient()) as any
  const { data } = await supabase
    .from('landing_pages')
    .select('html, published')
    .eq('slug', slug)
    .maybeSingle()

  if (!data || !data.published) {
    return new Response('Not found', { status: 404 })
  }

  return new Response(data.html, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8' },
  })
}
