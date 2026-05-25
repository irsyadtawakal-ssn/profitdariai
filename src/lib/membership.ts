import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export function isMembershipActive(profile: Pick<Profile, 'membership_expires_at'>): boolean {
  if (!profile.membership_expires_at) return false
  return new Date(profile.membership_expires_at) > new Date()
}

export function getDaysUntilExpiry(profile: Pick<Profile, 'membership_expires_at'>): number | null {
  if (!profile.membership_expires_at) return null
  const diff = new Date(profile.membership_expires_at).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function isRenewalWarning(profile: Pick<Profile, 'membership_expires_at'>): boolean {
  const days = getDaysUntilExpiry(profile)
  return days !== null && days <= 14 && days > 0
}
