import { notFound } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ModuleList } from '@/components/member/ModuleList'
import { Badge } from '@/components/ui/badge'

interface KursusDetailPageProps {
  params: Promise<{ slug: string }>
}

export default async function KursusDetailPage({ params }: KursusDetailPageProps) {
  const { slug } = await params
  const supabase = await createServerClient()

  const { data: course } = await supabase
    .from('courses')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!course) notFound()

  const { data: modules } = await supabase
    .from('course_modules')
    .select('id, title, duration_seconds, sort_order, video_url')
    .eq('course_id', course.id)
    .order('sort_order')

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        {course.thumbnail_url && (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="w-full max-h-48 object-cover rounded-xl mb-4"
          />
        )}
        <Badge variant="gold" className="mb-2">
          {course.category}
        </Badge>
        <h1 className="text-2xl font-bold text-[#F5F5F0] mb-2">{course.title}</h1>
        {course.description && (
          <p className="text-[#888888] text-sm">{course.description}</p>
        )}
      </div>

      <ModuleList modules={modules ?? []} />
    </div>
  )
}
