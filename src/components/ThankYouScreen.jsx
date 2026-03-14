import { useEffect, useState } from 'react'

export function ThankYouScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onShow = () => setVisible(true)
    const onHide = () => setVisible(false)

    window.addEventListener('showThankYou', onShow)
    window.addEventListener('hideThankYou', onHide)

    return () => {
      window.removeEventListener('showThankYou', onShow)
      window.removeEventListener('hideThankYou', onHide)
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    const handleWheel = (event) => {
      if (!visible) return
      if (event.deltaY < 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideThankYou'))
        window.dispatchEvent(new Event('thankYouToContact'))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [visible])

  if (!visible) return null

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 32,
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          textAlign: 'center',
          maxWidth: 560,
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 'clamp(2rem, 5vw, 3rem)',
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: '#f9fafb',
            lineHeight: 1.2,
          }}
        >
          Thank you
        </h2>
        <p
          style={{
            margin: '20px 0 0',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
            color: '#d1d5db',
            lineHeight: 1.6,
          }}
        >
          Thanks for visiting. I hope you enjoyed the journey. Feel free to reach
          out anytime — I’d love to connect.
        </p>
        <p style={{ marginTop: 16, fontSize: '1.25rem' }}>
          <span style={{ marginRight: 8, fontSize: '2rem' }}>💖</span>
        </p>
        <div
          style={{
            width: 64,
            height: 2,
            margin: '28px auto 0',
            background: 'rgba(75, 85, 99, 0.8)',
            borderRadius: 1,
          }}
        />
      </div>
    </div>
  )
}
