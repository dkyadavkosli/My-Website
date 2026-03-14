import { useEffect, useState } from 'react'
import { SiGithub, SiInstagram, SiX } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'
import pic from '../assets/MyImage-2.jpg'
import reactImg from '../assets/react.png'
import solidity from '../assets/solidity.png'
import tailwind from '../assets/tailwind.svg'
import typescript from '../assets/typescript.png'
import js from '../assets/js.png'
import mongodb from '../assets/mongodb.png'
import next from '../assets/next.png'
import nodejs from '../assets/nodejs.png'

const TYPED_TEXT = 'BOUT ME'
const CHAR_INTERVAL_MS = 500

export function AboutScreen() {
  const [visible, setVisible] = useState(false)
  const [animatedText, setAnimatedText] = useState('')

  // Visibility is controlled externally via a custom event.
  useEffect(() => {
    const onShow = () => setVisible(true)
    const onHide = () => setVisible(false)

    window.addEventListener('showAbout', onShow)
    window.addEventListener('hideAbout', onHide)

    return () => {
      window.removeEventListener('showAbout', onShow)
      window.removeEventListener('hideAbout', onHide)
    }
  }, [])

  // Simple looping type animation for "AB0UT ME" heading.
  useEffect(() => {
    if (!visible) return

    setAnimatedText('')
    let index = 0
    let interval

    const animate = () => {
      interval = setInterval(() => {
        if (index <= TYPED_TEXT.length) {
          setAnimatedText(TYPED_TEXT.slice(0, index))
          index += 1
        } else {
          clearInterval(interval)
          index = 0
          setTimeout(animate, 1000)
        }
      }, CHAR_INTERVAL_MS)
    }

    animate()
    return () => clearInterval(interval)
  }, [visible])

  // Scroll: up -> back to intro card; down -> forward to experience screen.
  useEffect(() => {
    if (!visible) return

    const handleWheel = (event) => {
      if (!visible) return
      if (event.deltaY < 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideAbout'))
        window.dispatchEvent(new Event('aboutToCard'))
      } else if (event.deltaY > 0) {
        setVisible(false)
        window.dispatchEvent(new Event('hideAbout'))
        window.dispatchEvent(new Event('aboutToExperience'))
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
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px 32px',
        boxSizing: 'border-box',
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          maxWidth: 1200,
          width: '100%',
          maxHeight: '100%',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: 24,
          alignItems: 'start',
        }}
      >
        {/* Left column */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <h2
            style={{
              margin: 0,
              fontFamily:
                'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
              fontSize: '2.25rem',
              letterSpacing: '0.26em',
              textTransform: 'uppercase',
              color: '#f9fafb',
            }}
          >
            A{animatedText}
          </h2>

          <article
            style={{
              padding: 20,
              borderRadius: 18,
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              boxShadow: '0 20px 60px rgba(15, 23, 42, 0.95)',
              color: '#e5e7eb',
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: 14,
                lineHeight: 1.7,
              }}
            >
              A dedicated web and blockchain developer passionate about delving
              deeper into the world of Web3 and crafting intuitive, user-friendly
              Decentralized Applications (DApps).
            </p>

            <div
              style={{
                marginTop: 18,
                display: 'flex',
                gap: 14,
                justifyContent: 'center',
              }}
            >
              <a href="https://github.com/dkyadavkosli" target="_blank" rel="noreferrer" style={{ color: '#e5e7eb', fontSize: 24 }}><SiGithub /></a>
              <a href="https://www.linkedin.com/in/dipesh-kumar-b8580020b/" target="_blank" rel="noreferrer" style={{ color: '#e5e7eb', fontSize: 24 }}><FaLinkedin /></a>
              <a href="https://www.instagram.com/kal.se_padhai.shuru/" target="_blank" rel="noreferrer" style={{ color: '#e5e7eb', fontSize: 24 }}><SiInstagram /></a>
              <a href="https://twitter.com/DipeshK71331890" target="_blank" rel="noreferrer" style={{ color: '#e5e7eb', fontSize: 24 }}><SiX /></a>
            </div>
          </article>

          <article
            style={{
              padding: 0,
              borderRadius: 24,
              overflow: 'hidden',
              position: 'relative',
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(51, 65, 85, 0.5)',
            }}
          >
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1, borderRadius: 24 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent 50%)', zIndex: 1 }} />
              <img src={pic} alt="Dipesh Kumar" style={{ width: '100%', display: 'block', maxHeight: 400, objectFit: 'cover' }} />
            </div>
            <div
              style={{
                padding: '10px 16px 14px',
                color: '#d1d5db',
                fontFamily:
                  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                fontSize: 12,
              }}
            >
              <div style={{ fontWeight: 500 }}>Dipesh Kumar</div>
              <div style={{ opacity: 0.7 }}>Web &amp; Blockchain Developer</div>
            </div>
          </article>
        </section>

        {/* Middle column */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <article
            style={{
              padding: 20,
              borderRadius: 18,
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#94a3b8',
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: 8,
                fontSize: 16,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#f9fafb',
              }}
            >
              My Background
            </h3>
            <p>
              Growing up in a quaint village in India, I was surrounded by an
              environment brimming with positivity and motivation. With both my
              parents being dedicated teachers, they ensured I excelled in my
              studies. Although my initial exposure to technology was limited,
              my curiosity grew over time, sparking a deep interest in computers.
            </p>
            <p>
              During my school years, my passion for sports shone brightly. I
              competed at the state level in Volleyball for the under-14
              category, excelled in Throwball for the under-16 category, and
              showcased my talent in Cricket at the state level for the under-16
              category.
            </p>
            <p>
              My true interaction with emerging technologies began in college,
              where I discovered various tech stacks and the fascinating world of
              blockchain. Today, I harness my technical skills to craft
              user-friendly web applications.
            </p>
          </article>

          <article
            style={{
              padding: 20,
              borderRadius: 18,
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#94a3b8',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#f9fafb',
              }}
            >
              Technologies
            </h3>
            <div
              style={{
                marginTop: 18,
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: 18,
              }}
            >
              {[
                { src: reactImg, href: 'https://react.dev/', alt: 'React' },
                { src: next, href: 'https://nextjs.org/', alt: 'Next.js' },
                { src: tailwind, href: 'https://tailwindcss.com/', alt: 'Tailwind' },
                { src: typescript, href: 'https://www.typescriptlang.org/', alt: 'TypeScript' },
                { src: js, href: 'https://www.javascript.com/', alt: 'JavaScript' },
                { src: solidity, href: 'https://soliditylang.org/', alt: 'Solidity' },
                { src: mongodb, href: 'https://www.mongodb.com/', alt: 'MongoDB' },
                { src: nodejs, href: 'https://nodejs.org/en', alt: 'Node.js' },
              ].map((item) => (
                <a key={item.alt} href={item.href} target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={item.src}
                    alt={item.alt}
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 999,
                      border: '1px solid rgba(148,163,184,0.6)',
                      padding: 8,
                      backgroundColor: 'rgba(71, 85, 105, 0.8)',
                      objectFit: 'contain',
                    }}
                  />
                </a>
              ))}
            </div>
          </article>
        </section>

        {/* Right column */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <article
            style={{
              padding: 20,
              borderRadius: 18,
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#94a3b8',
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: 16,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#f9fafb',
              }}
            >
              My Education
            </h3>
            <div style={{ marginTop: 16, fontSize: 13, lineHeight: 1.6 }}>
              <div>
                <div>Indian Institute of Information Technology, Kota</div>
                <div style={{ color: '#bbf7d0' }}>B.Tech</div>
                <div>Duration: 2020-2024</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div>Rao Pahlad Singh School, Mahendergarh</div>
                <div style={{ color: '#bbf7d0' }}>12th Class</div>
                <div>Duration: 2019-2020</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div>Rao Pahlad Singh School, Mahendergarh</div>
                <div style={{ color: '#bbf7d0' }}>10th Class</div>
                <div>Duration: 2017-2018</div>
              </div>
            </div>
          </article>

          <article
            style={{
              padding: 20,
              borderRadius: 18,
              background: 'linear-gradient(to bottom right, rgba(15,23,42,0.6), rgba(30,41,59,0.4))',
              border: '1px solid rgba(51, 65, 85, 0.5)',
              color: '#94a3b8',
            }}
          >
            <h3
              style={{
                margin: 0,
                marginBottom: 10,
                fontSize: 16,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#f9fafb',
              }}
            >
              Favourite Tunes
            </h3>
            <p style={{ margin: 0, fontSize: 12, opacity: 0.8, marginBottom: 12 }}>
              A small collection of tracks I keep on repeat while building.
            </p>
            {[
              { id: '52AXCViV9CJCayQkIzokkr', title: 'Track 1', artist: 'Spotify' },
              { id: '0w1qgN9ZbInXLIzAPEcMoI', title: 'Track 2', artist: 'Spotify' },
              { id: '0ZxIxTxup7AiJIHDwodwCR', title: 'Track 3', artist: 'Spotify' },
            ].map((track, i) => (
              <a
                key={track.id}
                href={`https://open.spotify.com/track/${track.id}`}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  marginBottom: i < 2 ? 8 : 0,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: '#181818',
                  border: '1px solid rgba(55, 65, 81, 0.8)',
                  textDecoration: 'none',
                  color: '#e5e7eb',
                }}
              >
                <span style={{ fontSize: 20 }}>🎵</span>
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, color: '#f9fafb' }}>{track.title}</div>
                  <div style={{ fontSize: 12, color: '#9ca3af' }}>{track.artist}</div>
                </div>
                <span style={{ fontSize: 12, color: '#22c55e' }}>Play on Spotify →</span>
              </a>
            ))}
          </article>
        </section>
      </div>
    </div>
  )
}

