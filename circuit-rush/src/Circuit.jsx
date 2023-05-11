import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { useTexture, Clone, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'
import { usePlane } from '@react-three/cannon'

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }))
  return (
    <mesh ref={ref} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[400, 400]}/>
            <meshStandardMaterial color={'#ffffff'} transparent={true} opacity={0} />
    </mesh>
  )
}

export default function Circuit() {
  const { scene } = useGLTF('./circuit.glb');
    const settings = useControls({
        color: '#ffffff',
        terrain: '#ffffff',
        test: '#ffffff',
        track: '#ffffff',
    });

    scene.traverse((child) => {
      console.log(child)
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: settings.color,
            roughness: 1,
            metalness: 0,
            emissive: settings.color,
            emissiveIntensity: 1,
          });
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name === 'Plane') {
            child.material = new THREE.MeshStandardMaterial({
              color: settings.terrain,
              roughness: 1,
              metalness: 0,
              emissive: settings.color,
              emissiveIntensity: 1,
            });
          }
          if (child.name === 'test') {
            child.material = new THREE.MeshStandardMaterial({
              color: settings.test,
              roughness: 1,
              metalness: 0,
              emissive: settings.color,
              emissiveIntensity: 0.4,
            });
          }
          if (child.name === 'Track') {
            child.material = new THREE.MeshStandardMaterial({
              color: settings.track,
              roughness: 1,
              metalness: 0,
              emissive: settings.color,
              emissiveIntensity: 0.6,
            });
          }
        }
    });
    return (
        <>
        <Plane/>
        <Clone object={scene} />
        </>
      )
}