import { Suspense, useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { OrthographicCamera } from 'three'
import Circuit from './Circuit'
import Vehicle from './Vehicle'
import { Physics, usePlane } from '@react-three/cannon'
import PhysicsWorld from './PhysicsWorld'
import Objects from './Objects'
import cubes from '../public/static/cubes'
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
	const [checkpoint, setCheckpoint] = useState(0);
	const [gamePaused, setGamePaused] = useState(false);
	const [gameFinished, setGameFinished] = useState(false);
	const perfMode = perfomanceMode;
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
				castShadow={true}
				position={[-100, 100, -100]}
				intensity={2}
				shadow-camera={shadowCamera}
				shadow-bias={0.01}
				shadow-mapSize-width={4096}
				shadow-mapSize-height={4096}
				color={'#fff'}
				radius={perfMode > 0 ? 6 : 2}
				blurSamples={perfMode > 0 ? 12 : 4}
			/>
			<pointLight position={[100, 100, 100]} intensity={0.2} color={'#7f84d8'} />
			<pointLight position={[-100, 100, -100]} intensity={0.2} color={'#454362'} />
			<OrbitControls target={[0, 0, 0]} camera={cameraRef.current} enableRotate={false} enableZoom={false} />
			<ambientLight intensity={0.8} color={'#dfdfe6'} />
			<Environment files={'static/environment.hdr'} />
			<Circuit perfomanceMode={perfMode !== 2 ? true : false }/>
			<Physics gravity={[0, -9.81, 0]} broadphase={'SAP'} allowSleep={true} isPaused={gamePaused}>
					<PhysicsWorld />
					<Suspense>
						<Objects
							cubesData={cubesArray}
							cubesCount={cubesArray.length}
							perfomanceMode={perfMode === 0 ? true : false }
						/>
					</Suspense>
					<Plane />
					<Vehicle checkpoint={checkpoint} />
					<Checkpoints checkpoint={checkpoint} setCheckpoint={setCheckpoint} />
			</Physics>
    </>
  );
}