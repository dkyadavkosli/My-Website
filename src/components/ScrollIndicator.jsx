import { useEffect, useState } from 'react'

export function ScrollIndicator() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  if (!visible) return null

  return (
    <>
      <style>
        {`
          @keyframes scrollIndicatorPulse {
            0% { opacity: 0.2; }
            50% { opacity: 1; }
            100% { opacity: 0.2; }
          }
        `}
      </style>
      <div
        style={{
          position: 'fixed',
          left: '50%',
          bottom: 24,
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          fontSize: 14,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: '#f9fafb',
          opacity: 0.8,
          animation: 'scrollIndicatorPulse 1.8s ease-in-out infinite',
        }}
      >
        Scroll ↓
      </div>
    </>
  )
}

