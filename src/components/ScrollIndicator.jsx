import { useEffect, useState } from 'react'

export function ScrollIndicator() {
  const [visible, setVisible] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [experienceOpen, setExperienceOpen] = useState(false)
  const [thankYouOpen, setThankYouOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const onShowAbout = () => setAboutOpen(true)
    const onHideAbout = () => setAboutOpen(false)
    window.addEventListener('showAbout', onShowAbout)
    window.addEventListener('hideAbout', onHideAbout)
    return () => {
      window.removeEventListener('showAbout', onShowAbout)
      window.removeEventListener('hideAbout', onHideAbout)
    }
  }, [])

  useEffect(() => {
    const onShow = () => setExperienceOpen(true)
    const onHide = () => setExperienceOpen(false)
    window.addEventListener('showExperience', onShow)
    window.addEventListener('hideExperience', onHide)
    return () => {
      window.removeEventListener('showExperience', onShow)
      window.removeEventListener('hideExperience', onHide)
    }
  }, [])

  useEffect(() => {
    const onShow = () => setThankYouOpen(true)
    const onHide = () => setThankYouOpen(false)
    window.addEventListener('showThankYou', onShow)
    window.addEventListener('hideThankYou', onHide)
    return () => {
      window.removeEventListener('showThankYou', onShow)
      window.removeEventListener('hideThankYou', onHide)
    }
  }, [])

  if (!visible || aboutOpen || experienceOpen || thankYouOpen) return null

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
