import { useEffect, useState } from 'react'

const CAMERA_ANIMATION_MS = 2000
const CHAR_INTERVAL_MS = 35
const TEXT = "Hi, I'm Dipesh."

export function IntroDialogue() {
  const [visible, setVisible] = useState(false)
  const [typedText, setTypedText] = useState('')

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), CAMERA_ANIMATION_MS)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!visible) return

    let index = 0
    const interval = setInterval(() => {
      index += 1
      const next = TEXT.slice(0, index)
      setTypedText(next)

      if (index >= TEXT.length) {
        clearInterval(interval)
      }
    }, CHAR_INTERVAL_MS)

    return () => clearInterval(interval)
  }, [visible])

  if (!visible) return null

  return (
    <>
      <style>
        {`
          @keyframes introDialogueEnter {
            0% {
              opacity: 0;
              transform: translate(-50%, -10%) scale(0.96);
            }
            100% {
              opacity: 1;
              transform: translate(-50%, -50%) scale(1);
            }
          }

          @keyframes introDialogueFloat {
            0% {
              transform: translate(-50%, -50%) translateY(0);
            }
            50% {
              transform: translate(-50%, -50%) translateY(-4px);
            }
            100% {
              transform: translate(-50%, -50%) translateY(0);
            }
          }

          @keyframes introDialogueGlow {
            0% {
              box-shadow:
                0 18px 55px rgba(0, 0, 0, 0.7),
                0 0 18px rgba(96, 165, 250, 0.18);
              border-color: rgba(129, 140, 248, 0.35);
            }
            50% {
              box-shadow:
                0 20px 60px rgba(0, 0, 0, 0.8),
                0 0 32px rgba(129, 140, 248, 0.45);
              border-color: rgba(129, 140, 248, 0.7);
            }
            100% {
              box-shadow:
                0 18px 55px rgba(0, 0, 0, 0.7),
                0 0 18px rgba(96, 165, 250, 0.18);
              border-color: rgba(129, 140, 248, 0.35);
            }
          }
        `}
      </style>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '25%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            padding: '16px 22px',
            maxWidth: 420,
            borderRadius: 18,
            background:
              'linear-gradient(145deg, rgba(10, 16, 32, 0.88), rgba(15, 23, 42, 0.92))',
            border: '1px solid rgba(129, 140, 248, 0.5)',
            boxShadow:
              '0 18px 55px rgba(0, 0, 0, 0.7), 0 0 30px rgba(96, 165, 250, 0.35)',
            backdropFilter: 'blur(18px)',
            WebkitBackdropFilter: 'blur(18px)',
            color: '#f9fafb',
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 14,
            lineHeight: 1.6,
            letterSpacing: '0.04em',
            textTransform: 'none',
            animation:
              'introDialogueEnter 0.7s ease-out forwards, introDialogueFloat 5s ease-in-out 0.7s infinite, introDialogueGlow 4s ease-in-out 1.2s infinite',
          }}
        >
          <p style={{ margin: 0 }}>{typedText}</p>
        </div>
      </div>
    </>
  )
}

