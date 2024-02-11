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
	const [specsInfoActive, setSpecsInfoActive] = useState(false);
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
		GPUTier.fps == undefined && GPUTier.tier < 2 && !GPUTier.isMobile ? setAccelerationEnabled(false) : setAccelerationEnabled(true);
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

	const toggleSpecsInfo = () => {
    setSpecsInfoActive((prev) => !prev);
  };

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
					<div id='specs-info-btn' className="game-option-btn" onClick={toggleSpecsInfo}>
						<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 -960 960 960" width="24"><path d="M440-280h80v-240h-80v240Zm40-320q17 0 28.5-11.5T520-640q0-17-11.5-28.5T480-680q-17 0-28.5 11.5T440-640q0 17 11.5 28.5T480-600Zm0 520q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
						<div className={`specs-info ${specsInfoActive ? 'active' : ''}`}>
							<span className='specs-info-title'>Performance specs</span>
							<hr/>
							<span className='specs-info-text'>{GPUTier.isMobile ? "Mobile" : "Desktop"} device</span>
							<span className='specs-info-text'>Expected {GPUTier.fps}fps</span>
							<span className='specs-info-text'>Graphics tier {GPUTier.tier}</span>
							<hr/>
							<a className='specs-info-text' href='https://github.com/iaruso/circuit-rush' target='_blank'>Source code</a>
						</div>
					</div>
				</div>
			}
		</div>
  );
};

export default MainMenu;
