import './style.css';
import ReactDOM from 'react-dom';
import { useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import useGame from './stores/Game.jsx'
import UserControls from './UserControls';
import { Perf } from 'r3f-perf';
import { useDetectGPU, PerformanceMonitor } from '@react-three/drei';
import MainMenu from './MainMenu.jsx';
import round from 'lodash/round';
import { set } from 'lodash';

const root = ReactDOM.createRoot(document.querySelector('#root'));

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const GPUTier = useDetectGPU();
  const [perfomanceMode, setPerfomanceMode] = useState(0);
  const [dpr, setDpr] = useState(0.5);
	const [minDpr, setMinDpr] = useState(0.5);
	const [maxDpr, setMaxDpr] = useState(0.8);

	useEffect(() => {
		GPUTier.fps > 60 ? setPerfomanceMode(2) : GPUTier.fps > 30 ? setPerfomanceMode(1) : setPerfomanceMode(0);
		if (perfomanceMode == 2) {
			setDpr(1);
			setMinDpr(0.8);
			setMaxDpr(1.2);
		} else if ( perfomanceMode == 1) {
			setDpr(0.8);
			setMinDpr(0.6);
			setMaxDpr(1);
		} else {
			setDpr(0.5);
			setMinDpr(0.5);
			setMaxDpr(0.8);
		}
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
            dpr={dpr}
            shadows={perfomanceMode > 0 ? 'soft' : 'basic'} 
            camera={{
              fov: 45,
              near: 0.01,
              far: 300,
              position: [0, 0, 0],
            }}
          >
            <color attach="background" args={['#fbfbfb']} />
            <PerformanceMonitor onIncline={() => setDpr(minDpr)} onDecline={() => setDpr(maxDpr)}>
              <Experience perfomanceMode={perfomanceMode} />
            </PerformanceMonitor>
            <Perf position="top-right" minimal={true} overClock />
          </Canvas>
          {/* <Interface/> */}
        </UserControls>
      )}
    </>
  );
}

root.render(<App />);
