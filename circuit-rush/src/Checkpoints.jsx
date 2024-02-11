import { useRef, useEffect, useState } from 'react';
import { useBox } from '@react-three/cannon';
import { Html } from '@react-three/drei';
import { useFrame, addEffect } from '@react-three/fiber';
import useGame from './stores/Game.jsx';
import { useCallback } from 'react';
import gsap from 'gsap';

export default function Checkpoints({ checkpoint, setCheckpoint, isVolumeOn }) {
  const end = useGame((state) => state.end);
  const [checkpointSound] = useState(() => new Audio('./static/checkpoint.mp3'));
  const [lapSound] = useState(() => new Audio('./static/lap.mp3'));
  const [finishSound] = useState(() => new Audio('./static/finish.mp3'));
  const positions = [[-24, 2, -12], [6, 2, 44], [44, 2, -9]];
  const args = [[2, 4, 10], [2, 4, 10], [10, 4, 2]];
  const lapRef = useRef();
  const timeRef = useRef();
  var lap = 1;
  var currentCheckpoint = checkpoint;
  const [flag, setFlag] = useState(false);
  const [volumeStatus, setVolumeStatus] = useState(isVolumeOn);

  useEffect(() => {
    setVolumeStatus(isVolumeOn);
    console.log(isVolumeOn);
  }, [isVolumeOn]);

  useEffect(() => {
    checkpointSound.volume = volumeStatus ? 0.05 : 0;
  }, [volumeStatus, checkpointSound]);

  useEffect(() => {
    lapSound.volume = volumeStatus ? 0.4 : 0;
  }, [volumeStatus, lapSound]);

  useEffect(() => {
    finishSound.volume = volumeStatus ? 0.05 : 0;
  }, [volumeStatus, finishSound]);

  const checkpoints = positions.map((position, index) => {
    const [checkpoint] = useBox(() => ({
      isTrigger: true,
      args: args[index],
      position,
      onCollide: handleCollide(index),
    }));
    return checkpoint;
  });

  const playCheckpointSound = () => {
    checkpointSound.play();
  };

  const playLapSound = () => {
    lapSound.play();
  };

  const playFinishSound = () => {
    finishSound.play();
  };

  const handleCollide = useCallback(
    (index) => (e) => {
      console.log("Data: " + currentCheckpoint + "/" + lap)
      const { body } = e;
      if (body.userData.name === 'vehicle' && index === currentCheckpoint && !flag) {
        if (currentCheckpoint < 2) {
          playCheckpointSound();
        } else if (currentCheckpoint > 1 && lap < 3) {
          playLapSound();
          lap++;
        } else if (currentCheckpoint > 1 && lap === 3) {
          setFlag(true);
          playFinishSound();
          end();
        }
        setCheckpoint(index !== 2 ? index + 1 : 0);
        currentCheckpoint = index !== 2 ? index + 1 : 0;
      }
    },
    [checkpoint, setCheckpoint]
  );

  const { phase, startTime, endTime, pauseTime } = useGame((state) => state);

  useEffect(() => {
    const unsubscribeEffect = addEffect(() => {
      lapRef.current ? (lapRef.current.textContent = 'Lap ' + lap + '/3') : null;
    });
    return () => {
      unsubscribeEffect();
    };
  }, [lap]);

  useFrame(() => {
    let elapsedTime = 0;

    if (phase === 'playing') {
      elapsedTime = Date.now() - startTime;
    } else if (phase === 'ended') {
      elapsedTime = endTime - startTime;
    } else if (phase === 'paused') {
      elapsedTime = pauseTime - startTime;
    }

    const minutes = Math.floor((elapsedTime / 60000) % 60);
    const seconds = Math.floor((elapsedTime / 1000) % 60);
    const milliseconds = elapsedTime % 1000;

    const formattedTime = `${padWithZero(minutes)}:${padWithZero(seconds)}:${padWithZero(milliseconds, 3)}`;
    timeRef.current ? (timeRef.current.textContent = formattedTime) : null;

    function padWithZero(number, width = 2) {
      const paddedNumber = String(number);
      return paddedNumber.padStart(width, '0');
    }
  });

  const circuitStats = useRef();
  useEffect(() => {
    if (phase === "ended") {
      gsap.to(circuitStats.current, {
        opacity: 0,
        duration: 0.5,
      });
    }
  }, [phase]);

  return (
    <>
      <group>
        {checkpoints.map((checkpoint, index) => (
          <mesh key={index} ref={checkpoint} visible={false}></mesh>
        ))}
      </group>
      {phase !== "paused" ?
        <Html wrapperClass={'circuit-stats-overlay'} className="circuit-stats" ref={circuitStats}>
          <div ref={lapRef} className="circuit-lap"></div>
          <div ref={timeRef} className="circuit-time"></div>
        </Html>
        : null
      }
    </>
  );
}
