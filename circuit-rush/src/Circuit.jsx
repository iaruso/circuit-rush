import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { useTexture, Clone, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { RigidBody } from '@react-three/rapier'

export default function Circuit() {
  const { scene } = useGLTF('./circuit.glb');
    const settings = useControls({
        color: '#ffffff'
    });

    scene.traverse((child) => {
        console.log(child.children)
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: settings.color,
            roughness: 1,
            metalness: 0,
            emissive: settings.color,
            emissiveIntensity: 1,
            wireframe: true
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
    });
    return (
        <>
        <RigidBody colliders='ball' restitution={1}>
          <mesh castShadow position={[5.5, 30, 0]}>
            <sphereGeometry/>
            <meshStandardMaterial color={'#ffffff'} metalness={0} roughness={1} emissive={'#fff'} emissiveIntensity={1}/>
          </mesh>
        </RigidBody>
        <RigidBody type='fixed' colliders='trimesh' restitution={0.2}>
          <mesh rotation={[Math.PI/2, 0, 0]}>
            <planeGeometry args={[400, 400]}/>
            <meshStandardMaterial color={'#ffffff'} transparent />
          </mesh>
        </RigidBody>
        <Clone object={scene} />
        </>
      )
}