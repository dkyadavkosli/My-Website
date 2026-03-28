import { useEffect, useState, useCallback, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SiGithub, SiInstagram, SiSpotify, SiX } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'
import cImg from '../assets/c.png'
import cppImg from '../assets/cpp.png'
import cssImg from '../assets/css.png'
import htmlImg from '../assets/html.png'
import js from '../assets/js.png'
import mongodb from '../assets/mongodb.png'
import mysqlImg from '../assets/mysql.png'
import next from '../assets/next.png'
import nodejs from '../assets/nodejs.png'
import postmanImg from '../assets/postman.png'
import pythonImg from '../assets/python.png'
import reactImg from '../assets/react.png'
import reduxImg from '../assets/redux.png'
import solidity from '../assets/solidity.png'
import tailwind from '../assets/tailwind.svg'
import typescript from '../assets/typescript.png'
import { AboutSolarCanvas, getStoryChapter, scrollProgressForPlanet } from './AboutSolarCanvas'
import { IntroSpaceCanvas } from './IntroSpaceCanvas'

gsap.registerPlugin(ScrollTrigger)

/** Fade duration for About enter/exit and intro ↔ story open/close (not chapter-to-chapter scroll) */
const ABOUT_UI_FADE_MS = 200

/** hideAbout detail: set when AboutScreen already ran finishShellClose — avoids onHide → finishShellClose(null) re-entry */
const HIDE_ABOUT_INTERNAL = 'aboutShellClose'

const glassShell = {
  padding: 'clamp(16px, 2.8vw, 24px)',
  borderRadius: 18,
  background: 'rgba(15, 23, 42, 0.38)',
  backdropFilter: 'blur(18px) saturate(1.05)',
  WebkitBackdropFilter: 'blur(18px) saturate(1.05)',
  border: '1px solid rgba(255, 255, 255, 0.07)',
  boxShadow: '0 24px 70px rgba(0, 0, 0, 0.35)',
  color: '#cbd5e1',
  fontSize: 14,
  lineHeight: 1.72,
}

const h3Style = {
  margin: 0,
  marginBottom: 10,
  fontSize: 15,
  letterSpacing: '0.12em',
  textTransform: 'uppercase',
  color: '#f9fafb',
}

/** Slightly brighter + semibold for skimmable keywords in body copy */
const kw = {
  color: '#f8fafc',
  fontWeight: 600,
}

function PanelBackground() {
  return (
    <article style={glassShell}>
      <h3 style={h3Style}>My Background</h3>
      <p>
        I grew up in a <span style={kw}>small village in India</span> where access to technology was limited,
        but curiosity was always strong. With both my parents being <span style={kw}>teachers</span>,
        education and discipline were deeply ingrained in my upbringing. Over time, that curiosity evolved
        into a strong interest in <span style={kw}>computers and technology</span>.
      </p>
      <p>
        Alongside academics, <span style={kw}>sports</span> played a big role in my early years. I competed
        at the state level in <span style={kw}>volleyball and cricket</span> and also represented my school
        in <span style={kw}>throwball</span>. Sports taught me <span style={kw}>discipline</span>,{' '}
        <span style={kw}>resilience</span>, and the drive to continuously improve.
      </p>
      <p style={{ marginBottom: 0 }}>
        My real exposure to technology began during college, where I started exploring different{' '}
        <span style={kw}>programming stacks</span> and eventually discovered the world of{' '}
        <span style={kw}>blockchain</span>. Today, I focus on building <span style={kw}>modern web applications</span>{' '}
        and experimenting with emerging technologies to create intuitive and reliable{' '}
        <span style={kw}>digital experiences</span>.
      </p>
    </article>
  )
}

function PanelEducation() {
  return (
    <article style={glassShell}>
      <h3 style={h3Style}>My Education</h3>
      <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.6 }}>
        <div>
          <div>
            <span style={kw}>Indian Institute of Information Technology, Kota</span>
          </div>
          <div style={{ color: '#bbf7d0' }}>B.Tech</div>
          <div>Duration: 2020-2024</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div>
            <span style={kw}>Rao Pahlad Singh School</span>, Mahendergarh
          </div>
          <div style={{ color: '#bbf7d0' }}>12th Class</div>
          <div>Duration: 2019-2020</div>
        </div>
        <div style={{ marginTop: 12 }}>
          <div>
            <span style={kw}>Rao Pahlad Singh School</span>, Mahendergarh
          </div>
          <div style={{ color: '#bbf7d0' }}>10th Class</div>
          <div>Duration: 2017-2018</div>
        </div>
      </div>
    </article>
  )
}

