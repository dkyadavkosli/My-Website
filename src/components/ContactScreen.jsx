import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import emailjs from '@emailjs/browser'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Toaster, toast } from 'react-hot-toast'
import { SiGithub, SiInstagram, SiX } from 'react-icons/si'
import { FaLinkedin } from 'react-icons/fa'
import { IntroSpaceCanvas } from './IntroSpaceCanvas'

gsap.registerPlugin(ScrollTrigger)

const ACCENT = '#7dd3fc'
const ACCENT_SOFT = 'rgba(125, 211, 252, 0.42)'
const EASE = 'power2.out'
const EASE_EXIT = 'sine.inOut'
const DURATION = 0.62
/** Arc-length gap between trail stars, as a fraction of total path length */
const TRAIL_STAR_GAP_FRAC = 0.13

export function ContactScreen() {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState('idle')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [connectionP, setConnectionP] = useState(0)
  const [trailStars, setTrailStars] = useState(() => [
    { x: 6, y: 46 },
    { x: 6, y: 46 },
    { x: 6, y: 46 },
  ])
  const [rippleKey, setRippleKey] = useState(0)

  const formRef = useRef(null)
  const formWrapRef = useRef(null)
  const varsRootRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const scrollTrackRef = useRef(null)
  const contactSectionFadeRef = useRef(null)
  const signalPathRef = useRef(null)
  const connectionProgressRef = useRef(0)
  const scrollTriggerRef = useRef(null)
  const rafUiRef = useRef(0)
  const signalPathLenRef = useRef(140)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    const onShow = () => {
      setVisible(true)
      setPhase('idle')
      setConnectionP(0)
      connectionProgressRef.current = 0
    }
    const onHide = () => {
      setVisible(false)
      setPhase('idle')
      setConnectionP(0)
      connectionProgressRef.current = 0
    }

    window.addEventListener('showContact', onShow)
    window.addEventListener('hideContact', onHide)

    return () => {
      window.removeEventListener('showContact', onShow)
      window.removeEventListener('hideContact', onHide)
    }
  }, [])

  useLayoutEffect(() => {
    if (!visible) return undefined

    const root = varsRootRef.current
    const scrollEl = scrollContainerRef.current
    const track = scrollTrackRef.current
    const pathEl = signalPathRef.current

    const setStarsFromPath = (path, L, progress) => {
      if (!path || typeof path.getPointAtLength !== 'function') return
      const gap = L * TRAIL_STAR_GAP_FRAC
      const lead = L * progress
      const lens = [lead, lead - gap, lead - 2 * gap].map((len) => Math.min(L, Math.max(0, len)))
      setTrailStars(lens.map((len) => {
        const pt = path.getPointAtLength(len)
        return { x: pt.x, y: pt.y }
      }))
    }

    if (reducedMotion) {
      connectionProgressRef.current = 1
      if (root) root.style.setProperty('--contact-p', '1')
      requestAnimationFrame(() => setConnectionP(1))
      if (pathEl && typeof pathEl.getTotalLength === 'function') {
        const L = pathEl.getTotalLength()
        signalPathLenRef.current = L
        pathEl.style.strokeDasharray = String(L)
        pathEl.style.strokeDashoffset = '0'
        requestAnimationFrame(() => setStarsFromPath(pathEl, L, 1))
      }
      return undefined
    }

    if (!scrollEl || !track || !root) return undefined

    scrollEl.scrollTop = 0
    connectionProgressRef.current = 0
    root.style.setProperty('--contact-p', '0')
    requestAnimationFrame(() => setConnectionP(0))

    const syncPathLength = () => {
      if (pathEl && typeof pathEl.getTotalLength === 'function') {
        signalPathLenRef.current = pathEl.getTotalLength()
      }
    }
    syncPathLength()

    const drawFullTrail = () => {
      if (!pathEl) return
      const L = signalPathLenRef.current
      pathEl.style.strokeDasharray = String(L)
      pathEl.style.strokeDashoffset = '0'
    }
    drawFullTrail()
    if (pathEl && typeof pathEl.getPointAtLength === 'function') {
      const L = signalPathLenRef.current
      requestAnimationFrame(() => setStarsFromPath(pathEl, L, 0))
    }

    const ctx = gsap.context(() => {
      const fadeWrap = contactSectionFadeRef.current
      const fadeTl =
        fadeWrap &&
        gsap.timeline({ paused: true }).to(fadeWrap, {
          opacity: 0,
          y: -22,
          scale: 0.94,
          filter: 'blur(7px)',
          duration: 1.1,
          ease: EASE_EXIT,
        })

      scrollTriggerRef.current = ScrollTrigger.create({
        scroller: scrollEl,
        trigger: track,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.65,
        animation: fadeTl || undefined,
        onUpdate: (self) => {
          const p = self.progress
          connectionProgressRef.current = p
          root.style.setProperty('--contact-p', String(p))
          drawFullTrail()
          if (!rafUiRef.current) {
            rafUiRef.current = requestAnimationFrame(() => {
              rafUiRef.current = 0
              const pr = connectionProgressRef.current
              setConnectionP(pr)
              if (pathEl && typeof pathEl.getTotalLength === 'function') {
                const L = signalPathLenRef.current
                setStarsFromPath(pathEl, L, pr)
              }
            })
          }
        },
      })
      ScrollTrigger.refresh()
    }, root)

    return () => {
      scrollTriggerRef.current?.kill()
      scrollTriggerRef.current = null
      ctx.revert()
    }
  }, [visible, reducedMotion])

  useEffect(() => {
    if (!visible) return undefined

    const scrollEl = scrollContainerRef.current
    if (!scrollEl) return undefined

    const handleWheel = (event) => {
      if (!visible) return
      const maxScroll = Math.max(0, scrollEl.scrollHeight - scrollEl.clientHeight)
      const top = scrollEl.scrollTop
      const p = connectionProgressRef.current

      if (event.deltaY < 0 && top <= 2) {
        setVisible(false)
        window.dispatchEvent(new Event('hideContact'))
        window.dispatchEvent(new Event('contactToProjects'))
        return
      }

      if (event.deltaY > 0 && maxScroll > 8 && top < maxScroll - 24) {
        return
      }

      if (event.deltaY > 0 && (maxScroll <= 8 || top >= maxScroll - 24) && p >= 0.94) {
        setVisible(false)
        window.dispatchEvent(new Event('hideContact'))
        window.dispatchEvent(new Event('contactToThankYou'))
      }
    }

    window.addEventListener('wheel', handleWheel, { passive: true })
    return () => window.removeEventListener('wheel', handleWheel)
  }, [visible])

  const sendEmail = useCallback(
    async (e) => {
      e.preventDefault()
      if (phase !== 'idle' || !formRef.current) return

      setRippleKey((k) => k + 1)
      setPhase('sending')
      const minHoldMs = reducedMotion ? 0 : 980
      const t0 = Date.now()

      try {
        await emailjs.sendForm(
          'service_r61kmn8',
          'template_5gxoita',
          formRef.current,
          '0J3p5PmdR7bRXKFCv'
        )
        const elapsed = Date.now() - t0
        await new Promise((r) => setTimeout(r, Math.max(0, minHoldMs - elapsed)))
        formRef.current.reset()
        setPhase('success')
      } catch {
        setPhase('idle')
        toast.error('Failed to send email.')
      }
    },
    [phase, reducedMotion]
  )

  useEffect(() => {
    if (phase !== 'success') return undefined
    const id = setTimeout(() => setPhase('idle'), 5200)
    return () => clearTimeout(id)
  }, [phase])

  if (!visible) return null

  const formDimmed = phase === 'sending'
  const showBeam = phase === 'sending' && !reducedMotion
  const btnPrime = Math.max(0, Math.min(1, (connectionP - 0.58) / 0.32))

  return (
    <>
      <Toaster position="top-center" />
      <style>{`
        @keyframes contact-beam {
          0% { opacity: 0; transform: translate(-50%, 0) scaleY(0.1); }
          22% { opacity: 0.9; }
          100% { opacity: 0; transform: translate(-50%, -268px) scaleY(1); }
        }
        @keyframes contact-particle {
          0% { opacity: 0; transform: translate(0, 0) scale(0.5); }
          16% { opacity: 0.85; }
          100% { opacity: 0; transform: translate(var(--dx, 0px), -208px) scale(0.22); }
        }
        @keyframes contact-success-pop {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.94); }
          100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
        @keyframes contact-bg-ripple {
          0% { opacity: 0.35; transform: translate(-50%, -50%) scale(0.2); }
          100% { opacity: 0; transform: translate(-50%, -50%) scale(2.4); }
        }
        .contact-input {
          width: 100%;
          padding: 13px 15px;
          border-radius: 11px;
          border: 1px solid rgba(100, 116, 139, 0.45);
          background: rgba(2, 10, 22, 0.55);
          color: #e2e8f0;
          font-size: 14px;
          outline: none;
          box-sizing: border-box;
          transition: border-color ${DURATION}s ${EASE}, box-shadow ${DURATION}s ${EASE},
            background ${DURATION}s ${EASE}, transform ${DURATION}s ${EASE};
        }
        .contact-input::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }
        .contact-input:hover {
          border-color: rgba(125, 211, 252, 0.32);
          background: rgba(2, 14, 28, 0.62);
        }
        .contact-input:focus {
          border-color: rgba(125, 211, 252, 0.55);
          box-shadow: 0 0 0 1px rgba(125, 211, 252, 0.15), 0 0 22px rgba(125, 211, 252, 0.14);
          background: rgba(2, 16, 32, 0.75);
        }
        .contact-input:focus-visible {
          transform: translateY(-1px);
        }
        .contact-stagger-field {
          transition: none;
          opacity: 1;
          transform: none;
        }
        .contact-form-shell {
          opacity: 1;
          transform: scale(1);
          filter: none;
          transition: opacity ${DURATION}s ${EASE}, filter ${DURATION}s ${EASE};
        }
        .contact-transmit {
          position: relative;
          width: 100%;
          margin-top: 8px;
          padding: 17px 28px;
          border-radius: 13px;
          border: 1px solid rgba(125, 211, 252, calc(0.28 + var(--btn-glow, 0) * 0.4));
          background: linear-gradient(
            165deg,
            rgba(56, 189, 248, calc(0.14 + var(--btn-glow, 0) * 0.12)) 0%,
            rgba(14, 116, 144, calc(0.28 + var(--btn-glow, 0) * 0.1)) 42%,
            rgba(15, 23, 42, 0.88) 100%
          );
          color: #f0f9ff;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          box-shadow: 0 0 calc(18px + var(--btn-glow, 0) * 22px) rgba(56, 189, 248, calc(0.1 + var(--btn-glow, 0) * 0.2)),
            inset 0 1px 0 rgba(255, 255, 255, 0.06);
          transition: transform ${DURATION}s cubic-bezier(0.22, 1, 0.36, 1), box-shadow ${DURATION}s ${EASE},
            border-color ${DURATION}s ${EASE}, filter ${DURATION}s ${EASE};
        }
        .contact-transmit:hover:not(:disabled) {
          transform: translateY(-3px);
          filter: brightness(1.05);
        }
        .contact-transmit:focus-visible {
          outline: 2px solid rgba(125, 211, 252, 0.5);
          outline-offset: 3px;
        }
        .contact-transmit:active:not(:disabled) {
          transform: translateY(-1px);
        }
        .contact-transmit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          transform: none;
        }
        .contact-transmit--compress {
          transform: scaleY(0.94) scaleX(0.99) !important;
          transition: transform 0.22s ease !important;
        }
        .contact-social a {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          color: #e8eaef;
          border: 1px solid rgba(148, 163, 184, 0.18);
          background: rgba(15, 23, 42, 0.28);
          transition: transform ${DURATION}s ${EASE}, border-color ${DURATION}s ${EASE},
            box-shadow ${DURATION}s ${EASE}, color ${DURATION}s ${EASE};
        }
        .contact-social a:hover {
          transform: translateY(-2px);
          border-color: rgba(125, 211, 252, 0.38);
          box-shadow: 0 0 18px rgba(125, 211, 252, 0.1);
          color: ${ACCENT};
        }
      `}</style>

      <div
        ref={varsRootRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          overflow: 'hidden',
          ['--contact-p']: 0,
          ['--btn-glow']: btnPrime,
        }}
      >
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <IntroSpaceCanvas
            active={visible}
            showStars
            showMeteors
            connectionFlowRef={connectionProgressRef}
          />
        </div>

        {phase === 'sending' && !reducedMotion && (
          <div
            key={rippleKey}
            aria-hidden
            style={{
              position: 'absolute',
              left: '72%',
              top: '58%',
              width: 'min(90vw, 520px)',
              height: 'min(90vw, 520px)',
              borderRadius: '50%',
              border: '1px solid rgba(125, 211, 252, 0.25)',
              background: 'radial-gradient(circle, rgba(56,189,248,0.12) 0%, transparent 65%)',
              pointerEvents: 'none',
              zIndex: 1,
              animation: 'contact-bg-ripple 1.15s ease-out forwards',
            }}
          />
        )}

        <div
          ref={scrollContainerRef}
          style={{
            position: 'relative',
            zIndex: 2,
            height: '100%',
            overflowY: 'auto',
            overflowX: 'hidden',
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            pointerEvents: 'auto',
          }}
        >
          <div
            ref={scrollTrackRef}
            style={{
              minHeight: reducedMotion ? '100vh' : '290vh',
              position: 'relative',
            }}
          >
            <div
              style={{
                position: 'sticky',
                top: 0,
                minHeight: '100vh',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                padding: 'clamp(22px, 5vh, 48px) clamp(18px, 4vw, 36px)',
              }}
            >
              <svg
                aria-hidden
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 0,
                }}
              >
                <defs>
                  <linearGradient id="contact-sig-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
                    <stop offset="42%" stopColor="#7dd3fc" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#bae6fd" stopOpacity="0.45" />
                  </linearGradient>
                  <radialGradient id="contact-star-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
                    <stop offset="35%" stopColor="#bae6fd" stopOpacity="0.55" />
                    <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                  </radialGradient>
                  <filter id="contact-star-shine" x="-80%" y="-80%" width="260%" height="260%">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="0.12" result="blur" />
                    <feMerge>
                      <feMergeNode in="blur" />
                      <feMergeNode in="SourceGraphic" />
                    </feMerge>
                  </filter>
                </defs>
                <path
                  ref={signalPathRef}
                  d="M 6 46 C 22 38, 38 52, 52 48 S 82 42, 94 54"
                  fill="none"
                  stroke="url(#contact-sig-grad)"
                  strokeWidth="0.35"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <g style={{ pointerEvents: 'none' }}>
                  {trailStars.map((s, i) => (
                    <g key={i} filter="url(#contact-star-shine)">
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={2.05}
                        fill="url(#contact-star-glow)"
                        opacity={0.72}
                      />
                      <circle cx={s.x} cy={s.y} r={0.48} fill="#ffffff" opacity={0.95} />
                      <circle cx={s.x} cy={s.y} r={0.16} fill="#f0f9ff" opacity={1} />
                    </g>
                  ))}
                </g>
              </svg>

              <div
                ref={contactSectionFadeRef}
                style={{
                  position: 'relative',
                  zIndex: 1,
                  width: '100%',
                  maxWidth: 1220,
                  maxHeight: '100%',
                  overflowY: 'auto',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 'clamp(32px, 6vw, 64px)',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  willChange: reducedMotion ? undefined : 'transform, opacity, filter',
                }}
              >
                <div
                  style={{
                    flex: '1 1 min(100%, 300px)',
                    maxWidth: 500,
                    minWidth: 0,
                    paddingTop: 4,
                  }}
                >
                  <p
                    style={{
                      margin: 0,
                      marginBottom: 12,
                      fontSize: 10,
                      letterSpacing: '0.32em',
                      textTransform: 'uppercase',
                      color: ACCENT_SOFT,
                      fontWeight: 600,
                    }}
                  >
                    Uplink
                  </p>
                  <h1
                    style={{
                      margin: 0,
                      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
                      fontSize: 'clamp(2.15rem, 5.5vw, 3.35rem)',
                      fontWeight: 700,
                      letterSpacing: '-0.035em',
                      lineHeight: 1.08,
                      color: '#f8fafc',
                      textShadow: '0 0 56px rgba(125, 211, 252, 0.1)',
                    }}
                  >
                    Open a channel
                  </h1>
                  <div
                    style={{
                      width: 64,
                      height: 3,
                      margin: '22px 0 26px',
                      borderRadius: 2,
                      background: `linear-gradient(90deg, ${ACCENT}, transparent)`,
                      opacity: 0.88,
                    }}
                  />

                  <p
                    style={{
                      margin: 0,
                      marginBottom: 18,
                      fontSize: 'clamp(15px, 1.85vw, 17px)',
                      lineHeight: 1.78,
                      color: 'rgba(226, 232, 240, 0.68)',
                      maxWidth: '42ch',
                    }}
                  >
                    Scroll to trace the signal along the channel — the form is open whenever
                    you&apos;re ready. Suggestions, collaborations, or a quick hello — I read
                    every signal.
                  </p>

                  <p
                    style={{
                      margin: '0 0 26px',
                      fontSize: 12,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      color: 'rgba(148, 163, 184, 0.55)',
                      textAlign: 'center',
                    }}
                  >
                    Relay
                  </p>

                  <div
                    className="contact-social"
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: 12,
                      justifyContent: 'center',
                    }}
                  >
                    <a href="https://github.com/dkyadavkosli" target="_blank" rel="noreferrer" aria-label="GitHub">
                      <SiGithub size={22} />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/dipesh-kumar-b8580020b/"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="LinkedIn"
                    >
                      <FaLinkedin size={22} />
                    </a>
                    <a
                      href="https://www.instagram.com/kal.se_padhai.shuru/"
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Instagram"
                    >
                      <SiInstagram size={22} />
                    </a>
                    <a href="https://twitter.com/DipeshK71331890" target="_blank" rel="noreferrer" aria-label="X">
                      <SiX size={22} />
                    </a>
                  </div>

                  <a
                    href="mailto:dipesh23062003@gmail.com"
                    style={{
                      display: 'block',
                      marginTop: 26,
                      fontSize: 15,
                      color: ACCENT,
                      textDecoration: 'none',
                      fontWeight: 500,
                      borderBottom: '1px solid rgba(125, 211, 252, 0.32)',
                      paddingBottom: 2,
                      textAlign: 'center',
                      width: 'fit-content',
                      maxWidth: '100%',
                      marginLeft: 'auto',
                      marginRight: 'auto',
                      transition: `color ${DURATION}s ${EASE}, border-color ${DURATION}s ${EASE}`,
                    }}
                  >
                    dipesh23062003@gmail.com
                  </a>
                </div>

                <div
                  ref={formWrapRef}
                  style={{
                    flex: '1 1 min(100%, 360px)',
                    maxWidth: 528,
                    minWidth: 0,
                    position: 'relative',
                  }}
                >
                  {showBeam && (
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: 78,
                        width: 3,
                        height: 190,
                        pointerEvents: 'none',
                        zIndex: 4,
                        borderRadius: 3,
                        background: `linear-gradient(180deg, ${ACCENT}, transparent)`,
                        filter: 'blur(0.5px)',
                        animation: 'contact-beam 1.05s ease-out forwards',
                      }}
                    />
                  )}
                  {showBeam && (
                    <div
                      aria-hidden
                      style={{
                        position: 'absolute',
                        left: '50%',
                        bottom: 70,
                        width: 120,
                        height: 120,
                        marginLeft: -60,
                        pointerEvents: 'none',
                        zIndex: 3,
                      }}
                    >
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <span
                          key={i}
                          style={{
                            position: 'absolute',
                            left: `calc(50% + ${(i - 2.5) * 15}px)`,
                            bottom: 8,
                            marginLeft: -2.5,
                            width: 4,
                            height: 4,
                            borderRadius: '50%',
                            background: 'rgba(186, 230, 253, 0.88)',
                            boxShadow: `0 0 10px ${ACCENT}`,
                            ['--dx']: `${(i - 2.5) * 9}px`,
                            animation: `contact-particle 1.02s ease-out ${i * 0.05}s forwards`,
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {phase === 'success' && (
                    <div
                      role="status"
                      style={{
                        position: 'absolute',
                        left: '50%',
                        top: '40%',
                        zIndex: 6,
                        maxWidth: 'min(90%, 320px)',
                        padding: '16px 22px',
                        borderRadius: 12,
                        border: '1px solid rgba(125, 211, 252, 0.38)',
                        background: 'rgba(15, 23, 42, 0.94)',
                        color: '#e0f2fe',
                        fontSize: 14,
                        fontWeight: 600,
                        lineHeight: 1.45,
                        letterSpacing: '0.02em',
                        textAlign: 'center',
                        boxShadow: '0 0 28px rgba(56, 189, 248, 0.18)',
                        animation: reducedMotion ? 'none' : 'contact-success-pop 0.55s ease-out both',
                        pointerEvents: 'none',
                      }}
                    >
                      Signal received. I&apos;ll respond soon.
                    </div>
                  )}

                  <form
                    ref={formRef}
                    onSubmit={sendEmail}
                    className="contact-form-shell"
                    style={{
                      position: 'relative',
                      zIndex: 2,
                      padding: 'clamp(24px, 4vw, 32px)',
                      borderRadius: 18,
                      border: '1px solid rgba(125, 211, 252, 0.12)',
                      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.45) 0%, rgba(2, 8, 18, 0.55) 100%)',
                      boxShadow: '0 20px 48px rgba(0, 0, 0, 0.28), inset 0 1px 0 rgba(255,255,255,0.04)',
                      color: '#e5e7eb',
                      opacity: formDimmed ? 0.46 : undefined,
                      filter: formDimmed ? 'blur(0.6px)' : undefined,
                      backdropFilter: 'blur(14px)',
                      WebkitBackdropFilter: 'blur(14px)',
                      transition: `opacity ${DURATION}s ${EASE}, filter ${DURATION}s ${EASE}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 11,
                        letterSpacing: '0.22em',
                        textTransform: 'uppercase',
                        color: ACCENT_SOFT,
                        fontWeight: 600,
                        marginBottom: 20,
                      }}
                    >
                      Encode transmission
                    </div>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: 14,
                        marginBottom: 14,
                      }}
                    >
                      {[
                        { name: 'from_name', ph: 'First name', type: 'text', fi: 0 },
                        { name: 'from_name2', ph: 'Last name', type: 'text', fi: 1 },
                        { name: 'from_email', ph: 'Email', type: 'email', fi: 2 },
                        { name: 'from_phone', ph: 'Phone', type: 'text', fi: 3, req: false },
                      ].map((f) => (
                        <div key={f.name} className="contact-stagger-field" style={{ ['--fi']: f.fi }}>
                          <input
                            className="contact-input"
                            name={f.name}
                            id={f.name}
                            type={f.type}
                            placeholder={f.ph}
                            required={f.req !== false}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="contact-stagger-field" style={{ ['--fi']: 4, marginBottom: 16 }}>
                      <textarea
                        className="contact-input"
                        name="message"
                        id="message"
                        placeholder="Your message"
                        rows={9}
                        required
                        style={{
                          width: '100%',
                          minHeight: 150,
                          resize: 'vertical',
                          lineHeight: 1.55,
                        }}
                      />
                    </div>
                    <div className="contact-stagger-field" style={{ ['--fi']: 5 }}>
                      <button
                        className={`contact-transmit${phase === 'sending' ? ' contact-transmit--compress' : ''}`}
                        type="submit"
                        disabled={phase !== 'idle'}
                      >
                        Transmit Signal
                      </button>
                    </div>
                  </form>

                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
