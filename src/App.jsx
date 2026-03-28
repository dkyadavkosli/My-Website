import { Canvas } from '@react-three/fiber'
import { WorldScene } from './scenes/WorldScene'
import { AssistantRobot } from './components/AssistantRobot'
import { ScrollIndicator } from './components/ScrollIndicator'
import { IntroText } from './components/IntroText'
import { IntroHero } from './components/IntroHero'
import { AboutScreen } from './components/AboutScreen'
import { ExperienceScreen } from './components/ExperienceScreen'
import { ProjectsScreen } from './components/ProjectsScreen'
import { ContactScreen } from './components/ContactScreen'
import { ThankYouScreen } from './components/ThankYouScreen'

function App() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 1.8, 5], fov: 50 }}
        gl={{ antialias: true }}
        style={{ background: '#0a0a0f' }}
      >
        <color attach="background" args={['#0a0a0f']} />
        <WorldScene />
      </Canvas>

      <IntroText />
      <IntroHero />
      <AboutScreen />
      <ExperienceScreen />
      <ProjectsScreen />
      <ContactScreen />
      <ThankYouScreen />
      <AssistantRobot />
      <ScrollIndicator />
    </div>
  )
}

export default App
