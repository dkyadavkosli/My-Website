import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'

const lerp = (a, b, t) => a + (b - a) * t

/**
 * WorldCameraController
 *
 * Uses drei's useScroll (inside <ScrollControls />) to move the camera
 * smoothly along the Z axis as the user scrolls.
 *
 * Props:
 * - zStart: camera Z at top of page (scroll = 0)
 * - zEnd: camera Z at bottom of page (scroll = 1)
 * - lerpFactor: smoothing factor per frame (0–1, smaller = smoother/slower)
 */
export function WorldCameraController({
  zStart = 5,
  zEnd = 3.2,
  lerpFactor = 0.08,
}) {
  const { camera } = useThree()
  const scroll = useScroll()
  const currentZRef = useRef(camera.position.z)

  useFrame(() => {
    // Scroll offset from drei: 0 at top, 1 at bottom of ScrollControls pages
    const progress = scroll.offset || 0

    const targetZ = lerp(zStart, zEnd, progress)
    const currentZ = currentZRef.current
    const nextZ = lerp(currentZ, targetZ, lerpFactor)

    camera.position.z = nextZ
    currentZRef.current = nextZ
  })

  return null
}

