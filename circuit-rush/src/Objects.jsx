import { useSphere } from '@react-three/cannon';
import { Instances } from '@react-three/drei';

export default function Objects({ sphereArray }) {
  return (
    <group>
        {sphereArray.map((sphere, index) => {
          const [sphereRef] = useSphere(() => ({
            mass: 1,
            args: [0.5],
            position: [sphere.x, sphere.y, sphere.z],
            restitution: 0.9,
            friction: 0.1
          }));

          return (
            <Instances limit={1000} range={1000}>
              
                <sphereBufferGeometry args={[0.5, 32, 32]} />
                <meshStandardMaterial color={"#fff"} roughness={1} metalness={0} emissive={"#fff"} emissiveIntensity={0.8}/>
              
            </Instances>
          );
        })}
    </group>
  );
}
