import { useGLTF, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useSphere } from '@react-three/cannon';
import Cube from './Cube';
import gsap from 'gsap';

export default function Objects({ data, count }) {
  const { nodes } = useGLTF('./cube.glb');

  const colors = ["#ff0000"];

  const material = new THREE.MeshStandardMaterial({
    color: "#fff",
    roughness: 0.8,
    metalness: 0.2,
    emissive: "#fff",
    emissiveIntensity: 1,
    // transparent: true,
    // opacity: 1
  });
  gsap.to(material.emissiveIntensity, {
    value: 10,
    duration: 1,
    yoyo: true,
    repeat: -1,
  });
  gsap.to(material.emissive, {
    r: 1,
    g: 0,
    b: 0,
    duration: 1,
    yoyo: true,
    repeat: -1,
  });



    return (
      <>
        <Instances range={count} material={material} geometry={nodes.Cube.geometry} castShadow receiveShadow>
          <group position={[0, 0, 0]}>
            {data.map((props, i) => (
              <group key={i}>
                <Cube key={i} position={[props[0], 0.5, -props[1]]} rotation={[0, props[2], 0]} color={colors[i % colors.length]} />
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

