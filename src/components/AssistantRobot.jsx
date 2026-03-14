import { useEffect, useState, useRef } from 'react'
import gsap from 'gsap'

const MESSAGE = 'Hey! Let me show you around.'
const CHAR_INTERVAL_MS = 30

export function AssistantRobot() {
  const [visible, setVisible] = useState(false)
  const [typedText, setTypedText] = useState('')
  const containerRef = useRef(null)
  const typingIndexRef = useRef(0)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 3000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible || !containerRef.current) return
    const el = containerRef.current
    gsap.set(el, { opacity: 0, y: 8 })
    gsap.to(el, {
      opacity: 1,
      y: 0,
      duration: 0.4,
      ease: 'power2.out',
    })
  }, [visible])

  useEffect(() => {
    if (!visible) return

    setTypedText('')
    typingIndexRef.current = 0

    const interval = setInterval(() => {
      typingIndexRef.current += 1
      const next = MESSAGE.slice(0, typingIndexRef.current)
      setTypedText(next)

      if (next.length >= MESSAGE.length) {
        clearInterval(interval)
      }
    }, CHAR_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        left: 24,
        bottom: 24,
        display: 'flex',
        alignItems: 'flex-end',
        gap: 0,
        zIndex: 10,
      }}
    >
      <div
        style={{
          position: 'relative',
          padding: '12px 16px',
          background: 'rgba(26, 26, 32, 0.95)',
          borderRadius: 16,
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
          maxWidth: 220,
          marginRight: 4,
        }}
      >
        <p
          style={{
            margin: 0,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 14,
            lineHeight: 1.4,
            color: '#e5e7eb',
          }}
        >
          {typedText}
        </p>
        <div
          style={{
            position: 'absolute',
            left: 20,
            bottom: -6,
            width: 12,
            height: 12,
            background: 'rgba(26, 26, 32, 0.95)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            borderRight: '1px solid rgba(255, 255, 255, 0.08)',
            transform: 'rotate(45deg)',
          }}
        />
      </div>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: 'linear-gradient(145deg, #3b3b4a 0%, #2a2a34 100%)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
        aria-hidden
      >
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="5"
            y="8"
            width="14"
            height="10"
            rx="2"
            stroke="#a5b4fc"
            strokeWidth="1.5"
            fill="rgba(165, 180, 252, 0.15)"
          />
          <circle cx="9" cy="12" r="1.5" fill="#a5b4fc" />
          <circle cx="15" cy="12" r="1.5" fill="#a5b4fc" />
          <path
            d="M8 6V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v1"
            stroke="#a5b4fc"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M12 18v2M9 20h6"
            stroke="#818cf8"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  )
}
