import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import useGame from './stores/Game';

const MainMenu = () => {
	const backgroundRef = useRef(null);
  const textRef = useRef(null);
	const [startStatus, setStartStatus] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const loading = useGame((state) => state.startLoading);

  const updateLoadingStatus = () => {
    setLoadingStatus((prevStatus) => !prevStatus);
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (!loadingStatus && startStatus) {
        loading();
        updateLoadingStatus();
      }
    }
  };

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
		<div className="main-screen">
			<img className="main-cover" ref={backgroundRef} src={'static/cover.webp'} alt='Circuit Rush Main Screen Cover'/>
			<div className="menu">
				<div ref={textRef} className="start-info">
					PRESS ENTER TO START
				</div>
			</div>
		</div>
  );
};

export default MainMenu;
