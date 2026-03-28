import { useState, useEffect, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { IntroSpaceCanvas } from './IntroSpaceCanvas'

gsap.registerPlugin(ScrollTrigger)

const EASE_EXIT = 'sine.inOut'

const INTRO_PARAGRAPHS = [
  "I'm a software engineer who enjoys building reliable, high-performance web applications and solving complex engineering problems. My work focuses on modern web technologies, system design, and creating products that are both scalable and user-centric. I enjoy turning ideas into well-engineered solutions and continuously improving systems through thoughtful architecture and clean code.",
  "Outside of development, I'm deeply competitive and enjoy pushing my limits through sports. I've competed at the state level in cricket and volleyball, and I'm also an active esports athlete. When I'm not coding or playing, you'll probably find me exploring geopolitics or watching documentaries that dive into science, technology, and the universe.",
]

export function IntroText() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  const rootRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const scrollTrackRef = useRef(null)
  const exitWrapRef = useRef(null)
  const textBlockRef = useRef(null)
  const scrollBoostRef = useRef(0)
  const exitDispatchedRef = useRef(false)
  const scrollTriggerRef = useRef(null)

  useEffect(() => {
    if (!visible || dismissed) return

    const handleWheel = (event) => {
      if (!visible) return
      const dy = Math.abs(event.deltaY)
      scrollBoostRef.current = Math.min(2.6, scrollBoostRef.current + dy * 0.0016)

      const scroller = scrollContainerRef.current
      if (scroller && event.deltaY < 0 && scroller.scrollTop <= 2) {
        setDismissed(true)
        window.dispatchEvent(new Event('cardToHero'))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [visible, dismissed])

  useEffect(() => {
    const handleShowIntroCard = () => {
      setVisible(true)
      setDismissed(false)
      exitDispatchedRef.current = false
      scrollBoostRef.current = 0
      if (textBlockRef.current) {
        gsap.set(textBlockRef.current, { opacity: 0 })
      }
    }

    window.addEventListener('showCardIntro', handleShowIntroCard)
    return () => window.removeEventListener('showCardIntro', handleShowIntroCard)
  }, [])

  useLayoutEffect(() => {
    if (!visible || dismissed) return undefined

    const scrollEl = scrollContainerRef.current
    if (!scrollEl) return undefined

    scrollEl.scrollTop = 0

    const ctx = gsap.context(() => {
      const exitWrap = exitWrapRef.current
      const track = scrollTrackRef.current
      if (!exitWrap || !track) return

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

      const dispatchExit = () => {
        if (exitDispatchedRef.current) return
        exitDispatchedRef.current = true
        window.dispatchEvent(new Event('cardToAbout'))
        setDismissed(true)
      }

      scrollTriggerRef.current = ScrollTrigger.create({
        scroller: scrollEl,
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.75,
        animation: exitTl,
        onUpdate: (self) => {
          window.dispatchEvent(
            new CustomEvent('introCardScrollProgress', {
              detail: { progress: self.progress },
            })
          )
          if (self.progress >= 0.998) {
            dispatchExit()
          }
        },
        onLeave: dispatchExit,
      })

      const block = textBlockRef.current
      if (block) {
        gsap.set(block, { opacity: 0 })
        gsap.to(block, {
          opacity: 1,
          duration: 1.25,
          ease: 'power1.out',
          delay: 0.12,
        })
      }

      ScrollTrigger.refresh()
    }, rootRef)

    return () => {
      scrollTriggerRef.current?.kill()
      scrollTriggerRef.current = null
      ctx.revert()
    }
  }, [visible, dismissed])

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: visible && !dismissed ? 1 : 0,
        transition: 'opacity 0.5s ease-out',
      }}
    >
      {visible && !dismissed && (
        <div
          ref={rootRef}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'auto',
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
                minHeight: '200vh',
                position: 'relative',
              }}
            >
              <div
                style={{
                  position: 'sticky',
                  top: 0,
                  minHeight: '100vh',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 24px',
                  boxSizing: 'border-box',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                    pointerEvents: 'none',
                    overflow: 'hidden',
                  }}
                >
                  <IntroSpaceCanvas active={visible && !dismissed} boostRef={scrollBoostRef} />
                </div>

                <div
                  ref={exitWrapRef}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    maxWidth: '760px',
                    width: 'min(92vw, 760px)',
                    willChange: 'transform, opacity, filter',
                  }}
                >
                  <div
                    ref={textBlockRef}
                    className="intro-text-glass"
                    style={{
                      position: 'relative',
                      zIndex: 1,
                      width: '100%',
                      opacity: 0,
                      borderRadius: 22,
                      padding: 'clamp(1.1rem, 2.5vw, 1.65rem) clamp(1.15rem, 2.8vw, 1.75rem)',
                      boxSizing: 'border-box',
                      background:
                        'linear-gradient(145deg, rgba(15, 23, 42, 0.36) 0%, rgba(30, 41, 59, 0.2) 100%)',
                      backdropFilter: 'blur(22px) saturate(1.12)',
                      WebkitBackdropFilter: 'blur(22px) saturate(1.12)',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      boxShadow:
                        'inset 0 1px 0 rgba(255, 255, 255, 0.06), 0 24px 72px rgba(15, 23, 42, 0.45)',
                    }}
                  >
                    <article
                      style={{
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 'clamp(0.85rem, 2vh, 1.1rem)',
                      }}
                    >
                      {INTRO_PARAGRAPHS.map((text, i) => (
                        <p
                          key={`intro-para-${i}`}
                          style={{
                            margin: 0,
                            fontFamily:
                              'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                            fontSize: 'clamp(13px, 1.15vw, 15px)',
                            lineHeight: 1.65,
                            letterSpacing: '0.02em',
                            color: '#e8edf5',
                            textAlign: 'left',
                          }}
                        >
                          {text}
                        </p>
                      ))}
                    </article>

                    <a
                      className="intro-resume-btn intro-resume-ghost"
                      href="https://drive.google.com/file/d/1ezx41Y7qhoGHhkIXWKcKc964cuhXbSeH/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'inline-block',
                        marginTop: 'clamp(1rem, 2.4vh, 1.35rem)',
                        padding: '9px 26px',
                        borderRadius: 999,
                        border: '1px solid rgba(255, 255, 255, 0.14)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: '#f1f5f9',
                        fontFamily:
                          'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                        fontSize: 13,
                        fontWeight: 600,
                        letterSpacing: '0.08em',
                        textTransform: 'uppercase',
                        cursor: 'pointer',
                        textDecoration: 'none',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      My Resume
                    </a>
                  </div>

                  <style>
                    {`
                .intro-text-glass {
                  isolation: isolate;
                }
                .intro-resume-ghost {
                  transition: background 0.3s ease, border-color 0.3s ease, color 0.3s ease;
                }
                .intro-resume-ghost:hover {
                  background: rgba(255, 255, 255, 0.09);
                  border-color: rgba(255, 255, 255, 0.22);
                  color: #ffffff;
                }
              `}
                  </style>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
