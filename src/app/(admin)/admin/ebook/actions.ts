'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function createEbook(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const pageCount = formData.get('page_count')
  const { error } = await supabase.from('ebooks').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    cover_url: (formData.get('cover_url') as string) || null,
    file_path: formData.get('file_path') as string,
    page_count: pageCount ? Number(pageCount) : null,
    is_published: formData.get('is_published') === 'true',
  })
  if (error) {
    console.error('[createEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/ebook')
}

export async function updateEbook(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const pageCount = formData.get('page_count')
  const { error } = await supabase
    .from('ebooks')
    .update({
      title: formData.get('title') as string,
      slug: formData.get('slug') as string,
      description: (formData.get('description') as string) || null,
      category: formData.get('category') as string,
      cover_url: (formData.get('cover_url') as string) || null,
      file_path: formData.get('file_path') as string,
      page_count: pageCount ? Number(pageCount) : null,
      is_published: formData.get('is_published') === 'true',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) {
    console.error('[updateEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/ebook')
}

export async function deleteEbook(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('ebooks').delete().eq('id', id)
  if (error) {
    console.error('[deleteEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/ebook')
}
