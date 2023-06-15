import { useRef, useEffect } from 'react';
import { Instance } from '@react-three/drei';
import gsap from 'gsap';

export default function Arrow({ position, rotation, index, color, refs }) {
  const arrowRef = useRef();
  const isFirstInteraction = useRef(true);

  useEffect(() => {
    const animateArrow = () => {
      const arrow = arrowRef.current.color;
      const delay = isFirstInteraction.current ? index * (1 / 7) : 1;
      gsap.to(arrow, {
        r: 1.0,
        g: 0.05,
        b: 0.05,
        duration: 0.5,
        delay: delay,
        onComplete: () => {
          gsap.to(arrow, {
            r: 0.8,
            g: 0.5,
            b: 0.5,
            duration: 0.5,
            onComplete: animateArrow,
          });
        },
      });
      isFirstInteraction.current = false;
    };

    animateArrow();
  }, [index]);

  return (
    <>
      <Instance
        index={index}
        position={position}
        rotation={rotation}
        receiveShadow
        castShadow
        color={color}
        ref={(instance) => {
          arrowRef.current = instance;
          refs.current = instance;
        }}
      />
    </>
  );
}