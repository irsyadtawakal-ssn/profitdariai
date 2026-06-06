// Ownership checking utilities
// Previously: membership-based (membership_expires_at)
// Now: any authenticated user has access (ownership tracked via user_ebooks — coming soon)

/**
 * For now, any logged-in user can access their purchased content.
 * TODO: Replace with user_ebooks table check when implemented.
 */
export function isUserAuthenticated(userId: string | null | undefined): boolean {
  return !!userId
}
