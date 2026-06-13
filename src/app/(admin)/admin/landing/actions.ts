'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { isValidSlug } from '@/lib/landing/slug'

function readFields(formData: FormData) {
  const title = ((formData.get('title') as string) || '').trim()
  const slug = ((formData.get('slug') as string) || '').trim()
  const html = (formData.get('html') as string) || ''
  const published = formData.get('published') === 'true'
  if (!title) throw new Error('Judul wajib diisi.')
  if (!isValidSlug(slug)) throw new Error('Slug tidak valid. Gunakan huruf kecil, angka, dan strip (contoh: cuan-dari-ai).')
  if (!html.trim()) throw new Error('Kode HTML wajib diisi.')
  return { title, slug, html, published }
}

export async function createLandingPage(formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const fields = readFields(formData)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('landing_pages').insert(fields)
  if (error) {
    console.error('[createLandingPage]', error.message)
    throw new Error(error.code === '23505' ? 'Slug sudah dipakai landing page lain.' : error.message)
  }
  revalidatePath('/admin/landing')
}

export async function updateLandingPage(id: string, formData: FormData) {
  await requireAdmin()
  const supabase = createAdminClient()
  const fields = readFields(formData)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('landing_pages')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[updateLandingPage]', error.message)
    throw new Error(error.code === '23505' ? 'Slug sudah dipakai landing page lain.' : error.message)
  }
  revalidatePath('/admin/landing')
  revalidatePath(`/lp/${fields.slug}`)
}

export async function deleteLandingPage(id: string) {
  await requireAdmin()
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('landing_pages').delete().eq('id', id)
  if (error) {
    console.error('[deleteLandingPage]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/landing')
}

export async function togglePublish(id: string, current: boolean) {
  await requireAdmin()
  const supabase = createAdminClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('landing_pages')
    .update({ published: !current, updated_at: new Date().toISOString() })
    .eq('id', id)
  if (error) {
    console.error('[togglePublish]', error.message)
    throw new Error(error.message)
  }
  revalidatePath('/admin/landing')
}
