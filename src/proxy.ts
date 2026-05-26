import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookies) => {
          cookies.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const pathname = request.nextUrl.pathname

  const isProtected = ['/dashboard', '/kursus', '/ebook', '/profile', '/admin'].some(
    (p) => pathname.startsWith(p)
  )

  if (isProtected && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (user && (pathname.startsWith('/kursus/') || pathname.startsWith('/ebook/'))) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('membership_expires_at')
      .eq('id', user.id)
      .single()

    const isActive =
      profile?.membership_expires_at &&
      new Date(profile.membership_expires_at) > new Date()

    if (!isActive) {
      return NextResponse.redirect(new URL('/pricing?expired=true', request.url))
    }
  }

  if (pathname.startsWith('/admin')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user!.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

  return response
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/kursus/:path*',
    '/ebook/:path*',
    '/profile/:path*',
    '/admin/:path*',
  ],
}
