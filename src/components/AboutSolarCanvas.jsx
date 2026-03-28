import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Stars, Text } from '@react-three/drei'
import * as THREE from 'three'

/** Progress 0–1: intro, then four planet bands */
export const INTRO_END = 0.16
export const PLANET_SLICE = (1 - INTRO_END) / 4

export function getStoryChapter(p) {
  if (p < INTRO_END) return -1
  return Math.min(3, Math.floor((p - INTRO_END) / PLANET_SLICE))
}

export function scrollProgressForPlanet(planetIndex) {
  return INTRO_END + (planetIndex + 0.42) * PLANET_SLICE
}

export const SOLAR_PLANETS = [
  { id: 'background', label: 'Background', color: '#94b4e8', emissive: '#2d3f66' },
  { id: 'education', label: 'Education', color: '#6ec8d8', emissive: '#155e5e' },
  { id: 'technologies', label: 'Technologies', color: '#b4a0e8', emissive: '#3d2d6b' },
  { id: 'tunes', label: 'Tunes', color: '#7dccb0', emissive: '#1a5c40' },
]

/** Four concentric rings — wider steps so worlds don’t feel cramped */
const RING_RADII = [1.22, 1.46, 1.7, 1.94]
/** Planet i orbits on ring i */
const PLANET_RING = [0, 1, 2, 3]
/** Shared angular speed keeps spacing as the system rotates (+Y) */
const ORBIT_OMEGA = 0.082
const ORBIT_SPEEDS = [ORBIT_OMEGA, ORBIT_OMEGA, ORBIT_OMEGA, ORBIT_OMEGA]
/**
 * Exactly 90° apart on each ring (max even spacing for 4 bodies).
 * Order: Background → Education → Technologies → Tunes around the sun.
 */
const PHASE_OFFSETS = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2]
/** Slightly smaller spheres = clearer gaps between neighbors on screen */
const PLANET_RADII = [0.104, 0.12, 0.11, 0.128]
/** Tilt orbit plane so planets aren’t lined up with the view axis (fewer hidden-behind-sun / clumps) */
const ORBIT_PLANE_TILT_X = 0.32
const ORBIT_PLANE_TILT_Y = 0.62

/** Smaller pull keeps the focused planet from drifting over neighbors */
const PULL_MAX = 0.22
const SYSTEM_GROUP_Y = 0.16
const LOOK_AT_Y = -0.06

function activeWeights(p) {
  const n = SOLAR_PLANETS.length
  if (p < INTRO_END * 0.7) return Array(n).fill(0.22)

  if (p < INTRO_END) {
    const k = THREE.MathUtils.smoothstep((p - INTRO_END * 0.7) / (INTRO_END * 0.3), 0, 1)
    const w = Array(n).fill(0.22)
    w[0] = 0.22 + k * 0.55
    for (let i = 1; i < n; i++) w[i] = 0.22 - k * 0.12
    return w
  }

  const u = (p - INTRO_END) / (1 - INTRO_END)
  const centers = [1 / 8, 3 / 8, 5 / 8, 7 / 8]
  const sigma = 0.17
  const raw = centers.map((c) => {
    const d = (u - c) / sigma
    return Math.exp(-d * d)
  })
  let s = raw.reduce((a, b) => a + b, 0)
  if (s < 1e-6) s = 1
  return raw.map((x) => x / s)
}

const sunVertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vViewDir;
  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`

const sunFragmentShader = /* glsl */ `
  uniform float uTime;
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    float limb = max(0.001, dot(vNormal, vViewDir));
    float t = pow(limb, 0.52);
    vec3 core = vec3(1.0, 0.96, 0.55);
    vec3 mid = vec3(1.0, 0.62, 0.12);
    vec3 edge = vec3(0.45, 0.12, 0.02);
    vec3 col = mix(edge, mid, smoothstep(0.08, 0.55, t));
    col = mix(col, core, smoothstep(0.45, 0.98, t));
    float breathe = 0.92 + 0.08 * sin(uTime * 0.85);
    col *= breathe;
    gl_FragColor = vec4(col, 1.0);
  }
