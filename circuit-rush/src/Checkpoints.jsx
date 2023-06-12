import { useRef, useEffect, useState } from 'react';
import { useBox } from '@react-three/cannon';
import { Html } from '@react-three/drei';
import { addEffect } from '@react-three/fiber';
import useGame from './stores/Game.jsx';
import { useCallback } from 'react';

export default function Checkpoints({checkpoint, setCheckpoint}) {
  const positions = [[-24, 2, -12], [6, 2, 44], [44, 2, -9]];
  const args = [[2, 4, 10], [2, 4, 10], [10, 4, 2]];
  const lapRef = useRef();
	const timeRef = useRef();
	var lap = 1;
	var flag = false;
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

  var checkpoint2 = checkpoint;

  const handleCollide = useCallback(
    (index) => (e) => {
      const { body } = e;

      if (body.userData.name === 'vehicle' && index === checkpoint2 && !flag) {
        if (checkpoint2 > 1 && lap < 3) {
          lap++;
          console.log('Lap ' + lap);
        } else if (checkpoint2 > 1 && lap === 3) {
          console.log('Finish');
					flag = true;
        }
        index !== 2 ? setCheckpoint(index + 1) : setCheckpoint(0);
				index !== 2 ? checkpoint2 = index + 1 : checkpoint2 = 0;
        console.log(checkpoint2);
      }
    },
    [checkpoint, setCheckpoint]
  );
  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      const state = useGame.getState();
      let elapsedTime = 0;
      if (state.phase === 'playing') elapsedTime = Date.now() - state.startTime;
      else if (state.phase === 'ended') elapsedTime = state.endTime - state.startTime;

      const minutes = Math.floor((elapsedTime / 60000) % 60);
      const seconds = Math.floor((elapsedTime / 1000) % 60);
      const milliseconds = elapsedTime % 1000;

      const formattedTime = `${padWithZero(minutes)}:${padWithZero(seconds)}:${padWithZero(milliseconds, 3)}`;
      timeRef.current ? timeRef.current.textContent = formattedTime : null;
			lapRef.current ? lapRef.current.textContent = 'Lap ' + lap + '/3' : null;
    });

    function padWithZero(number, width = 2) {
      const paddedNumber = String(number);
      return paddedNumber.padStart(width, '0');
    }

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
      <group>
        <Html wrapperClass={'circuit-stats-overlay'} className='circuit-stats'>
          <div ref={lapRef} className="circuit-lap"></div>
          <div ref={timeRef} className="circuit-time"></div>
        </Html>
      </group>
    </>
  );
}
