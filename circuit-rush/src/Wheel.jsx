export const Wheel = ({ radius, wheelRef }) => {
  return (
    <group ref={wheelRef}>
      <mesh rotation={[0, 0, Math.PI / 2]} visible={false}>
        <cylinderGeometry args={[radius, radius, 0.5, 16]} />
        <meshStandardMaterial transparent={true} opacity={0.5} />
      </mesh>
    </group>
  );
};