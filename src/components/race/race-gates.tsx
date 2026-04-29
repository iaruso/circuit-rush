'use client'

import { useRef } from 'react'
import { Html } from '@react-three/drei'
import { useBox, type CollideBeginEvent, type Triplet } from '@react-three/cannon'
import { useFrame } from '@react-three/fiber'
import type { Mesh, MeshBasicMaterial } from 'three'

export type RaceGateId = 'finish' | 'checkpoint-1' | 'checkpoint-2' | 'checkpoint-3'

type RaceGateConfig = {
  id: RaceGateId
  label: string
  position: Triplet
  args: Triplet
  color: string
}

const raceGates: RaceGateConfig[] = [
  {
    id: 'finish',
    label: 'Finish / Lap',
    position: [0, 1, -8],
    args: [1, 3, 12],
    color: '#22c55e',
  },
  {
    id: 'checkpoint-1',
    label: 'Checkpoint 1',
    position: [0, 1, -28],
    args: [12, 3, 1],
    color: '#f59e0b',
  },
  {
    id: 'checkpoint-2',
    label: 'Checkpoint 2',
    position: [16, 1, -28],
    args: [1, 3, 12],
    color: '#38bdf8',
  },
  {
    id: 'checkpoint-3',
    label: 'Checkpoint 3',
    position: [16, 1, -8],
    args: [12, 3, 1],
    color: '#f472b6',
  },
]

/**
 * Determine whether this gate is the "next" one the player should hit.
 */
function isNextGate(gateId: RaceGateId, checkpointIndex: number): boolean {
  if (gateId === 'finish') return checkpointIndex >= 3
  const num = Number(gateId.replace('checkpoint-', ''))
  return num === checkpointIndex + 1
}

type RaceGatesProps = {
  onGateHit: (gateId: RaceGateId) => void
  checkpointIndex: number
  finished: boolean
}

function RaceGate({
  gate,
  onGateHit,
  isActive,
}: {
  gate: RaceGateConfig
  onGateHit: (gateId: RaceGateId) => void
  isActive: boolean
}) {
  const lastHitAtRef = useRef(0)
  const materialRef = useRef<MeshBasicMaterial>(null)

  const [ref] = useBox<Mesh>(
    () => ({
      args: gate.args,
      collisionResponse: false,
      isTrigger: true,
      onCollideBegin: (event: CollideBeginEvent) => {
        if (event.body?.userData?.name !== 'vehicle') return

        const now = performance.now()
        if (now - lastHitAtRef.current < 500) return

        lastHitAtRef.current = now
        onGateHit(gate.id)
      },
      position: gate.position,
      type: 'Static',
      userData: { name: gate.id },
    }),
    undefined,
    [gate.id, onGateHit],
  )

  // Pulse opacity for the active gate
  useFrame(({ clock }) => {
    if (!materialRef.current) return
    if (isActive) {
      // Smooth pulse between 0.35 and 0.65
      materialRef.current.opacity = 0.5 + Math.sin(clock.elapsedTime * 4) * 0.15
    } else {
      materialRef.current.opacity = 0.15
    }
  })

  return (
    <mesh ref={ref} position={gate.position}>
      <boxGeometry args={gate.args} />
      <meshBasicMaterial
        ref={materialRef}
        color={gate.color}
        transparent
        opacity={isActive ? 0.5 : 0.15}
        depthWrite={false}
      />
      <Html center distanceFactor={16}>
        <div
          className={`whitespace-nowrap rounded px-2 py-1 text-xs font-bold transition-opacity ${
            isActive ? 'bg-black text-white opacity-100' : 'bg-black/60 text-white/60 opacity-60'
          }`}
        >
          {gate.label}
        </div>
      </Html>
    </mesh>
  )
}

export default function RaceGates({ onGateHit, checkpointIndex, finished }: RaceGatesProps) {
  return (
    <>
      {raceGates.map((gate) => (
        <RaceGate
          key={gate.id}
          gate={gate}
          onGateHit={onGateHit}
          isActive={!finished && isNextGate(gate.id, checkpointIndex)}
        />
      ))}
    </>
  )
}
