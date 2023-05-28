import { useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import { Instance } from '@react-three/drei';

export default function Cube({ position, rotation, color, onCollide, cubeInstanceRefs, index }) {
  const [cubeRef] = useBox(() => ({
    mass: 0.01,
    args: [1, 1, 1],
    position,
    rotation,
    onCollide,
    restitution: 0.9,
    friction: 0.1,
    userData: {
      name: 'cube',
    },
  }));

  const cubeInstanceRef = useRef();

  useEffect(() => {
    cubeInstanceRefs.current[index] = cubeInstanceRef.current;
    return () => {
      cubeInstanceRefs.current[index] = null;
    };
  }, [cubeInstanceRefs, index]);

  return (
    <>
      <Instance
        ref={(instance) => {
          cubeRef.current = instance;
          cubeInstanceRef.current = instance;
        }}
        color={color}
      />
    </>
  );
}
