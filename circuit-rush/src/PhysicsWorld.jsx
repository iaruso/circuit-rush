import { useBox } from '@react-three/cannon';
import physics from '../public/static/physics';
import { Instance, Instances } from '@react-three/drei';
import { MeshBasicMaterial, BoxGeometry } from 'three';

const cubeMaterial = new MeshBasicMaterial({
	color: "#fff",
	transparent: true,
	opacity: 0
});

const cubeGeometry = new BoxGeometry(1, 1, 1);

export default function PhysicsWorld() {
  const cubesArray = physics;
  return (
    <>
			<Instances range={cubesArray.length} material={cubeMaterial} geometry={cubeGeometry} castShadow receiveShadow>
        <group position={[0, 0, 0]}>
					{cubesArray.map((cubeParams, index) => (
						<Cube key={index} position={cubeParams.slice(0,3)} rotation={[0, (cubeParams[3] * Math.PI) / 180, 0]} size={cubeParams.slice(4)} />
					))}
				</group>
			</Instances>
    </>
  );
}

function Cube({ position, size, rotation}) {
  const [ref, api] = useBox(() => ({
    mass: 0,
    position,
    rotation,
    args: size,
    restitution: 0.5,
    friction: 0.5
  }));

  return (
    <Instance
      ref={ref}
    />
  );
}