import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useDetectGPU } from '@react-three/drei';
import useGame from './stores/Game';

const MainMenu = () => {
	const [clickSound] = useState(() => new Audio('./static/click.mp3'));
	const backgroundRef = useRef(null);
  const textRef = useRef(null);
	const GPUTier = useDetectGPU();
	const [mobileDevice, setMobileDevice] = useState(false);
	const [startStatus, setStartStatus] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const loading = useGame((state) => state.startLoading);

  const updateLoadingStatus = () => {
    setLoadingStatus((prevStatus) => !prevStatus);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (!loadingStatus && startStatus) {
				clickSound.volume = 0.05;
				clickSound.play();
        loading();
        updateLoadingStatus();
      }
    }
  };

	useEffect(() => { 
		if (GPUTier.isMobile) {
			setMobileDevice(true);
			textRef.current.classList.add('mobile');
		} else {
			setMobileDevice(false);
		}
	}, [loadingStatus]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [startStatus]);

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
			if (!mobileDevice) {
				const textElement = textRef.current;
				const animation = gsap.fromTo(
					textElement,
					{ opacity: 0 },
					{ opacity: 1, yoyo: true, repeat: -1, duration: 1, delay: 3 }
				);
				return () => {
					animation.kill();
				};
			}
		};
	}, [mobileDevice]);

  return (
		<div className="main-screen">
			<img className="main-cover" ref={backgroundRef} src={'static/cover.webp'} alt='Circuit Rush Main Screen Cover'/>
			<div className="menu">
				<div ref={textRef} className="start-info">
					{!mobileDevice ? 'PRESS ENTER TO START' : 'MOBILE DEVICES CURRENTLY NOT SUPPORTED'}
				</div>
			</div>
		</div>
  );
};

export default MainMenu;
