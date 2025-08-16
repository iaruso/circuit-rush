'use client'
import { memo } from 'react'
import {
  Grid,
  Center,
  AccumulativeShadows,
  RandomizedLight,
  OrbitControls,
  Environment,
  Outlines,
  Stats
  //useGLTF
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { useControls } from 'leva'

export default function Scene() {
  const { gridSize, ...gridConfig } = useControls({
    gridSize: [10, 10],
    cellSize: { value: 0.5, min: 0, max: 10, step: 0.1 },
    cellThickness: { value: 1, min: 0, max: 5, step: 0.1 },
    cellColor: '#E5EAF6',
    sectionSize: { value: 2.5, min: 0, max: 10, step: 0.1 },
    sectionThickness: { value: 1.5, min: 0, max: 5, step: 0.1 },
    sectionColor: '#E5EAF6',
    fadeDistance: { value: 25, min: 0, max: 100, step: 1 },
    fadeStrength: { value: 1, min: 0, max: 1, step: 0.1 },
    followCamera: false,
    infiniteGrid: true
  })
  return (
      <Canvas
        shadows={'basic'}
      >
        <Stats showPanel={0} className='stats' />
        <color attach='background' args={['#405CB0']} />
        <group position={[0, -0.5, 0]}>
        <Center top position={[-2, 0, 2]}>
          <mesh castShadow>
            <sphereGeometry args={[0.5, 64, 64]} />
            <meshStandardMaterial color='#98ADDD' />
            <Outlines thickness={3} color='#E5EAF6'/>
          </mesh>
        </Center>
        <Center top position={[2.5, 0, 1]}>
          <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color='#98ADDD' />
            <Outlines thickness={3} color='#E5EAF6' />
          </mesh>
        </Center>
        <Grid position={[0, -0.01, 0]} args={gridSize} {...gridConfig} />
        <Shadows />
      </group>
      <OrbitControls makeDefault />
      <Environment preset='city' />
      </Canvas>
  );
}

const Shadows = memo(() => (
  <AccumulativeShadows temporal frames={60} color='#E5EAF6' colorBlend={0.5} alphaTest={0.9} scale={20}>
    <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
  </AccumulativeShadows>
));

Shadows.displayName = 'Shadows';
