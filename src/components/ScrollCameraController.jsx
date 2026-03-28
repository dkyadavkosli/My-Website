import { useEffect, useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { ScrollProgressProvider } from '../context/ScrollProgressContext'

const lerp = (a, b, t) => a + (b - a) * t

const SECTIONS = ['intro', 'about', 'experience', 'projects', 'contact']

function getSectionFromProgress(progress) {
  const index = Math.min(SECTIONS.length - 1, Math.floor(progress * SECTIONS.length))
  return SECTIONS[index]
}

const defaultProps = {
  zMin: 5,
  zMax: 3.2,
  lerpFactor: 0.08,
}

export function ScrollCameraController({
  zMin = defaultProps.zMin,
  zMax = defaultProps.zMax,
  lerpFactor = defaultProps.lerpFactor,
  children,
}) {
  const { camera, invalidate } = useThree()
  const scrollProgressRef = useRef(0)
  const scrollTargetRef = useRef(0)
  const sectionRef = useRef('intro')

  const contextValue = useMemo(
    () => ({
      scrollProgressRef,
      sectionRef,
      getScrollProgress: () => scrollProgressRef.current,
      getSection: () => sectionRef.current,
      sections: SECTIONS,
    }),
    []
  )

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      scrollTargetRef.current = maxScroll <= 0 ? 0 : Math.min(1, scrollY / maxScroll)
    }

    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useFrame(() => {
    const targetProgress = scrollTargetRef.current
    scrollProgressRef.current = lerp(scrollProgressRef.current, targetProgress, lerpFactor)

    const progress = scrollProgressRef.current
    sectionRef.current = getSectionFromProgress(progress)

    const maxScroll = document.documentElement.scrollHeight - window.innerHeight
    if (maxScroll > 0) {
      const targetZ = lerp(zMin, zMax, progress)
      camera.position.z = lerp(camera.position.z, targetZ, lerpFactor)
    }

    invalidate()
  })

  return (
    <ScrollProgressProvider value={contextValue}>
      {children}
    </ScrollProgressProvider>
  )
}
