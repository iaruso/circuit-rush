'use client'
import { memo, useCallback, useEffect, useRef } from 'react'
import {
  AccumulativeShadows,
  Environment,
  Grid,
  KeyboardControls,
  OrbitControls,
  RandomizedLight,
  Stats,
} from '@react-three/drei'
import { Physics, type PlaneProps, usePlane } from '@react-three/cannon'
import { Canvas } from '@react-three/fiber'
import { useControls } from '@/context/use-controls'
import { useRaceSession } from '@/hooks/use-race-session'
import RaceGates from './race/race-gates'
import RaceHud from './race/race-hud'
import FinishScreen from './race/finish-screen'
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

const physicsProps = {
  gravity: [0, -9.81, 0] as [number, number, number],
  broadphase: 'SAP' as const,
  allowSleep: true,
  iterations: 12,
  tolerance: 0.001,
  defaultContactMaterial: {
    friction: 0.001,
    restitution: 0,
    contactEquationStiffness: 1e8,
    contactEquationRelaxation: 3,
  },
}

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

import Obstacles from './race/obstacles'

export default function Scene() {
  const { controls } = useControls()
  const vehicleResetRef = useRef<(() => void) | null>(null)

  const {
    raceState,
    currentLapElapsedMs,
    currentSpeedKmh,
    topSpeedKmh,
    storedStats,
    isPaused,
    handleGateHit,
    handleSpeedChange,
    restartRace,
    togglePause,
  } = useRaceSession()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyP') {
        togglePause()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePause])

  const handleRestart = useCallback(() => {
    restartRace()
    vehicleResetRef.current?.()
  }, [restartRace])

  const handleVehicleResetReady = useCallback((resetFn: () => void) => {
    vehicleResetRef.current = resetFn
  }, [])

  return (
    <div className="relative h-full w-full">
      {isPaused && !raceState.finished && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <h2 className="text-6xl font-extrabold tracking-tight text-white drop-shadow-xl">
            PAUSED
          </h2>
        </div>
      )}
      {raceState.finished ? (
        <FinishScreen
          lapTimesMs={raceState.lapTimesMs}
          bestLapMs={storedStats.bestLapMs}
          topSpeedKmh={topSpeedKmh}
          onRestart={handleRestart}
        />
      ) : (
        <RaceHud
          bestLapMs={storedStats.bestLapMs}
          checkpointIndex={raceState.checkpointIndex}
          currentLap={raceState.currentLap}
          currentLapElapsedMs={currentLapElapsedMs}
          currentSpeedKmh={currentSpeedKmh}
          finished={raceState.finished}
          lapTimesMs={raceState.lapTimesMs}
          status={raceState.status}
          topSpeedKmh={topSpeedKmh}
          onRestart={handleRestart}
          isPaused={isPaused}
          onTogglePause={togglePause}
        />
      )}
      <KeyboardControls map={keyboardMap}>
        <Canvas camera={{ position: [24, 28, 34], fov: 45 }} shadows="basic">
          <OrbitControls target={[8, 0, -18]} />
          <Stats showPanel={0} className="stats" />
          <color attach="background" args={['#405CB0']} />
          <group position={[0, -0.5, 0]}>
            <Grid position={[0, -0.01, 0]} args={controls.scene.grid.size} {...controls.scene.grid} />
            <Shadows />
            <Physics {...physicsProps} isPaused={isPaused}>
              <Vehicle
                onSpeedChange={handleSpeedChange}
                onResetReady={handleVehicleResetReady}
              />
              <RaceGates
                onGateHit={handleGateHit}
                checkpointIndex={raceState.checkpointIndex}
                finished={raceState.finished}
              />
              <Obstacles />
              <Plane />
            </Physics>
          </group>
          <Environment preset="city" />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}

const Shadows = memo(() => (
  <AccumulativeShadows temporal frames={60} color="#E5EAF6" colorBlend={0.5} alphaTest={0.9} scale={20}>
    <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
  </AccumulativeShadows>
))

Shadows.displayName = 'Shadows'
