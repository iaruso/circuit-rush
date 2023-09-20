import { useRef } from 'react';
import { useBox } from '@react-three/cannon';
import { Instance } from '@react-three/drei';

export default function Waypoint({ position, rotation, index }) {
  const [waypointRef] = useBox(() => ({
    mass: 0,
    args: [1.5, 2, 1],
    position,
    rotation,
    userData: {
      name: 'waypoint',
    }
  }));

  const waypointInstanceRef = useRef();
  const setRefs = (instance) => {
    waypointRef.current = waypointInstanceRef.current = instance;
  };

  return (
    <>
      <Instance
        index={index}
        ref={setRefs}
      />
    </>
  );
}