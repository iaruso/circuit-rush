import React, { useEffect, useRef, useState } from 'react';
import { useFrame, useLoader, useThree } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { Html, useKeyboardControls } from '@react-three/drei';
import { MeshStandardMaterial, Vector3 }from 'three';
import { gsap } from 'gsap';
import { debounce } from 'lodash';
import { useBox, useRaycastVehicle } from '@react-three/cannon';
import { Wheels } from './Wheels';
import { Wheel } from './Wheel';
import { VehicleControls } from './VehicleControls';
import Camera from './Camera';
import useGame from "./stores/Game.jsx";

const cameraPositions = [[0, 40, -40], [0, 20, -25]];

export default function Vehicle({ checkpoint }) {
  const camera = useThree((state) => state.camera);
  const cameraRef = useRef();
  const lookRef = useRef();
	const [resetAlert, setResetAlert] = useState(false);
	const resetAlertContent = useRef();
	const resetAlertMessage = useRef();
	var alternativeCamera = 0;
	const [subscribeKeys, getKeys] = useKeyboardControls();

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
        materialParams.color = '#e55556';
        materialParams.emissiveIntensity = -0.15;
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

  const position = [44, 0.7, -5];
  const width = 1.7;
  const height = 1;
  const front = 1.85;
  const radius = 0.25;

  const chassisBodyArgs = [width, height, front * 2];
  const [chassisBody, chassisApi] = useBox(() => ({
    allowSleep: false,
    args: chassisBodyArgs,
    mass: 400,
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

	const { phase } = useGame((state) => state);
	const vehicleStats = useRef();

	useEffect(() => {
		if (phase === "ended") {
			gsap.to(vehicleStats.current, {
				opacity: 0,
				duration: 0.5,
			});
		}
	}, [phase]);

	const handleCameraChange = () => {
		const positionIndex = alternativeCamera === 0 ? 1 : 0;
		cameraRef.current.position.set(...cameraPositions[positionIndex]);
		alternativeCamera = 1 - alternativeCamera;
	};

	const debounceCameraChange = useRef(debounce(handleCameraChange, 50));	

	useEffect(() => {
    return () => {
      debounceCameraChange.current.cancel();
    };
  }, [])

	const handleKeyDown = (event) => {
		if ((event.key === 'r' || event.key === 'R') && resetAlert) {
			gsap.to(resetAlertContent.current, {
				opacity: 0,
				duration: 1,
			});
			setTimeout(() => { 
				setResetAlert(false);
			}, 1000);
		}
	};
	
	useEffect(() => {
    if (resetAlert) {
      setTimeout(() => {
				gsap.fromTo(resetAlertMessage.current, {opacity: 0}, { opacity: 1, yoyo: true, repeat: -1, duration: 1 });
			}, 500);
    }
	}, [resetAlert]);


	useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [resetAlert]);

  useEffect(() => { 
    chassisApi.velocity.subscribe((velocity) => {
      const newSpeed = Math.round(v.set(...velocity).length() * 3.6);
      setSpeed(newSpeed);
    });
  }, []);

	const engineForces = [3000, 3200, 2800, 2400, 1600, 1600, 0]; 
	const brakeForces = [10, 20, 30, 40, 50, 50, 0];
	const maxSpeeds = [1, 20, 40, 65, 90, 160, 180];
	var currentGear = 0;

  useFrame((state, delta) => {
		const { changeCamera } = getKeys();
    if (changeCamera) {
      debounceCameraChange.current();
    }

		for (var i = 0; i < maxSpeeds.length + 1; i++) {
			if (speed <= maxSpeeds[i]) {
				currentGear = i;
				break;
			}
		}
		
		const cameraPosition = new Vector3(0, 0, 0);
		cameraPosition.setFromMatrixPosition(cameraRef.current.matrixWorld);
		if (cameraPosition.y < 10 && phase === "playing") { 
			setResetAlert(true);
		} else {
			setResetAlert(false);
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
		setGearProgress(speed === 1 ? 2.5 : (reverseFlag && speed > 20)  || speed >= 160 ? 100 : (speedWithinGearRange / gearSpeedRange) * 100);

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
          <object3D ref={lookRef} position={[0, 0, 0]}>
            <Camera ref={cameraRef} cameraRef={cameraRef} position={[...cameraPositions[0]]} />
          </object3D>
        </group>
        <Wheel wheelRef={wheels[0]} />
        <Wheel wheelRef={wheels[1]} />
        <Wheel wheelRef={wheels[2]} />
        <Wheel wheelRef={wheels[3]} />
      </group>
      <Html wrapperClass={'vehicle-stats-overlay'} className='vehicle-stats' ref={vehicleStats}>
				<p className='vehicle-transmission'>{transmission}</p>
				<div className='vehicle-gear-stats'>
					<div className='vehicle-speed-bar' style={{ width: `${gearProgressBar}%` }}></div>
				</div>
				<p className='vehicle-speed'>{speed}</p>
      </Html>
			{resetAlert ? 
				<Html wrapperClass={'reset-alert-overlay'} className='reset-alert' ref={resetAlertContent}>
					<div ref={resetAlertMessage} className="reset-message">PRESS R TO RESET CAR</div>
				</Html>
				: null
			}
    </>
  );
}
	