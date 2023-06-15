import './style.css';
import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import useGame from './stores/Game.jsx'
import UserControls from './UserControls';
import { Perf } from 'r3f-perf';
import { useDetectGPU } from '@react-three/drei';
import MainMenu from './MainMenu.jsx';

const root = ReactDOM.createRoot(document.querySelector('#root'));

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const GPUTier = useDetectGPU();
	const [perfomanceMode, setPerfomanceMode] = useState(true);
	useEffect(() => {
		GPUTier.fps > 60 ? setPerfomanceMode(false) : setPerfomanceMode(true);
	}, [perfomanceMode]);
  const gamePhase = useGame((state) => state.phase);
  if (gamePhase === 'playing' && !gameStarted) {
    setGameStarted(true);
  }

  return (
    <>
      {!gameStarted ? (
        <MainMenu />
      ) : (
        <UserControls>
          <Canvas
            shadows={'soft'}
            camera={{
              fov: 45,
              near: 0.01,
              far: 1000,
              position: [0, 0, 0],
            }}
          >
            <color attach="background" args={['#fbfbfb']} />
            <Experience perfomanceMode={perfomanceMode}/>
            <Perf position="top-right" minimal={true} />
          </Canvas>
          {/* <Interface/> */}
        </UserControls>
      )}
    </>
  );
}

root.render(<App />);
