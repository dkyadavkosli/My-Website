import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'

const BACKDROP_FADE = '0.55s ease-out'

const TRANSITION = '0.62s cubic-bezier(0.45, 0, 0.55, 1)'
const ACCENT = 'rgba(186, 230, 253, 0.55)'
const LINE_IDLE = 'rgba(148, 163, 184, 0.32)'
const LINE_HOVER = 'rgba(186, 230, 253, 0.5)'
const LINE_ACTIVE = 'rgba(186, 230, 253, 0.72)'

/** Fixed slots: 0 top-left, 1 bottom-left, 2 center-right (percent-based, tight to transmitter) */
const SLOT_STYLES = [
  {
    top: '22%',
    left: '18%',
    bottom: 'auto',
    right: 'auto',
    transform: 'none',
    transformOrigin: 'top left',
  },
  {
    bottom: '22%',
    left: '18%',
    top: 'auto',
    right: 'auto',
    transform: 'none',
    transformOrigin: 'bottom left',
  },
  {
    top: '50%',
    right: '18%',
    left: 'auto',
    bottom: 'auto',
    transform: 'translateY(-50%)',
    transformOrigin: 'center right',
  },
]

/** Gentle curve — short lines stay subtle (no exaggerated arcs). */
function buildQuadPath(x0, y0, x1, y1, bend = 0.05) {
  const mx = (x0 + x1) / 2 + (y1 - y0) * bend
  const my = (y0 + y1) / 2 - (x1 - x0) * bend
  return `M ${x0} ${y0} Q ${mx} ${my} ${x1} ${y1}`
}

