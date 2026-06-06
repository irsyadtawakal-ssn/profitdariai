import { createServerClient } from '@/lib/supabase/server'
import { getCachedEbooks, getCachedCourseCounts } from '@/lib/cache/content'
import { InteractiveMemberDashboard } from '@/components/member/InteractiveMemberDashboard'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  // Fetch user profile and content cache concurrently
  const [profileResult, allMateris, { courseCount, ebookCount }, { data: ownedEbooks }] =
    await Promise.all([
      supabase.from('profiles').select('full_name, email').eq('id', user.id).single(),
      getCachedEbooks(),
      getCachedCourseCounts(),
      supabase.from('user_ebooks').select('ebook_id').eq('user_id', user.id),
    ])

  const profile = profileResult.data
  const ownedEbookIds = ownedEbooks?.map((oe) => oe.ebook_id) ?? []
  const ownedEbooksCount = ownedEbookIds.length

  const featuredMateri = allMateris.find((m) => m.is_featured) ?? allMateris[0] ?? null

  // Get newest materis (top 5)
  const newestMateris = allMateris.slice(0, 5)

  if (!profile) {
    return null
  }

  return (
    <InteractiveMemberDashboard
      user={{
        full_name: profile.full_name,
        email: profile.email,
      }}
      ownedEbooksCount={ownedEbooksCount}
      totalEbooks={ebookCount}
      totalCourses={courseCount}
      featuredMateri={featuredMateri}
      newestMateris={newestMateris}
      ownedEbookIds={ownedEbookIds}
    />
  )
}
