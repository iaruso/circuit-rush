'use client'
import { memo } from 'react'
import {
  Grid,
  Center,
  AccumulativeShadows,
  RandomizedLight,
  Environment,
  Outlines,
  Stats,
  KeyboardControls,
} from '@react-three/drei'
import { Physics, type PlaneProps, usePlane } from '@react-three/cannon'
import { Canvas } from '@react-three/fiber'
import { useControls } from '@/context/use-controls'
import Vehicle from './vehicle'

const keyboardMap = [
  { name: 'forward', keys: ['ArrowUp', 'KeyW'] },
  { name: 'backward', keys: ['ArrowDown', 'KeyS'] },
  { name: 'leftward', keys: ['ArrowLeft', 'KeyA'] },
  { name: 'rightward', keys: ['ArrowRight', 'KeyD'] },
  { name: 'brake', keys: ['Space'] },
  { name: 'reset', keys: ['KeyR'] },
  { name: 'cameraToggle', keys: ['KeyC'] },
]

function Plane(props: PlaneProps) {
  const [ref] = usePlane(() => ({
    type: 'Static',
    rotation: [-Math.PI / 2, 0, 0],
    restitution: 0.02,
    friction: 1.0,
    ...props,
  }))

  return (
    <mesh ref={ref} rotation={[-Math.PI / 2, 0, 0]} visible={false}>
      <planeGeometry args={[200, 200]} />
    </mesh>
  )
}

export default function Scene() {
  const { controls } = useControls()

  return (
    <KeyboardControls map={keyboardMap}>
      <Canvas shadows={'basic'}>
        <Stats showPanel={0} className='stats' />
        <color attach='background' args={['#405CB0']} />
        <group position={[0, -0.5, 0]}>
          <Center top position={[-2, 0, 2]}>
            <mesh castShadow>
              <sphereGeometry args={[0.5, 64, 64]} />
              <meshStandardMaterial color='#98ADDD' />
              <Outlines thickness={3} color='#E5EAF6' />
            </mesh>
          </Center>
          <Center top position={[2.5, 0, 1]}>
            <mesh castShadow rotation={[0, Math.PI / 4, 0]}>
              <boxGeometry args={[0.7, 0.7, 0.7]} />
              <meshStandardMaterial color='#98ADDD' />
              <Outlines thickness={3} color='#E5EAF6' />
            </mesh>
          </Center>
          <Grid position={[0, -0.01, 0]} args={controls.scene.grid.size} {...controls.scene.grid} />
          <Shadows />
          <Physics
            gravity={[0, -9.81, 0]}
            broadphase={'SAP'}
            allowSleep={true}
            iterations={12}
            tolerance={0.001}
            defaultContactMaterial={{
              friction: 0.001,
              restitution: 0,
              contactEquationStiffness: 1e8,
              contactEquationRelaxation: 3,
            }}
          >
            <Vehicle />
            <Plane />
          </Physics>
        </group>
        <Environment preset='city' />
      </Canvas>
    </KeyboardControls>
  )
}

const Shadows = memo(() => (
  <AccumulativeShadows temporal frames={60} color='#E5EAF6' colorBlend={0.5} alphaTest={0.9} scale={20}>
    <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
  </AccumulativeShadows>
))

Shadows.displayName = 'Shadows'
