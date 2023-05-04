import { useLoader } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { useTexture, Clone, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useControls } from 'leva'

export default function Circuit() {
    const { scene } = useGLTF('./circuit.glb')
    const settings = useControls({
        color: "#ffffff"
    });

    scene.traverse((child) => {
        console.log(child.children)
        if (child.isMesh) {
          child.material = new THREE.MeshStandardMaterial({
            color: settings.color,
            roughness: 1,
            metalness: 0,
            emissive: 0xffffff,
            emissiveIntensity: 1
          });
          child.castShadow = true;
          child.receiveShadow = true;
        }
    });
    return (
        <>
          <Clone object={scene} />
        </>
      )
}