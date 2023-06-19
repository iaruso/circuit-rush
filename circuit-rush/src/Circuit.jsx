import { Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

export default function Circuit() {
  const { scene } = useGLTF('static/circuit.glb');
  scene.traverse((child) => {
    if (child.isMesh) {
      child.material = new THREE.MeshStandardMaterial({
        color: '#fff',
        roughness: 1,
        metalness: 0,
				emissive: "#fff",
				emissiveIntensity: 1
      });
      child.castShadow = true;
      child.receiveShadow = true;
    }
		if (child.name === 'Plane' || child.name === 'Terrain') {
			child.castShadow = false;
			child.receiveShadow = true;
			child.material = new THREE.MeshStandardMaterial({
				color: '#f9f9f9',
				roughness: 1,
				metalness: 0
			});
		}
  });

  return (
    <>
      <Clone object={scene} position={[0, 0, 0]} />
    </>
  );
}
