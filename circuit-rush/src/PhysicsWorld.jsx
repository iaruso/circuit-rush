import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { Clone, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { RigidBody } from '@react-three/rapier'

export default function PhysicsWorld() {
    const { scene } = useGLTF('./circuit-physics.glb');
    scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            transparent: true,
            opacity: 0
          });
        }
    });
    return (
        <>
        <RigidBody type='fixed' colliders='trimesh' restitution={0.2}>
            <Clone object={scene} />
        </RigidBody>
        </>
        )
}