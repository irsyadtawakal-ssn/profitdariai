import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ModulClient } from './ModulClient'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminModulPage({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const [{ data: course }, { data: modules }] = await Promise.all([
    supabase.from('courses').select('id, title').eq('id', id).single(),
    supabase
      .from('course_modules')
      .select('id, title, video_url, duration_seconds, sort_order')
      .eq('course_id', id)
      .order('sort_order'),
  ])

  if (!course) notFound()

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <ModulClient courseId={id} courseTitle={course.title} modules={modules ?? []} />
    </div>
  )
}
