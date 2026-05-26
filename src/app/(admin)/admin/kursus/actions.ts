'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createKursus(formData: FormData) {
  const supabase = createAdminClient()
  await supabase.from('courses').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    thumbnail_url: (formData.get('thumbnail_url') as string) || null,
    is_published: formData.get('is_published') === 'true',
  })
  revalidatePath('/admin/kursus')
}

export async function updateKursus(id: string, formData: FormData) {
  const supabase = createAdminClient()
  await supabase
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
  revalidatePath('/admin/kursus')
}

export async function deleteKursus(id: string) {
  const supabase = createAdminClient()
  await supabase.from('courses').delete().eq('id', id)
  revalidatePath('/admin/kursus')
}