`

function Sun() {
  const outerGlowRef = useRef(null)
  const midGlowRef = useRef(null)

  const sunUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
    }),
    []
  )

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    sunUniforms.uTime.value = t
    const b = 1 + 0.045 * Math.sin(t * 0.72)
    if (outerGlowRef.current) outerGlowRef.current.scale.setScalar(1.08 * b)
    if (midGlowRef.current) midGlowRef.current.scale.setScalar(1.03 * b)
  })

  return (
    <group>
      <mesh ref={outerGlowRef}>
        <sphereGeometry args={[0.68, 32, 32]} />
        <meshBasicMaterial
          color="#ff6b1a"
          transparent
          opacity={0.045}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={midGlowRef}>
        <sphereGeometry args={[0.52, 40, 40]} />
        <meshBasicMaterial
          color="#ffc14d"
          transparent
          opacity={0.07}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.4, 64, 64]} />
        <shaderMaterial
          vertexShader={sunVertexShader}
          fragmentShader={sunFragmentShader}
          uniforms={sunUniforms}
        />
      </mesh>
    </group>
  )
}

/** Three coplanar rings, torus in XZ after -90° X */
function OrbitRings() {
  return (
    <group>
      {RING_RADII.map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[r, 0.0045, 8, 128]} />
          <meshBasicMaterial color="#9ca3c4" transparent opacity={0.22} depthWrite={false} />
        </mesh>
      ))}
    </group>
  )
}

function MovingStars() {
  const g = useRef(null)
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.018
  })
  return (
    <group ref={g}>
      <Stars
        radius={90}
        depth={42}
        count={1800}
        factor={2.2}
        saturation={0}
        fade
        speed={0.35}
      />
    </group>
  )
}

const _tmpCol = new THREE.Color()
const _dimMix = new THREE.Color(0.35, 0.38, 0.48)

function PlanetBody({
  index,
  baseRadius,
  orbitSpeed,
  phase0,
  radius,
  config,
  progressRef,
  onPlanetClick,
}) {
  const groupRef = useRef(null)
  const matRef = useRef(null)
  const angleRef = useRef(phase0)

  useFrame((_, dt) => {
    const weights = activeWeights(progressRef.current)
    const w = weights[index]
    const wMax = Math.max(weights[0], weights[1], weights[2], weights[3])
    const isFocus = w >= wMax - 0.02 && w > 0.18
    const back = !isFocus && w < 0.38

    angleRef.current += orbitSpeed * dt
    const pull = w * PULL_MAX
    const r = Math.max(0.35, baseRadius - pull)
    const a = angleRef.current
    const x = r * Math.cos(a)
    const z = r * Math.sin(a)
    if (groupRef.current) {
      groupRef.current.position.set(x, 0, z)
      const focusScale = THREE.MathUtils.lerp(back ? 0.9 : 0.97, isFocus ? 1.12 : 1.0, w)
      const sx = groupRef.current.scale.x
      groupRef.current.scale.setScalar(THREE.MathUtils.lerp(sx, focusScale, 1 - Math.exp(-10 * dt)))
    }

    if (matRef.current) {
      const emBase = THREE.MathUtils.lerp(0.1, 0.68, w)
      const rough = THREE.MathUtils.lerp(back ? 0.68 : 0.48, isFocus ? 0.26 : 0.4, w)
      matRef.current.emissiveIntensity = THREE.MathUtils.lerp(matRef.current.emissiveIntensity, emBase, 1 - Math.exp(-8 * dt))
      matRef.current.roughness = THREE.MathUtils.lerp(matRef.current.roughness, rough, 1 - Math.exp(-8 * dt))
      matRef.current.metalness = THREE.MathUtils.lerp(matRef.current.metalness, isFocus ? 0.28 : 0.14, 1 - Math.exp(-6 * dt))
      _tmpCol.set(config.color)
      if (back) _tmpCol.lerp(_dimMix, 0.5)
      else if (!isFocus) _tmpCol.lerp(_dimMix, 0.18)
      matRef.current.color.lerp(_tmpCol, 1 - Math.exp(-6 * dt))
    }
  })

  return (
    <group ref={groupRef}>
      <mesh
        castShadow
        onClick={(e) => {
          e.stopPropagation()
          onPlanetClick(index)
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial
          ref={matRef}
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={0.32}
          metalness={0.16}
          roughness={0.44}
          toneMapped
        />
      </mesh>
      <Text
        position={[0, radius + 0.12 + (index % 2) * 0.045, 0]}
        fontSize={0.04}
        color="#f1f5f9"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.005}
        outlineColor="#020617"
        maxWidth={1.35}
        textAlign="center"
        onClick={(e) => {
          e.stopPropagation()
          onPlanetClick(index)
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        {config.label}
      </Text>
    </group>
  )
}

function SolarScene({ progressRef, onPlanetClick }) {
  const { camera } = useThree()

  useFrame((_, dt) => {
    const p = progressRef.current
    const u = p < INTRO_END ? 0 : (p - INTRO_END) / (1 - INTRO_END)
    const yaw = 0.1 + u * 0.32
    const lp = 1 - Math.exp(-4 * dt)
    camera.position.x = THREE.MathUtils.lerp(camera.position.x, Math.sin(yaw) * 0.42, lp)
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, 1.02 + u * 0.1, lp)
    camera.position.z = 4.9
    camera.lookAt(0, LOOK_AT_Y, 0)
  })

  return (
    <>
      <MovingStars />

      <ambientLight intensity={0.06} color="#b4c5e8" />
      <pointLight position={[0, 0.02, 0]} intensity={2.4} distance={14} decay={2} color="#fff4dd" />
      <directionalLight position={[3.5, 2.8, 4]} intensity={0.12} color="#e8eaff" />

      <group position={[0, SYSTEM_GROUP_Y, 0]}>
        <Sun />
        <group rotation={[ORBIT_PLANE_TILT_X, ORBIT_PLANE_TILT_Y, 0]}>
          <OrbitRings />
          {SOLAR_PLANETS.map((cfg, i) => (
            <PlanetBody
              key={cfg.id}
              index={i}
              baseRadius={RING_RADII[PLANET_RING[i]]}
              orbitSpeed={ORBIT_SPEEDS[i]}
              phase0={PHASE_OFFSETS[i]}
              radius={PLANET_RADII[i]}
              config={cfg}
              progressRef={progressRef}
              onPlanetClick={onPlanetClick}
            />
          ))}
        </group>
      </group>
    </>
  )
}

export function AboutSolarCanvas({ progressRef, onPlanetClick }) {
  return (
    <Canvas
      camera={{ position: [0.15, 1.02, 4.9], fov: 38, near: 0.1, far: 120 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.75]}
      onCreated={({ gl, scene }) => {
        scene.background = null
        gl.setClearColor(0x000000, 0)
      }}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'auto',
        touchAction: 'none',
      }}
    >
      <SolarScene progressRef={progressRef} onPlanetClick={onPlanetClick} />
    </Canvas>
  )
}
