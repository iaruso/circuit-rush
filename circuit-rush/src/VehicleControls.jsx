import { useState, useEffect } from "react";
import { useKeyboardControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";

export const VehicleControls = (vehicleApi, chassisApi, speed, gear, forcePower, brakePower, setReverseFlag, checkpoint) => {
  const [controls, setControls] = useState({});
  const [subscribeKeys, getKeys] = useKeyboardControls();
  const [isBrakePressed, setIsBrakePressed] = useState(false);
  const [isHornClickable, setIsHornClickable] = useState(true);
  const positions = [[44, 0.6, -6], [-27, 0.6, -12], [3, 0.6, 44]];
  const rotations = [[0, Math.PI, 0], [0, Math.PI / 2, 0], [0, Math.PI / 2, 0]];
  const [hornSound] = useState(() => new Audio('./static/horn.mp3'));

  useEffect(() => {
    const handleSoundEnd = () => {
      setIsHornClickable(true);
    };

    hornSound.addEventListener('ended', handleSoundEnd);

    return () => {
      hornSound.removeEventListener('ended', handleSoundEnd);
    };
  }, [hornSound]);

  var rearForce = 0;
  useFrame((state, delta) => {
    if (!vehicleApi || !chassisApi) return;
    const { forward, backward, leftward, rightward, brake, reset, horn } = getKeys();
    if (forward) {
      if (gear === 0) setReverseFlag(false);
      vehicleApi.applyEngineForce(-forcePower / 2, 0);
      vehicleApi.applyEngineForce(-forcePower / 2, 1);
      vehicleApi.applyEngineForce(-forcePower, 2);
      vehicleApi.applyEngineForce(-forcePower, 3);
    } else if (backward) {
      speed > 20 ? (rearForce = forcePower / 10) : (rearForce = forcePower / 2);
      if (gear === 0) setReverseFlag(true);
      vehicleApi.applyEngineForce(rearForce / 2, 0);
      vehicleApi.applyEngineForce(rearForce / 2, 1);
      vehicleApi.applyEngineForce(rearForce, 2);
      vehicleApi.applyEngineForce(rearForce, 3);
    } else {
      vehicleApi.applyEngineForce(0, 0);
      vehicleApi.applyEngineForce(0, 1);
      vehicleApi.applyEngineForce(0, 2);
      vehicleApi.applyEngineForce(0, 3);
    }

    if (brake && !isBrakePressed) {
      setIsBrakePressed(true);
      vehicleApi.setBrake(brakePower, 0);
      vehicleApi.setBrake(brakePower, 1);
      vehicleApi.setBrake(brakePower / 2, 2);
      vehicleApi.setBrake(brakePower / 2, 3);
    } else if (!brake && isBrakePressed) {
      setIsBrakePressed(false);
      vehicleApi.setBrake(0, 0);
      vehicleApi.setBrake(0, 1);
      vehicleApi.setBrake(0, 2);
      vehicleApi.setBrake(0, 3);
    }

    if (leftward) {
      vehicleApi.setSteeringValue(0.4, 2);
      vehicleApi.setSteeringValue(0.4, 3);
    } else if (rightward) {
      vehicleApi.setSteeringValue(-0.4, 2);
      vehicleApi.setSteeringValue(-0.4, 3);
    } else {
      for (let i = 0; i < 4; i++) {
        vehicleApi.setSteeringValue(0, i);
      }
    }

    if (reset) {
      chassisApi.position.set(...positions[checkpoint]);
      chassisApi.velocity.set(0, 0, 0);
      chassisApi.angularVelocity.set(0, 0, 0);
      chassisApi.rotation.set(...rotations[checkpoint]);
    }

    if (horn && isHornClickable) {
      hornSound.currentTime = 0;
      hornSound.volume = 0.05;
      hornSound.play();
      setIsHornClickable(false);
    }
  }, [controls, vehicleApi, chassisApi, checkpoint, hornSound, isHornClickable]);

  return controls;
};
