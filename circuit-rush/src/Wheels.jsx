import { useCompoundBody } from "@react-three/cannon";
import { useRef } from "react";

export const Wheels = (front, radius) => {
  const wheels = [useRef(null), useRef(null), useRef(null), useRef(null)];

  const wheelInfo = {
    radius,
    directionLocal: [0, -1, 0],
    axleLocal: [-1, 0, 0],
    suspensionStiffness: 50,
    suspensionRestLength: 0.5,
    frictionSlip: 5,
    dampingRelaxation: 2.5,
    dampingCompression: 5,
    maxSuspensionForce: 200000,
    rollInfluence: 0.01,
    maxSuspensionTravel: 0.25,
    customSlidingRotationalSpeed: -100000,
    useCustomSlidingRotationalSpeed: true,
  };

  const wheelInfos = [
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.7, 0.05, -front + 0.65],
      isFrontWheel: false,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.7, 0.05, -front + 0.65],
      isFrontWheel: false,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.7, 0.05, front - 0.65],
      isFrontWheel: true,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.7, 0.05, front - 0.65],
      isFrontWheel: true,
    },
  ];

  const propsFunc = () => ({
    collisionFilterGroup: 0,
    mass: 1,
    shapes: [
      {
        args: [wheelInfo.radius, wheelInfo.radius, 0.3, 32],
        rotation: [0, 0, Math.PI / 2],
        type: "Cylinder",
      },
    ],
    type: "Kinematic",
  });

  useCompoundBody(propsFunc, wheels[0]);
  useCompoundBody(propsFunc, wheels[1]);
  useCompoundBody(propsFunc, wheels[2]);
  useCompoundBody(propsFunc, wheels[3]);

  return [wheels, wheelInfos];
};