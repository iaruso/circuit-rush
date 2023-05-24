import * as THREE from 'three';
import { useBox } from '@react-three/cannon';
import { useRef } from 'react';
import physics from '../public/physics';

export default function PhysicsWorld() {
  const cubesArray = physics;
  return (
    <>
      {cubesArray.map((cubeParams, index) => (
        <Cube key={index} position={cubeParams.slice(0, 3)} size={cubeParams.slice(3)} />
      ))}
    </>
  );
}

function Cube({ position, size }) {
  const [ref, api] = useBox(() => ({
    mass: 0,
    position,
    args: size,
    restitution: 0.5,
    friction: 0.5
  }));

  return (
    <mesh ref={ref}>
      <boxGeometry args={size} />
      <meshStandardMaterial transparent={true} opacity={0} />
    </mesh>
  );
}
