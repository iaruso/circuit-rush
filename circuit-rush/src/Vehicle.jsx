import { useEffect, useRef } from 'react';
import { useFrame, useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useTexture, Clone, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva'
import { useBox, useRaycastVehicle } from '@react-three/cannon'; 
import { Wheels } from './Wheels';
import { Wheel } from './Wheel';
import { Controls } from './Controls';


export default function Vehicle() {

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco-gltf/');

  const gltf = useLoader(GLTFLoader, './car.glb', (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });
  const mesh = gltf.scene;

  const position = [5, 10, 5];
  const width = 2;
  const height = 1;
  const front = 0.5;
  const radius = 0.5;

  const chassisBodyArgs = [width, height, front * 2];
  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    args: chassisBodyArgs,
    mass: 100,
    position
  }), useRef(null));

  const [wheels, wheelInfos] = Wheels(width, height, front, radius);

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      wheelInfos,
      wheels,
    }),
    useRef(null),
  );;

  Controls(vehicleApi, chassisApi)

  useEffect(() => {
    mesh.scale.set(1, 1, 1);
  }, [mesh]);
  return (
      <group ref={vehicle} name='vehicle'>
        <mesh ref={chassisBody}>
            <meshBasicMaterial color="red" />
            <boxGeometry args={chassisBodyArgs} />
        </mesh>
        <Wheel wheelRef={wheels[0]} radius={radius} />
        <Wheel wheelRef={wheels[1]} radius={radius} />
        <Wheel wheelRef={wheels[2]} radius={radius} />
        <Wheel wheelRef={wheels[3]} radius={radius} />
        {/* <Clone object={scene} /> */}
      </group>
    )
}


  {/* 3D model source: https://sketchfab.com/3d-models/low-poly-rally-cars-pack-aa5eb26008474c88a04d0ea6a3c424a2 with minor changes (Renault R5) */}
  // const { scene, mesh } = useGLTF('./car.glb');
  // scene.traverse((child) => {
  //   if (child.isMesh) {
  //     const materialParams = {
  //       roughness: 1,
  //       metalness: 0
  //     };
  //     if (child.name === 'Backlights') {
  //       materialParams.color = '#ff0000';
  //       materialParams.emissive = '#000000';
  //       materialParams.emissiveIntensity = 1;
  //     } else if (child.name === 'Frontlights') {
  //       materialParams.color = 'yellow';
  //     } else if (child.name === 'RFW' || child.name === 'RRW' || child.name === 'LRW' || child.name === 'LFW') {
  //       materialParams.color = '#eeeeee';
  //     } else {
  //       materialParams.color = '#ffffff';
  //       materialParams.emissive = '#ffffff';
  //       materialParams.emissiveIntensity = 0.2;
  //     }
  //     child.material = new THREE.MeshStandardMaterial(materialParams);
  //     child.castShadow = true;
  //     child.receiveShadow = true;
  //   }
  // });