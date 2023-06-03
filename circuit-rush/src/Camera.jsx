import { useRef } from 'react';
import { PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, SMAA, N8AO, ASCII} from '@react-three/postprocessing';
import { useControls } from 'leva';

export default function Camera() {

  const cameraRef = useRef();

const settings = useControls({
    n8ao: '#efefef',
		aoRadius: {
      value: 10,
      min: 0,
      max: 100,
      step: 0.1,
    },
		intensity: {
      value: 1,
      min: 0,
      max: 100,
      step: 0.1,
    },
		aoSamples: {
      value: 1,
      min: 0,
      max: 100,
      step: 1,
    },
		denoiseSamples: {
      value: 2,
      min: 0,
      max: 100,
      step: 1,
    },
  });

  return (
		<PerspectiveCamera ref={cameraRef} makedefault>
			<EffectComposer multisampling={0}>
				<N8AO color={settings.n8ao} aoRadius={settings.aoRadius} intensity={settings.intensity} aoSamples={settings.aoSamples} denoiseSamples={settings.denoiseSamples} />
      	<SMAA />

			</EffectComposer>
		</PerspectiveCamera>
  );
}
