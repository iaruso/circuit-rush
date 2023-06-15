import { Suspense, useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { OrthographicCamera } from 'three'
import Circuit from './Circuit'
import Vehicle from './Vehicle'
import { Physics, Debug, usePlane, useBox } from '@react-three/cannon'
import PhysicsWorld from './PhysicsWorld'
import Objects from './Objects'
import cubes from '../public/static/cubes'
import waypointsLeft from '../public/static/waypoints-left'
import waypointsRight from '../public/static/waypoints-right'
import { OrbitControls } from '@react-three/drei'
import Checkpoints from './Checkpoints'

function Plane(props) {
  const [ref] = usePlane(() => ({
    type: 'Static',
    rotation: [-Math.PI / 2, 0, 0],
    restitution: 0.9,
    friction: 0.1,
    ...props
  }));

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <planeGeometry args={[200, 200]} />
    </mesh>
  );
}

export default function Experience({ perfomanceMode }) {
	console.log(perfomanceMode);
  const { scene } = useThree();
  const light = useRef();
  const cameraRef = useRef();
  const cubesArray = cubes;
  const waypointsLeftArray = waypointsLeft;
  const waypointsRightArray = waypointsRight;
	const [checkpoint, setCheckpoint] = useState(0);
	const objectsMin = perfomanceMode;

  const shadowCameraSize = 200;
  const shadowCamera = new OrthographicCamera(
    -shadowCameraSize,
    shadowCameraSize,
    shadowCameraSize,
    -shadowCameraSize,
    2,
    500
  );

  useEffect(() => {
    if (!light.current) return;
    light.current.shadowCameraVisible = true;
    light.current.shadow.camera = shadowCamera;
    light.current.shadow.bias = 0.0001;
    light.current.shadow.mapSize.width = 4096;
    light.current.shadow.mapSize.height = 4096;
  }, [light, shadowCamera, scene]);

  return (
    <>
      <directionalLight
        ref={light}
        castShadow={!perfomanceMode}
        position={[-100, 100, -100]}
        intensity={2}
        shadow-camera={shadowCamera}
        color={'#fff'}
        radius={!perfomanceMode ? 10 : 2}
        blurSamples={!perfomanceMode ? 20 : 4}
      />
			<pointLight position={[100, 100, 100]} intensity={0.2} color={'#3865fc'} />
			<pointLight position={[-100, 100, -100]} intensity={0.2} color={'#ff6f00'} />
      <OrbitControls target={[0, 0, 0]} camera={cameraRef.current} enableRotate={false} enableZoom={false} />
      <ambientLight intensity={1} color={'#fff'} />
      <Environment files={'static/adamsbridge.hdr'} />
      <Physics gravity={[0, -9.81, 0]} broadphase={'SAP'} allowSleep={true}>
				{/* <Debug scale={1} color={'#ff0000'}> */}
					<PhysicsWorld />
					<Suspense>
						<Objects
							cubesData={cubesArray}
							cubesCount={cubesArray.length}
							waypointsRightData={waypointsRightArray}
							waypointsRightCount={waypointsRightArray.length}
							waypointsLeftData={waypointsLeftArray}
							waypointsLeftCount={waypointsLeft.length}
							objectsMin={objectsMin}
						/>
					</Suspense>
					<Plane />
					<Vehicle checkpoint={checkpoint} />
					<Checkpoints checkpoint={checkpoint} setCheckpoint={setCheckpoint} />
				{/* </Debug> */}
      </Physics>
      <Circuit />
    </>
  );
}