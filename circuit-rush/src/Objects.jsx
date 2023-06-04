import { useRef, useEffect } from 'react';
import { Instances, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Cube from './Cube';
import gsap from 'gsap';
import { useControls } from 'leva';
import Waypoint from './Waypoint';
import Arrow from './Arrow';

const cubeMaterial = new THREE.MeshStandardMaterial({
	color: "#fff",
	roughness: 1,
	metalness: 0,
	transparent: true,
	opacity: 0.9
});

const waypointMaterial = new THREE.MeshStandardMaterial({
	color: "#fff",
	roughness: 1,
	metalness: 0
});

export default function Objects({ cubesData, cubesCount, waypointsRightData, waypointsRightCount, waypointsLeftData, waypointsLeftCount}) {
  const { nodes: cube } = useGLTF('./cube.glb');
	const { nodes: waypointRight } = useGLTF('./waypoint-right.glb');
	const { nodes: arrowRight } = useGLTF('./arrow-right.glb');
	const { nodes: waypointLeft } = useGLTF('./waypoint-left.glb');
	const { nodes: arrowLeft } = useGLTF('./arrow-left.glb');
  const settings = useControls({
    color: '#fff',
		arrow: '#cc8080'
  });
  const colors = [settings.color, settings.arrow];
	const scale = [1, 1, 1];

  const cubeInstanceRefs = useRef([]);
	const arrowRightInstanceRefs = useRef([]);
	const arrowLeftInstanceRefs = useRef([]);

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
      <Instances range={cubesCount} material={cubeMaterial} geometry={cube.Cube.geometry} castShadow receiveShadow>
        <group position={[0, 0, 0]}>
          {cubesData.map((props, i) => (
            <group key={i}>
              <Cube
                position={[props[0], 0.5, -props[1]]}
                rotation={[0, props[2], 0]}
								args={scale}
                color={colors[0]}
                onCollide={(e) => handleCollide(e, i)}
                cubeInstanceRefs={cubeInstanceRefs}
                index={i}
              />
            </group>
          ))}
        </group>
      </Instances>
			<>
				{[waypointsRightData, waypointsLeftData].map((waypointsData, sideIndex) => (
					<Instances key={sideIndex} range={waypointsData.length} material={waypointMaterial} geometry={sideIndex === 0 ? waypointRight.Waypoint.geometry : waypointLeft.Waypoint.geometry} castShadow receiveShadow>
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
				))}
				{[waypointsRightData, waypointsLeftData].map((waypointsData, sideIndex) => (
					<Instances key={sideIndex} range={waypointsData.length} material={waypointMaterial} geometry={sideIndex === 0 ? arrowRight.Arrow.geometry : arrowLeft.Arrow.geometry} castShadow receiveShadow>
						<group position={[0, 0, 0]}>
							{waypointsData.map((props, i) => (
								<group key={i}>
									<Arrow
										position={[props[0], 1, -props[1]]}
										rotation={[0, (props[2] * Math.PI) / 180, 0]}
										index={i}
										color={colors[1]}
										refs={sideIndex === 0 ? arrowRightInstanceRefs : arrowLeftInstanceRefs}
									/>
								</group>
							))}
						</group>
					</Instances>
				))}
			</>
    </>
  );
}

