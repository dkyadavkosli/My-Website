import { useEffect, useRef } from 'react'
import { useGLTF, useAnimations, Center } from '@react-three/drei'
import { useThree, useFrame } from '@react-three/fiber'
import gsap from 'gsap'

const MODEL_PATH = '/models/avatar.glb'

// Preload for smoother appearance
useGLTF.preload(MODEL_PATH)

export function Avatar() {
  const groupRef = useRef(null)
  const idleRef = useRef(null)
  const { scene, animations } = useGLTF(MODEL_PATH)
  const { actions, names } = useAnimations(animations, scene)
  const { invalidate } = useThree()

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true
      }
    })
  }, [scene])

  // After the initial 4s intro, smoothly fade the avatar out quickly
  // so the camera travel happens through the environment only.
  useEffect(() => {
    const materials = []
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        const mat = child.material
        mat.transparent = true
        mat.opacity = 1
        materials.push(mat)
      }
    })

    let ctx
    const timer = setTimeout(() => {
      ctx = gsap.context(() => {
        gsap.to(materials, {
          opacity: 0,
          duration: 0.5,
          ease: 'power2.out',
          onUpdate: invalidate,
        })
      })
    }, 4000)

    return () => {
      clearTimeout(timer)
      if (ctx) ctx.revert()
    }
  }, [scene, invalidate])

  useEffect(() => {
    if (names.length > 0 && actions[names[0]]) {
      actions[names[0]].play()
    }
  }, [actions, names])

  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    group.position.y = -0.5
    group.scale.setScalar(0.95)

    const ctx = gsap.context(() => {
      gsap.to(group.position, {
        y: 0,
        duration: 1,
        ease: 'power2.out',
        onUpdate: invalidate,
      })
      gsap.to(group.scale, {
        x: 1,
        y: 1,
        z: 1,
        duration: 1,
        ease: 'power2.out',
        onUpdate: invalidate,
      })
    })

    return () => ctx.revert()
  }, [invalidate])

  useFrame((state) => {
    if (!idleRef.current) return
    const t = state.clock.getElapsedTime()

    const floatOffset = Math.sin(t * 0.6) * 0.02
    const rotationOffset = Math.sin(t * 0.18) * 0.08

    idleRef.current.position.y = floatOffset
    idleRef.current.rotation.y = rotationOffset
  })

  return (
    <Center>
      <group position={[0, -1.1, 0]}>
        <group ref={groupRef}>
          <group ref={idleRef}>
            <primitive object={scene} scale={1.2} />
          </group>
        </group>
      </group>
    </Center>
  )
}
