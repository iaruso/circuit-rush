import { PerspectiveCamera } from '@react-three/drei';

export default function Camera({cameraRef}) {
  return (
			<PerspectiveCamera makeDefault cameraRef={cameraRef} fov={20}/>
  );
}
