import { useEffect } from 'react';
import { Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';
import gsap from 'gsap';

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
        metalness: 0
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  return (
    <>
      <Clone object={scene} position={[0, 0, 0]} />
    </>
  );
}
