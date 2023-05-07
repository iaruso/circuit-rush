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


export default function Experience() {
  const { scene } = useThree()
  const light = useRef()

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
        <Physics gravity={[0, -9.81, 0]}>
          {/* <Debug color="black" scale={1}> */}
            <Circuit/>
            <PhysicsWorld/>
            <Vehicle/>
          {/* </Debug> */}
        </Physics>
    </>
}