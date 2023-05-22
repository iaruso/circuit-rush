import { useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useTexture, Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva' 


export default function Vehicle() {
  {/* 3D model source: https://sketchfab.com/3d-models/low-poly-rally-cars-pack-aa5eb26008474c88a04d0ea6a3c424a2 with minor changes (Renault R5) */}
  const { scene } = useGLTF('./car.glb');
    scene.traverse((child) => {
      console.log(child)
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: '#ffffff',
            roughness: 1,
            metalness: 0,
            emissive: '#ffffff',
            emissiveIntensity: 0.2
          });
          child.castShadow = true;
          child.receiveShadow = true;
          if (child.name === 'Backlights') {
            child.material = new THREE.MeshStandardMaterial({
              color: '#ff0000',
              roughness: 1,
              metalness: 0,
              emissive: '#000000',
              emissiveIntensity: 1,
            });
          }
          if (child.name === 'Frontlights') {
            child.material = new THREE.MeshStandardMaterial({
              color: 'yellow',
              roughness: 1,
              metalness: 0
            });
          }
          if (child.name === 'RFW' || child.name === 'RRW' || child.name === 'LRW' || child.name === 'LFW') {
            child.material = new THREE.MeshStandardMaterial({
              color: '#eeeeee',
              roughness: 1,
              metalness: 0
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