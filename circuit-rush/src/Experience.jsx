import { useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import Circuit from './Circuit'
import { useControls } from 'leva'
import Vehicle from './Vehicle'
import { Physics, Debug, usePlane, useTrimesh} from '@react-three/cannon'
import PhysicsWorld from './PhysicsWorld'
import Objects from './Objects'
import cubes from '../public/cubes'
import waypoints from '../public/waypoints'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'

function Plane(props) {
  const [ref] = usePlane(() => ({ type: 'Static', rotation: [-Math.PI / 2, 0, 0], restitution: 0.9, friction: 0.1, ...props }))
  return (
    <mesh ref={ref} rotation={[-Math.PI/2, 0, 0]} visible={false}>
      <planeGeometry args={[200, 200]} />
    </mesh>
  )
}

export default function Experience() {
  const { scene } = useThree()
  const light = useRef()
  const count = 300;
	const [cameraPosition, setCameraPosition] = useState([-6, 3.9, 6.21]);
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

  const cubesArray = cubes;
	const waypointsArray = waypoints;
  
  const settings = useControls({
    ambientLight: '#fff',
		directionalLight: '#fff',
		intensity: {
			value: 2,
			min: 0,
			max: 100,
			step: 1,
		}
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

  useEffect(() => {
    if (!light.current) return
    light.current.shadowCameraVisible = true;
    light.current.shadow.camera = shadowCamera
    light.current.shadow.bias = 0.01
    light.current.shadow.mapSize.width = 4096*2
    light.current.shadow.mapSize.height = 4096*2
  }, [light, shadowCamera, scene])

  useEffect(() => {
    function keydownHandler(e) {
      if (e.key == "k") {
        if(thirdPerson) setCameraPosition([-6, 3.9, 6.21 + Math.random() * 0.01]);
        setThirdPerson(!thirdPerson); 
      }
    }

    window.addEventListener("keydown", keydownHandler);
    return () => window.removeEventListener("keydown", keydownHandler);
  }, [thirdPerson]);
    return <>
        <Perf position="top-left" />
        <directionalLight 
          ref={light} 
          castShadow 
          position={ [ -100, 100, -100 ] }
          intensity={ settings.intensity }
          shadow-camera={shadowCamera}
					color={settings.directionalLight}
        />
        <PerspectiveCamera makeDefault position={cameraPosition} fov={50}></PerspectiveCamera>
				{!thirdPerson && (
					<OrbitControls target={[0, 0, 0]} />
				)}
        <ambientLight intensity={ 1 } color={settings.ambientLight}/>
        <Environment files={'adamsbridge.hdr'} />
        <Physics gravity={[gX, gY, gZ]} broadphase={'SAP'} allowSleep={true} timeStep="vary">
          {/* <Debug color="black" scale={1}> */}
            <PhysicsWorld />
            <Objects cubesData={cubesArray} cubesCount={cubesArray.length} waypointsData={waypointsArray} waypointsCount={waypointsArray.length}/>
            <Plane />
            <Vehicle thirdPerson={thirdPerson}/>
          {/* </Debug> */}
        </Physics>
        <Circuit />
    </>
}