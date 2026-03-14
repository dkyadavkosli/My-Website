import { createContext, useContext, useState, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useScrollProgress } from './ScrollProgressContext'

export const SECTIONS = ['intro', 'about', 'skills', 'projects', 'experience', 'contact']

const SectionContext = createContext(null)

function getSectionFromProgress(progress) {
  const index = Math.min(
    SECTIONS.length - 1,
    Math.floor(progress * SECTIONS.length)
  )
  return SECTIONS[index]
}

export function useSection() {
  const ctx = useContext(SectionContext)
  if (!ctx) {
    throw new Error('useSection must be used inside SectionProvider')
  }
  return ctx
}

export function SectionProvider({ children }) {
  const [section, setSection] = useState('intro')
  const prevSectionRef = useRef('intro')
  const { scrollProgressRef } = useScrollProgress()

  useFrame(() => {
    const progress = scrollProgressRef.current
    const next = getSectionFromProgress(progress)
    if (next !== prevSectionRef.current) {
      prevSectionRef.current = next
      setSection(next)
    }
  })

  return (
    <SectionContext.Provider value={{ section, sections: SECTIONS }}>
      {children}
    </SectionContext.Provider>
  )
}

export { SectionContext }
