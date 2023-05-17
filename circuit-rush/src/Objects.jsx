import { Physics, useBox, useSphere } from '@react-three/cannon';
import { useRef } from 'react';

export default function Objects({ cubeArray, sphereArray }) {
  const cubeRef = useRef();
  const sphereRef = useRef();

  return (
    <group>
        {/* Cubes */}
        {cubeArray.map((cube, index) => {
          const [cubeRef] = useBox(() => ({
            mass: 1,
            position: [cube.x, cube.y, cube.z],
            rotation: [0, cube.rotation_y, 0],
          }));

          return (
            <mesh ref={cubeRef} key={`cube-${index}`}>
              <boxBufferGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="red" />
            </mesh>
          );
        })}

        {/* Spheres */}
        {sphereArray.map((sphere, index) => {
          const [sphereRef] = useSphere(() => ({
            mass: 1,
            position: [sphere.x, sphere.y, sphere.z],
            rotation: [0, sphere.rotation_y, 0],
          }));

          return (
            <mesh ref={sphereRef} key={`sphere-${index}`}>
              <sphereBufferGeometry args={[0.5, 32, 32]} />
              <meshStandardMaterial color="blue" />
            </mesh>
          );
        })}
    </group>
  );
}
