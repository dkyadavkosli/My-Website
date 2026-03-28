import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import pic1 from '../assets/freelance.png'
import pic2 from '../assets/crowd.png'
import pic3 from '../assets/esports.png'
import { IntroSpaceCanvas } from './IntroSpaceCanvas'
import { ProjectsFocusOverlay, ProjectsSignalNetwork } from './ProjectsSignalNetwork'

gsap.registerPlugin(ScrollTrigger)

const EASE_EXIT = 'sine.inOut'

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

const ACCENT = '#7dd3fc'

export function ProjectsScreen() {
  const [visible, setVisible] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(null)
  const [hoverIndex, setHoverIndex] = useState(null)
  const [lineAnimKey, setLineAnimKey] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  const rootRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const scrollTrackRef = useRef(null)
  const exitWrapRef = useRef(null)
  const vignetteRef = useRef(null)
  const scrollTriggerRef = useRef(null)
  const exitDispatchedRef = useRef(false)
  /** 0 → 1 while user scrolls the exit track; drives meteor shower intensity on IntroSpaceCanvas */
  const projectsExitProgressRef = useRef(0)

  useEffect(() => {
    const onShow = () => {
      setVisible(true)
      exitDispatchedRef.current = false
    }

    const onHide = () => {
      setFocusedIndex(null)
      setHoverIndex(null)
      setVisible(false)
    }

    window.addEventListener('showProjects', onShow)
    window.addEventListener('hideProjects', onHide)

    return () => {
      window.removeEventListener('showProjects', onShow)
      window.removeEventListener('hideProjects', onHide)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (visible) projectsExitProgressRef.current = 0
  }, [visible])

  useLayoutEffect(() => {
    if (!visible || reducedMotion) return undefined
    const scrollEl = scrollContainerRef.current
    const track = scrollTrackRef.current
    const exitWrap = exitWrapRef.current
    if (!scrollEl || !track || !exitWrap) return undefined

    scrollEl.scrollTop = 0

    const ctx = gsap.context(() => {
      const exitTl = gsap.timeline({ paused: true })
      exitTl.to(
        exitWrap,
        {
          opacity: 0,
          y: -22,
          scale: 0.94,
          filter: 'blur(7px)',
          duration: 1.1,
          ease: EASE_EXIT,
        },
        0
      )
      if (vignetteRef.current) {
        exitTl.to(
          vignetteRef.current,
          {
            opacity: 0,
            duration: 0.95,
            ease: EASE_EXIT,
          },
          0.12
        )
      }

      const finishExit = () => {
        if (exitDispatchedRef.current) return
        exitDispatchedRef.current = true
        setFocusedIndex(null)
        setHoverIndex(null)
        setVisible(false)
        window.dispatchEvent(new Event('hideProjects'))
        window.dispatchEvent(new Event('projectsToContact'))
      }

      scrollTriggerRef.current = ScrollTrigger.create({
        scroller: scrollEl,
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.75,
        animation: exitTl,
        onUpdate: (self) => {
          projectsExitProgressRef.current = self.progress
          if (self.progress >= 0.998 && !exitDispatchedRef.current) {
            finishExit()
          }
        },
        onLeave: () => {
          finishExit()
        },
      })

      ScrollTrigger.refresh()
    }, rootRef)

    return () => {
      scrollTriggerRef.current?.kill()
      scrollTriggerRef.current = null
      ctx.revert()
    }
  }, [visible, reducedMotion])

  useEffect(() => {
    if (!visible) return undefined
    if (focusedIndex !== null) return undefined

    if (reducedMotion) {
      const handleWheel = (event) => {
        if (event.deltaY < 0) {
          setFocusedIndex(null)
          setVisible(false)
          window.dispatchEvent(new Event('hideProjects'))
          window.dispatchEvent(new Event('projectsToExperience'))
        } else if (event.deltaY > 0) {
          setFocusedIndex(null)
          setVisible(false)
          window.dispatchEvent(new Event('hideProjects'))
          window.dispatchEvent(new Event('projectsToContact'))
        }
      }
      window.addEventListener('wheel', handleWheel, { passive: true })
      return () => window.removeEventListener('wheel', handleWheel)
    }

    const scrollEl = scrollContainerRef.current
    if (!scrollEl) return undefined

    const onWheelUpAtTop = (event) => {
      if (scrollEl.scrollTop > 2) return
      if (event.deltaY >= 0) return
      setFocusedIndex(null)
      setVisible(false)
      window.dispatchEvent(new Event('hideProjects'))
      window.dispatchEvent(new Event('projectsToExperience'))
    }
    scrollEl.addEventListener('wheel', onWheelUpAtTop, { passive: true })
    return () => scrollEl.removeEventListener('wheel', onWheelUpAtTop)
  }, [visible, focusedIndex, reducedMotion])

  useEffect(() => {
    if (!visible) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setFocusedIndex(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [visible])

  useEffect(() => {
    return () => {
      document.body.style.cursor = 'auto'
    }
  }, [])

  const handleSelectNode = useCallback((index) => {
    setLineAnimKey((k) => k + 1)
    setFocusedIndex(index)
  }, [])

  const closeFocus = useCallback(() => {
    setFocusedIndex(null)
  }, [])

  if (!visible) return null

  const focusedProject = focusedIndex !== null ? PROJECTS[focusedIndex] : null
  const trackMinHeight = reducedMotion ? '100vh' : '200vh'

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        inset: 0,
        zIndex: 8,
        display: 'flex',
        flexDirection: 'column',
        pointerEvents: 'none',
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          pointerEvents: 'auto',
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        <div
          ref={scrollContainerRef}
          style={{
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
          }}
        >
          <div
            ref={scrollTrackRef}
            style={{
              minHeight: trackMinHeight,
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 0,
                minHeight: '100vh',
                height: '100vh',
              }}
            >
              <div
                ref={vignetteRef}
                style={{
                  position: 'absolute',
                  inset: 0,
                  background:
                    'radial-gradient(ellipse 85% 65% at 50% 38%, rgba(15, 23, 42, 0.35), transparent 58%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              {!reducedMotion && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                  }}
                >
                  <IntroSpaceCanvas
                    active={visible}
                    showStars={false}
                    exitProgressRef={projectsExitProgressRef}
                  />
                </div>
              )}
              <div
                ref={exitWrapRef}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  height: '100%',
                  minHeight: '100vh',
                  willChange: 'transform, opacity, filter',
                }}
              >
                <ProjectsSignalNetwork
                  projects={PROJECTS}
                  focusedIndex={focusedIndex}
                  hoverIndex={hoverIndex}
                  onHover={setHoverIndex}
                  onSelectNode={handleSelectNode}
                  reducedMotion={reducedMotion}
                  lineAnimKey={lineAnimKey}
                />

                <header
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    padding: 'clamp(36px, 6.5vh, 72px) 20px 10px',
                    textAlign: 'center',
                    pointerEvents: 'none',
                    zIndex: 4,
                  }}
                >
                  <h2
                    style={{
                      margin: 0,
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: 'clamp(1.05rem, 2.75vw, 1.45rem)',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      color: '#f8fafc',
                      fontWeight: 700,
                      textShadow: '0 0 40px rgba(125, 211, 252, 0.22), 0 2px 24px rgba(0, 0, 0, 0.45)',
                    }}
                  >
                    Recent Projects
                  </h2>
                  <div
                    style={{
                      width: 'min(200px, 52vw)',
                      height: 2,
                      margin: '14px auto 0',
                      borderRadius: 1,
                      background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
                      opacity: 0.72,
                      boxShadow: '0 0 20px rgba(125, 211, 252, 0.35)',
                    }}
                  />
                </header>
              </div>
            </div>
          </div>
        </div>

        <ProjectsFocusOverlay
          project={focusedProject}
          open={focusedIndex !== null}
          onClose={closeFocus}
          reducedMotion={reducedMotion}
        />
      </div>
    </div>
  )
}
