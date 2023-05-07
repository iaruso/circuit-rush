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
        color: '#ffffff'
    });

    scene.traverse((child) => {
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
        }
    });
    return (
        <>
        <Plane/>
        <Clone object={scene} />
        </>
      )
}