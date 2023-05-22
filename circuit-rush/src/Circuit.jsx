import { Clone, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

export default function Circuit() {
  const { scene } = useGLTF('./circuit.glb');
    const settings = useControls({
        color: '#ffffff',
        terrain: '#ffffff',
        test: '#ffffff',
        track: '#ffffff',
        trafficLight: '#ff0000',
    });

    scene.traverse((child) => {
      console.log(child)
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
          if (child.name === 'Plane') {
            child.material = new THREE.MeshStandardMaterial({
              color: settings.terrain,
              roughness: 1,
              metalness: 0,
              emissive: settings.color,
              emissiveIntensity: 0.8,
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
          if (child.name.startsWith('TrafficLight')) {
            child.material = new THREE.MeshStandardMaterial({
              color: settings.trafficLight,
              roughness: 0.5,
              metalness: 0.2,
              emissive: settings.color,
              emissiveIntensity: 0.1,
            });
          }
        }
    });
    return (
        <>
          <Clone object={scene} />
        </>
      )
}