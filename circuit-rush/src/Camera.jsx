import { PerspectiveCamera } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { forwardRef } from 'react';
import { EffectComposer, BrightnessContrast } from '@react-three/postprocessing';
import * as THREE from 'three';

const Camera = forwardRef((props, ref) => {
  useFrame(() => {
    const position2 = new THREE.Vector3();
    position2.setFromMatrixPosition(ref.current.matrixWorld);
    // console.log(position2);
  });

  return <PerspectiveCamera makeDefault ref={ref} fov={32} {...props}>
		<EffectComposer>

			<BrightnessContrast brightness={-0.2} contrast={0.4} />
		</EffectComposer>
	</PerspectiveCamera>;	
});

export default Camera;
