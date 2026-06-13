import { describe, it, expect } from 'vitest'
import { slugify, isValidSlug } from '@/lib/landing/slug'

describe('slugify', () => {
  it('mengubah teks jadi slug huruf kecil berstrip', () => {
    expect(slugify('Cuan Dari AI')).toBe('cuan-dari-ai')
  })
  it('membuang karakter non-alfanumerik', () => {
    expect(slugify('Promo!! 2026 #spesial')).toBe('promo-2026-spesial')
  })
  it('tidak menghasilkan strip ganda atau strip di ujung', () => {
    expect(slugify('  --Halo   Dunia--  ')).toBe('halo-dunia')
  })
})

describe('isValidSlug', () => {
  it('menerima slug valid', () => {
    expect(isValidSlug('cuan-dari-ai')).toBe(true)
    expect(isValidSlug('promo2026')).toBe(true)
  })
  it('menolak slug invalid', () => {
    expect(isValidSlug('Cuan Dari AI')).toBe(false)
    expect(isValidSlug('-leading')).toBe(false)
    expect(isValidSlug('trailing-')).toBe(false)
    expect(isValidSlug('double--strip')).toBe(false)
    expect(isValidSlug('')).toBe(false)
  })
})
