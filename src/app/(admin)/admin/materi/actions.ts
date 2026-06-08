'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function createEbook(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const pageCount = formData.get('page_count')
  const videosRaw = formData.get('videos') as string
  const documentsRaw = formData.get('documents') as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('ebooks').insert({
    title: formData.get('title') as string,
    slug: formData.get('slug') as string,
    description: (formData.get('description') as string) || null,
    category: formData.get('category') as string,
    cover_url: (formData.get('cover_url') as string) || null,
    file_path: formData.get('file_path') as string,
    page_count: pageCount ? Number(pageCount) : null,
    is_published: formData.get('is_published') === 'true',
    is_featured: formData.get('is_featured') === 'true',
    videos: videosRaw ? JSON.parse(videosRaw) : null,
    documents: documentsRaw ? JSON.parse(documentsRaw) : null,
  })
  if (error) {
    console.error('[createEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/materi')
  revalidatePath('/materi')
  revalidatePath('/dashboard')
}

export async function updateEbook(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const pageCount = formData.get('page_count')
  const videosRaw = formData.get('videos') as string
  const documentsRaw = formData.get('documents') as string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
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
      is_featured: formData.get('is_featured') === 'true',
      videos: videosRaw ? JSON.parse(videosRaw) : null,
      documents: documentsRaw ? JSON.parse(documentsRaw) : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
  if (error) {
    console.error('[updateEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/materi')
  revalidatePath('/materi')
  revalidatePath('/dashboard')
}

export async function toggleEbookPublished(id: string, current: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('ebooks')
    .update({ is_published: !current, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[toggleEbookPublished]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/materi')
  revalidatePath('/materi')
}

export async function deleteEbook(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  const { error } = await supabase.from('ebooks').delete().eq('id', id)
  if (error) {
    console.error('[deleteEbook]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/materi')
  revalidatePath('/materi')
  revalidatePath('/dashboard')
}

export interface ImportRow {
  title: string
  slug: string
  category: string
  description: string | null
  file_path: string
  cover_url: string | null
  page_count: number | null
  is_featured: boolean
  is_published: boolean
}

export interface ImportResult {
  success: number
  errors: { row: number; message: string }[]
}

export async function bulkImportMateri(rows: ImportRow[]): Promise<ImportResult> {
  await requireAdmin()
  const supabase = createAdminClient()
  let success = 0
  const errors: { row: number; message: string }[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (supabase as any).from('ebooks').insert({
      title: row.title,
      slug: row.slug,
      category: row.category,
      description: row.description,
      file_path: row.file_path,
      cover_url: row.cover_url,
      page_count: row.page_count,
      is_featured: row.is_featured,
      is_published: row.is_published,
      videos: null,
      documents: null,
    })
    if (error) {
      errors.push({ row: i + 2, message: error.message })
    } else {
      success++
    }
  }

  revalidatePath('/admin/materi')
  revalidatePath('/materi')
  revalidatePath('/dashboard')

  return { success, errors }
}