export function ProjectsSignalNetwork({
  projects,
  focusedIndex,
  hoverIndex,
  onHover,
  onSelectNode,
  reducedMotion,
  lineAnimKey,
}) {
  const rootRef = useRef(null)
  const svgRef = useRef(null)
  const transmitterRef = useRef(null)
  const nodeRefs = useRef([])
  const [paths, setPaths] = useState(['', '', ''])

  const measurePaths = useCallback(() => {
    const root = rootRef.current
    const svg = svgRef.current
    const tx = transmitterRef.current
    if (!root || !svg || !tx) return
    const svgR = svg.getBoundingClientRect()
    const tR = tx.getBoundingClientRect()
    const x0 = tR.left + tR.width / 2 - svgR.left
    const y0 = tR.top + tR.height / 2 - svgR.top

    const next = projects.map((_, i) => {
      const el = nodeRefs.current[i]
      if (!el) return ''
      const nR = el.getBoundingClientRect()
      const x1 = nR.left + nR.width / 2 - svgR.left
      const y1 = nR.top + nR.height / 2 - svgR.top
      return buildQuadPath(x0, y0, x1, y1, i === 2 ? -0.04 : 0.05)
    })
    setPaths(next)
  }, [projects])

  useLayoutEffect(() => {
    measurePaths()
  }, [measurePaths, focusedIndex])

  useEffect(() => {
    const ro = new ResizeObserver(() => measurePaths())
    if (rootRef.current) ro.observe(rootRef.current)
    window.addEventListener('resize', measurePaths)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', measurePaths)
    }
  }, [measurePaths])

  /** Keep link endpoints on card centers while kite-float transforms run. */
  useEffect(() => {
    if (reducedMotion) return undefined
    let id = 0
    const tick = () => {
      measurePaths()
      id = requestAnimationFrame(tick)
    }
    id = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(id)
  }, [measurePaths, reducedMotion])

  const anyFocus = focusedIndex !== null

  return (
    <div
      ref={rootRef}
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: 'transparent',
      }}
    >
      <style>{`
        @keyframes sn-tx-pulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.08); opacity: 1; }
        }
        @keyframes sn-bubble-shimmer {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 0.9; }
        }
        @keyframes sn-line-flow {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        /* Kite drift — lifted sway + tilt (paths follow via rAF) */
        @keyframes sn-kite-0 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          22% { transform: translate(12px, -23px) rotate(2deg); }
          48% { transform: translate(-11px, -38px) rotate(-1.5deg); }
          72% { transform: translate(14px, -18px) rotate(1.35deg); }
        }
        @keyframes sn-kite-1 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          30% { transform: translate(-14px, -28px) rotate(-2.1deg); }
          58% { transform: translate(11px, -40px) rotate(1.65deg); }
          82% { transform: translate(-8px, -14px) rotate(-1.05deg); }
        }
        @keyframes sn-kite-2 {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          18% { transform: translate(15px, -21px) rotate(1.8deg); }
          52% { transform: translate(-13px, -35px) rotate(-1.9deg); }
          78% { transform: translate(11px, -13px) rotate(1.2deg); }
        }
      `}</style>

      <svg
        ref={svgRef}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      >
        {paths.map((d, i) => {
          if (!d) return null
          const hovered = hoverIndex === i
          const active = focusedIndex === i
          const dim = anyFocus && focusedIndex !== i
          const stroke = active ? LINE_ACTIVE : hovered ? LINE_HOVER : LINE_IDLE
          const sw = active ? 1.65 : hovered ? 1.35 : 1.05
          const opacity = dim ? 0.42 : 1

          return (
            <g key={`ln-${i}`} style={{ opacity, transition: `opacity ${TRANSITION}` }}>
              <path
                d={d}
                fill="none"
                stroke={stroke}
                strokeWidth={sw}
                strokeLinecap="round"
                vectorEffect="non-scaling-stroke"
                style={{ transition: `stroke ${TRANSITION}, stroke-width ${TRANSITION}` }}
              />
              {!reducedMotion && (
                <path
                  d={d}
                  fill="none"
                  stroke="rgba(226, 232, 255, 0.28)"
                  strokeWidth={0.75}
                  strokeDasharray="4 10"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{
                    animation: anyFocus && !active ? 'none' : 'sn-line-flow 5.5s linear infinite',
                  }}
                />
              )}
              {!reducedMotion && (
                <>
                  <circle r={1.75} fill="rgba(226, 232, 255, 0.42)" opacity={dim ? 0 : 0.9}>
                    <animateMotion
                      key={`${i}-a-${lineAnimKey}`}
                      dur={`${7.2 + i * 0.35}s`}
                      repeatCount="indefinite"
                      path={d}
                      rotate="auto"
                      calcMode="linear"
                    />
                  </circle>
                  <circle r={1.25} fill="rgba(186, 230, 253, 0.28)" opacity={dim ? 0 : 0.75}>
                    <animateMotion
                      key={`${i}-b-${lineAnimKey}`}
                      dur={`${9 + i * 0.5}s`}
                      begin={`${1.8 + i * 0.6}s`}
                      repeatCount="indefinite"
                      path={d}
                      rotate="auto"
                      calcMode="linear"
                    />
                  </circle>
                </>
              )}
            </g>
          )
        })}
      </svg>

      {/* Glass bubble hub + compact transmitter core (line anchor = bubble center) */}
      <div
        ref={transmitterRef}
        style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2,
          width: 118,
          height: 118,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 30% 22%, rgba(255, 255, 255, 0.14) 0%, transparent 42%), radial-gradient(circle at 50% 88%, rgba(125, 211, 252, 0.08) 0%, transparent 55%), radial-gradient(circle at 50% 50%, rgba(15, 23, 42, 0.12) 0%, rgba(2, 6, 12, 0.22) 100%)',
            border: '1px solid rgba(125, 211, 252, 0.38)',
            boxShadow:
              '0 0 0 1px rgba(255, 255, 255, 0.07) inset, 0 0 36px rgba(125, 211, 252, 0.18), 0 12px 40px rgba(0, 0, 0, 0.2)',
            animation: reducedMotion ? 'none' : 'sn-bubble-shimmer 4s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'relative',
            zIndex: 1,
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '1px solid rgba(125, 211, 252, 0.45)',
            background:
              'radial-gradient(circle at 35% 28%, rgba(224, 242, 254, 0.35), rgba(15, 23, 42, 0.45) 70%, rgba(2, 6, 12, 0.55))',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.06) inset, 0 0 16px rgba(125, 211, 252, 0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            animation: reducedMotion ? 'none' : 'sn-tx-pulse 2.6s ease-in-out infinite',
          }}
        >
          <div
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'rgba(224, 242, 254, 0.95)',
              boxShadow: '0 0 10px rgba(186, 230, 253, 0.75)',
            }}
          />
        </div>
      </div>

      {projects.map((p, i) => {
        const slot = SLOT_STYLES[i] ?? SLOT_STYLES[0]
        const { transformOrigin: slotOrigin, ...slotPos } = slot
        const hovered = hoverIndex === i
        const focused = focusedIndex === i
        const otherFocused = anyFocus && !focused
        const scale = hovered && !anyFocus ? 1.05 : 1

        const kiteAnim = `sn-kite-${i} ${6.9 + i * 0.4}s ease-in-out infinite`
        const kiteDelay = `${-i * 1.7}s`

        return (
          <button
            key={p.title}
            type="button"
            onMouseEnter={() => onHover(i)}
            onMouseLeave={() => onHover(null)}
            onClick={() => onSelectNode(i)}
            style={{
              position: 'absolute',
              zIndex: 3,
              width: 'clamp(222px, 38vw, 308px)',
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              textAlign: 'left',
              font: 'inherit',
              color: 'inherit',
              ...slotPos,
              transform: slot.transform === 'none' ? `scale(${scale})` : `${slot.transform} scale(${scale})`,
              transformOrigin: slotOrigin,
              filter: otherFocused ? 'blur(2px)' : 'none',
              opacity: otherFocused ? 0.48 : 1,
              transition: `transform ${TRANSITION}, opacity ${TRANSITION}, filter ${TRANSITION}`,
              pointerEvents: focused ? 'none' : 'auto',
            }}
          >
            <div
              ref={(el) => {
                nodeRefs.current[i] = el
              }}
              style={{
                willChange: reducedMotion ? undefined : 'transform',
                animation: reducedMotion ? 'none' : kiteAnim,
                animationDelay: reducedMotion ? undefined : kiteDelay,
              }}
            >
              <div
                style={{
                  borderRadius: 16,
                  overflow: 'hidden',
                  border: `1px solid ${hovered ? 'rgba(125, 211, 252, 0.42)' : 'rgba(71, 85, 105, 0.65)'}`,
                  background: 'rgba(15, 23, 42, 0.78)',
                  boxShadow: '0 14px 44px rgba(0, 0, 0, 0.42)',
                  transition: `border-color ${TRANSITION}, box-shadow ${TRANSITION}`,
                }}
              >
                <div style={{ height: 158, overflow: 'hidden' }}>
                  <img src={p.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
                <div
                  style={{
                    padding: '13px 15px 15px',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: 14,
                    fontWeight: 600,
                    letterSpacing: '0.03em',
                    color: 'rgba(248, 250, 252, 0.98)',
                    textAlign: 'center',
                  }}
                >
                  {p.title}
                </div>
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Focused project — centered detail view with calm entrance animation.
 */
export function ProjectsFocusOverlay({ project, open, onClose, reducedMotion }) {
  if (!open || !project) return null

  return (
    <>
      <div
        role="presentation"
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 18,
          background: 'rgba(2, 6, 12, 0.45)',
          animation: reducedMotion ? 'none' : `sn-fade-in ${BACKDROP_FADE} both`,
        }}
      />
      <style>{`
        @keyframes sn-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sn-focus-article {
          from { opacity: 0; transform: translate(-50%, -50%) scale(0.96); }
          to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }
      `}</style>
      <article
        role="dialog"
        aria-modal="true"
        aria-labelledby="sn-focus-title"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 19,
          width: 'min(92vw, 440px)',
          maxHeight: 'min(85vh, 640px)',
          overflow: 'auto',
          borderRadius: 16,
          border: '1px solid rgba(125, 211, 252, 0.22)',
          background: 'linear-gradient(165deg, rgba(15, 23, 42, 0.97) 0%, rgba(15, 23, 42, 0.88) 100%)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          color: '#e5e7eb',
          animation: reducedMotion ? 'none' : `sn-focus-article ${TRANSITION} cubic-bezier(0.45, 0, 0.55, 1) both`,
        }}
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 2,
            width: 34,
            height: 34,
            borderRadius: 8,
            border: '1px solid rgba(148, 163, 184, 0.25)',
            background: 'rgba(15, 23, 42, 0.8)',
            color: '#e2e8f0',
            fontSize: 20,
            cursor: 'pointer',
          }}
        >
          ×
        </button>
        <div style={{ height: 200, overflow: 'hidden' }}>
          <img src={project.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ padding: '20px 20px 22px' }}>
          <h2
            id="sn-focus-title"
            style={{
              margin: 0,
              fontSize: 'clamp(1.35rem, 3.5vw, 1.55rem)',
              fontWeight: 700,
              color: '#fafafa',
              letterSpacing: '-0.02em',
            }}
          >
            {project.title}
          </h2>
          <p
            style={{
              margin: '14px 0 0',
              fontSize: 14,
              lineHeight: 1.65,
              color: '#cbd5e1',
            }}
          >
            {project.description}
          </p>
          <a
            href={project.link}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex',
              marginTop: 18,
              padding: '10px 18px',
              borderRadius: 10,
              background: 'rgba(56, 189, 248, 0.12)',
              border: `1px solid ${ACCENT}`,
              color: '#f0f9ff',
              fontSize: 13,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View project
          </a>
        </div>
      </article>
    </>
  )
}
