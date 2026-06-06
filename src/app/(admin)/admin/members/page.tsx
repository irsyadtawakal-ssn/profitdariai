import { createAdminClient } from '@/lib/supabase/admin'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface MembersPageProps {
  searchParams: Promise<{ q?: string; status?: string }>
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const { q, status } = await searchParams
  const supabase = createAdminClient()

  // Fetch profiles with their purchase count from user_ebooks
  let query = supabase
    .from('profiles')
    .select('id, full_name, email, created_at, user_ebooks(count)')
    .eq('role', 'member')
    .order('created_at', { ascending: false })

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%`)
  }

  const { data: members, error } = await query.limit(100)
  if (error) console.error('[Members] Query failed:', error)

  // Filter by purchase status client-side (count from user_ebooks)
  const filtered = (members ?? []).filter((m) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const count = (m.user_ebooks as any)?.[0]?.count ?? 0
    if (status === 'active') return count > 0
    if (status === 'inactive') return count === 0
    return true
  })

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-[#F5F5F0] mb-6">Users</h1>

      <form className="flex gap-3 mb-6">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari nama atau email..."
          className="flex-1 bg-[#111111] border border-[#222222] rounded-lg px-4 py-2 text-[#F5F5F0] text-sm placeholder:text-[#555555] focus:outline-none focus:border-[#D4AF37]"
        />
        <select
          name="status"
          defaultValue={status ?? ''}
          className="bg-[#111111] border border-[#222222] rounded-lg px-3 py-2 text-[#F5F5F0] text-sm focus:outline-none focus:border-[#D4AF37]"
        >
          <option value="">Semua</option>
          <option value="active">Ada Pembelian</option>
          <option value="inactive">Belum Beli</option>
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-[#D4AF37] text-[#0A0A0A] text-sm font-semibold rounded-lg hover:bg-[#D4AF37]/90 transition-colors"
        >
          Cari
        </button>
      </form>

      <div className="bg-[#111111] border border-[#222222] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#222222]">
              {['Nama', 'Email', 'Produk Dimiliki', 'Join'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-[#555555] font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((m) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              const ebookCount = (m.user_ebooks as any)?.[0]?.count ?? 0
              const hasPurchased = ebookCount > 0
              return (
                <tr key={m.id} className="border-b border-[#222222] last:border-0 hover:bg-[#1A1A1A]/50 transition-colors">
                  <td className="px-4 py-3 text-[#F5F5F0]">{m.full_name ?? '—'}</td>
                  <td className="px-4 py-3 text-[#888888]">{m.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      hasPurchased ? 'bg-[#D4AF37]/15 text-[#D4AF37]' : 'bg-[#888888]/20 text-[#888888]'
                    }`}>
                      {hasPurchased ? `${ebookCount} produk` : 'Belum beli'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#888888]">
                    {format(new Date(m.created_at), 'd MMM yyyy', { locale: id })}
                  </td>
                </tr>
              )
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-[#555555]">
                  Tidak ada user ditemukan.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
