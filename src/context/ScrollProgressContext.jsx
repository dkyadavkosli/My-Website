import { createContext, useContext, useRef } from 'react'

const ScrollProgressContext = createContext(null)

export function useScrollProgress() {
  const ctx = useContext(ScrollProgressContext)
  if (!ctx) {
    throw new Error('useScrollProgress must be used inside ScrollCameraController or ScrollProgressProvider')
  }
  return ctx
}

export function ScrollProgressProvider({ children, value }) {
  return (
    <ScrollProgressContext.Provider value={value}>
      {children}
    </ScrollProgressContext.Provider>
  )
}

export { ScrollProgressContext }
