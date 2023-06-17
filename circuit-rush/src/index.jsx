import './style.css';
import ReactDOM from 'react-dom';
import { Suspense, useEffect, useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Experience from './Experience.jsx';
import useGame from './stores/Game.jsx';
import UserControls from './UserControls';
import { Perf } from 'r3f-perf';
import { useDetectGPU, PerformanceMonitor, useProgress } from '@react-three/drei';
import MainMenu from './MainMenu.jsx';
import Lottie from 'lottie-react';
import keyboardAnimation from '../public/static/keyboard.json';
import { gsap } from 'gsap';

const root = ReactDOM.createRoot(document.querySelector('#root'));

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const GPUTier = useDetectGPU();
  const [perfomanceMode, setPerfomanceMode] = useState(0);
  const [dpr, setDpr] = useState(0.5);
	const [minDpr, setMinDpr] = useState(0.5);
	const [maxDpr, setMaxDpr] = useState(0.8);
	const lottieRef = useRef(null);
	const lottieContent = useRef(null);
	const loadingRef = useRef(null);
	const [loadingStatus, setLoadingStatus] = useState(false);
	const [gameLoaded, setGameLoaded] = useState(false);
	const [contentLoaded, setContentLoaded] = useState(false);
	const start = useGame((state) => state.startGame);

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
  if (gamePhase === 'loading' && !gameStarted) {
    setGameStarted(true);
  }
	
	const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (loadingStatus) {
				setGameLoaded(true);
				setContentLoaded(false);
				start();
      }
    }
  };

	useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [gameStarted, gameLoaded, loadingStatus, contentLoaded]);

	useEffect(() => {
    if (lottieRef.current) {
			const lottieElement = lottieContent.current;
			const animation = gsap.fromTo(
				lottieElement,
				{ opacity: 0 },
				{ opacity: 1, duration: 1.5 }
			);
      const timeout = setTimeout(() => {
				lottieRef.current.play();
			}, 1000);
			return () => {
				animation.kill();
      	clearTimeout(timeout);
    	};
    }
  }, [gameStarted, lottieRef]);

	useEffect(() => {
  if (loadingStatus) {
    const textElement = loadingRef.current;
    const animation = gsap.fromTo(
      textElement,
      { opacity: 0 },
      { opacity: 1, yoyo: true, repeat: -1, duration: 1 }
    );
    return () => {
      animation.kill();
    };
  }
}, [loadingStatus]);


	function Loader() {
		const { progress } = useProgress()
		loadingRef.current.textContent = 'LOADING ' + progress.toFixed(0) + '%';
		if ( progress > 99.9 ) {
			setContentLoaded(true);
			setTimeout(() => {
				setLoadingStatus(true);
        loadingRef.current.textContent = 'PRESS ENTER TO PLAY';
      }, 2000);
		}
		return <></>
	}

  return (
		<>
			{!gameStarted ? (
				<MainMenu />
			) : (
				<>
					{!gameLoaded ? (
						<div className='loading-screen'>
							<div className="keyboard-controls" ref={lottieContent}>
								<Lottie
									animationData={keyboardAnimation}
									loop={true}
									autoplay={false}
									lottieRef={lottieRef}
								/>
							</div>
							<div ref={loadingRef} className="loading-info"></div>
						</div>
					) : null}
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
							<Suspense fallback={<Loader />}>
							{!contentLoaded ?
								<>
									<color attach="background" args={['#fbfbfb']} />
									<PerformanceMonitor onIncline={() => setDpr(minDpr)} onDecline={() => setDpr(maxDpr)}>
										<Experience perfomanceMode={perfomanceMode} />
									</PerformanceMonitor>
									<Perf position="top-right" minimal={true} overClock /> 
								</>
								: null}
							</Suspense>
						</Canvas>
					</UserControls>
				</>
			)}
		</>
	);
}

root.render(<App />);