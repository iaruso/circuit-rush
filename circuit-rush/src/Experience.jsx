import { useEffect, useRef } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import Circuit from './Circuit'
import { useControls } from 'leva'
import Vehicle from './Vehicle'
import { Physics, Debug, usePlane, } from '@react-three/cannon'
import PhysicsWorld from './PhysicsWorld'
import Objects from './Objects'

function Plane(props) {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], restitution: 0.9, friction: 0.1, ...props }))
  return (
    <mesh ref={ref} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[400, 400]} />
            <meshStandardMaterial color={'#ffffff'} transparent={true} opacity={0} />
    </mesh>
  )
}

export default function Experience() {
  const { scene } = useThree()
  const light = useRef()
  const count = 200;

  const { gX } = useControls({
    gX: {
      value: 0,
      min: -10,
      max: 10,
      step: 0.01,
    },
  })

  const { gY } = useControls({
    gY: {
      value: -9.81,
      min: -10,
      max: 10,
      step: 0.01,
    },
  })

  const { gZ } = useControls({
    gZ: {
      value: 0,
      min: -10,
      max: 10,
      step: 0.01,
    },
  })

  const generatePositions = () => {
    const positionsArray = [];
    for (let i = 0; i < count; i++) {
      const x = Math.random() * 40 - 20;
      const y = Math.random() * 9 + 0.5;
      const z = Math.random() * 40 - 20;
      positionsArray.push({ x, y, z });
    }
    return positionsArray;
  };
  
  const positionsArray = generatePositions();

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
        <Physics gravity={[gX, gY, gZ]} broadphase={'SAP'}>
          <Debug color="black" scale={1}>
            <PhysicsWorld borderObjectName="StartObject" />
            <PhysicsWorld borderObjectName="Checkpoint1Object" />
            <PhysicsWorld borderObjectName="Checkpoint2Object" rotation={ [ 0, Math.PI / 4, 0 ] } />
            <PhysicsWorld borderObjectName="ExteriorObject" />
            <PhysicsWorld borderObjectName="BorderObject" />
            <Plane />
            <Objects data={positionsArray} count={count}/>
          </Debug>
        </Physics>
        <Vehicle/>
        <Circuit />
    </>
}