import { useEffect, useState } from 'react'

const FULL_TEXT = "I'M DIPESH"
const CHAR_INTERVAL_MS = 500

export function IntroHero() {
  const [visible, setVisible] = useState(false)
  const [typed, setTyped] = useState('')

  useEffect(() => {
    const onShow = () => {
      setVisible(true)
    }

    window.addEventListener('showHero', onShow)
    return () => window.removeEventListener('showHero', onShow)
  }, [])

  // Scroll down from this hero screen to navigate forward
  // to the intro card "screen".
  useEffect(() => {
    if (!visible) return

    const handleWheel = (event) => {
      if (!visible) return
      // Only react to downward scroll to go to the next screen
      if (event.deltaY > 0) {
        setVisible(false)
        window.dispatchEvent(new Event('heroToCard'))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [visible])

  useEffect(() => {
    if (!visible) return

    setTyped('')
    let index = 0

    const interval = setInterval(() => {
      index += 1
      const next = FULL_TEXT.slice(0, index)
      setTyped(next)

      if (next.length >= FULL_TEXT.length) {
        clearInterval(interval)
      }
    }, CHAR_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        background:
          'radial-gradient(circle at top, rgba(15, 23, 42, 0.4), transparent 55%)',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          textAlign: 'center',
          paddingInline: '24px',
        }}
      >
        <h1
          style={{
            margin: 0,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 'clamp(3rem, 7.5vw, 4.2rem)',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            color: '#f9fafb',
          }}
        >
          HEY THERE
        </h1>
        <div
          style={{
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 'clamp(3.9rem, 10vw, 6.4rem)',
            fontWeight: 600,
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            color: 'transparent',
            backgroundImage:
              'radial-gradient(circle at center top, rgba(59, 130, 246, 0.22), transparent 55%), rgba(17, 24, 39, 0.96)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            WebkitTextStroke: '1px rgba(209, 213, 219, 0.7)',
            textStroke: '1px rgba(209, 213, 219, 0.7)',
            lineHeight: 1.2,
            marginTop: 32,
          }}
        >
          {typed}
          <span
            style={{
              display: 'inline-block',
              width: '0.08em',
              marginLeft: '0.12em',
              height: '0.9em',
              background: '#e5e7eb',
              verticalAlign: 'middle',
              animation: 'heroCursorBlink 1s steps(2, start) infinite',
            }}
          />
        </div>
      </div>
      <style>
        {`
          @keyframes heroCursorBlink {
            0% { opacity: 1; }
            50% { opacity: 0; }
            100% { opacity: 1; }
          }
        `}
      </style>
    </div>
  )
}
