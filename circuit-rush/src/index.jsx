import './style.css';
import ReactDOM from 'react-dom';
import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import useGame from './stores/Game.jsx'
import Interface from './Interface.jsx'
import UserControls from './UserControls';
import { Perf, usePerf } from 'r3f-perf';
import { useDetectGPU } from '@react-three/drei';
import MainMenu from './MainMenu.jsx';

const root = ReactDOM.createRoot(document.querySelector('#root'));
function App() {
	const [gameStarted, setGameStarted] = useState(false);
	const GPUTier = useDetectGPU()
	console.log(GPUTier)
	const start = useGame((state) => state.start)
  start()
	
	const startGame = () => {
    setGameStarted(true);
    // Additional logic to transition to the game scene
  };
  return (
		<>
		{!gameStarted ? (
        <MainMenu startGame={startGame} />
      ) : (
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
      )}
	</>
  );
}

root.render(<App />);
