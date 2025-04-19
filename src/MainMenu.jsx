import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { useDetectGPU } from '@react-three/drei';
import useGame from './stores/Game';

const MainMenu = ({ isVolumeOn }) => {
	const [clickSound] = useState(() => new Audio('./static/click.mp3'));
	const backgroundRef = useRef(null);
  const textRef = useRef(null);
	const GPUTier = useDetectGPU();
	const [mobileDevice, setMobileDevice] = useState(false);
	const [accelerationEnabled, setAccelerationEnabled] = useState(false);
	const [startStatus, setStartStatus] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const loading = useGame((state) => state.startLoading);

  const updateLoadingStatus = () => {
    setLoadingStatus((prevStatus) => !prevStatus);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !mobileDevice && accelerationEnabled) {
      if (!loadingStatus && startStatus) {
				updateLoadingStatus();
        loading();
				clickSound.volume = isVolumeOn ? 0.05 : 0;
				clickSound.play();
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
		GPUTier.fps == undefined && GPUTier.tier < 2 && GPUTier.isMobile ? setAccelerationEnabled(false) : setAccelerationEnabled(true);
	}, [accelerationEnabled]);

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
			}, 2500);
			if (!mobileDevice) {
				const textElement = textRef.current;
				const animation = gsap.fromTo(
					textElement,
					{ opacity: 0 },
					{ opacity: 1, yoyo: true, repeat: -1, duration: 1, delay: 2.5, ease: 'power2.inOut' }
				);
				return () => {
					animation.kill();
				};
			}
		};
	}, [mobileDevice]);

  return (
		<div className="main-screen">
			<img className={GPUTier.isMobile ? "main-cover mobile" : "main-cover"} ref={backgroundRef} srcSet="static/cover-min.webp 768w, static/cover.webp 1024w" sizes="(max-width: 1024px) 100vw, 1024px" src="static/cover.webp" alt='Circuit Rush Main Screen Cover' style={{ width: 'auto', height: 'auto' }}/>
			<div className="menu">
				<div ref={textRef} className="start-info">
					{!accelerationEnabled ? 'ENABLE GPU ACCELERATION IN YOUR BROWSER SETTINGS' : !mobileDevice ? 'PRESS ENTER TO START' : 'MOBILE DEVICES CURRENTLY NOT SUPPORTED'}
				</div>
			</div>
			{ GPUTier.isMobile ?
				<a className='mobile-source-code' href='https://github.com/iaruso/circuit-rush' target='_blank'>Source code</a>
				:
				<div className='source-info-buttons'>
					<a id='source-code-btn' className="game-option-btn" href='https://github.com/iaruso/circuit-rush' target='_blank'>
						<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z"/></svg>
					</a>
				</div>
			}
		</div>
  );
};

export default MainMenu;
