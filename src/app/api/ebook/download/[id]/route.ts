import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  // Check ownership via user_ebooks table
  const { data: ownership } = await supabase
    .from('user_ebooks')
    .select('id')
    .eq('user_id', user.id)
    .eq('ebook_id', id)
    .single()

  if (!ownership) {
    return NextResponse.json({ error: 'Ebook ini belum kamu miliki. Beli terlebih dahulu.' }, { status: 403 })
  }

  const { data: ebook } = await supabase
    .from('ebooks')
    .select('file_path, title')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (!ebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  // Jika GDrive URL → return langsung sebagai JSON (client pakai window.location.href)
  if (ebook.file_path.startsWith('https://')) {
    return NextResponse.json({ url: ebook.file_path })
  }

  // Jika Supabase Storage path → generate signed URL
  const adminClient = createAdminClient()
  const { data } = await adminClient.storage
    .from('ebooks')
    .createSignedUrl(ebook.file_path, 60 * 60, { download: ebook.title + '.pdf' })

  if (!data?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
