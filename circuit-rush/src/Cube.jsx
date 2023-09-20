import { useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import { Instance } from '@react-three/drei';

export default function Cube({ position, rotation, color, args, onCollide, cubeInstanceRefs, index }) {
  const [cubeRef] = useBox(() => ({
    mass: 1,
    args,
    position,
    rotation,
    onCollide,
    restitution: 0.9,
    friction: 0.1,
    userData: { name: 'cube' },
  }));

  const cubeInstanceRef = useRef();
  const setRefs = (instance) => {
    cubeRef.current = cubeInstanceRef.current = instance;
  };

  useEffect(() => {
    cubeInstanceRefs.current[index] = cubeInstanceRef.current;
    return () => {
      cubeInstanceRefs.current[index] = null;
    };
  }, [cubeInstanceRefs, index]);

  return (
    <Instance
      ref={setRefs}
      color={color}
      index={index}
    />
  );
}