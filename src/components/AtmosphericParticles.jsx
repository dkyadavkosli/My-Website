import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const COUNT_MOVING = 140
const COUNT_STATIC = 90
const SPREAD = 10
const SIZE = 0.035

export function AtmosphericParticles() {
  const movingRef = useRef(null)
  const staticRef = useRef(null)

  const {
    movingPositions,
    movingInitialY,
    movingSpeeds,
    staticPositions,
  } = useMemo(() => {
    const movingPositions = new Float32Array(COUNT_MOVING * 3)
    const movingInitialY = new Float32Array(COUNT_MOVING)
    const movingSpeeds = new Float32Array(COUNT_MOVING)

    for (let i = 0; i < COUNT_MOVING; i++) {
      movingPositions[i * 3] = (Math.random() - 0.5) * SPREAD * 2
      movingPositions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD
      movingPositions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD
      movingInitialY[i] = movingPositions[i * 3 + 1]
      movingSpeeds[i] = 0.15 + Math.random() * 0.25
    }

    const staticPositions = new Float32Array(COUNT_STATIC * 3)
    for (let i = 0; i < COUNT_STATIC; i++) {
      staticPositions[i * 3] = (Math.random() - 0.5) * SPREAD * 2.2
      staticPositions[i * 3 + 1] = (Math.random() - 0.5) * SPREAD * 1.2
      staticPositions[i * 3 + 2] = (Math.random() - 0.5) * SPREAD * 1.8
    }

    return { movingPositions, movingInitialY, movingSpeeds, staticPositions }
  }, [])

  useFrame((state) => {
    if (!movingRef.current) return
    const pos = movingRef.current.geometry.attributes.position.array
    const time = state.clock.elapsedTime
    for (let i = 0; i < COUNT_MOVING; i++) {
      pos[i * 3 + 1] =
        movingInitialY[i] +
        Math.sin(time * movingSpeeds[i] + i * 0.35) * 0.18
    }
    movingRef.current.geometry.attributes.position.needsUpdate = true
  })

  return (
    <>
      {/* Slow moving near-layer */}
      <points ref={movingRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT_MOVING}
            array={movingPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={SIZE}
          transparent
          opacity={0.42}
          color="#a5b4fc"
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* Static distant layer for depth */}
      <points ref={staticRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={COUNT_STATIC}
            array={staticPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={SIZE * 0.8}
          transparent
          opacity={0.25}
          color="#7f8ffb"
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  )
}
