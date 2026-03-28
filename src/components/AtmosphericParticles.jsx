import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const BASE_SIZE = 0.075

/** Frame-rate–independent smoothing: approaches 1 when dt ~ 1/60 */
function smoothStep(current, target, dt, lambda = 10) {
  const t = 1 - Math.exp(-lambda * Math.min(dt, 0.05))
  return current + (target - current) * t
}

function createCircleTexture() {
  const size = 64
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, 'rgba(255,255,255,1)')
  g.addColorStop(0.35, 'rgba(255,255,255,0.85)')
  g.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.needsUpdate = true
  return tex
}

function buildLayer(count, spread, zJitter) {
  const positions = new Float32Array(count * 3)
  const initialY = new Float32Array(count)
  const speeds = new Float32Array(count)

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread * 2
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.1
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * zJitter
    initialY[i] = positions[i * 3 + 1]
    speeds[i] = 0.12 + Math.random() * 0.22
  }

  return { positions, initialY, speeds, count }
}

function buildTwinkleLayer(count, spread) {
  const positions = new Float32Array(count * 3)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * spread * 2
    positions[i * 3 + 1] = (Math.random() - 0.5) * spread * 1.0
    positions[i * 3 + 2] = (Math.random() - 0.5) * spread * 0.8
  }
  return positions
}

const TWINKLE_PRESETS = [
  { count: 14, phase: 0.0, freq: 1.05, baseOpacity: 0.14, sizeMul: 0.42 },
  { count: 14, phase: 2.1, freq: 1.55, baseOpacity: 0.12, sizeMul: 0.38 },
  { count: 12, phase: 4.2, freq: 2.05, baseOpacity: 0.16, sizeMul: 0.48 },
]

