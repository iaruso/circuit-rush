import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useTrimesh } from '@react-three/cannon'
import { useRef } from 'react'

export default function PhysicsWorld({ borderObjectName, rotation, ...props }) {
  const { nodes } = useGLTF('./circuit-physics.glb');
  const [ref, api] = useTrimesh(
    () => ({
      args: [
        nodes[borderObjectName].geometry.attributes.position.array,
        nodes[borderObjectName].geometry.index.array,
      ],
      mass: 0,
      restitution: 0.2,
      friction: 0.1,
      rotation: rotation,
      ...props,
    }),
  )
  return (
    <>
      <group
        ref={ref}
        {...props}
        dispose={null}
      >
        <mesh
          geometry={nodes[borderObjectName].geometry}
          material={new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0
          })}
        />
      </group>
    </>
  )
}
