import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import Circuit from './Circuit'
import { useControls } from 'leva'
import Vehicle from './Vehicle'
import { Physics, Debug } from '@react-three/cannon'
import PhysicsWorld from './PhysicsWorld'
import Objects from './Objects'

export default function Experience() {
  const { scene } = useThree()
  const light = useRef()
  const count = 40;

  const generateSpheres = () => {
    const sphereArray = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 20 - 10; // Random x between -10 and 10
      const y = Math.random() * 9 + 0.5; // Random y between 0.5 and 9.5
      const z = Math.random() * 20 - 10; // Random z between -10 and 10
      sphereArray.push({ x, y, z });
    }
    return sphereArray;
  };
  
  const sphereArray = generateSpheres();

  const settings = useControls({
    light: '#d4e0ff'
  });

  const shadowCameraSize = 200
  const shadowCamera = new THREE.OrthographicCamera(
    -shadowCameraSize,
    shadowCameraSize,
    shadowCameraSize,
    -shadowCameraSize,
    2,
    500
  )

  useEffect(() => {
    if (!light.current) return
    light.current.shadowCameraVisible = true;
    light.current.shadow.camera = shadowCamera
    light.current.shadow.bias = 0.0001
    light.current.shadow.mapSize.width = 4096
    light.current.shadow.mapSize.height = 4096
  }, [light, shadowCamera, scene])

 
    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight 
          ref={light} 
          castShadow 
          position={ [ -100, 100, -100 ] }
          intensity={ 1 }
          shadow-camera={shadowCamera}
        />
        <ambientLight intensity={ 1.2 } color={settings.light}/>
        <Physics gravity={[0, -9.81, 0]} broadphase={'SAP'} allowSleep={true}>
          {/* <Debug color="black" scale={1}> */}
            <Circuit />
            <PhysicsWorld borderObjectName="BorderObject" />
            <PhysicsWorld borderObjectName="StartObject" />
            <PhysicsWorld borderObjectName="Checkpoint1Object" />
            <PhysicsWorld borderObjectName="Checkpoint2Object" rotation={ [ 0, Math.PI / 4, 0 ] } />
            <PhysicsWorld borderObjectName="ExteriorObject" />
            <Objects data={sphereArray} count={count}/>
            <Vehicle/>
          {/* </Debug> */}
        </Physics>
    </>
}