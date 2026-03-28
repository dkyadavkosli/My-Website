import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
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

const TRACK_MIN_VH = 200
const ACCENT = '#a5b4fc'
const ACCENT_SOFT = 'rgba(165, 180, 252, 0.45)'

/** Tall left-column orbit: vertical journey with strong curve (fills portrait viewBox) */
const PATH_D = 'M 108 36 C 268 128, 332 228, 256 312 S 112 428, 188 564'
const VIEW_W = 420
const VIEW_H = 608
/** Active orbit node filled disk radius in viewBox units */
const ORBIT_NODE_BODY_R_ACTIVE_VB = 18
/** Thin periphery ring radius (active); beam starts here, not on the body disk */
const ORBIT_NODE_RING_R_ACTIVE_VB = 26
const AHEAD_RAY_FRAC = 0.12

const BULLET_PREVIEW = 3
const ROW_MAX_VH = 78
/** Visual scale for orbit stack (~1.8× perceived size vs prior baseline) */
const ORBIT_VISUAL_SCALE = 1.74
/** ~12% narrower than prior 708px — reduces stretched lines */
const CARD_MAX_PX = 620
/** Readable measure for body copy inside the card */
const CARD_CONTENT_MAX_PX = 568

const iconStyle = { width: 12, height: 12, opacity: 0.92 }

/** Key phrases in bullets — longest first */
const BULLET_HIGHLIGHT_RE =
  /(third-party payment gateways|subscription acquisition flow|Personal Loan flow|transaction views, summaries, and filters|product, design, and backend teams|business workflows|React Native|CleverTap|Razorpay|PayU|payment gateways|responsive dashboard|spend management features|user engagement|employee spending|data visualization|high-volume financial transactions)/gi

const highlightStyle = { color: '#e8edf5', fontWeight: 500 }

function BulletWithHighlights({ text }) {
  const re = new RegExp(BULLET_HIGHLIGHT_RE.source, BULLET_HIGHLIGHT_RE.flags)
  const out = []
  let last = 0
  let m
  let k = 0
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<span key={`t-${k++}`}>{text.slice(last, m.index)}</span>)
    }
    out.push(
      <span key={`h-${k++}`} style={highlightStyle}>
        {m[0]}
      </span>,
    )
    last = m.index + m[0].length
  }
  if (last < text.length) {
    out.push(<span key={`t-${k++}`}>{text.slice(last)}</span>)
  }
  return out.length > 0 ? out : text
}

/** Subtle motion on orbit column only */
const CAMERA_ORBIT = [
  { x: 1.2, y: 0.35, s: 1.012 },
  { x: -0.8, y: -0.25, s: 1.016 },
]

/** Map viewBox coords to viewport (xMidYMid meet) */
function viewBoxPointToClient(svgEl, vx, vy, vbW, vbH) {
  const rect = svgEl.getBoundingClientRect()
  const rw = rect.width
  const rh = rect.height
  const s = Math.min(rw / vbW, rh / vbH)
  const tx = (rw - s * vbW) / 2
  const ty = (rh - s * vbH) / 2
  return { x: rect.left + tx + vx * s, y: rect.top + ty + vy * s }
}

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

