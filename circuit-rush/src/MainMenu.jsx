import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import Lottie from 'lottie-react';
import keyboardAnimation from '../public/keyboard.json';
import useGame from './stores/Game';

const MainMenu = () => {
  const textRef = useRef(null);
	const loadingRef = useRef(null);
  const lottieRef = useRef(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [playAnimation, setPlayAnimation] = useState(false);
  const start = useGame((state) => state.startGame);
  const loading = useGame((state) => state.startLoading);

  const updateLoadingStatus = () => {
    setLoadingStatus((prevStatus) => !prevStatus);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (!loadingStatus) {
        loading();
        updateLoadingStatus();
      } else {
        updateLoadingStatus();
        start();
      }
    }
  };

  useEffect(() => {
    const textElement = textRef.current;

    const animation = gsap.fromTo(
      textElement,
      { opacity: 0 },
      { opacity: 1, yoyo: true, repeat: -1, duration: 1 }
    );

    return () => {
      animation.kill();
    };
  }, []);

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
  }, [loadingStatus]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setPlayAnimation(true);
    }, 3000);

    return () => {
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (lottieRef.current) {
      if (playAnimation) {
        lottieRef.current.play();
      } else {
        lottieRef.current.pause();
      }
    }
  }, [playAnimation]);

  return (
    <div className="main-screen">
      {loadingStatus ? (
				<>
					<div className="keyboard-controls">
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
          <div className="background-image"></div>
          <div className="menu">
            <div ref={textRef} className="start-info">
              PRESS<span> ENTER </span> TO START
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MainMenu;
