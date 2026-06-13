import { requireAdmin } from '@/lib/auth/requireAdmin'

export async function GET(req: Request) {
  await requireAdmin()

  const { searchParams } = new URL(req.url)
  const html = searchParams.get('html')

  if (!html) {
    return new Response('Missing html parameter', { status: 400 })
  }

  let decodedHtml: string
  try {
    decodedHtml = Buffer.from(html, 'base64').toString('utf-8')
  } catch (err) {
    return new Response('Invalid base64 encoding', { status: 400 })
  }

  return new Response(decodedHtml, {
    status: 200,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'x-content-type-options': 'nosniff',
      'x-frame-options': 'SAMEORIGIN',
      'content-security-policy': "default-src 'self'; script-src 'none'",
    },
  })
}
