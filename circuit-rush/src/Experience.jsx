import { Suspense, useEffect, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Environment, PerformanceMonitor } from '@react-three/drei'
import { OrthographicCamera } from 'three'
import Circuit from './Circuit'
import Vehicle from './Vehicle'
import { Physics, Debug, usePlane } from '@react-three/cannon'
import PhysicsWorld from './PhysicsWorld'
import Objects from './Objects'
import cubes from '../public/static/cubes'
import waypointsLeft from '../public/static/waypoints-left'
import waypointsRight from '../public/static/waypoints-right'
import { OrbitControls } from '@react-three/drei'
import Checkpoints from './Checkpoints'
import useGame from './stores/Game.jsx'

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
  const { scene } = useThree();
  const light = useRef();
  const cameraRef = useRef();
  const cubesArray = cubes;
  const waypointsLeftArray = waypointsLeft;
  const waypointsRightArray = waypointsRight;
	const [checkpoint, setCheckpoint] = useState(0);
	const [gamePaused, setGamePaused] = useState(false);
	const [gameFinished, setGameFinished] = useState(false);
	const perfMode = perfomanceMode;
	const shadowBiasArray = [1, 0.1, 0.01];
	const shadowMapSizeWidthArray = [0, 1024, 2048];
	const shadowMapSizeHeightArray = [0, 1024, 4048];
  const shadowCameraSize = 200;
  const shadowCamera = new OrthographicCamera(
    -shadowCameraSize,
    shadowCameraSize,
    shadowCameraSize,
    -shadowCameraSize,
    2,
    400
  );

  useEffect(() => {
    if (!light.current) return;
    light.current.shadowCameraVisible = true;
    light.current.shadow.camera = shadowCamera;
  }, [light, shadowCamera, scene]);

	const { phase } = useGame((state) => state);
	useEffect(() => { 
		if (phase === "playing") {
			setGamePaused(false);
			setGameFinished(false);
		} else if (phase === "paused") {
			setGamePaused(true);
		} else {
			setGamePaused(false);
		}
		if (phase === "ended") {
			setGameFinished(true);
		}
	}, [phase]);

	useEffect(() => {
		if (gameFinished) {
			setTimeout(() => {
				setGamePaused(true);
			}, 1000);
		}
	}, [gameFinished, phase])
  return (
    <>
			<directionalLight
				ref={light}
				castShadow={perfMode > 0 ? true : false}
				position={[-100, 100, -100]}
				intensity={2}
				shadow-camera={shadowCamera}
				shadow-bias={shadowBiasArray[perfMode]}
				shadow-mapSize-width={shadowMapSizeWidthArray[perfMode]}
				shadow-mapSize-height={shadowMapSizeHeightArray[perfMode]}
				color={'#fff'}
				radius={perfMode > 1 ? 6 : 2}
				blurSamples={perfMode > 1 ? 12 : 4}
			/>
			<pointLight position={[100, 100, 100]} intensity={0.2} color={'#3865fc'} />
			<pointLight position={[-100, 100, -100]} intensity={0.2} color={'#ff6f00'} />
			<OrbitControls target={[0, 0, 0]} camera={cameraRef.current} enableRotate={false} enableZoom={false} />
			<ambientLight intensity={1} color={'#fff'} />
			<Environment files={'static/adamsbridge.hdr'} />
			<Physics gravity={[0, -9.81, 0]} broadphase={'SAP'} allowSleep={true} isPaused={gamePaused}>
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
							perfomanceMode={perfMode === 2 ? false : true }
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