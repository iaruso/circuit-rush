import { useGLTF, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useSphere } from '@react-three/cannon';
import Cube from './Cube';

export default function Objects({ data, count }) {
  const { nodes } = useGLTF('./cube.glb');

  const colors = ["#1778F2"];

  const material = new THREE.MeshStandardMaterial({
    color: "#fff",
    roughness: 1,
    metalness: 0.0
  });


  return (
    <>
      <Instances range={count} material={material} geometry={nodes.Cube.geometry} castShadow receiveShadow>
        <group position={[0, 0, 0]}>
          {data.map((props, i) => (
            <group key={i}>
              <Cube key={i} {...props} color={colors[i % colors.length]} />
            </group>
          ))}
        </group>
      </Instances>
    </>
  );
}

// import { SphereBufferGeometry, MeshStandardMaterial } from 'three';
// import { Instances } from '@react-three/drei';
// import Ball from './Ball';

// const material = new MeshStandardMaterial({
//   color: "#fff",
//   roughness: 1,
//   metalness: 0,
//   emissive: "#fff",
//   emissiveIntensity: 0.8,
// });

// const geometry = new SphereBufferGeometry(0.5, 32, 32);

// export default function Objects({ data, count }) {
//   return (
//     <Instances range={count} material={material} geometry={geometry} castShadow={true} receiveShadow={true}>
//       <group position={[0, 0, 0]}>
//         {data.map((props, i) => (
//           <Ball key={i} {...props} />
//         ))}
//       </group>
//     </Instances>
//   );
// }

