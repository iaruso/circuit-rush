import { SphereBufferGeometry, MeshStandardMaterial } from 'three';
import { Instances } from '@react-three/drei';
import Ball from './Ball';

const material = new MeshStandardMaterial({
  color: "#fff",
  roughness: 1,
  metalness: 0,
  emissive: "#fff",
  emissiveIntensity: 0.8,
});

const geometry = new SphereBufferGeometry(0.5, 32, 32);

export default function Objects({ data, count }) {
  return (
    <Instances range={count} material={material} geometry={geometry} castShadow={true} receiveShadow={true}>
      <group position={[0, 0, 0]}>
        {data.map((props, i) => (
          <Ball key={i} {...props} />
        ))}
      </group>
    </Instances>
  );
}