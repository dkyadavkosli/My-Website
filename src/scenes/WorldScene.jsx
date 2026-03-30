import { ScrollCameraController } from '../components/ScrollCameraController'
import { AtmosphericParticles } from '../components/AtmosphericParticles'
import { IntroCameraMove } from '../components/IntroCameraMove'
import { SectionProvider } from '../context/SectionContext'

/**
 * WorldScene: main 3D world with scroll-driven camera and section state.
 * Active section (intro | about | experience | projects | contact) is
 * derived from scroll progress. Use useSection() to read current section.
 */
export function WorldScene() {
  return (
    <ScrollCameraController>
      <SectionProvider>
        {/* Lighting */}
        <ambientLight intensity={0.28} />
        <directionalLight
          position={[2.5, 4, 2]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadowBias={-0.0001}
        />
        <directionalLight position={[0, 2.2, 4.5]} intensity={0.45} />

        {/* Environment */}
        <AtmosphericParticles />

        {/* One-time cinematic camera intro */}
        <IntroCameraMove />
      </SectionProvider>
    </ScrollCameraController>
  )
}
