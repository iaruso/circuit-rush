import * as THREE from 'three';
import { useBox } from '@react-three/cannon';
import { useRef } from 'react';
import physics from '../public/physics';

export default function PhysicsWorld() {
  const cubesArray = physics;
  return (
    <>
      {cubesArray.map((cubeParams, index) => (
        <Cube key={index} position={cubeParams.slice(0,3)} rotation={[0, (cubeParams[3] * Math.PI) / 180, 0]} size={cubeParams.slice(4)} />
      ))}
    </>
  );
}

function Cube({ position, size, rotation}) {
  const [ref, api] = useBox(() => ({
    mass: 0,
    position,
    rotation,
    args: size,
    restitution: 0.5,
    friction: 0.5
  }));

  return (
    <mesh ref={ref} visible={false}>
    </mesh>
  );
}
