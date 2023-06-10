import { useRef, useEffect, useState } from 'react';
import { useBox } from '@react-three/cannon';
import { Html } from '@react-three/drei';
import { addEffect } from '@react-three/fiber';
import useGame from './stores/Game.jsx';

export default function Checkpoints() {
  const positions = [[-24, 2, -12], [6, 2, 44], [44, 2, -9]];
  const args = [[2, 4, 10], [2, 4, 10], [10, 4, 2]];
  var lap = 1;
  var currentCheckpoint = 0;

  const checkpoints = [];

	for (let i = 0; i < positions.length; i++) {
		const [checkpoint] = useBox(() => ({
			args: args[i],
			position: positions[i],
			isTrigger: true,
			onCollide: handleCollide(i),
		}), useRef(null));
		checkpoints.push(checkpoint);
	}

  const handleCollide = (id) => {
    return (e) => {
      const { body } = e;
      if (body.userData.name === 'vehicle' && id === currentCheckpoint) {
				if (currentCheckpoint > 1) {
          lap++;
          if (lap === 4) {
            console.log('Finish');
          }
        }
				id != 2 ? currentCheckpoint = id + 1 : currentCheckpoint = 0;
				console.log(lap + '-' + currentCheckpoint);
      }
    };
  };

	const time = useRef();

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();
      let elapsedTime = 0;
      if (state.phase === 'playing') elapsedTime = Date.now() - state.startTime;
      else if (state.phase === 'ended') elapsedTime = state.endTime - state.startTime;
      elapsedTime /= 1000;
      time.current.textContent = elapsedTime.toFixed(3);
    });

    return () => {
      unsubscribeEffect();
    };
  }, []);

  return (
		<>
			<group>
				{checkpoints.map((checkpoint, index) => (
					<mesh key={index} ref={checkpoint} visible={false}></mesh>
				))}
			</group>
			<Html fullscreen className='vehicle-stats-overlay'>
				<div className="interface">
					<div ref={time} className="time">0.00</div>
				</div>
			</Html>
		</>
  );
}
