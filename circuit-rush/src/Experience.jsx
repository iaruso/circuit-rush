import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, Environment, PerspectiveCamera } from '@react-three/drei'
import { EffectComposer, Noise, N8AO, SMAA, SSR, DepthOfField } from "@react-three/postprocessing"
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import Circuit from './Circuit'
import { useControls } from 'leva'
import Vehicle from './Vehicle'
import { Physics, Debug, usePlane, useTrimesh} from '@react-three/cannon'
import PhysicsWorld from './PhysicsWorld'
import Objects from './Objects'
import Effects from './Effects'
import objects from '../public/objects'

function Plane(props) {
  const [ref] = usePlane(() => ({ type: 'Static', rotation: [-Math.PI / 2, 0, 0], restitution: 0.9, friction: 0.1, ...props }))
  return (
    <mesh ref={ref} rotation={[-Math.PI/2, 0, 0]}>
            <planeGeometry args={[200, 200]} />
            <meshStandardMaterial color={'#fff'} transparent={true} opacity={0}/>
    </mesh>
  )
}

export default function Experience() {
  const { scene } = useThree()
  const light = useRef()
  const count = 300;

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

  const objectsArray = objects;
  
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

    
  const [thirdPerson, setThirdPerson] = useState(true);
  const [cameraPosition, setCameraPosition] = useState([-6, 3.9, 6.21]);

  useEffect(() => {
    if (!light.current) return
    light.current.shadowCameraVisible = true;
    light.current.shadow.camera = shadowCamera
    light.current.shadow.bias = 0.0001
    light.current.shadow.mapSize.width = 4096*2
    light.current.shadow.mapSize.height = 4096*2
  }, [light, shadowCamera, scene])

  useEffect(() => {
    function keydownHandler(e) {
      if (e.key == "k") {
        // random is necessary to trigger a state change
        if(thirdPerson) setCameraPosition([-6, 3.9, 6.21 + Math.random() * 0.01]);
        setThirdPerson(!thirdPerson); 
      }
    }

    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [thirdPerson]);
    return <>

        <Perf position="top-left" />

        {/* <OrbitControls makeDefault /> */}

        <directionalLight 
          ref={light} 
          castShadow 
          position={ [ -100, 100, -100 ] }
          intensity={ 2 }
          shadow-camera={shadowCamera}
        />
        <ambientLight intensity={ 1 } color={settings.light}/>
        <Environment files={'adamsbridge.hdr'} />
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50}></PerspectiveCamera>
      {!thirdPerson && (
        <OrbitControls target={[0, 0, 0]} />
      )}
        {/* <Effects /> */}
        <Physics gravity={[gX, gY, gZ]} broadphase={'SAP'} allowSleep={true} timeStep="vary">
          <Debug color="black" scale={1}>
            <PhysicsWorld />
            <Objects data={objectsArray} count={objectsArray.length}/>
            <Plane />
            <Vehicle thirdPerson={thirdPerson}/>
          </Debug>
        </Physics>
        <Circuit />
    </>
}