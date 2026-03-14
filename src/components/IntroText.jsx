import { useState, useEffect } from 'react'

export function IntroText() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (!visible || dismissed) return

    const handleWheel = (event) => {
      if (!visible) return
      if ('deltaY' in event) {
        if (event.deltaY < 0) {
          // Scroll up: go back to hero
          setDismissed(true)
          window.dispatchEvent(new Event('cardToHero'))
        } else if (event.deltaY > 0) {
          // Scroll down: go forward to about screen
          setDismissed(true)
          window.dispatchEvent(new Event('cardToAbout'))
        }
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [visible, dismissed])

  // Allow navigating "back" to this intro card when user scrolls up
  // from the hero or about screen.
  useEffect(() => {
    const handleShowIntroCard = () => {
      setVisible(true)
      setDismissed(false)
    }

    window.addEventListener('showCardIntro', handleShowIntroCard)
    return () => window.removeEventListener('showCardIntro', handleShowIntroCard)
  }, [])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
        opacity: visible && !dismissed ? 1 : 0,
        transition: 'opacity 0.6s ease-out',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: '760px',
          width: 'min(92vw, 760px)',
          padding: '28px 34px 30px',
          background:
            'radial-gradient(circle at top, rgba(59, 130, 246, 0.22), transparent 55%), rgba(17, 24, 39, 0.96)',
          borderRadius: 26,
          border: '1px solid rgba(148, 163, 184, 0.28)',
          boxShadow:
            '0 22px 70px rgba(15, 23, 42, 0.92)',
          color: '#e5e7eb',
          backdropFilter: 'blur(14px)',
          position: 'relative',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 1,
            borderRadius: 24,
            border: '1px solid rgba(148, 163, 184, 0.18)',
            pointerEvents: 'none',
          }}
        />
        <p
          style={{
            margin: 0,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            textAlign: 'left',
          }}
        >
          I am a proficient software developer, expertly versed in{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>TypeScript</span>{' '}
          and{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>JavaScript</span>
          , with a strong command of frameworks such as{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>React</span>,{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>Node.js</span>, and{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>Next.js</span>. My
          robust problem-solving skills are complemented by an extensive
          understanding of diverse{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>
            Data Structures and Algorithms
          </span>
          . Additionally, I possess the capability to develop cutting-edge{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>
            Decentralized Web Applications (DApps)
          </span>{' '}
          utilizing{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>
            Smart Contracts
          </span>
          , <span style={{ fontWeight: 600, color: '#e5e7eb' }}>Web3.js</span>,
          and <span style={{ fontWeight: 600, color: '#e5e7eb' }}>Ether.js</span>
          .
        </p>
        <p
          style={{
            marginTop: 18,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: '0.95rem',
            lineHeight: 1.7,
            textAlign: 'left',
          }}
        >
          Beyond my technical expertise, I am a{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>
            state-level cricket and volleyball player
          </span>
          , as well as an{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>
            esports athlete
          </span>
          . I have a passion for{' '}
          <span style={{ fontWeight: 600, color: '#e5e7eb' }}>astronomy</span>{' '}
          and enjoy immersing myself in captivating documentaries.
        </p>

        <div
          style={{
            marginTop: 26,
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <button
            type="button"
            style={{
              padding: '10px 28px',
              borderRadius: 999,
              border: '1px solid rgba(59, 130, 246, 0.5)',
              background:
                'linear-gradient(135deg, #1d4ed8, #2563eb)',
              color: '#e5e7eb',
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: 14,
              fontWeight: 600,
              letterSpacing: '0.09em',
              textTransform: 'uppercase',
              cursor: 'pointer',
              boxShadow:
                '0 10px 26px rgba(15, 23, 42, 0.9)',
              transform: 'translateY(0)',
              transition:
                'transform 0.16s ease-out, box-shadow 0.16s ease-out, background 0.16s ease-out',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)'
              e.currentTarget.style.boxShadow =
                '0 16px 34px rgba(15, 23, 42, 0.95)'
              e.currentTarget.style.background =
                'linear-gradient(135deg, #2563eb, #3b82f6)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow =
                '0 10px 26px rgba(15, 23, 42, 0.9)'
              e.currentTarget.style.background =
                'linear-gradient(135deg, #1d4ed8, #2563eb)'
            }}
          >
            My Resume
          </button>
        </div>
      </div>
    </div>
  )
}
