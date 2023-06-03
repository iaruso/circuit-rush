import { useRef } from 'react';
import { Instances, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useSphere } from '@react-three/cannon';
import Cube from './Cube';
import gsap from 'gsap';
import { useControls } from 'leva';
import Waypoint from './Waypoint';

export default function Objects({ cubesData, cubesCount, waypointsData, waypointsCount }) {
  const { nodes: cube } = useGLTF('./cube.glb');
	const { nodes: waypoint } = useGLTF('./waypoint.glb');


	console.log(waypoint);
  const settings = useControls({
    color2: '#fff'
  });
  const colors = [settings.color2];
	const scale = [1, 1, 1];


  const material = new THREE.MeshStandardMaterial({
    color: "#fff",
    roughness: 1,
    metalness: 0,
    transparent: true,
    opacity: 0.9
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
      <Instances range={cubesCount} material={material} geometry={cube.Cube.geometry} castShadow receiveShadow>
        <group position={[0, 0, 0]}>
          {cubesData.map((props, i) => (
            <group key={i}>
              <Cube
                position={[props[0], 0.5, -props[1]]}
                rotation={[0, props[2], 0]}
								args={scale}
                color={colors[i % colors.length]}
                onCollide={(e) => handleCollide(e, i)}
                cubeInstanceRefs={cubeInstanceRefs}
                index={i}
              />
            </group>
          ))}
        </group>
      </Instances>
			<Instances range={waypointsCount} material={material} geometry={waypoint.Waypoint.geometry} castShadow receiveShadow>
        <group position={[0, 0, 0]}>
          {waypointsData.map((props, i) => (
            <group key={i}>
              <Waypoint
                position={[props[0], 1, -props[1]]}
                rotation={[0, (props[2] * Math.PI) / 180, 0]}
                index={i}
              />
            </group>
          ))}
        </group>
      </Instances>
    </>
  );
}

