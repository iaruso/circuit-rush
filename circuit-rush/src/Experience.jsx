import { Suspense, useEffect, useRef, useState } from 'react'
import { useThree } from '@react-three/fiber'
import { Environment } from '@react-three/drei'
import { Perf } from 'r3f-perf'
import * as THREE from 'three'
import Circuit from './Circuit'
import Vehicle from './Vehicle'
import { Physics, Debug, usePlane, useBox } from '@react-three/cannon'
import PhysicsWorld from './PhysicsWorld'
import Objects from './Objects'
import cubes from '../public/cubes'
import waypointsLeft from '../public/waypoints-left'
import waypointsRight from '../public/waypoints-right'
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

export default function Experience() {
	const camera = useThree((state) => state.camera);
  const { scene } = useThree();
  const light = useRef();
  const cameraRef = useRef();
  const [cameraPosition, setCameraPosition] = useState([-6, 3.9, 6.21]);
  const cubesArray = cubes;
  const waypointsLeftArray = waypointsLeft;
  const waypointsRightArray = waypointsRight;
	const [checkpoint, setCheckpoint] = useState(0);

	// const audioListener = new THREE.AudioListener();
	// const audioLoader = new THREE.AudioLoader();
	// const audio = new THREE.Audio(audioListener);

	// audioLoader.load('music.mp3', function (buffer) {
	// 	audio.setBuffer(buffer);
	// 	audio.play();
	// 	audio.setLoop(true);
	// 	audio.setVolume(0.4);
	// });

	// Add the audio listener to the camera or any object that represents the listener's position
	// camera.add(audioListener);

  const shadowCameraSize = 200;
  const shadowCamera = new THREE.OrthographicCamera(
    -shadowCameraSize,
    shadowCameraSize,
    shadowCameraSize,
    -shadowCameraSize,
    2,
    500
  );

  const [thirdPerson, setThirdPerson] = useState(true);

  useEffect(() => {
    if (!light.current) return;
    light.current.shadowCameraVisible = true;
    light.current.shadow.camera = shadowCamera;
    light.current.shadow.bias = 0.0001;
    light.current.shadow.mapSize.width = 4096*2;
    light.current.shadow.mapSize.height = 4096*2;
  }, [light, shadowCamera, scene]);

  useEffect(() => {
    function keydownHandler(e) {
      if (e.key === 'k') {
        if (thirdPerson) setCameraPosition([-6, 3.9, 6.21 + Math.random() * 0.01]);
        setThirdPerson(!thirdPerson);
      }
    }

    window.addEventListener('keydown', keydownHandler);
    return () => window.removeEventListener('keydown', keydownHandler);
  }, [thirdPerson]);

  return (
    <>
      <directionalLight
        ref={light}
        castShadow
        position={[-100, 100, -100]}
        intensity={2}
        shadow-camera={shadowCamera}
        color={'#fff'}
        radius={10}
        blurSamples={20}
      />
			<pointLight position={[100, 100, 100]} intensity={0.2} color={'#3865fc'} />
			<pointLight position={[-100, 100, -100]} intensity={0.2} color={'#ff6f00'} />
      <OrbitControls target={[0, 0, 0]} camera={cameraRef.current} enableRotate={false} enableZoom={false} />
			{!thirdPerson && (
				<OrbitControls />
			)}
      <ambientLight intensity={1} color={'#fff'} />
      <Environment files={'adamsbridge.hdr'} />
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
						/>
					</Suspense>
					<Plane />
					<Vehicle thirdPerson={thirdPerson} checkpoint={checkpoint} />
					<Checkpoints checkpoint={checkpoint} setCheckpoint={setCheckpoint} />
				{/* </Debug> */}
      </Physics>
      <Perf position="top-right" minimal={true} overClock antialias />
      <Circuit />
    </>
  );
}