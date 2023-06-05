import { useEffect, useState } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export const Controls = (vehicleApi, chassisApi) => {
  const [controls, setControls] = useState({});
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [isForwardPressed, setIsForwardPressed] = useState(false);
  const [isBackwardPressed, setIsBackwardPressed] = useState(false);
  const [isBrakePressed, setIsBrakePressed] = useState(false);

  useFrame((state, delta) => {
    if (!vehicleApi || !chassisApi) return;
    const { forward, backward, leftward, rightward, brake, reset } = getKeys();

    if (forward && !isForwardPressed) {
      setIsForwardPressed(true);
      vehicleApi.applyEngineForce(-150 * 3, 2);
      vehicleApi.applyEngineForce(-150 * 3, 3);
    } else if (!forward && isForwardPressed) {
      setIsForwardPressed(false);
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }

    if (backward && !isBackwardPressed) {
      setIsBackwardPressed(true);
      vehicleApi.applyEngineForce(150, 2);
      vehicleApi.applyEngineForce(150, 3);
    } else if (!backward && isBackwardPressed) {
      setIsBackwardPressed(false);
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }

    if (brake && !isBrakePressed) {
      setIsBrakePressed(true);
      vehicleApi.applyEngineForce(150 * 4, 2);
      vehicleApi.applyEngineForce(150 * 4, 3);
    } else if (!brake && isBrakePressed) {
      setIsBrakePressed(false);
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
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
      chassisApi.position.set(44, 2, 3);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(0, Math.PI, 0);
    }
  }, [controls, vehicleApi, chassisApi]);

  return controls;
};