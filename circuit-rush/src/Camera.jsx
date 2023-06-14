import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef } from 'react';
import { EffectComposer, BrightnessContrast, ColorDepth } from '@react-three/postprocessing';
import * as THREE from 'three';

const Camera = forwardRef((props, ref) => {
  useFrame(() => {
    const position2 = new THREE.Vector3();
    position2.setFromMatrixPosition(ref.current.matrixWorld);
    // console.log(position2);
  });

  return <PerspectiveCamera makeDefault ref={ref} fov={24} {...props} resolution={2160}>
		{/* <EffectComposer>
			<BrightnessContrast brightness={-0.2} contrast={0.4}/>
			<ColorDepth bits={8} opacity={0.2}/>
		</EffectComposer> */}
	</PerspectiveCamera>;	
});

export default Camera;
