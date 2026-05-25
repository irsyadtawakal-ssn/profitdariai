import crypto from 'crypto'

export function generateBunnyVideoUrl(videoGuid: string): string {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID!
  const securityKey = process.env.BUNNY_TOKEN_SECURITY_KEY!
  const expiresIn = 60 * 60 * 4 // 4 hours
  const expires = Math.floor(Date.now() / 1000) + expiresIn

  const path = `/${libraryId}/${videoGuid}/playlist.m3u8`
  const token = crypto
    .createHash('sha256')
    .update(`${securityKey}${path}${expires}`)
    .digest('base64url')

  return `https://iframe.mediadelivery.net${path}?token=${token}&expires=${expires}`
}
