import { useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import { useFrame } from '@react-three/fiber';
import { Instance } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

export default function Cube({ i, position, rotation, color }) {
  const [cubeRef] = useBox(() => ({
    mass: 0.01,
    args: [1, 1, 1],
    position: position,
    rotation: rotation,
    restitution: 0.9,
    friction: 0.1,
  }));

  const cubeInstanceRef = useRef();

  const animateColor = () => {
    gsap.fromTo(
      cubeInstanceRef.current.color,
      {
        r: 1,
        g: 1,
        b: 1,
      },
      {
        r: 1,
        g: 0,
        b: 0,
        duration: 1,
        onComplete: () => {
          gsap.fromTo(
            cubeInstanceRef.current.color,
            {
              r: 1,
              g: 0,
              b: 0
            },
            {
              r: 1,
              g: 1,
              b: 1,
              duration: 1,
            onComplete: () => {
              animateColor();
            },
          });
        },
      }
    );
  };
  
  useEffect(() => {
    animateColor();
  }, []);  

  return (
    <>
      <Instance ref={(instance) => {
        cubeRef.current = instance;
        cubeInstanceRef.current = instance;
      }} key={`cube-${i}`} color={color} />
    </>
  );
}
