'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'

export async function createModul(courseId: string, formData: FormData) {
  const supabase = createAdminClient()
  const duration = formData.get('duration_seconds')
  const { error } = await supabase.from('course_modules').insert({
    course_id: courseId,
    title: formData.get('title') as string,
    video_url: formData.get('video_url') as string,
    duration_seconds: duration ? Number(duration) : null,
    sort_order: Number(formData.get('sort_order') ?? 0),
  })
  if (error) {
    console.error('[createModul]', error.message)
    throw new Error(error.message)
  }
  revalidatePath(`/admin/kursus/${courseId}/modul`)
}

export async function updateModul(courseId: string, modulId: string, formData: FormData) {
  const supabase = createAdminClient()
  const duration = formData.get('duration_seconds')
  const { error } = await supabase
    .from('course_modules')
    .update({
      title: formData.get('title') as string,
      video_url: formData.get('video_url') as string,
      duration_seconds: duration ? Number(duration) : null,
      sort_order: Number(formData.get('sort_order') ?? 0),
    })
    .eq('id', modulId)
    .eq('course_id', courseId)
  if (error) {
    console.error('[updateModul]', error.message)
    throw new Error(error.message)
  }
  revalidatePath(`/admin/kursus/${courseId}/modul`)
}

export async function deleteModul(courseId: string, modulId: string) {
  const supabase = createAdminClient()
  const { error } = await supabase.from('course_modules').delete().eq('id', modulId)
  if (error) {
    console.error('[deleteModul]', error.message)
    throw new Error(error.message)
  }
  revalidatePath(`/admin/kursus/${courseId}/modul`)
  revalidatePath('/admin/kursus')
}