/** Tool icons for the About planet panel */
const TECH_STACK = [
  { name: 'C', img: cImg, href: 'https://en.cppreference.com/w/c' },
  { name: 'C++', img: cppImg, href: 'https://isocpp.org/' },
  { name: 'HTML', img: htmlImg, href: 'https://developer.mozilla.org/en-US/docs/Web/HTML' },
  { name: 'JavaScript', img: js, href: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript' },
  { name: 'TypeScript', img: typescript, href: 'https://www.typescriptlang.org/' },
  { name: 'CSS', img: cssImg, href: 'https://developer.mozilla.org/en-US/docs/Web/CSS' },
  { name: 'Tailwind', img: tailwind, href: 'https://tailwindcss.com/' },
  { name: 'Python', img: pythonImg, href: 'https://www.python.org/' },
  { name: 'React', img: reactImg, href: 'https://react.dev/' },
  { name: 'Redux', img: reduxImg, href: 'https://redux.js.org/' },
  { name: 'Next.js', img: next, href: 'https://nextjs.org/' },
  { name: 'Solidity', img: solidity, href: 'https://soliditylang.org/' },
  { name: 'Node.js', img: nodejs, href: 'https://nodejs.org/' },
  { name: 'MongoDB', img: mongodb, href: 'https://www.mongodb.com/' },
  { name: 'Postman', img: postmanImg, href: 'https://www.postman.com/' },
  { name: 'MySQL', img: mysqlImg, href: 'https://www.mysql.com/' },
]

function PanelTechnologies() {
  const [hovered, setHovered] = useState(null)

  return (
    <article
      style={{
        ...glassShell,
        color: '#cbd5e1',
        padding: 'clamp(18px, 3vw, 26px)',
        background: 'linear-gradient(155deg, rgba(15, 23, 42, 0.52) 0%, rgba(15, 23, 42, 0.36) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        boxShadow: '0 28px 80px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <h3 style={{ ...h3Style, marginBottom: 6, textAlign: 'center' }}>Technologies</h3>
      <div
        style={{
          width: 36,
          height: 1,
          margin: '14px auto 16px',
          background: 'linear-gradient(90deg, transparent, rgba(129, 140, 248, 0.45), transparent)',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
        }}
      >
        {TECH_STACK.map((item, i) => {
          const isHover = hovered === i
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noreferrer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                flex: '0 0 auto',
                width: 'clamp(88px, calc((100% - 60px) / 6), 108px)',
                boxSizing: 'border-box',
                padding: '12px 8px 14px',
                borderRadius: 14,
                textDecoration: 'none',
                color: 'inherit',
                background: isHover ? 'rgba(51, 65, 85, 0.55)' : 'rgba(30, 41, 59, 0.45)',
                border: `1px solid ${isHover ? 'rgba(165, 180, 252, 0.35)' : 'rgba(71, 85, 105, 0.5)'}`,
                boxShadow: isHover
                  ? '0 10px 28px rgba(0,0,0,0.35), 0 0 0 1px rgba(99, 102, 241, 0.12)'
                  : '0 4px 16px rgba(0,0,0,0.2)',
                transform: isHover ? 'translateY(-2px)' : 'translateY(0)',
                transition:
                  'background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease',
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: '1px solid rgba(100, 116, 139, 0.25)',
                }}
              >
                <img
                  src={item.img}
                  alt={item.name}
                  style={{
                    maxWidth: 34,
                    maxHeight: 34,
                    objectFit: 'contain',
                    ...(item.name === 'Next.js'
                      ? { backgroundColor: '#fff', borderRadius: 6, padding: 4 }
                      : {}),
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.04em',
                  color: isHover ? '#e2e8f0' : '#94a3b8',
                  textAlign: 'center',
                  lineHeight: 1.25,
                  transition: 'color 0.2s ease',
                }}
              >
                {item.name}
              </span>
            </a>
          )
        })}
      </div>
    </article>
  )
}

const spotifyGreen = '#1ed760'

