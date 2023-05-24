import { Clone, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

export default function Circuit() {
  const { scene } = useGLTF('./circuit.glb');
    const settings = useControls({
      color: '#efefef',
      plane: '#fff'
    });

    scene.traverse((child) => {
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: settings.color,
            roughness: 1,
            metalness: 0,
            emissive: settings.color,
            emissiveIntensity: 0.8,
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
        if (child.name === 'Plane') {
          child.material = new THREE.MeshStandardMaterial({
            color: settings.plane,
            roughness: 1,
            metalness: 0,
            emissive: settings.plane,
            emissiveIntensity: 1,
          });
        }
    });
    return (
        <>
          <Clone object={scene} position={[0, 0, 0]}/>
        </>
      )
}