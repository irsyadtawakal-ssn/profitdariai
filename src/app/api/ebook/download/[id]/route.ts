import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { isMembershipActive } from '@/lib/membership'

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: profile } = await supabase
    .from('profiles')
    .select('membership_expires_at')
    .eq('id', user.id)
    .single()

  if (!profile || !isMembershipActive(profile)) {
    return NextResponse.json({ error: 'Membership required' }, { status: 403 })
  }

  const { data: ebook } = await supabase
    .from('ebooks')
    .select('file_path, title')
    .eq('id', params.id)
    .single()

  if (!ebook) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await supabase.storage
    .from('ebooks')
    .createSignedUrl(ebook.file_path, 60 * 60) // 1 hour

  if (!data?.signedUrl) {
    return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 })
  }

  return NextResponse.json({ url: data.signedUrl })
}
