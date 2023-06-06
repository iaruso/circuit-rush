import { useEffect, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { useTexture, Clone, useGLTF } from '@react-three/drei';
import { PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';
import * as CANNON from 'cannon-es';
import { useBox, useRaycastVehicle, Physics } from '@react-three/cannon';
import { Wheels } from './Wheels';
import { Wheel } from './Wheel';
import { Controls } from './Controls';
import Camera from './Camera';

export default function Vehicle({ thirdPerson }) {
	const camera = useThree((state) => state.camera)
	const cameraRef = useRef();
  const lookRef = useRef();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('/draco-gltf/');
  const gltf = useLoader(GLTFLoader, './car.glb', (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });
  const mesh = gltf.scene;

  mesh.traverse((child) => {
    if (child.isMesh) {
      const materialParams = {
        roughness: 1,
        metalness: 0,
      };
      if (child.name === 'Backlights') {
        materialParams.color = '#ff0000';
        materialParams.emissive = '#000000';
        materialParams.emissiveIntensity = 1;
      } else if (child.name === 'Headlights') {
        materialParams.color = 'yellow';
      } else if (
        child.name === 'RFW' ||
        child.name === 'RRW' ||
        child.name === 'LRW' ||
        child.name === 'LFW'
      ) {
        materialParams.color = '#eeeeee';
      } else {
        materialParams.color = '#ffffff';
        materialParams.emissive = '#ffffff';
        materialParams.emissiveIntensity = 0.2;
      }
      child.material = new THREE.MeshStandardMaterial(materialParams);
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const position = [5, 10, 5];
  const width = 1.7;
  const height = 1;
  const front = 1.85;
  const radius = 0.25;

  const chassisBodyArgs = [width, height, front * 2];
  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    args: chassisBodyArgs,
    mass: 400,
    position,
    userData: {
      name: 'vehicle',
    },
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

  var speed = useRef();
  var direction = useRef();
  var rotation = useRef();
  const v = new THREE.Vector3();
  const v2 = new THREE.Vector3();
  useEffect(() =>
      chassisApi.velocity.subscribe((velocity) => {
        speed = v.set(...velocity).length()
        var uua = new CANNON.Vec3(0, 0, 1);
        direction = v.set(...velocity).dot(uua)
        
      }),
      // chassisApi.rotation.subscribe((rotation) => {
      //  rotation = v2.set(...rotation).length()
      //   console.log(rotation)
      // }),
      [])

  useFrame((state, delta) => {
  if (!thirdPerson) return;

  const position = new THREE.Vector3(0, 0, 0);
  position.setFromMatrixPosition(lookRef.current.matrixWorld); // Add (0, 2, -5) to the position vector

  const currentCamera = new THREE.Vector3(0, 0, 0);
  currentCamera.setFromMatrixPosition(camera.matrixWorld);

  camera.lookAt(position);
});


  return (
    <group ref={vehicle} name='vehicle'>
      <group ref={chassisBody} matrixWorldNeedsUpdate={true}>
        <primitive object={mesh} position={[0, -0.7, -0.1]} />
				<object3D ref={lookRef} position={[0, 2, 0]}>
					<Camera ref={cameraRef} cameraRef={cameraRef} position={[0, 20, -24]}/>
				</object3D>
				
      </group>
      <Wheel wheelRef={wheels[0]} radius={radius} />
      <Wheel wheelRef={wheels[1]} radius={radius} />
      <Wheel wheelRef={wheels[2]} radius={radius} />
      <Wheel wheelRef={wheels[3]} radius={radius} />
    </group>
  );
}
