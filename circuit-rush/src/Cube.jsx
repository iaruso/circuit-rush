import { useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { Instance } from '@react-three/drei';
import * as THREE from 'three'

export default function Cube({ i, x, y, z, color}) {
  const [cubeRef] = useBox(() => ({
    mass: 0.01,
    args: [1, 1, 1],
    position: [x, y, z],
    restitution: 0.9,
    friction: 0.1,
  }));

  return (
    <>
      <Instance ref={cubeRef} key={`cube-${i}`} color={color} />
    </>
  );
}