function PanelTunes() {
  const [hovered, setHovered] = useState(null)
  const tracks = [
    { id: '5KsUSkoxajNI8CIJ3spjST', title: 'Kiska Rasta Dekhe - From "Joshila"', artist: 'Kishore Kumar, R. D. Burman' },
    { id: '46bHffIYlRKDZJG1Wbv8vi', title: 'Main Nashe Mein Hoon - Jagjit Singh', artist: 'Jagjit Singh' },
    { id: '0ZxIxTxup7AiJIHDwodwCR', title: 'Kabhi Khamosh Baithoge', artist: 'Jagjit Singh' },
  ]

  return (
    <article
      style={{
        ...glassShell,
        color: '#cbd5e1',
        padding: 'clamp(18px, 3vw, 26px)',
        background: 'linear-gradient(155deg, rgba(15, 23, 42, 0.52) 0%, rgba(15, 23, 42, 0.36) 100%)',
        border: '1px solid rgba(148, 163, 184, 0.12)',
        boxShadow: '0 28px 80px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255,255,255,0.06)',
      }}
    >
      <h3 style={{ ...h3Style, marginBottom: 6, textAlign: 'center' }}>Favourite Tunes</h3>
      <p
        style={{
          margin: '0 0 4px',
          fontSize: 12,
          lineHeight: 1.55,
          color: '#94a3b8',
          textAlign: 'center',
        }}
      >
        A small collection of tracks I{' '}
        <span style={{ ...kw, fontSize: 12 }}>keep on repeat while building</span>.
      </p>
      <div
        style={{
          width: 36,
          height: 1,
          margin: '14px auto 16px',
          background: `linear-gradient(90deg, transparent, ${spotifyGreen}66, transparent)`,
        }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tracks.map((track, i) => {
          const isHover = hovered === i
          return (
            <a
              key={track.id}
              href={`https://open.spotify.com/track/${track.id}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px 14px',
                borderRadius: 14,
                textDecoration: 'none',
                color: 'inherit',
                background: isHover ? 'rgba(30, 41, 59, 0.72)' : 'rgba(30, 41, 59, 0.42)',
                border: `1px solid ${
                  isHover ? 'rgba(30, 215, 96, 0.42)' : 'rgba(71, 85, 105, 0.55)'
                }`,
                boxShadow: isHover
                  ? `0 10px 28px rgba(0,0,0,0.38), 0 0 0 1px rgba(30, 215, 96, 0.1)`
                  : '0 4px 18px rgba(0,0,0,0.22)',
                transform: isHover ? 'translateY(-2px)' : 'translateY(0)',
                transition:
                  'background 0.22s ease, border-color 0.22s ease, box-shadow 0.22s ease, transform 0.22s ease',
              }}
            >
              <div
                style={{
                  flexShrink: 0,
                  width: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 12,
                  background: isHover ? 'rgba(30, 215, 96, 0.12)' : 'rgba(15, 23, 42, 0.75)',
                  border: `1px solid ${isHover ? 'rgba(30, 215, 96, 0.35)' : 'rgba(100, 116, 139, 0.3)'}`,
                  transition: 'background 0.22s ease, border-color 0.22s ease',
                }}
              >
                <SiSpotify size={22} color={spotifyGreen} aria-hidden />
              </div>
              <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: 13,
                    lineHeight: 1.35,
                    color: isHover ? '#f8fafc' : '#f1f5f9',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {track.title}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    marginTop: 3,
                    color: '#94a3b8',
                    lineHeight: 1.35,
                  }}
                >
                  {track.artist}
                </div>
              </div>
              <span
                style={{
                  flexShrink: 0,
                  fontSize: 10,
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: spotifyGreen,
                  opacity: isHover ? 1 : 0.88,
                  transition: 'opacity 0.2s ease',
                }}
              >
                Open ↗
              </span>
            </a>
          )
        })}
      </div>
    </article>
  )
}

function StoryPanel({ chapter }) {
  if (chapter < 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {chapter === 0 && <PanelBackground />}
      {chapter === 1 && <PanelEducation />}
      {chapter === 2 && <PanelTechnologies />}
      {chapter === 3 && <PanelTunes />}
    </div>
  )
}

export function AboutScreen() {
  const [shellMounted, setShellMounted] = useState(false)
  const [shellOpacity, setShellOpacity] = useState(0)
  const [chapter, setChapter] = useState(-1)
  const [renderedChapter, setRenderedChapter] = useState(-1)
  const [contentOpacity, setContentOpacity] = useState(0)
  const [scrollP, setScrollP] = useState(0)

  const rootRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const scrollTrackRef = useRef(null)
  const progressRef = useRef(0)
  const scrollTriggerRef = useRef(null)
  const prevChapterRef = useRef(-1)
  const contentTimersRef = useRef([])
  const shellClosingRef = useRef(false)

  const jumpToPlanet = useCallback((planetIndex) => {
    const el = scrollContainerRef.current
    if (!el) return
    const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
    if (maxScroll <= 0) return
    const targetP = scrollProgressForPlanet(planetIndex)
    el.scrollTo({ top: targetP * maxScroll, behavior: 'smooth' })
  }, [])

  const closePlanetContent = useCallback(() => {
    const el = scrollContainerRef.current
    if (!el) return
    el.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const clearContentTimers = useCallback(() => {
    contentTimersRef.current.forEach((id) => clearTimeout(id))
    contentTimersRef.current = []
  }, [])

  /** Fade whole About out, then unmount and notify listeners */
  const finishShellClose = useCallback((nextEvent) => {
    if (shellClosingRef.current) return
    shellClosingRef.current = true
    clearContentTimers()
    setShellOpacity(0)
    const t = setTimeout(() => {
      shellClosingRef.current = false
      setShellMounted(false)
      setChapter(-1)
      setRenderedChapter(-1)
      setContentOpacity(0)
      prevChapterRef.current = -1
      window.dispatchEvent(
        new CustomEvent('hideAbout', { detail: { source: HIDE_ABOUT_INTERNAL } })
      )
      if (nextEvent) window.dispatchEvent(new Event(nextEvent))
    }, ABOUT_UI_FADE_MS)
    contentTimersRef.current.push(t)
  }, [clearContentTimers])

  useEffect(() => {
    const onShow = () => {
      clearContentTimers()
      setRenderedChapter(-1)
      setContentOpacity(0)
      setChapter(-1)
      prevChapterRef.current = -1
      progressRef.current = 0
      setShellMounted(true)
    }
    const onHide = (e) => {
      if (e?.detail?.source === HIDE_ABOUT_INTERNAL) return
      finishShellClose(null)
    }

    window.addEventListener('showAbout', onShow)
    window.addEventListener('hideAbout', onHide)

    return () => {
      window.removeEventListener('showAbout', onShow)
      window.removeEventListener('hideAbout', onHide)
    }
  }, [clearContentTimers, finishShellClose])

  /** Shell fade in after mount */
  useEffect(() => {
    if (!shellMounted) return undefined
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => setShellOpacity(1))
    })
    return () => cancelAnimationFrame(id)
  }, [shellMounted])

  /** Story overlay: fade only intro ↔ story (chapter -1 ↔ 0+). Chapter 0–3 swaps are instant. */
  useEffect(() => {
    const from = prevChapterRef.current
    const to = chapter
    prevChapterRef.current = to
    clearContentTimers()

    if (to < 0) {
      setContentOpacity(0)
      const t = setTimeout(() => setRenderedChapter(-1), ABOUT_UI_FADE_MS)
      contentTimersRef.current.push(t)
      return () => clearTimeout(t)
    }

    if (from < 0 && to >= 0) {
      setRenderedChapter(to)
      const id = requestAnimationFrame(() => {
        requestAnimationFrame(() => setContentOpacity(1))
      })
      return () => cancelAnimationFrame(id)
    }

    if (from >= 0 && to >= 0 && from !== to) {
      setRenderedChapter(to)
      setContentOpacity(1)
      return undefined
    }

    return undefined
  }, [chapter, clearContentTimers])

  useLayoutEffect(() => {
    if (!shellMounted) return undefined

    const el = scrollContainerRef.current
    const track = scrollTrackRef.current
    if (!el || !track) return undefined

    el.scrollTop = 0
    progressRef.current = 0

    const ctx = gsap.context(() => {
      scrollTriggerRef.current = ScrollTrigger.create({
        scroller: el,
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.65,
        onUpdate: (self) => {
          progressRef.current = self.progress
          setScrollP(self.progress)
          const ch = getStoryChapter(self.progress)
          setChapter((prev) => (prev !== ch ? ch : prev))
        },
      })
      requestAnimationFrame(() => ScrollTrigger.refresh())
    }, rootRef)

    return () => {
      scrollTriggerRef.current?.kill()
      scrollTriggerRef.current = null
      ctx.revert()
    }
  }, [shellMounted])

  /** Wheel on scroll container (capture) so we see events even when inner UI captures; same logic as before */
  useEffect(() => {
    if (!shellMounted) return undefined

    const el = scrollContainerRef.current
    if (!el) return undefined

    const onWheel = (event) => {
      if (shellClosingRef.current) return
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
      const top = el.scrollTop
      const prog = progressRef.current

      if (event.deltaY < 0 && top <= 16) {
        finishShellClose('aboutToCard')
        return
      }

      if (event.deltaY > 0 && getStoryChapter(prog) === 3) {
        const slack = 64
        const scrollAtEnd =
          maxScroll <= 1
            ? prog >= 0.92
            : top >= maxScroll - slack || top + el.clientHeight >= el.scrollHeight - 16
        // Deep in Favourite Tunes band, or scroll metrics at end — avoids mismatch between ST progress and scrollTop
        if (scrollAtEnd || prog >= 0.93) {
          finishShellClose('aboutToExperience')
        }
      }
    }

    el.addEventListener('wheel', onWheel, { passive: true, capture: true })
    return () => el.removeEventListener('wheel', onWheel, { capture: true })
  }, [shellMounted, finishShellClose])

  if (!shellMounted) return null

  const fadeTransition = `opacity ${ABOUT_UI_FADE_MS}ms ease-out`

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'auto',
        zIndex: 4,
        height: '100%',
        opacity: shellOpacity,
        transition: fadeTransition,
      }}
    >
      <div
        ref={scrollContainerRef}
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div ref={scrollTrackRef} style={{ minHeight: '520vh', position: 'relative' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              minHeight: '100vh',
              height: '100vh',
              display: 'flex',
              alignItems: 'stretch',
              justifyContent: 'center',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'auto',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  opacity: chapter < 0 ? 1 : 0,
                  transition: fadeTransition,
                  pointerEvents: chapter < 0 ? 'auto' : 'none',
                }}
              >
                <AboutSolarCanvas progressRef={progressRef} onPlanetClick={jumpToPlanet} />
              </div>
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  zIndex: 1,
                  opacity: chapter >= 0 ? contentOpacity : 0,
                  transition: fadeTransition,
                  pointerEvents: 'none',
                }}
              >
                <IntroSpaceCanvas
                  active={shellMounted && chapter >= 0}
                  showStars
                  showMeteors={false}
                />
              </div>
            </div>

            <div
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 2,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'clamp(14px, 3.5vw, 36px)',
                boxSizing: 'border-box',
              }}
            >
              {/* Intro vignette (solar-only) — fades out when a chapter is active */}
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: `rgba(2, 6, 23, ${Math.min(0.52, 0.08 + scrollP * 0.42)})`,
                  opacity: chapter < 0 ? 1 : 0,
                  transition: fadeTransition,
                  pointerEvents: 'none',
                }}
              />
              {/* Heavy overlay + panels — fades in/out over ABOUT_UI_FADE_MS */}
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: contentOpacity,
                  transition: fadeTransition,
                  pointerEvents: contentOpacity > 0.02 ? 'auto' : 'none',
                }}
              >
                <button
                  type="button"
                  tabIndex={-1}
                  aria-label="Close story and return to the solar system"
                  onClick={closePlanetContent}
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    margin: 0,
                    padding: 0,
                    border: 'none',
                    cursor: 'pointer',
                    background: 'transparent',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    pointerEvents: 'auto',
                    width: 'min(96vw, 680px)',
                    overflow: 'visible',
                    boxSizing: 'border-box',
                  }}
                >
                  <StoryPanel chapter={renderedChapter} />
                </div>
              </div>
            </div>

            <div
              className="about-solar-social"
              style={{
                position: 'absolute',
                bottom: 20,
                left: '50%',
                transform: 'translateX(-50%)',
                display: 'flex',
                gap: 11,
                pointerEvents: 'auto',
                zIndex: 4,
              }}
            >
              {[
                { href: 'https://github.com/dkyadavkosli', Icon: SiGithub },
                { href: 'https://www.linkedin.com/in/dipesh-kumar-b8580020b/', Icon: FaLinkedin },
                { href: 'https://www.instagram.com/kal.se_padhai.shuru/', Icon: SiInstagram },
                { href: 'https://twitter.com/DipeshK71331890', Icon: SiX },
              ].map(({ href, Icon }) => (
                <a
                  key={href}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    color: '#e8eaef',
                    fontSize: 19,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 42,
                    height: 42,
                    borderRadius: 11,
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                  }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>
        {`
          .about-solar-social a {
            transition: transform 0.32s cubic-bezier(0.22, 1, 0.36, 1),
              border-color 0.28s ease,
              background 0.28s ease;
          }
          .about-solar-social a:hover {
            transform: scale(1.05);
            border-color: rgba(199, 210, 254, 0.18);
            background: rgba(255, 255, 255, 0.06);
          }
        `}
      </style>
    </div>
  )
}
