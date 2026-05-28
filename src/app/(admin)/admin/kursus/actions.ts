'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function createKursus(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('courses').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    is_published: formData.get('is_published') === 'true',
  })
  if (error) console.error('[createKursus]', error.message)
  revalidatePath('/admin/kursus')
}

export async function updateKursus(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('courses')
    .update({
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      thumbnail_url: (formData.get('thumbnail_url') as string) || null,
      is_published: formData.get('is_published') === 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) console.error('[updateKursus]', error.message)
  revalidatePath('/admin/kursus')
}

export async function deleteKursus(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('courses').delete().eq('id', id)
  if (error) console.error('[deleteKursus]', error.message)
  revalidatePath('/admin/kursus')
}
