import './style.css';
import ReactDOM from 'react-dom';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import useGame from './stores/Game.jsx'
import Interface from './Interface.jsx'
import UserControls from './UserControls';
import { Perf, usePerf } from 'r3f-perf';
import { useDetectGPU } from '@react-three/drei';

const root = ReactDOM.createRoot(document.querySelector('#root'));
function App() {
	const GPUTier = useDetectGPU()
	console.log(GPUTier)
	const start = useGame((state) => state.start)
  start()
	
  return (
		<UserControls>
			<Canvas
				shadows={'soft'}
				camera={{
					fov: 45,
					near: 0.01,
					far: 1000,
					position: [0,0,0],
				}}
			>
				<color attach="background" args={['#fbfbfb']} />
				<Experience />
				<Perf position="top-right" minimal={true}/>
			</Canvas>
			{/* <Interface/> */}
		</UserControls>
  );
}

root.render(<App />);
