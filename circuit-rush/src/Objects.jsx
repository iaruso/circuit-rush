import { useRef } from 'react';
import { Instances, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import Cube from './Cube';
import gsap from 'gsap';
import Waypoint from './Waypoint';
import Arrow from './Arrow';

const cubeMaterial = new THREE.MeshStandardMaterial({
	color: "#fff",
	roughness: 1,
	metalness: 0,
	emissive: "#fff",
	emissiveIntensity: 0.2
});

const waypointMaterial = new THREE.MeshStandardMaterial({
	color: "#fff",
	roughness: 1,
	metalness: 0,
	emissive: "#fff",
	emissiveIntensity: 0.1
});

export default function Objects({ cubesData, cubesCount, waypointsRightData, waypointsRightCount, waypointsLeftData, waypointsLeftCount}) {
  const { nodes: cube } = useGLTF('./cube.glb');
	const { nodes: waypointRight } = useGLTF('./waypoint-right.glb');
	const { nodes: arrowRight } = useGLTF('./arrow-right.glb');
	const { nodes: waypointLeft } = useGLTF('./waypoint-left.glb');
	const { nodes: arrowLeft } = useGLTF('./arrow-left.glb');

  const colors = ['#fff', '#cc8080'];
	const scale = [1, 1, 1];

  const cubeInstanceRefs = useRef([]);
	const arrowRightInstanceRefs = useRef([]);
	const arrowLeftInstanceRefs = useRef([]);

  let enableCollisionHandling = false;

	setTimeout(() => {
		enableCollisionHandling = true;
	}, 1000);

	const handleCollide = (e, index) => {
		if (!enableCollisionHandling) {
			return;
		}

		const cubeColor = cubeInstanceRefs.current[index].color;
		animateColor(cubeColor, { r: 1, g: 0, b: 0 }, { r: 1, g: 1, b: 1 });
	};

	const animateColor = (color, startColor, endColor) => {
		gsap.to(color, {
			r: startColor.r,
			g: startColor.g,
			b: startColor.b,
			duration: 1,
			onComplete: () => {
				gsap.to(color, {
					r: endColor.r,
					g: endColor.g,
					b: endColor.b,
					duration: 1,
				});
			},
		});
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