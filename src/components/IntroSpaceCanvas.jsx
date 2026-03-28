import { useEffect, useRef } from 'react'

/**
 * Full-bleed 2D canvas: drifting stars + meteor shower (pool of meteors, parallel-ish trails).
 * boostRef.current from parent on scroll; decays each frame.
 * exitProgressRef: when set (0–1), meteor intensity follows scroll exit progress (e.g. projects screen).
 * showStars: set false for meteors-only layer over an existing starfield.
 * showMeteors: set false for a calm starfield only (e.g. About story panels).
 * connectionFlowRef: 0–1 for Contact “connection sequence”; scales drift/meteors and pulls stars toward a right-side beacon.
 */
export function IntroSpaceCanvas({
  active,
  boostRef,
  showStars = true,
  showMeteors = true,
  exitProgressRef,
  connectionFlowRef,
}) {
  const canvasRef = useRef(null)
  const rafRef = useRef(0)
  const starsRef = useRef([])
  const meteorsRef = useRef([])
  const reducedMotionRef = useRef(false)

  useEffect(() => {
    reducedMotionRef.current =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      return undefined
    }

    const canvas = canvasRef.current
    if (!canvas) return undefined

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return undefined

    let w = 0
    let h = 0
    let dpr = 1
    let lastT = performance.now()

    const initStars = () => {
      const cx = w * 0.5
      const cy = h * 0.38
      if (!showStars) {
        starsRef.current = { list: [], cx, cy }
        return
      }
      const n = Math.min(160, Math.floor((w * h) / 14000) + 60)
      const stars = []
      for (let i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: 0.25 + Math.random() * 0.75,
          r: 0.35 + Math.random() * 1.15,
          a: 0.1 + Math.random() * 0.32,
        })
      }
      starsRef.current = { list: stars, cx, cy }
    }

    const spawnMeteor = () => {
      const fromTop = Math.random() < 0.7
      let x
      let y
      if (fromTop) {
        x = -140 + Math.random() * (w * 0.92)
        y = -70 - Math.random() * (h * 0.22)
      } else {
        x = -200 - Math.random() * (w * 0.35)
        y = -40 + Math.random() * (h * 0.55)
      }
      const angle = 0.28 + Math.random() * 0.2
      return {
        x,
        y,
        vx: 0,
        vy: 0,
        angle,
        speedMul: 0.52 + Math.random() * 0.58,
        scale: 0.38 + Math.random() * 0.78,
        trailAlphaMul: 0.35 + Math.random() * 0.5,
      }
    }

    const initMeteors = () => {
      if (!showMeteors) {
        meteorsRef.current = []
        return
      }
      const area = w * h
      const count = Math.min(20, Math.max(10, Math.floor(area / 55000) + 11))
      const list = []
      for (let i = 0; i < count; i++) {
        const m = spawnMeteor()
        m.x += Math.cos(m.angle) * (Math.random() * (w + h) * 0.35)
        m.y += Math.sin(m.angle) * (Math.random() * (w + h) * 0.35)
        list.push(m)
      }
      meteorsRef.current = list
    }

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const rect = parent.getBoundingClientRect()
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      w = Math.max(1, rect.width)
      h = Math.max(1, rect.height)
      canvas.width = Math.floor(w * dpr)
      canvas.height = Math.floor(h * dpr)
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      initStars()
      initMeteors()
    }

    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement)
    resize()

    const drawMeteor = (m, trailAlpha, headScale) => {
      const speed = Math.hypot(m.vx, m.vy) || 1
      const ux = m.vx / speed
      const uy = m.vy / speed
      const tailLen = Math.min(300, 95 + speed * 0.38) * (0.75 + m.scale * 0.35)
      const steps = Math.max(14, Math.round(18 + m.scale * 16))

      for (let i = 1; i <= steps; i++) {
        const t = i / steps
        const falloff = (1 - t) ** 1.85
        const dist = t * tailLen
        const px = m.x - ux * dist
        const py = m.y - uy * dist
        const rad = (1.1 + 5.2 * falloff) * headScale
        const g = ctx.createRadialGradient(px, py, 0, px, py, rad * 2.2)
        g.addColorStop(0, `rgba(200, 215, 255, ${falloff * 0.2 * trailAlpha})`)
        g.addColorStop(0.35, `rgba(130, 155, 210, ${falloff * 0.07 * trailAlpha})`)
        g.addColorStop(1, 'rgba(40, 55, 90, 0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(px, py, rad * 2.2, 0, Math.PI * 2)
        ctx.fill()
      }

      const coreGrad = ctx.createLinearGradient(
        m.x - ux * 12,
        m.y - uy * 12,
        m.x + ux * 10,
        m.y + uy * 10
      )
      coreGrad.addColorStop(0, 'rgba(45, 52, 72, 0.92)')
      coreGrad.addColorStop(0.45, 'rgba(95, 105, 135, 0.88)')
      coreGrad.addColorStop(0.78, 'rgba(175, 190, 225, 0.75)')
      coreGrad.addColorStop(1, 'rgba(230, 238, 255, 0.55)')

      ctx.save()
      ctx.translate(m.x, m.y)
      ctx.rotate(Math.atan2(uy, ux))
      const bw = 11 * headScale
      const bh = 6.5 * headScale
      ctx.beginPath()
      ctx.moveTo(bw * 0.95, 0)
      ctx.lineTo(bw * 0.25, -bh * 0.9)
      ctx.lineTo(-bw * 0.55, -bh * 0.35)
      ctx.lineTo(-bw * 0.9, bh * 0.15)
      ctx.lineTo(-bw * 0.15, bh * 0.8)
      ctx.lineTo(bw * 0.45, bh * 0.5)
      ctx.closePath()
      ctx.fillStyle = coreGrad
      ctx.fill()

      const glow = ctx.createRadialGradient(bw * 0.35, 0, 0, bw * 0.35, 0, bh * 2.8)
      glow.addColorStop(0, 'rgba(255, 255, 255, 0.12)')
      glow.addColorStop(0.5, 'rgba(180, 200, 255, 0.04)')
      glow.addColorStop(1, 'rgba(0, 0, 0, 0)')
      ctx.fillStyle = glow
      ctx.beginPath()
      ctx.arc(bw * 0.35, 0, bh * 2.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()
    }

    const tick = (now) => {
      const dt = Math.min(0.05, (now - lastT) / 1000)
      lastT = now

      let boost = boostRef?.current ?? 0
      boost *= 0.965
      if (boostRef) boostRef.current = boost
      const mult = 1 + boost * 0.85

      const rm = reducedMotionRef.current
      const driftBase = rm ? 8 : 48
      const meteorBase = rm ? 95 : 540

      ctx.clearRect(0, 0, w, h)

      let meteorIntensity = 1
      if (exitProgressRef) {
        const p = exitProgressRef.current ?? 0
        meteorIntensity = p <= 0 ? 0 : Math.min(1, p * 1.15)
      }

      let flowMul = 1
      if (connectionFlowRef) {
        flowMul = Math.max(0, Math.min(1, connectionFlowRef.current ?? 0))
        meteorIntensity *= flowMul
      }

      const pack = starsRef.current
      if (showStars && pack?.list?.length) {
        const { list, cx, cy } = pack
        const driftScale = connectionFlowRef ? Math.max(0.03, flowMul) : 1
        const drift = driftBase * mult * dt * driftScale
        const beaconX = w * 0.76
        const beaconY = h * 0.5
        const pullStrength = connectionFlowRef ? flowMul * flowMul * 26 : 0

        for (let i = 0; i < list.length; i++) {
          const s = list[i]
          const dx = s.x - cx
          const dy = s.y - cy
          const dist = Math.hypot(dx, dy) || 1
          s.x += (dx / dist) * s.z * drift
          s.y += (dy / dist) * s.z * drift

          if (pullStrength > 0.4) {
            const bx = beaconX - s.x
            const by = beaconY - s.y
            const bd = Math.hypot(bx, by) || 1
            const pull = (pullStrength * s.z * dt) / bd
            s.x += bx * pull * 0.018
            s.y += by * pull * 0.018
          }

          if (s.x < -20) s.x = w + 20
          if (s.x > w + 20) s.x = -20
          if (s.y < -20) s.y = h + 20
          if (s.y > h + 20) s.y = -20
          ctx.fillStyle = `rgba(220, 228, 245, ${s.a * (0.85 + 0.15 * mult)})`
          ctx.beginPath()
          ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
          ctx.fill()
        }
      }

      const list = meteorsRef.current
      if (list.length && !rm && meteorIntensity > 0.004) {
        const margin = 120
        const speedMul = 0.38 + 0.62 * meteorIntensity
        for (let i = 0; i < list.length; i++) {
          const m = list[i]
          const sp = meteorBase * mult * m.speedMul * speedMul
          m.vx = Math.cos(m.angle) * sp
          m.vy = Math.sin(m.angle) * sp
          m.x += m.vx * dt
          m.y += m.vy * dt

          if (m.x > w + margin || m.y > h + margin) {
            Object.assign(m, spawnMeteor())
          }
        }

        const sorted = [...list].sort((a, b) => a.scale - b.scale)
        const baseTrail = (0.72 + boost * 0.06) * meteorIntensity
        const baseHead = (0.92 + boost * 0.035) * (0.82 + 0.18 * meteorIntensity)
        for (let i = 0; i < sorted.length; i++) {
          const m = sorted[i]
          drawMeteor(
            m,
            baseTrail * m.trailAlphaMul,
            baseHead * m.scale
          )
        }
      } else if (rm && !exitProgressRef && showMeteors) {
        const staticShow = [
          { x: w * 0.08, y: h * 0.12, vx: 1, vy: 0.38, angle: 0.36, scale: 1, trailAlphaMul: 0.5 },
          { x: w * 0.22, y: h * 0.08, vx: 1, vy: 0.4, angle: 0.34, scale: 0.65, trailAlphaMul: 0.4 },
          { x: w * 0.04, y: h * 0.22, vx: 1, vy: 0.42, angle: 0.4, scale: 0.55, trailAlphaMul: 0.35 },
          { x: w * 0.35, y: h * 0.05, vx: 1, vy: 0.39, angle: 0.33, scale: 0.45, trailAlphaMul: 0.32 },
        ]
        for (const sm of staticShow) {
          drawMeteor(sm, 0.45 * sm.trailAlphaMul, 0.9 * sm.scale)
        }
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)

    return () => {
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [active, boostRef, showStars, showMeteors, exitProgressRef, connectionFlowRef])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  )
}
