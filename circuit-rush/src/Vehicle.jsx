import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Html } from '@react-three/drei';
import { MeshStandardMaterial, Vector3 }from 'three';
import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { Wheels } from './Wheels';
import { Wheel } from './Wheel';
import { VehicleControls } from './VehicleControls';
import Camera from './Camera';

export default function Vehicle({ checkpoint }) {
  const camera = useThree((state) => state.camera);
  const cameraRef = useRef();
  const lookRef = useRef();
	const [alternativeCamera, setAlternativeCamera] = useState(false);

  const [speed, setSpeed] = useState(0);
	const [gear, setGear] = useState(0);
	const [forcePower, setForce] = useState(0);
	const [brakePower, setBrake] = useState(0);
	const [reverseFlag, setReverseFlag] = useState(false);
	const [transmission, setTransmission] = useState('N');
	const [gearProgressBar, setGearProgress] = useState(0);
  const v = new Vector3();

  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath('./draco-gltf/');
  const gltf = useLoader(GLTFLoader, './static/car.glb', (loader) => {
    loader.setDRACOLoader(dracoLoader);
  });
  const mesh = gltf.scene;

  mesh.traverse((child) => {
    if (child.isMesh) {
      const materialParams = {
        roughness: 1,
        metalness: 0,
        emissive: '#fff',
        emissiveIntensity: 1,
      };
      if (child.name === 'Backlights') {
        materialParams.color = '#ff4242';
        materialParams.emissive = '#000000';
        materialParams.emissiveIntensity = 1;
      } else if (child.name === 'Headlights') {
        materialParams.color = 'yellow';
      } else {
        materialParams.color = '#ffffff';
        materialParams.emissive = '#ffffff';
        materialParams.emissiveIntensity = 0.2;
      }
      child.material = new MeshStandardMaterial(materialParams);
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });

  const position = [44, 1, -6];
  const width = 1.7;
  const height = 1;
  const front = 1.85;
  const radius = 0.25;

  const chassisBodyArgs = [width, height, front * 2];
  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    args: chassisBodyArgs,
    mass: 300,
    position,
		rotation: [0, Math.PI, 0],
    userData: {
      name: 'vehicle',
    },
  }), useRef(null));

  const [wheels, wheelInfos] = Wheels(front, radius);

  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
			indexForwardAxis: 2,
      wheelInfos,
      wheels,
    }),
    useRef(null),
  );

  useEffect(() => {
    mesh.scale.set(1, 1, 1);
  }, [mesh]);

  useEffect(() => { 
    chassisApi.velocity.subscribe((velocity) => {
      const newSpeed = Math.round(v.set(...velocity).length() * 3.6);
      setSpeed(newSpeed);
    });
  }, []);

	useEffect(() => {
		function keydownHandler(e) {
			if (e.key === 'c') {
				if (!alternativeCamera){
					cameraRef.current.position.set(0, 20, -20);
					setAlternativeCamera(true);
				} else {
					cameraRef.current.position.set(0, 40, -40);
					setAlternativeCamera(false);
				}
			}
		}

		window.addEventListener('keydown', keydownHandler);
		return () => window.removeEventListener('keydown', keydownHandler);
	}, [alternativeCamera]);

	const engineForces = [4000, 2400, 1800, 1600, 1400, 1200, 0]; 
	const brakeForces = [10, 15, 20, 25, 30, 35, 0];
	const maxSpeeds = [1, 20, 36, 48, 72, 119, 150];
	var currentGear = 0;

  useFrame((state, delta) => {
		for (var i = 0; i < maxSpeeds.length + 1; i++) {
			if (speed <= maxSpeeds[i]) {
				currentGear = i;
				break;
			}
		}
		
		const gearPowerScale = currentGear >= 1 && currentGear <= 2 ? 0.5 : 0.8;
		const gearPowerRange = currentGear >= 1 && currentGear <= 2 ? 0.5 : 0.2;
		const gearSpeedRange = currentGear === 0 ? maxSpeeds[currentGear] : maxSpeeds[currentGear] - maxSpeeds[currentGear - 1];
		const speedWithinGearRange = currentGear === 0 ? speed : speed - maxSpeeds[currentGear - 1];
		const gearProgress = speedWithinGearRange / gearSpeedRange;
		const gearPower = gearPowerScale + gearPowerRange * gearProgress;
		const scaledEngineForce = engineForces[currentGear] * gearPower;

		setGear(currentGear);
		setForce(scaledEngineForce);
		setBrake(brakeForces[currentGear]);
		setTransmission(reverseFlag ? 'R' : gear === 0 ? 1 : gear === 6 ? '5' : gear.toString());
		setGearProgress(speed === 1 ? 2.5 : (reverseFlag && speed > 20)  || speed >= 120 ? 100 : (speedWithinGearRange / gearSpeedRange) * 100);

    const position = new Vector3(0, 0, 0);
    position.setFromMatrixPosition(lookRef.current.matrixWorld);

    const currentCamera = new Vector3(0, 0, 0);
    currentCamera.setFromMatrixPosition(camera.matrixWorld);

    camera.lookAt(position);
  });

	VehicleControls(vehicleApi, chassisApi, speed, gear, forcePower, brakePower, setReverseFlag, checkpoint);

  return (
    <>
      <group ref={vehicle} name="vehicle">
        <group ref={chassisBody} matrixWorldNeedsUpdate={true}>
          <primitive object={mesh} position={[0, -0.7, -0.1]} />
          <object3D ref={lookRef} position={[0, 2, 0]}>
            <Camera ref={cameraRef} cameraRef={cameraRef} position={[0, 40, -40]} />
          </object3D>
        </group>
        <Wheel wheelRef={wheels[0]} />
        <Wheel wheelRef={wheels[1]} />
        <Wheel wheelRef={wheels[2]} />
        <Wheel wheelRef={wheels[3]} />
      </group>
      <Html fullscreen className='vehicle-stats-overlay'>
				<div className='vehicle-stats'>
					<p className='vehicle-transmission'>{transmission}</p>
					<div className='vehicle-gear-stats'>
						<div className='vehicle-speed-bar' style={{ width: `${gearProgressBar}%` }}></div>
					</div>
					<p className='vehicle-speed'>{speed}</p>
				</div>
      </Html>
    </>
  );
}
	