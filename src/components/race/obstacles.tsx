'use client'

import { useBox, useCylinder } from '@react-three/cannon'

function ObstacleBox({ position, color = '#f59e0b' }: { position: [number, number, number], color?: string }) {
  const [ref] = useBox(() => ({
    mass: 100,
    position,
    args: [1, 1, 1],
    material: { friction: 0.1, restitution: 0.5 },
  }))

  return (
    <mesh ref={ref as any}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={color} />
    </mesh>
  )
}

function TireStack({ position }: { position: [number, number, number] }) {
  const [ref] = useCylinder(() => ({
    mass: 50,
    position,
    args: [0.6, 0.6, 1.2, 16],
    material: { friction: 0.8, restitution: 0.1 },
  }))

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <cylinderGeometry args={[0.6, 0.6, 1.2, 16]} />
      <meshStandardMaterial color="#1f2937" roughness={0.9} />
    </mesh>
  )
}

export default function Obstacles() {
  return (
    <>
      {/* Corner 1 */}
      <TireStack position={[-6, 0.6, -15]} />
      <TireStack position={[-4, 0.6, -17]} />
      <TireStack position={[-2, 0.6, -19]} />
      
      {/* Corner 2 */}
      <TireStack position={[18, 0.6, -19]} />
      <TireStack position={[20, 0.6, -17]} />
      <TireStack position={[22, 0.6, -15]} />

      {/* Chicane */}
      <TireStack position={[8, 0.6, -10]} />
      <TireStack position={[10, 0.6, -11]} />
    </>
  )
}
