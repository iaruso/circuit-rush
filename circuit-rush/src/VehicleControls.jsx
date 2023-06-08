import { useEffect, useState } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export const VehicleControls = (vehicleApi, chassisApi, speed, gear, forcePower, brakePower, setReverseFlag) => {
	const [controls, setControls] = useState({});
	const [subscribeKeys, getKeys] = useKeyboardControls();
	const [isBrakePressed, setIsBrakePressed] = useState(false);

	var rearForce = 0;
	useFrame((state, delta) => {
		if (!vehicleApi || !chassisApi) return;
		const { forward, backward, leftward, rightward, brake, reset } = getKeys();
		if (forward) {
			if (gear == 0) setReverseFlag(false)
			vehicleApi.applyEngineForce(-forcePower, 2);
			vehicleApi.applyEngineForce(-forcePower, 3);
		} else if (backward) {
			speed > 20 ? rearForce = forcePower/10 : rearForce = forcePower/2;
			if (gear == 0) setReverseFlag(true)
			vehicleApi.applyEngineForce(rearForce, 2);
			vehicleApi.applyEngineForce(rearForce, 3);
		} else {
			vehicleApi.applyEngineForce(0, 2);
			vehicleApi.applyEngineForce(0, 3);
		}

		if (brake && !isBrakePressed) {
			setIsBrakePressed(true);
			vehicleApi.setBrake(brakePower, 0);
			vehicleApi.setBrake(brakePower, 1);
			vehicleApi.setBrake(brakePower, 2);
			vehicleApi.setBrake(brakePower, 3);
		} else if (!brake && isBrakePressed) {
			setIsBrakePressed(false);
			vehicleApi.setBrake(0, 0);
			vehicleApi.setBrake(0, 1);
			vehicleApi.setBrake(0, 2);
			vehicleApi.setBrake(0, 3);
		}

		if (leftward) {
			vehicleApi.setSteeringValue(0.35, 2);
			vehicleApi.setSteeringValue(0.35, 3);
		} else if (rightward) {
			vehicleApi.setSteeringValue(-0.35, 2);
			vehicleApi.setSteeringValue(-0.35, 3);
		} else {
			for(let i = 0; i < 4; i++) {
				vehicleApi.setSteeringValue(0, i);
			}
		}

		if (reset) {
			chassisApi.position.set(44, 0.49, 2);
			chassisApi.velocity.set(0, 0, 0);
			chassisApi.angularVelocity.set(0, 0, 0);
			chassisApi.rotation.set(0, Math.PI, 0);
		}
	}, [controls, vehicleApi, chassisApi]);

	return controls;
};