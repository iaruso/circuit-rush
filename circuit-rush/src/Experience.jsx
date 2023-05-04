import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three';
import Circuit from './Circuit';
import { useControls } from 'leva'


export default function Experience() {
  const { scene } = useThree()
  const light = useRef()

  const shadowCameraSize = 200
  const shadowCamera = new THREE.OrthographicCamera(
    -shadowCameraSize,
    shadowCameraSize,
    shadowCameraSize,
    -shadowCameraSize,
    0.5,
    500
  )

  useEffect(() => {
    if (!light.current) return
    light.current.shadow.camera = shadowCamera
    light.current.shadow.bias = 0.0001
    light.current.shadow.mapSize.width = 2048
    light.current.shadow.mapSize.height = 2048
  }, [light, shadowCamera, scene])

 
    return <>

        <Perf position="top-left" />

        <OrbitControls makeDefault />

        <directionalLight 
          ref={light} 
          castShadow 
          position={ [ -10, 20, -30 ] }
          intensity={ 1 }
          shadow-camera={shadowCamera}
        />
        <ambientLight intensity={ 0.8 } />
        <Circuit/>
    </>
}