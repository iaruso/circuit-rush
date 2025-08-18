import { FC, RefObject } from 'react'
import { useControls } from '@/context/use-controls'
import type { Group } from 'three'

interface WheelProps {
  wheelRef: RefObject<Group | null>
  color?: string
}

export const Wheel: FC<WheelProps> = ({ wheelRef, color }) => {
  const { controls } = useControls()
  const wireColor = color ?? '#E5EAF6'
  return (
    <group ref={wheelRef}>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 2]}>
        <cylinderGeometry args={[
          controls.vehicle.body.wheels.wheelSize[0],
          controls.vehicle.body.wheels.wheelSize[0],
          controls.vehicle.body.wheels.wheelSize[1],
          24
        ]} />
        <meshBasicMaterial wireframe color={wireColor} />
      </mesh>
    </group>
  )
}