const ExperienceDetail = forwardRef(function ExperienceDetail({ exp }, ref) {
  const [showAll, setShowAll] = useState(false)
  const extra = exp.bullets.length - BULLET_PREVIEW
  const bullets = showAll || extra <= 0 ? exp.bullets : exp.bullets.slice(0, BULLET_PREVIEW)

  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        maxWidth: CARD_MAX_PX,
        padding: 'clamp(11px, 2vw, 16px) clamp(14px, 2.5vw, 20px)',
        borderRadius: 14,
        background: 'linear-gradient(155deg, rgba(15, 23, 42, 0.88) 0%, rgba(15, 23, 42, 0.52) 100%)',
        backdropFilter: 'blur(18px) saturate(1.06)',
        WebkitBackdropFilter: 'blur(18px) saturate(1.06)',
        boxShadow: '0 20px 52px rgba(0, 0, 0, 0.42), inset 0 1px 0 rgba(255, 255, 255, 0.07)',
        border: '1px solid rgba(148, 163, 184, 0.14)',
        color: '#e5e7eb',
        animation: 'expDetailIn 0.48s cubic-bezier(0.22, 1, 0.36, 1) both',
        textAlign: 'left',
      }}
    >
      <div
        style={{
          maxWidth: CARD_CONTENT_MAX_PX,
          margin: 0,
        }}
      >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 'clamp(1.22rem, 2.55vw, 1.38rem)',
            fontWeight: 700,
            color: '#fafafa',
            lineHeight: 1.18,
            letterSpacing: '-0.015em',
          }}
        >
          {exp.title}
        </span>
        {exp.current && (
          <span
            style={{
              padding: '3px 8px',
              borderRadius: 999,
              background: 'rgba(34, 197, 94, 0.16)',
              color: '#86efac',
              fontSize: 9.5,
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Current
          </span>
        )}
      </div>
      <div
        style={{
          marginTop: 4,
          fontSize: 12,
          color: '#cbd5e1',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          flexWrap: 'wrap',
          lineHeight: 1.35,
        }}
      >
        <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{exp.company}</span>
        {exp.companyAlt && <span style={{ color: '#94a3b8', fontSize: 11.5 }}>({exp.companyAlt})</span>}
        {exp.companyLinkedIn && (
          <a href={exp.companyLinkedIn} target="_blank" rel="noreferrer" style={{ color: ACCENT }} aria-label="Company LinkedIn">
            <FaLinkedin style={{ width: 14, height: 14, opacity: 1 }} />
          </a>
        )}
      </div>
      <div
        style={{
          marginTop: 5,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          fontSize: 11,
          color: '#b4c0ce',
          lineHeight: 1.32,
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <CalendarIcon />
          {exp.duration}
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <PinIcon />
          {exp.location}
        </span>
      </div>
      <ul
        style={{
          margin: '7px 0 0',
          paddingLeft: 15,
          listStylePosition: 'outside',
          fontSize: 'clamp(14px, 1.4vw, 15px)',
          lineHeight: 1.38,
          color: '#c8d0dc',
        }}
      >
        {bullets.map((b, j) => (
          <li key={j} style={{ marginBottom: 2 }}>
            <BulletWithHighlights text={b} />
          </li>
        ))}
      </ul>
      {extra > 0 && (
        <button
          type="button"
          aria-expanded={showAll}
          onClick={() => setShowAll((v) => !v)}
          style={{
            marginTop: 7,
            padding: 0,
            border: 'none',
            background: 'none',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: ACCENT,
            opacity: 0.92,
          }}
        >
          {showAll ? 'Show less' : `View more · ${extra} more`}
        </button>
      )}
      </div>
    </div>
  )
})
ExperienceDetail.displayName = 'ExperienceDetail'

export function ExperienceScreen() {
  const uid = useId().replace(/:/g, '')
  const [visible, setVisible] = useState(false)
  const [scrollP, setScrollP] = useState(0)
  const [pathLen, setPathLen] = useState(0)
  const [nodePoints, setNodePoints] = useState([])
  const [lightPhase, setLightPhase] = useState(0)
  const [beamBridge, setBeamBridge] = useState(null)

  const scrollRef = useRef(null)
  const pathRef = useRef(null)
  const rowRef = useRef(null)
  const orbitFrontSvgRef = useRef(null)
  const cardRef = useRef(null)
  const exitingRef = useRef(false)
  const rafRef = useRef(0)
  const t0Ref = useRef(0)

  const n = EXPERIENCES.length
  const activeIndex = Math.min(n - 1, Math.max(0, Math.floor(scrollP * n * 1.0001)))

  const updateBeamBridge = useCallback(() => {
    if (!visible) {
      setBeamBridge(null)
      return
    }
    const row = rowRef.current
    const svg = orbitFrontSvgRef.current
    const card = cardRef.current
    if (!row || !svg || !card || nodePoints.length === 0) {
      setBeamBridge(null)
      return
    }
    const active = nodePoints[activeIndex]
    if (!active) {
      setBeamBridge(null)
      return
    }
    const rowRect = row.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const ex = cardRect.left + 3
    const centerPt = viewBoxPointToClient(svg, active.x, active.y, VIEW_W, VIEW_H)
    const cx = centerPt.x - rowRect.left
    const cy = centerPt.y - rowRect.top
    let ey = centerPt.y
    ey = Math.min(Math.max(ey, cardRect.top + 8), cardRect.bottom - 8)
    const x1 = ex - rowRect.left
    const y1 = ey - rowRect.top
    const udx = x1 - cx
    const udy = y1 - cy
    const ulen = Math.hypot(udx, udy)
    if (ulen < 8) {
      setBeamBridge(null)
      return
    }
    const svgRect = svg.getBoundingClientRect()
    const unitScale = Math.min(svgRect.width / VIEW_W, svgRect.height / VIEW_H)
    /** On thin ring stroke (same r as active periphery <circle r={ringR} />) */
    const Rvb = ORBIT_NODE_RING_R_ACTIVE_VB
    const Rpx = Rvb * unitScale
    const ux = udx / ulen
    const uy = udy / ulen
    const x0 = cx + ux * Rpx
    const y0 = cy + uy * Rpx
    const dx = x1 - x0
    const dy = y1 - y0
    const chord = Math.hypot(dx, dy)
    if (chord < 8) {
      setBeamBridge(null)
      return
    }
    // Single cubic = smooth S (no midpoint kink from joined segments)
    const nx = -dy / chord
    const ny = dx / chord
    const bend = Math.min(34, Math.max(8, chord * 0.1))
    const c1x = x0 + dx * 0.3 + nx * bend
    const c1y = y0 + dy * 0.3 + ny * bend
    const c2x = x0 + dx * 0.7 - nx * bend * 0.88
    const c2y = y0 + dy * 0.7 - ny * bend * 0.88
    const pathD = `M ${x0} ${y0} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x1} ${y1}`
    setBeamBridge({
      w: rowRect.width,
      h: rowRect.height,
      pathD,
      x0,
      y0,
      x1,
      y1,
    })
  }, [visible, activeIndex, nodePoints])

  useLayoutEffect(() => {
    updateBeamBridge()
  }, [updateBeamBridge, scrollP, pathLen, nodePoints])

  useEffect(() => {
    if (!visible) return undefined
    const ro = new ResizeObserver(() => {
      updateBeamBridge()
    })
    const row = rowRef.current
    const svg = orbitFrontSvgRef.current
    const card = cardRef.current
    if (row) ro.observe(row)
    if (svg) ro.observe(svg)
    if (card) ro.observe(card)
    window.addEventListener('resize', updateBeamBridge)
    const t1 = window.setTimeout(updateBeamBridge, 400)
    const t2 = window.setTimeout(updateBeamBridge, 780)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', updateBeamBridge)
      window.clearTimeout(t1)
      window.clearTimeout(t2)
    }
  }, [visible, updateBeamBridge, activeIndex])

  useLayoutEffect(() => {
    if (!visible) return
    const path = pathRef.current
    if (!path) return
    const plen = path.getTotalLength()
    if (plen < 2) return
    setPathLen(plen)
    const pts = []
    for (let i = 0; i < n; i++) {
      const t = (i + 1) / (n + 1)
      pts.push(path.getPointAtLength(plen * t))
    }
    setNodePoints(pts)
  }, [n, visible])

  useEffect(() => {
    if (!visible || pathLen < 2) return undefined
    t0Ref.current = performance.now()
    const loop = (now) => {
      const elapsed = (now - t0Ref.current) / 1000
      setLightPhase((elapsed * 0.22) % 1)
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [visible, pathLen])

  const onScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const max = Math.max(1, el.scrollHeight - el.clientHeight)
    setScrollP(el.scrollTop / max)
  }, [])

  useEffect(() => {
    if (!visible) return undefined
    const el = scrollRef.current
    if (!el) return undefined
    el.scrollTop = 0
    setScrollP(0)
    const ro = () => onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', ro)
    onScroll()
    return () => {
      el.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', ro)
    }
  }, [visible, onScroll])

  useEffect(() => {
    if (!visible) return undefined

    const el = scrollRef.current
    if (!el) return undefined

    const onWheel = (e) => {
      if (exitingRef.current) return
      const maxScroll = Math.max(0, el.scrollHeight - el.clientHeight)
      const top = el.scrollTop

      if (e.deltaY < 0 && top <= 2) {
        exitingRef.current = true
        setVisible(false)
        window.dispatchEvent(new Event('hideExperience'))
        window.dispatchEvent(new Event('experienceToAbout'))
        exitingRef.current = false
        return
      }
      if (e.deltaY > 0 && top >= maxScroll - 4) {
        exitingRef.current = true
        setVisible(false)
        window.dispatchEvent(new Event('hideExperience'))
        window.dispatchEvent(new Event('experienceToProjects'))
        exitingRef.current = false
      }
    }

    el.addEventListener('wheel', onWheel, { passive: true, capture: true })
    return () => el.removeEventListener('wheel', onWheel, { capture: true })
  }, [visible])

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

  if (!visible) return null

  const pathProgress = Math.min(1, scrollP * 1.08)
  const len = pathLen > 0 ? pathLen : 1
  const dashOffset = len * (1 - pathProgress)
  const drawnLen = pathProgress * len
  const aheadLen = Math.min(AHEAD_RAY_FRAC * len, Math.max(0, len - drawnLen))
  const showAheadRay = aheadLen > 8 && pathProgress > 0.03 && pathProgress < 0.997
  const camOrbit = CAMERA_ORBIT[activeIndex] ?? { x: 0, y: 0, s: 1 }

  const lightAlong = pathLen > 0 ? pathProgress * pathLen * lightPhase : 0
  const lightPt =
    pathRef.current && pathLen > 0 ? pathRef.current.getPointAtLength(Math.min(pathLen * pathProgress * 0.98, lightAlong)) : null

  const fidB = `exp-${uid}-bg`
  const fidF = `exp-${uid}-fg`

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        pointerEvents: 'none',
        zIndex: 5,
      }}
    >
      <div
        ref={scrollRef}
        style={{
          height: '100%',
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          WebkitOverflowScrolling: 'touch',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ minHeight: `${TRACK_MIN_VH}vh`, position: 'relative' }}>
          <div
            style={{
              position: 'sticky',
              top: 0,
              minHeight: '100vh',
              height: '100vh',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 'clamp(2px, 0.5vh, 8px) clamp(8px, 1.4vw, 18px)',
              boxSizing: 'border-box',
              perspective: 1400,
            }}
          >
            <div
              style={{
                width: '100%',
                maxWidth: 1380,
                maxHeight: `${ROW_MAX_VH}vh`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'stretch',
                flexShrink: 0,
              }}
            >
              <div
                ref={rowRef}
                style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 'clamp(2px, 0.5vw, 8px)',
                  flex: '1 1 auto',
                  minHeight: 0,
                  width: '100%',
                  overflow: 'visible',
                }}
              >
                {beamBridge && (
                  <svg
                    aria-hidden
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: beamBridge.w,
                      height: beamBridge.h,
                      overflow: 'visible',
                      pointerEvents: 'none',
                      zIndex: 2,
                    }}
                    viewBox={`0 0 ${beamBridge.w} ${beamBridge.h}`}
                  >
                    <defs>
                      <linearGradient
                        id={`${uid}-beamCurve`}
                        gradientUnits="userSpaceOnUse"
                        x1={beamBridge.x0}
                        y1={beamBridge.y0}
                        x2={beamBridge.x1}
                        y2={beamBridge.y1}
                      >
                        <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.95" />
                        <stop offset="18%" stopColor="#e0e7ff" stopOpacity="0.85" />
                        <stop offset="45%" stopColor={ACCENT} stopOpacity="0.5" />
                        <stop offset="78%" stopColor="#818cf8" stopOpacity="0.18" />
                        <stop offset="100%" stopColor="#3730a3" stopOpacity="0.04" />
                      </linearGradient>
                      <filter id={`${uid}-beamCurveBlur`} x="-35%" y="-35%" width="170%" height="170%">
                        <feGaussianBlur stdDeviation="2.2" result="blur" />
                        <feMerge>
                          <feMergeNode in="blur" />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    <path
                      d={beamBridge.pathD}
                      fill="none"
                      stroke="rgba(129, 140, 248, 0.28)"
                      strokeWidth={5}
                      strokeLinecap="round"
                      filter={`url(#${uid}-beamCurveBlur)`}
                    />
                    <path
                      d={beamBridge.pathD}
                      fill="none"
                      stroke={`url(#${uid}-beamCurve)`}
                      strokeWidth={1.35}
                      strokeLinecap="round"
                      style={{
                        animation: 'expBeamFlow 2.5s ease-in-out infinite',
                      }}
                    />
                  </svg>
                )}
                <div
                  style={{
                    flex: '1 1 42%',
                    minWidth: 'min(100%, 280px)',
                    maxWidth: 'min(52%, 620px)',
                    minHeight: 'min(70vh, 680px)',
                    maxHeight: 'min(78vh, 760px)',
                    position: 'relative',
                    transform: `translate3d(${camOrbit.x}%, ${camOrbit.y}%, 0) scale(${camOrbit.s})`,
                    transition: 'transform 0.72s cubic-bezier(0.22, 1, 0.36, 1)',
                    transformStyle: 'preserve-3d',
                    marginRight: 'clamp(-20px, -2.2vw, -4px)',
                    overflow: 'visible',
                    zIndex: 1,
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      transform: `scale(${ORBIT_VISUAL_SCALE})`,
                      transformOrigin: '56% 50%',
                      pointerEvents: 'none',
                    }}
                  >
                  <div
                    style={{
                      filter: 'blur(1.05px)',
                      opacity: 0.82,
                      transform: 'translateZ(-18px)',
                      pointerEvents: 'none',
                      position: 'absolute',
                      inset: 0,
                    }}
                  >
                    <svg
                      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                      preserveAspectRatio="xMidYMid meet"
                      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
                      aria-hidden
                    >
                      <defs>
                        <filter id={`${fidB}-bloom`} x="-30%" y="-30%" width="160%" height="160%">
                          <feGaussianBlur stdDeviation="7" result="blur" />
                          <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <linearGradient id={`${fidB}-grad`} x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#818cf8" stopOpacity="0.22" />
                          <stop offset="45%" stopColor={ACCENT} stopOpacity="0.82" />
                          <stop offset="100%" stopColor="#c4b5fd" stopOpacity="0.34" />
                        </linearGradient>
                      </defs>
                      <path
                        d={PATH_D}
                        fill="none"
                        stroke="rgba(129, 140, 248, 0.36)"
                        strokeWidth={17}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        filter={`url(#${fidB}-bloom)`}
                        style={{ strokeDasharray: len, strokeDashoffset: dashOffset }}
                      />
                      <path
                        ref={pathRef}
                        d={PATH_D}
                        fill="none"
                        stroke={`url(#${fidB}-grad)`}
                        strokeWidth={2.85}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ strokeDasharray: len, strokeDashoffset: dashOffset }}
                      />
                      {showAheadRay && (
                        <path
                          d={PATH_D}
                          fill="none"
                          stroke="rgba(129, 140, 248, 0.28)"
                          strokeWidth={13}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter={`url(#${fidB}-bloom)`}
                          style={{
                            strokeDasharray: `${aheadLen} ${len}`,
                            strokeDashoffset: -drawnLen,
                          }}
                        />
                      )}
                      {showAheadRay && (
                        <path
                          d={PATH_D}
                          fill="none"
                          stroke="rgba(199, 210, 254, 0.34)"
                          strokeWidth={2}
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            strokeDasharray: `${aheadLen} ${len}`,
                            strokeDashoffset: -drawnLen,
                          }}
                        />
                      )}
                    </svg>
                  </div>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      transform: 'translateZ(0)',
                      pointerEvents: 'none',
                    }}
                  >
                    <svg
                      ref={orbitFrontSvgRef}
                      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                      preserveAspectRatio="xMidYMid meet"
                      style={{ width: '100%', height: '100%', display: 'block', overflow: 'visible' }}
                      aria-hidden
                    >
                      <defs>
                        <radialGradient id={`${fidF}-planetA`} cx="35%" cy="30%" r="65%">
                          <stop offset="0%" stopColor="#f8fafc" stopOpacity="1" />
                          <stop offset="35%" stopColor="#a5b4fc" stopOpacity="1" />
                          <stop offset="70%" stopColor="#4f46e5" stopOpacity="1" />
                          <stop offset="100%" stopColor="#1e1b4b" stopOpacity="1" />
                        </radialGradient>
                        <radialGradient id={`${fidF}-planetI`} cx="40%" cy="35%" r="60%">
                          <stop offset="0%" stopColor="#64748b" stopOpacity="0.5" />
                          <stop offset="50%" stopColor="#334155" stopOpacity="0.9" />
                          <stop offset="100%" stopColor="#0f172a" stopOpacity="1" />
                        </radialGradient>
                        <filter id={`${fidF}-nodeGlow`} x="-100%" y="-100%" width="300%" height="300%">
                          <feGaussianBlur stdDeviation="3.5" result="g" />
                          <feMerge>
                            <feMergeNode in="g" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                      </defs>

                      <path
                        d={PATH_D}
                        fill="none"
                        stroke="rgba(226, 232, 255, 0.52)"
                        strokeWidth={1.15}
                        strokeLinecap="round"
                        style={{ strokeDasharray: len, strokeDashoffset: dashOffset }}
                      />
                      {showAheadRay && (
                        <path
                          d={PATH_D}
                          fill="none"
                          stroke="rgba(226, 232, 255, 0.4)"
                          strokeWidth={1.25}
                          strokeLinecap="round"
                          strokeDasharray={`${aheadLen} ${len}`}
                          strokeDashoffset={-drawnLen}
                          opacity={0.92}
                        />
                      )}

                      {lightPt && pathProgress > 0.04 && (
                        <circle
                          cx={lightPt.x}
                          cy={lightPt.y}
                          r={4}
                          fill="#f8fafc"
                          opacity={0.92}
                          style={{
                            filter: `drop-shadow(0 0 10px ${ACCENT}) drop-shadow(0 0 4px #fff)`,
                          }}
                        />
                      )}

                      {nodePoints.map((pt, i) => {
                        const active = i === activeIndex
                        const labelOp = active ? 1 : 0.4
                        const bodyR = active ? ORBIT_NODE_BODY_R_ACTIVE_VB : 9
                        const ringR = active ? ORBIT_NODE_RING_R_ACTIVE_VB : 11
                        return (
                          <g key={i} transform={`translate(${pt.x}, ${pt.y})`}>
                            {active && (
                              <circle
                                r={44}
                                fill={ACCENT}
                                opacity={0.12}
                                style={{ animation: 'expPlanetAura 2.4s ease-in-out infinite' }}
                              />
                            )}
                            <circle
                              r={ringR}
                              fill="none"
                              stroke={active ? ACCENT : 'rgba(100, 116, 139, 0.3)'}
                              strokeWidth={active ? 0.65 : 0.35}
                              opacity={active ? 0.55 : 0.22}
                            />
                            <circle
                              r={bodyR}
                              fill={active ? `url(#${fidF}-planetA)` : `url(#${fidF}-planetI)`}
                              filter={active ? `url(#${fidF}-nodeGlow)` : undefined}
                              opacity={active ? 1 : 0.5}
                              style={{
                                animation: active ? 'expPlanetPulse 2.2s ease-in-out infinite' : undefined,
                              }}
                            />
                            {active && (
                              <ellipse cx={-6} cy={-7} rx={6} ry={3.5} fill="#fff" opacity={0.36} transform="rotate(-22)" />
                            )}
                            <text
                              x={0}
                              y={active ? -32 : -24}
                              textAnchor="middle"
                              fill={active ? '#f1f5f9' : '#64748b'}
                              fontSize={active ? 11 : 10}
                              fontWeight={active ? 600 : 500}
                              letterSpacing="0.12em"
                              opacity={labelOp}
                              style={{
                                textTransform: 'uppercase',
                                fontFamily: 'system-ui, sans-serif',
                                transition: 'fill 0.45s ease, opacity 0.45s ease',
                              }}
                            >
                              {EXPERIENCES[i].company}
                            </text>
                          </g>
                        )
                      })}
                    </svg>
                  </div>
                  </div>
                </div>

                <div
                  style={{
                    flex: '1 1 48%',
                    minWidth: 'min(100%, 300px)',
                    maxWidth: 'min(54%, 660px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    pointerEvents: 'auto',
                    position: 'relative',
                    zIndex: 3,
                    paddingLeft: 0,
                  }}
                >
                  <ExperienceDetail ref={cardRef} key={activeIndex} exp={EXPERIENCES[activeIndex]} />
                </div>
              </div>
            </div>

            <style>
              {`
                @keyframes expDetailIn {
                  from { opacity: 0; transform: translateX(8px); }
                  to { opacity: 1; transform: translateX(0); }
                }
                @keyframes expPlanetPulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.84; }
                }
                @keyframes expPlanetAura {
                  0%, 100% { opacity: 0.1; }
                  50% { opacity: 0.24; }
                }
                @keyframes expBeamFlow {
                  0%, 100% {
                    opacity: 0.72;
                    filter: drop-shadow(0 0 3px rgba(165, 180, 252, 0.35));
                  }
                  50% {
                    opacity: 0.95;
                    filter: drop-shadow(0 0 6px rgba(224, 231, 255, 0.4));
                  }
                }
              `}
            </style>
          </div>
        </div>
      </div>
    </div>
  )
}
