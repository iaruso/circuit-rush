import type React from 'react'
import type { MutableRefObject } from 'react'
import type { Group } from 'three'

interface WheelProps {
  wheelRef: MutableRefObject<Group | null>
  color?: string
}

export const Wheel: React.FC<WheelProps> = ({ wheelRef, color }) => {
  const wireColor = color ?? '#E5EAF6'
  return (
    <group ref={wheelRef}>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.33, 0.33, 0.4, 24]} />
        <meshBasicMaterial wireframe color={wireColor} />
      </mesh>
    </group>
  )
}
