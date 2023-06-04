import { useRef, useEffect } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';


export default function Camera({cameraRef}) {
	const cameraRef2 = useRef();
	// useFrame(() => {
	// 	console.log(cameraRef.current);
  //   cameraRef2.current = cameraRef.current;
  // },);

  return (
			<PerspectiveCamera makeDefault cameraRef={cameraRef} fov={30}/>
  );
}
