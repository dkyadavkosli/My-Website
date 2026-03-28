import { useEffect, useState, useRef, useLayoutEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const EASE_INTRO = 'expo.out'
const EASE_EXIT = 'sine.inOut'
const EASE_FLOAT = 'sine.inOut'
const EASE_CURSOR = 'sine.out'

const FULL_TEXT = "I'M DIPESH"
const CHAR_INTERVAL_MS = 500

const HEY_INTRO_DURATION_S = 0.2

export function IntroHero() {
  const [visible, setVisible] = useState(false)
  const [typed, setTyped] = useState('')
  const [typingDone, setTypingDone] = useState(false)

  const rootRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const scrollTrackRef = useRef(null)
  const exitWrapRef = useRef(null)
  const floatWrapRef = useRef(null)
  const heyRef = useRef(null)
  const dipeshRowRef = useRef(null)
  const cursorRef = useRef(null)
  const vignetteRef = useRef(null)
  const exitDispatchedRef = useRef(false)
  const scrollTriggerRef = useRef(null)

  useEffect(() => {
    const onShow = () => {
      setVisible(true)
      exitDispatchedRef.current = false
    }

    window.addEventListener('showHero', onShow)
    return () => window.removeEventListener('showHero', onShow)
  }, [])

  useEffect(() => {
    if (!visible) return undefined

    let cancelled = false
    let intervalId = 0

    const startId = requestAnimationFrame(() => {
      if (cancelled) return
      setTyped('')
      setTypingDone(false)

      let index = 0
      const step = () => {
        index += 1
        const next = FULL_TEXT.slice(0, index)
        setTyped(next)
        if (next.length >= FULL_TEXT.length) {
          setTypingDone(true)
          return true
        }
        return false
      }

      if (FULL_TEXT.length > 0 && !step()) {
        intervalId = window.setInterval(() => {
          if (cancelled) return
          if (step()) clearInterval(intervalId)
        }, CHAR_INTERVAL_MS)
      }
    })

    return () => {
      cancelled = true
      cancelAnimationFrame(startId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [visible])

  useLayoutEffect(() => {
    if (!visible || !scrollContainerRef.current) return undefined

    const scrollEl = scrollContainerRef.current
    scrollEl.scrollTop = 0

    const ctx = gsap.context(() => {
      if (heyRef.current && dipeshRowRef.current) {
        gsap.set(heyRef.current, {
          opacity: 0,
          y: 36,
          scale: 0.94,
          transformOrigin: 'center center',
        })
        gsap.set(dipeshRowRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          transformOrigin: 'center center',
        })

        gsap.to(heyRef.current, {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: HEY_INTRO_DURATION_S,
          ease: EASE_INTRO,
        })
      }

      if (floatWrapRef.current) {
        gsap.to(floatWrapRef.current, {
          y: 8,
          duration: 6.2,
          repeat: -1,
          yoyo: true,
          ease: EASE_FLOAT,
        })
      }

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
      exitTl.to(
        vignetteRef.current,
        {
          opacity: 0,
          duration: 0.95,
          ease: EASE_EXIT,
        },
        0.12
      )

      scrollTriggerRef.current = ScrollTrigger.create({
        scroller: scrollEl,
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.75,
        animation: exitTl,
        onUpdate: (self) => {
          window.dispatchEvent(
            new CustomEvent('heroScrollProgress', {
              detail: { progress: self.progress },
            })
          )
          if (self.progress >= 0.998 && !exitDispatchedRef.current) {
            exitDispatchedRef.current = true
            window.dispatchEvent(new Event('heroToCard'))
            setVisible(false)
          }
        },
        onLeave: () => {
          if (exitDispatchedRef.current) return
          exitDispatchedRef.current = true
          window.dispatchEvent(new Event('heroToCard'))
          setVisible(false)
        },
      })

      ScrollTrigger.refresh()
    }, rootRef)

    return () => {
      scrollTriggerRef.current?.kill()
      scrollTriggerRef.current = null
      ctx.revert()
    }
  }, [visible])

  useLayoutEffect(() => {
    if (!typingDone || !cursorRef.current) return undefined

    const el = cursorRef.current

    const tl = gsap.timeline()
    tl.fromTo(
      el,
      { opacity: 0, scaleY: 0.72 },
      { opacity: 1, scaleY: 1, duration: 0.48, ease: EASE_CURSOR }
    )
    tl.to(el, {
      opacity: 0.26,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    })
    return () => {
      tl.kill()
    }
  }, [typingDone])

  if (!visible) return null

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={scrollContainerRef}
        style={{
          position: 'absolute',
          inset: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          pointerEvents: 'auto',
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
              pointerEvents: 'none',
            }}
          >
            <div
              ref={vignetteRef}
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at top, rgba(15, 23, 42, 0.45), transparent 55%)',
                pointerEvents: 'none',
              }}
            />
            <div
              ref={exitWrapRef}
              style={{
                position: 'relative',
                zIndex: 1,
                pointerEvents: 'auto',
                textAlign: 'center',
                paddingInline: '24px',
                willChange: 'transform, opacity, filter',
              }}
            >
              <div
                aria-hidden
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  width: 'min(92vw, 640px)',
                  height: 'min(52vh, 420px)',
                  background:
                    'radial-gradient(ellipse 70% 55% at 50% 42%, rgba(129, 140, 248, 0.11) 0%, rgba(99, 102, 241, 0.05) 35%, transparent 72%)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              />
              <div
                ref={floatWrapRef}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  perspective: '1400px',
                  transformStyle: 'preserve-3d',
                  willChange: 'transform',
                }}
              >
                <div
                  style={{
                    transform: 'translateZ(-32px)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <h1
                    ref={heyRef}
                    style={{
                      margin: 0,
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: 'clamp(3rem, 7.5vw, 4.2rem)',
                      fontWeight: 500,
                      letterSpacing: '0.36em',
                      textTransform: 'uppercase',
                      color: 'rgba(248, 250, 252, 0.9)',
                      textShadow:
                        '0 0 40px rgba(255, 255, 255, 0.055), 0 0 80px rgba(165, 180, 252, 0.04), 0 0 1px rgba(255, 255, 255, 0.12)',
                    }}
                  >
                    HEY THERE
                  </h1>
                </div>
                <div
                  style={{
                    marginTop: 32,
                    transform: 'translateZ(22px)',
                    transformStyle: 'preserve-3d',
                  }}
                >
                  <div
                    ref={dipeshRowRef}
                    style={{
                      fontFamily:
                        'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: 'clamp(3.9rem, 10vw, 6.4rem)',
                      fontWeight: 600,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'transparent',
                      backgroundImage:
                        'radial-gradient(ellipse 95% 85% at 50% 28%, rgba(191, 219, 254, 0.55) 0%, rgba(147, 197, 253, 0.22) 28%, transparent 58%), radial-gradient(ellipse 80% 70% at 50% 100%, rgba(226, 232, 240, 0.12) 0%, transparent 45%), linear-gradient(180deg, rgba(30, 41, 59, 0.35) 0%, rgba(15, 23, 42, 0.92) 100%)',
                      WebkitBackgroundClip: 'text',
                      backgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      WebkitTextStroke: '0.85px rgba(226, 232, 240, 0.78)',
                      textStroke: '0.85px rgba(226, 232, 240, 0.78)',
                      lineHeight: 1.2,
                      filter:
                        'brightness(1.07) drop-shadow(0 0 1px rgba(255, 255, 255, 0.12)) drop-shadow(0 0 18px rgba(199, 210, 254, 0.14)) drop-shadow(0 0 42px rgba(99, 102, 241, 0.09))',
                      transformOrigin: 'center center',
                    }}
                  >
                    {typed}
                    {typingDone && (
                      <span
                        ref={cursorRef}
                        style={{
                          display: 'inline-block',
                          width: '0.08em',
                          marginLeft: '0.12em',
                          height: '0.9em',
                          background:
                            'linear-gradient(180deg, #f1f5f9 0%, #cbd5e1 100%)',
                          verticalAlign: 'middle',
                          borderRadius: 1,
                          boxShadow:
                            '0 0 10px rgba(241, 245, 249, 0.35), 0 0 22px rgba(165, 180, 252, 0.25)',
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
