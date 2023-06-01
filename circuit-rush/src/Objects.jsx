import { useRef } from 'react';
import { useGLTF, Instances } from '@react-three/drei';
import * as THREE from 'three';
import { useSphere } from '@react-three/cannon';
import Cube from './Cube';
import gsap from 'gsap';
import { useControls } from 'leva';

export default function Objects({ data, count }) {
  const { nodes } = useGLTF('./cube.glb');
  const settings = useControls({
    color2: '#fff'
  });
  const colors = [settings.color2];


  const material = new THREE.MeshStandardMaterial({
    color: "#fff",
    roughness: 1,
    metalness: 0.1,
    transparent: true,
    opacity: 0.8
  });

  const cubeInstanceRefs = useRef([]);

  const handleCollide = (e, index) => {
    if (e.body.userData.name === 'cube') {
      const cubeColor = cubeInstanceRefs.current[index].color;
      gsap.to(cubeColor, {
        r: 1,
        g: 0,
        b: 0,
        duration: 1,
        onComplete: () => {
          gsap.to(cubeColor, {
            r: 1,
            g: 1,
            b: 1,
            duration: 1,
          });
        },
      });
    }
  };

  return (
    <>
      <Instances range={count} material={material} geometry={nodes.Cube.geometry} castShadow receiveShadow>
        <group position={[0, 0, 0]}>
          {data.map((props, i) => (
            <group key={i}>
              <Cube
                position={[props[0], 0.5, -props[1]]}
                rotation={[0, props[2], 0]}
                color={colors[i % colors.length]}
                onCollide={(e) => handleCollide(e, i)}
                cubeInstanceRefs={cubeInstanceRefs}
                index={i}
              />
            </group>
          ))}
        </group>
      </Instances>
    </>
  );
}

