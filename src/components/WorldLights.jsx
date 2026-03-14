export function WorldLights() {
  return (
    <>
      {/* Soft global ambient to lift shadows slightly */}
      <ambientLight intensity={0.22} color="#ffffff" />

      {/* Strong key light from top right with soft shadows */}
      <directionalLight
        position={[3, 5, 2]}
        intensity={1.8}
        color="#ffffff"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-radius={4}
        shadow-bias={-0.0001}
      />

      {/* Subtle rim light behind avatar */}
      <directionalLight
        position={[0, 2.4, 4.5]}
        intensity={0.45}
        color="#f9fafb"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-radius={3}
        shadow-bias={-0.0001}
      />

      {/* Very faint cool fill from the left */}
      <directionalLight
        position={[-3, 2.2, 1]}
        intensity={0.25}
        color="#4f46e5"
        castShadow
        shadow-mapSize={[512, 512]}
        shadow-radius={3}
        shadow-bias={-0.00005}
      />
    </>
  )
}

