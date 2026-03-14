import { useEffect, useState } from 'react'
import pic1 from '../assets/freelance.png'
import pic2 from '../assets/crowd.png'
import pic3 from '../assets/esports.png'

const PROJECTS = [
  {
    title: 'Freebee',
    tag: 'Blockchain',
    type: 'Live Project',
    link: 'https://www.youtube.com/watch?v=eyKn1011e20',
    image: pic1,
    description:
      'A decentralized application built with smart contracts and Web3 integration, featuring secure transactions and transparent operations.',
  },
  {
    title: 'Esports Empire',
    tag: 'MERN Stack',
    type: 'Live Project',
    link: 'https://myesportsempire.vercel.app/',
    image: pic2,
    description:
      'A full-stack web application with modern UI/UX, robust functionality, and seamless user experience across all devices.',
  },
  {
    title: 'FundChain',
    tag: 'Blockchain',
    type: 'Live Project',
    link: 'https://www.youtube.com/watch?v=LD21OxGZXqo',
    image: pic3,
    description:
      'A decentralized application built with smart contracts and Web3 integration, featuring secure transactions and transparent operations.',
  },
]

export function ProjectsScreen() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onShow = () => setVisible(true)
    const onHide = () => setVisible(false)

    window.addEventListener('showProjects', onShow)
    window.addEventListener('hideProjects', onHide)

    return () => {
      window.removeEventListener('showProjects', onShow)
      window.removeEventListener('hideProjects', onHide)
    }
  }, [])

  // Scroll: up -> back to Experience; down -> forward to Skills.
  useEffect(() => {
    if (!visible) return

    const handleWheel = (event) => {
      if (!visible) return
      if (event.deltaY < 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideProjects'))
        window.dispatchEvent(new Event('projectsToExperience'))
      } else if (event.deltaY > 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideProjects'))
        window.dispatchEvent(new Event('projectsToSkills'))
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
        padding: '48px 32px 32px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 1040,
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
          Recent Projects
        </h2>
        <div
          style={{
            width: 72,
            height: 2,
            margin: '12px auto 32px',
            background: 'rgba(75, 85, 99, 0.8)',
            borderRadius: 1,
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: 20,
            flexWrap: 'wrap',
            justifyContent: 'center',
          }}
        >
          {PROJECTS.map((p) => (
            <a
              key={p.title}
              href={p.link}
              target="_blank"
              rel="noreferrer"
              style={{
                width: 280,
                textDecoration: 'none',
                color: 'inherit',
              }}
            >
              <article
                style={{
                  width: '100%',
                  borderRadius: 24,
                  overflow: 'hidden',
                  background: 'linear-gradient(to bottom right, #0a0a0a, #141414, #1a1a1a)',
                  border: '1px solid rgba(51, 65, 85, 0.5)',
                  boxShadow: '0 20px 60px rgba(15, 23, 42, 0.95)',
                  color: '#e5e7eb',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    height: 200,
                    overflow: 'hidden',
                  }}
                >
                  <img
                    src={p.image}
                    alt={p.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      left: 12,
                      fontSize: '2rem',
                    }}
                  >
                    ☀️
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      padding: '6px 12px',
                      borderRadius: 999,
                      background: '#2e2e2e',
                      border: '1px solid rgba(55,65,81,0.9)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: '#e5e7eb',
                    }}
                  >
                    {p.tag}
                  </div>
                </div>

                <div
                  style={{
                    padding: '20px 20px 18px',
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.25rem',
                      fontWeight: 600,
                      textAlign: 'left',
                      marginBottom: 12,
                      color: '#fff',
                    }}
                  >
                    {p.title}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      fontSize: 11,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: '#6ee7b7',
                      marginBottom: 8,
                    }}
                  >
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 999,
                        background: '#22c55e',
                      }}
                    />
                    <span>{p.type}</span>
                  </div>

                  <p
                    style={{
                      margin: 0,
                      fontSize: 13,
                      lineHeight: 1.65,
                      color: '#d1d5db',
                      flexGrow: 1,
                    }}
                  >
                    {p.description}
                  </p>
                </div>
              </article>
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}

