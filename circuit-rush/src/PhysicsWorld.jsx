import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Clone, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { Physics, useTrimesh } from '@react-three/cannon'
import { useRef } from 'react'

export default function PhysicsWorld(props) {
    const { nodes } = useGLTF('./circuit-physics.glb');
    const [ref, api] = useTrimesh(
      () => ({
        args: [
          nodes.BorderObject.geometry.attributes.position.array,
          nodes.BorderObject.geometry.index.array,
        ],
        mass: 0,
        ...props,
      }),
      useRef()
    )
    return (
        <group
          ref={ref}
          {...props}
          dispose={null}
        >
          <mesh
            geometry={nodes.BorderObject.geometry}
            material={new THREE.MeshStandardMaterial({
              transparent: true,
              opacity: 0
            })}
          />
        </group>
        )
}