export function AtmosphericParticles() {
  const zoomGroupRef = useRef(null)
  const bgRef = useRef(null)
  const midRef = useRef(null)
  const fgRef = useRef(null)

  const twinkleMatRefs = useRef([])

  const mouseRef = useRef({ x: 0, y: 0 })
  const scrollSmoothedRef = useRef(0)
  const scrollTargetRef = useRef(0)

  const circleMap = useMemo(() => createCircleTexture(), [])

  useEffect(() => {
    return () => circleMap.dispose()
  }, [circleMap])

  const layers = useMemo(
    () => ({
      bg: buildLayer(110, 16, 2.4),
      mid: buildLayer(130, 11, 1.6),
      fg: buildLayer(85, 7, 1.1),
    }),
    []
  )

  const twinkleData = useMemo(() => {
    return TWINKLE_PRESETS.map((p) => ({
      ...p,
      positions: buildTwinkleLayer(p.count, 9),
    }))
  }, [])

  useEffect(() => {
    const onMove = (e) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    const onHeroScroll = (e) => {
      if (e.detail && typeof e.detail.progress === 'number') {
        scrollTargetRef.current = e.detail.progress
      }
    }
    const onIntroCardScroll = (e) => {
      if (e.detail && typeof e.detail.progress === 'number') {
        scrollTargetRef.current = e.detail.progress
      }
    }
    const resetScrollTargets = () => {
      scrollTargetRef.current = 0
      scrollSmoothedRef.current = 0
    }
    const onShowHero = () => {
      resetScrollTargets()
    }
    const onLeaveHero = () => {
      scrollTargetRef.current = 0
    }
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('heroScrollProgress', onHeroScroll)
    window.addEventListener('introCardScrollProgress', onIntroCardScroll)
    window.addEventListener('showHero', onShowHero)
    window.addEventListener('heroToCard', onLeaveHero)
    window.addEventListener('showCardIntro', resetScrollTargets)
    window.addEventListener('cardToAbout', resetScrollTargets)
    window.addEventListener('cardToHero', resetScrollTargets)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('heroScrollProgress', onHeroScroll)
      window.removeEventListener('introCardScrollProgress', onIntroCardScroll)
      window.removeEventListener('showHero', onShowHero)
      window.removeEventListener('heroToCard', onLeaveHero)
      window.removeEventListener('showCardIntro', resetScrollTargets)
      window.removeEventListener('cardToAbout', resetScrollTargets)
      window.removeEventListener('cardToHero', resetScrollTargets)
    }
  }, [])

  useFrame((state, delta) => {
    const time = state.clock.elapsedTime
    const dt = Math.min(delta, 0.055)
    const mx = mouseRef.current.x
    const my = mouseRef.current.y

    const target = scrollTargetRef.current
    scrollSmoothedRef.current = smoothStep(scrollSmoothedRef.current, target, dt, 12)
    const s = scrollSmoothedRef.current

    const wobbleAmpBg = 0.12 + s * 0.14
    const wobbleAmpMid = 0.16 + s * 0.26
    const wobbleAmpFg = 0.18 + s * 0.42

    const speedBg = 1 + s * 1.1
    const speedMid = 1 + s * 2.2
    const speedFg = 1 + s * 3.4

    const tickLayer = (ref, layer, amp, speedMul) => {
      if (!ref.current) return
      const pos = ref.current.geometry.attributes.position.array
      const { initialY, speeds, count } = layer
      for (let i = 0; i < count; i++) {
        pos[i * 3 + 1] =
          initialY[i] + Math.sin(time * speeds[i] * speedMul + i * 0.37) * amp
      }
      ref.current.geometry.attributes.position.needsUpdate = true
    }

    tickLayer(bgRef, layers.bg, wobbleAmpBg, speedBg)
    tickLayer(midRef, layers.mid, wobbleAmpMid, speedMid)
    tickLayer(fgRef, layers.fg, wobbleAmpFg, speedFg)

    const lp = 1 - Math.exp(-9 * dt)

    if (bgRef.current) {
      const bx = mx * 0.05
      const by = -my * 0.03
      const bz = -4.2 + s * 0.55
      bgRef.current.position.x = THREE.MathUtils.lerp(bgRef.current.position.x, bx, lp)
      bgRef.current.position.y = THREE.MathUtils.lerp(bgRef.current.position.y, by, lp)
      bgRef.current.position.z = THREE.MathUtils.lerp(bgRef.current.position.z, bz, lp)
    }
    if (midRef.current) {
      const bx = mx * 0.12
      const by = -my * 0.08
      const bz = -0.8 + s * 1.05
      midRef.current.position.x = THREE.MathUtils.lerp(midRef.current.position.x, bx, lp)
      midRef.current.position.y = THREE.MathUtils.lerp(midRef.current.position.y, by, lp)
      midRef.current.position.z = THREE.MathUtils.lerp(midRef.current.position.z, bz, lp)
    }
    if (fgRef.current) {
      const bx = mx * 0.2
      const by = -my * 0.13
      const bz = 1.35 + s * 1.75
      fgRef.current.position.x = THREE.MathUtils.lerp(fgRef.current.position.x, bx, lp)
      fgRef.current.position.y = THREE.MathUtils.lerp(fgRef.current.position.y, by, lp)
      fgRef.current.position.z = THREE.MathUtils.lerp(fgRef.current.position.z, bz, lp)
    }

    if (zoomGroupRef.current) {
      const zScale = 1 + s * 0.11
      const g = zoomGroupRef.current
      const next = THREE.MathUtils.lerp(g.scale.x, zScale, lp * 0.85)
      g.scale.setScalar(next)
    }

    twinkleData.forEach((tw, idx) => {
      const mat = twinkleMatRefs.current[idx]
      if (!mat) return
      const wobble = 0.78 + 0.22 * Math.sin(time * tw.freq + tw.phase)
      const micro = 0.96 + 0.04 * Math.sin(time * (tw.freq * 2.3) + tw.phase * 1.7)
      mat.opacity = tw.baseOpacity * wobble
      mat.size = BASE_SIZE * tw.sizeMul * micro
    })
  })

  return (
    <group ref={zoomGroupRef}>
      <points ref={bgRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={layers.bg.count}
            array={layers.bg.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={circleMap}
          size={BASE_SIZE * 0.55}
          transparent
          opacity={0.2}
          color="#6b7fd7"
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          alphaTest={0.01}
        />
      </points>

      <points ref={midRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={layers.mid.count}
            array={layers.mid.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={circleMap}
          size={BASE_SIZE * 0.82}
          transparent
          opacity={0.34}
          color="#8b9cff"
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          alphaTest={0.01}
        />
      </points>

      <points ref={fgRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={layers.fg.count}
            array={layers.fg.positions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          map={circleMap}
          size={BASE_SIZE}
          transparent
          opacity={0.48}
          color="#b4c2ff"
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          alphaTest={0.01}
        />
      </points>

      {twinkleData.map((tw, idx) => (
        <points
          key={`tw-${idx}`}
          frustumCulled={false}
          position={[0, 0, 0.9]}
        >
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={tw.count}
              array={tw.positions}
              itemSize={3}
            />
          </bufferGeometry>
          <pointsMaterial
            ref={(m) => {
              twinkleMatRefs.current[idx] = m
            }}
            map={circleMap}
            size={BASE_SIZE * tw.sizeMul}
            transparent
            opacity={tw.baseOpacity}
            color="#e8ecff"
            sizeAttenuation
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            alphaTest={0.01}
          />
        </points>
      ))}
    </group>
  )
}
