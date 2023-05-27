import { useEffect } from 'react';
import { Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';
import gsap from 'gsap';

export default function Circuit() {
  const { scene } = useGLTF('./circuit.glb');
  const settings = useControls({
    color: '#efefef',
    plane: '#fff',
    terrain: '#cbcbcb'
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

      // gsap.to(child.material.emissive, {
      //   r: 1,
      //   g: 0,
      //   b: 0,
      //   duration: 1,
      //   yoyo: true,
      //   repeat: -1,
      // });
      // gsap.to(child.material.emissiveIntensity, {
      //   value: 10,
      //   duration: 1,
      //   yoyo: true,
      //   repeat: -1,
      // });
      // gsap.to(child.material.color, {
      //   r: 1,
      //   g: 0,
      //   b: 0,
      //   duration: 1,
      //   yoyo: true,
      //   repeat: -1,
      // });
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
    if (child.name === 'Terrain') {
      child.material = new THREE.MeshStandardMaterial({
        color: settings.terrain, 
        roughness: 1,
        metalness: 0,
        emissive: settings.terrain,
        emissiveIntensity: 1,
      });
    }
  });

  return (
    <>
      <Clone object={scene} position={[0, 0, 0]} />
    </>
  );
}
