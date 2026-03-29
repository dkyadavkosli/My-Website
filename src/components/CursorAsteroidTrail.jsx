import { useEffect, useRef, useState } from 'react'

const TRAIL_FADE_MS = 500
const MAX_POINTS = 180
const MIN_DIST_PX = 1.5
const MAX_SAMPLE_HZ = 120

function readReducedMotion() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Shooting-star / meteor cursor trail: elongated streak along motion, cool
 * white–cyan glow, fades out within TRAIL_FADE_MS after the pointer stops.
 */
export function CursorAsteroidTrail() {
  const [reducedMotion, setReducedMotion] = useState(readReducedMotion)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReducedMotion(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  if (reducedMotion) return null

  return <CursorAsteroidTrailCanvas />
}

function CursorAsteroidTrailCanvas() {
  const canvasRef = useRef(null)
  const pointsRef = useRef([])
  const lastRef = useRef({ x: 0, y: 0, t: 0 })
  const lastSampleRef = useRef(0)
  const rafRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d')
    if (!ctx) return undefined

    let w = 0
    let h = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    window.addEventListener('resize', resize)

    const dist2 = (ax, ay, bx, by) => {
      const dx = ax - bx
      const dy = ay - by
      return dx * dx + dy * dy
    }

    /** Half-width at cursor end (thick “dot”); tail tip stays hair-thin */
    const HEAD_HALF_PX = 10
    const TAIL_HALF_PX = 0.2
    const TAPER_POW = 1.85

    const halfWidthFromLife = (life) => {
      const L = Math.max(0, Math.min(1, life))
      return TAIL_HALF_PX + (HEAD_HALF_PX - TAIL_HALF_PX) * L ** TAPER_POW
    }

    const perpUnit = (dx, dy) => {
      const len = Math.hypot(dx, dy)
      if (len < 1e-4) return { x: 0, y: 1 }
      return { x: -dy / len, y: dx / len }
    }

    /** Filled trapezoid: wide at p1 (newer, toward cursor), narrow at p0 (older tail tip) */
    const drawTaperedSegment = (p0, p1, now) => {
      const age0 = now - p0.t
      const age1 = now - p1.t
      const l0 = 1 - age0 / TRAIL_FADE_MS
      const l1 = 1 - age1 / TRAIL_FADE_MS
      const segAlpha = Math.min(l0, l1)
      if (segAlpha <= 0) return

      const fade = segAlpha * segAlpha
      const w0 = halfWidthFromLife(l0) * fade
      const w1 = halfWidthFromLife(l1) * fade
      if (w0 < 0.03 && w1 < 0.03) return

      const dx = p1.x - p0.x
      const dy = p1.y - p0.y
      const { x: nx, y: ny } = perpUnit(dx, dy)

      const x00 = p0.x + nx * w0
      const y00 = p0.y + ny * w0
      const x01 = p0.x - nx * w0
      const y01 = p0.y - ny * w0
      const x10 = p1.x + nx * w1
      const y10 = p1.y + ny * w1
      const x11 = p1.x - nx * w1
      const y11 = p1.y - ny * w1

      const g = ctx.createLinearGradient(p0.x, p0.y, p1.x, p1.y)
      g.addColorStop(0, `rgba(130, 175, 240, ${0.14 * fade})`)
      g.addColorStop(0.4, `rgba(200, 230, 255, ${0.42 * fade})`)
      g.addColorStop(0.82, `rgba(248, 252, 255, ${0.78 * fade * l1})`)
      g.addColorStop(1, `rgba(255, 255, 255, ${0.92 * fade * l1})`)

      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(x00, y00)
      ctx.lineTo(x10, y10)
      ctx.lineTo(x11, y11)
      ctx.lineTo(x01, y01)
      ctx.closePath()
      ctx.fill()
    }

    const drawMeteorHead = (x, y, life) => {
      const a = life * life
      if (a <= 0.02) return

      const coreR = 5 + 3 * a
      const glowR = coreR * 2.8
      const g = ctx.createRadialGradient(x, y, 0, x, y, glowR)
      g.addColorStop(0, `rgba(255, 255, 255, ${0.98 * a})`)
      g.addColorStop(0.15, `rgba(230, 248, 255, ${0.65 * a})`)
      g.addColorStop(0.4, `rgba(150, 210, 255, ${0.35 * a})`)
      g.addColorStop(0.7, `rgba(80, 140, 220, ${0.12 * a})`)
      g.addColorStop(1, 'rgba(30, 50, 100, 0)')

      ctx.fillStyle = g
      ctx.beginPath()
      ctx.arc(x, y, glowR, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = `rgba(255, 255, 255, ${0.95 * a})`
      ctx.beginPath()
      ctx.arc(x, y, coreR * 0.45, 0, Math.PI * 2)
      ctx.fill()
    }

    const runLoop = () => {
      rafRef.current = 0

      const now = performance.now()
      const pts = pointsRef.current
      pts.splice(
        0,
        pts.length,
        ...pts.filter((p) => now - p.t < TRAIL_FADE_MS)
      )

      ctx.clearRect(0, 0, w, h)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      for (let i = 0; i < pts.length - 1; i += 1) {
        drawTaperedSegment(pts[i], pts[i + 1], now)
      }

      if (pts.length > 0) {
        const head = pts[pts.length - 1]
        const headLife = 1 - (now - head.t) / TRAIL_FADE_MS
        drawMeteorHead(head.x, head.y, Math.max(0, headLife))
      }

      ctx.restore()

      if (pts.length > 0) {
        rafRef.current = requestAnimationFrame(runLoop)
      }
    }

    const scheduleDraw = () => {
      if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(runLoop)
      }
    }

    const onPointerMove = (e) => {
      const now = performance.now()
      if (now - lastSampleRef.current < 1000 / MAX_SAMPLE_HZ) {
        scheduleDraw()
        return
      }
      lastSampleRef.current = now

      const x = e.clientX
      const y = e.clientY
      const last = lastRef.current

      if (last.t > 0 && dist2(x, y, last.x, last.y) < MIN_DIST_PX * MIN_DIST_PX) {
        scheduleDraw()
        return
      }

      lastRef.current = { x, y, t: now }
      pointsRef.current.push({ x, y, t: now })
      if (pointsRef.current.length > MAX_POINTS) {
        pointsRef.current.shift()
      }
      scheduleDraw()
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      pointsRef.current = []
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10050,
      }}
    />
  )
}
