import { useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';

export default function Camera() {

  const cameraRef = useRef();

  return (
		<PerspectiveCamera ref={cameraRef} makedefault/>
  );
}
