'use client'

import { useEffect, useState, useCallback } from 'react'

const BUYERS = [
  { name: 'Rizky', city: 'Surabaya' },
  { name: 'Fajar', city: 'Bandung' },
  { name: 'Dian', city: 'Medan' },
  { name: 'Andika', city: 'Yogyakarta' },
  { name: 'Siti', city: 'Makassar' },
  { name: 'Bima', city: 'Semarang' },
  { name: 'Putri', city: 'Depok' },
  { name: 'Hendra', city: 'Bekasi' },
  { name: 'Nurul', city: 'Palembang' },
  { name: 'Arif', city: 'Malang' },
  { name: 'Dewi', city: 'Tangerang' },
  { name: 'Galih', city: 'Bogor' },
  { name: 'Maya', city: 'Pekanbaru' },
  { name: 'Rendi', city: 'Balikpapan' },
  { name: 'Ayu', city: 'Jakarta' },
]

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function getRandomBuyer() {
  const buyer = BUYERS[randomInt(0, BUYERS.length - 1)]
  const minutes = randomInt(2, 47)
  return { ...buyer, minutes }
}

export default function SocialProofPopup() {
  const [visible, setVisible] = useState(false)
  const [buyer, setBuyer] = useState(() => getRandomBuyer())

  const show = useCallback(() => {
    setBuyer(getRandomBuyer())
    setVisible(true)
    setTimeout(() => setVisible(false), 4500)
  }, [])

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    const scheduleNext = () => {
      timer = setTimeout(() => {
        show()
        scheduleNext()
      }, randomInt(5000, 7000))
    }

    // First popup after 5-7s
    timer = setTimeout(() => {
      show()
      scheduleNext()
    }, randomInt(5000, 7000))

    return () => clearTimeout(timer)
  }, [show])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: 24,
        zIndex: 9999,
        background: '#141414',
        border: '1px solid rgba(212,175,55,0.35)',
        borderRadius: 12,
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        maxWidth: 300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        animation: 'spPopIn 0.35s cubic-bezier(0.34,1.56,0.64,1)',
      }}
    >
      <style>{`
        @keyframes spPopIn {
          from { opacity: 0; transform: translateY(16px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
      `}</style>

      {/* Avatar */}
      <div style={{
        width: 40,
        height: 40,
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #D4AF37, #8B6914)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        fontSize: 16,
        fontWeight: 700,
        color: '#0A0A0A',
        fontFamily: 'var(--font-display, Geist, sans-serif)',
      }}>
        {buyer.name[0]}
      </div>

      {/* Text */}
      <div>
        <div style={{
          fontSize: 13,
          fontWeight: 600,
          color: '#F5F5F0',
          lineHeight: 1.3,
          fontFamily: 'var(--font-display, Geist, sans-serif)',
        }}>
          <span style={{ color: '#D4AF37' }}>{buyer.name}</span> dari {buyer.city}
        </div>
        <div style={{
          fontSize: 12,
          color: 'rgba(245,245,240,0.65)',
          marginTop: 2,
          fontFamily: 'Inter, sans-serif',
        }}>
          baru bergabung · {buyer.minutes} menit lalu
        </div>
      </div>

      {/* Close */}
      <button
        onClick={() => setVisible(false)}
        style={{
          position: 'absolute',
          top: 6,
          right: 8,
          background: 'none',
          border: 'none',
          color: 'rgba(245,245,240,0.4)',
          cursor: 'pointer',
          fontSize: 14,
          lineHeight: 1,
          padding: 0,
        }}
        aria-label="Tutup"
      >
        ✕
      </button>
    </div>
  )
}
