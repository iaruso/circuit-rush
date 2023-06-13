import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import useGame from './stores/Game';

const MainMenu = () => {
  const textRef = useRef(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
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
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [loadingStatus]);

  return (
    <div>
      {loadingStatus ? (
        <div>Loading...</div>
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
