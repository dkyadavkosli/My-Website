import { useEffect, useState } from 'react'
import { FaLinkedin } from 'react-icons/fa'

const EXPERIENCES = [
  {
    title: 'Software Development Engineer',
    current: true,
    company: 'GoodScore',
    companyAlt: 'Formerly Rupicard',
    companyLinkedIn: 'https://www.linkedin.com/company/goodscoreapp/',
    duration: '09/2024 - Present',
    location: 'Bengaluru',
    bullets: [
      'Integrated third-party payment gateways (Razorpay, PayU) across frontend and backend systems to support secure, high-volume financial transactions.',
      'Led the redesign of the subscription acquisition flow, significantly improving user experience and reducing drop-offs during payment.',
      'Developed complete Personal Loan flow, allowing users to view eligible loan partners, compare options, and complete the loan journey seamlessly.',
      'Implemented custom React Native notifications and configured event-based triggers using CleverTap, improving user engagement through targeted and real-time mobile notifications.',
    ],
  },
  {
    title: 'Web Developer Intern',
    current: false,
    company: 'Gemsyn',
    duration: '01/2024 - 07/2024',
    location: 'Remote',
    bullets: [
      'Developed a responsive dashboard for companies to track and manage employee spending, focusing on clear data visualization and ease of use.',
      'Developed spend management features such as transaction views, summaries, and filters, improving performance and maintainability.',
      'Collaborated with product, design, and backend teams to implement business workflows, ensuring accurate and efficient spend management.',
    ],
  },
]

const iconStyle = { width: 18, height: 18, opacity: 0.8 }

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function ExperienceScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onShow = () => setVisible(true)
    const onHide = () => setVisible(false)

    window.addEventListener('showExperience', onShow)
    window.addEventListener('hideExperience', onHide)

    return () => {
      window.removeEventListener('showExperience', onShow)
      window.removeEventListener('hideExperience', onHide)
    }
  }, [])

  useEffect(() => {
    if (!visible) return

    const handleWheel = (event) => {
      if (!visible) return
      if (event.deltaY < 0) {
        // Up: back to About
        setVisible(false)
        window.dispatchEvent(new Event('hideExperience'))
        window.dispatchEvent(new Event('experienceToAbout'))
      } else if (event.deltaY > 0) {
        // Down: forward to Projects
        setVisible(false)
        window.dispatchEvent(new Event('hideExperience'))
        window.dispatchEvent(new Event('experienceToProjects'))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [visible])

  if (!visible) return null

  const cardStyle = {
    padding: '24px 28px',
    borderRadius: 20,
    background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
    border: '1px solid rgba(51, 65, 85, 0.5)',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4)',
    color: '#e5e7eb',
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 32px 32px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        overflow: 'auto',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 720,
          width: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
        }}
      >
        <h2
          style={{
            margin: 0,
            fontFamily:
              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            fontSize: 'clamp(1.75rem, 4vw, 2.25rem)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: '#f9fafb',
            textAlign: 'center',
          }}
        >
          Working Experience
        </h2>
        <div
          style={{
            width: 48,
            height: 2,
            margin: '12px auto 32px',
            background: 'rgba(75, 85, 99, 0.8)',
            borderRadius: 1,
          }}
        />

        {EXPERIENCES.map((exp, i) => (
          <article
            key={i}
            style={{
              ...cardStyle,
              marginBottom: i < EXPERIENCES.length - 1 ? 24 : 0,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#f9fafb',
                }}
              >
                {exp.title}
              </span>
              {exp.current && (
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 999,
                    background: 'rgba(34, 197, 94, 0.25)',
                    color: '#86efac',
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  Current
                </span>
              )}
            </div>
            <div
              style={{
                marginTop: 6,
                fontSize: 15,
                color: '#d1d5db',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>{exp.company}</span>
              {exp.companyAlt && <span style={{ color: '#9ca3af', fontSize: 14 }}>({exp.companyAlt})</span>}
              {exp.companyLinkedIn && (
                <a href={exp.companyLinkedIn} target="_blank" rel="noreferrer" style={{ color: '#93c5fd' }} aria-label="Company LinkedIn">
                  <FaLinkedin style={{ width: 18, height: 18 }} />
                </a>
              )}
            </div>
            <div
              style={{
                marginTop: 10,
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                flexWrap: 'wrap',
                fontSize: 13,
                color: '#9ca3af',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarIcon />
                {exp.duration}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <PinIcon />
                {exp.location}
              </span>
            </div>
            <ul
              style={{
                margin: '16px 0 0',
                paddingLeft: 20,
                fontSize: 14,
                lineHeight: 1.65,
                color: '#d1d5db',
              }}
            >
              {exp.bullets.map((b, j) => (
                <li key={j} style={{ marginBottom: 6 }}>
                  {b}
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </div>
  )
}
