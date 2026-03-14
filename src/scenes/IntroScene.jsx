import { Avatar } from '../components/Avatar'
import { IntroCameraMove } from '../components/IntroCameraMove'
import { ScrollCameraController } from '../components/ScrollCameraController'
import { GridFloor } from '../components/GridFloor'

export function IntroScene() {
  return (
    <ScrollCameraController>
      {/* Soft ambient to keep the scene dark but readable */}
      <ambientLight intensity={0.35} />

      {/* Strong key light from the front, casting soft shadows on the face */}
      <directionalLight
        position={[2, 4, 3]}
        intensity={2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadowBias={-0.0001}
      />

      {/* Subtle rim light from behind to separate the avatar from the background */}
      <directionalLight
        position={[0, 2, -3]}
        intensity={0.6}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadowBias={-0.0001}
      />

      {/* Subtle spotlight above the avatar, fading into darkness */}
      <spotLight
        position={[0, 4.2, 1]}
        angle={0.6}
        penumbra={0.8}
        intensity={0.7}
        distance={12}
        decay={1.8}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadowBias={-0.0001}
      />

      {/* Dark floor that receives shadows */}
      <GridFloor />

      <Avatar />
      <IntroCameraMove />
    </ScrollCameraController>
  )
}
