import useGame from './stores/Game.jsx';
import { useEffect, useRef } from 'react';
import { addEffect } from '@react-three/fiber';
import { gsap } from 'gsap';

export default function Interface() {
  const time = useRef();

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();
      let elapsedTime = 0;
      if (state.phase === 'playing') elapsedTime = Date.now() - state.startTime;
      else if (state.phase === 'ended') elapsedTime = state.endTime - state.startTime;
      elapsedTime /= 1000;
      if (time.current) {
        gsap.to(time.current, {
          textContent: elapsedTime.toFixed(2),
          duration: 1
        });
      }
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  return (
    <div className="interface">
      <div ref={time} className="time">0.00</div>
    </div>
  );
}
