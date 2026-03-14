import * as THREE from 'three'

export function GridFloor() {
  const planeY = -0.7
  const gridY = planeY + 0.02

  return (
    <>
      {/* Shadow‑receiving floor */}
      <mesh
        position={[0, planeY, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#05070f" />
      </mesh>

      {/* Subtle overlay grid slightly above the floor */}
      <primitive
        object={new THREE.GridHelper(200, 80, 0x1f2937, 0x111827)}
        position={[0, gridY, 0]}
      />
    </>
  )
}

