import { useRef, useEffect, useMemo } from 'react';
import { Instances, useGLTF } from '@react-three/drei';
import { MeshStandardMaterial } from 'three';
import Cube from './Cube';
import gsap from 'gsap';
import Waypoint from './Waypoint';
import Arrow from './Arrow';

const cubeMaterial = new MeshStandardMaterial({
	color: "#fff",
	roughness: 1,
	metalness: 0,
	emissive: "#fff",
	emissiveIntensity: 0.2
});

const waypointMaterial = new MeshStandardMaterial({
	color: "#fff",
	roughness: 1,
	metalness: 0,
	emissive: "#fff",
	emissiveIntensity: 0.1
});

export default function Objects({ cubesData, cubesCount, waypointsRightData, waypointsLeftData }) {
  const { nodes: cube } = useGLTF('./static/cube.glb');
	const { nodes: cube_min } = useGLTF('./static/cube-min.glb');
  const { nodes: waypointRight } = useGLTF('./static/waypoint-right.glb');
  const { nodes: arrowRight } = useGLTF('./static/arrow-right.glb');
  const { nodes: waypointLeft } = useGLTF('./static/waypoint-left.glb');
	const { nodes: arrowLeft } = useGLTF('./static/arrow-left.glb');

  const colors = ['#fff', '#cc8080'];
  const scale = [1, 1, 1];

  const cubeInstanceRefs = useRef([]);
  const arrowRightInstanceRefs = useRef([]);
  const arrowLeftInstanceRefs = useRef([]);
  const enableCollisionHandlingRef = useRef(false);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      enableCollisionHandlingRef.current = true;
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const handleCollide = (e, index) => {
    if (!enableCollisionHandlingRef.current) {
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

  const memoizedCubeGeometry = useMemo(() => cube_min?.Cube?.geometry, [cube_min]);
  const memoizedWaypointRightGeometry = useMemo(() => waypointRight?.Waypoint?.geometry, [waypointRight]);
  const memoizedWaypointLeftGeometry = useMemo(() => waypointLeft?.Waypoint?.geometry, [waypointLeft]);
  const memoizedArrowRightGeometry = useMemo(() => arrowRight?.Arrow?.geometry, [arrowRight]);
  const memoizedArrowLeftGeometry = useMemo(() => arrowLeft?.Arrow?.geometry, [arrowLeft]);

  return (
    <>
      <Instances range={cubesCount} material={cubeMaterial} geometry={memoizedCubeGeometry} castShadow receiveShadow>
        <group position={[0, 0, 0]}>
          {cubesData.map((props, i) => (
            <Cube
              key={i}
              position={[props[0], 0.5, -props[1]]}
              rotation={[0, props[2], 0]}
              args={scale}
              color={colors[0]}
              onCollide={(e) => handleCollide(e, i)}
              cubeInstanceRefs={cubeInstanceRefs}
              index={i}
            />
          ))}
        </group>
      </Instances>

      {[waypointsRightData, waypointsLeftData].map((waypointsData, sideIndex) => (
        <Instances key={sideIndex} range={waypointsData.length} material={waypointMaterial} geometry={sideIndex === 0 ? memoizedWaypointRightGeometry : memoizedWaypointLeftGeometry} castShadow receiveShadow>
          <group position={[0, 0, 0]}>
            {waypointsData.map((props, i) => (
              <Waypoint
                key={i}
                position={[props[0], 1, -props[1]]}
                rotation={[0, (props[2] * Math.PI) / 180, 0]}
                index={i}
              />
            ))}
          </group>
        </Instances>
      ))}

      {[waypointsRightData, waypointsLeftData].map((waypointsData, sideIndex) => (
        <Instances key={sideIndex} range={waypointsData.length} material={waypointMaterial} geometry={sideIndex === 0 ? memoizedArrowRightGeometry : memoizedArrowLeftGeometry} castShadow receiveShadow>
          <group position={[0, 0, 0]}>
            {waypointsData.map((props, i) => (
              <Arrow
                key={i}
                position={[props[0], 1, -props[1]]}
                rotation={[0, (props[2] * Math.PI) / 180, 0]}
                index={i}
                color={colors[1]}
                refs={sideIndex === 0 ? arrowRightInstanceRefs : arrowLeftInstanceRefs}
              />
            ))}
          </group>
        </Instances>
      ))}
    </>
  );
}
