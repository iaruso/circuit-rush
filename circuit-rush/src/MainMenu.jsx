import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import keyboardAnimation from '../public/static/keyboard.json';
import useGame from './stores/Game';

const MainMenu = () => {
	const backgroundRef = useRef(null);
  const textRef = useRef(null);
	const loadingRef = useRef(null);
	const lottieContent = useRef(null);
  const lottieRef = useRef(null);
	const [startStatus, setStartStatus] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const start = useGame((state) => state.startGame);
  const loading = useGame((state) => state.startLoading);
	
  const updateLoadingStatus = () => {
    setLoadingStatus((prevStatus) => !prevStatus);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (!loadingStatus && startStatus) {
        loading();
        updateLoadingStatus();
      } else if (loadingStatus) {
        updateLoadingStatus();
        start();
      }
    }
  };

	useEffect(() => {
    const textElement = loadingRef.current;
    const animation = gsap.fromTo(
      textElement,
      { opacity: 0 },
      { opacity: 1, yoyo: true, repeat: -1, duration: 1 }
    );
    return () => {
      animation.kill();
    };
  }, [loadingStatus]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [loadingStatus, lottieRef, startStatus]);


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
			}, 3000);
			return () => {
				animation.kill();
      	clearTimeout(timeout);
    	};
    }
  }, [loadingStatus, lottieRef]);

	useEffect(() => {
		const image = new Image();
		image.src = 'static/cover.webp';
		image.onload = () => {
			gsap.to(backgroundRef.current, {
				opacity: 1,
				duration: 2,
			});
			setTimeout(() => {
				setStartStatus(true);
			}, 3000);
			const textElement = textRef.current;
			const animation = gsap.fromTo(
				textElement,
				{ opacity: 0 },
				{ opacity: 1, yoyo: true, repeat: -1, duration: 1, delay: 2 }
			);
			return () => {
				animation.kill();
			};
		};
	}, []);

  return (
		<>
			<div className="main-screen">
				{loadingStatus ? (
					<>
						<div className="keyboard-controls" ref={lottieContent}>
							<Lottie
								animationData={keyboardAnimation}
								loop={true}
								autoplay={false}
								lottieRef={lottieRef}
							/>
						</div>
						<div ref={loadingRef} className="loading-info">
							PRESS<span> ENTER </span> TO PLAY
						</div>
					</>
				) : (
					<>
						<img className="main-cover" ref={backgroundRef} src={'static/cover.webp'} alt='Circuit Rush Main Screen Cover'/>
						<div className="menu">
							<div ref={textRef} className="start-info">
								PRESS<span> ENTER </span> TO START
							</div>
						</div>
					</>
				)}
			</div>
		</>
  );
};

export default MainMenu;
