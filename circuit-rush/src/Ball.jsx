import { useRef } from 'react';
import { Physics, useBox } from '@react-three/cannon';
import { Instance } from '@react-three/drei';

export default function Ball({ i, x, y, z }) {
  const [sphereRef] = useBox(() => ({
    mass: 1,
    args: [0.5,0.5,0.5],
    position: [x, y, z],
    restitution: 0.9,
    friction: 0.1,
  }));

  return (
    <group>
      <Instance ref={sphereRef} key={`sphere-${i}`} />
    </group>
  );
}
