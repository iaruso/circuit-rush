'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Object3D, Quaternion } from 'three'

type CameraMode = 'first-person' | 'third-person' | 'sky-view'

const CAMERA_MODES: CameraMode[] = ['third-person', 'first-person', 'sky-view']

type VehicleCameraProps = {
  target: React.RefObject<Object3D | null>
}

export default function VehicleCamera({ target }: VehicleCameraProps) {
  const { camera } = useThree()
  const [modeIndex, setModeIndex] = useState(0)
  const wasPressed = useRef(false)

  const work = useRef({
    vehiclePos: new Vector3(),
    targetPos: new Vector3(),
    lookAtPos: new Vector3(),
    worldQuat: new Quaternion(),
    vehicleDir: new Vector3(),
    flatDir: new Vector3(),
    up: new Vector3(0, 1, 0),
  })
  const offsets = useRef<Record<CameraMode, { offset: Vector3; lookOffset: Vector3; stabilizeHorizon: boolean }>>({
    'first-person': {
      offset: new Vector3(0, 0.8, 0.5),
      lookOffset: new Vector3(0, 0.6, 20),
      stabilizeHorizon: false,
    },
    'third-person': {
      offset: new Vector3(0, 3, -8),
      lookOffset: new Vector3(0, 1, 0),
      stabilizeHorizon: true,
    },
    'sky-view': {
      offset: new Vector3(0, 25, 0),
      lookOffset: new Vector3(0, 0, 0),
      stabilizeHorizon: true,
    },
  })

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyC' && !wasPressed.current) {
        wasPressed.current = true
        setModeIndex((prev) => (prev + 1) % CAMERA_MODES.length)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'KeyC') {
        wasPressed.current = false
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  useFrame(() => {
    if (!target.current) return

    const mode = CAMERA_MODES[modeIndex]
    const config = offsets.current[mode]
    const { vehiclePos, targetPos, lookAtPos, worldQuat, vehicleDir, flatDir, up } = work.current

    target.current.getWorldPosition(vehiclePos)
    target.current.getWorldQuaternion(worldQuat)
    vehicleDir.set(0, 0, 1).applyQuaternion(worldQuat)
    flatDir.copy(vehicleDir)
    flatDir.y = 0
    if (flatDir.lengthSq() < 0.0001) {
      flatDir.set(0, 0, 1)
    }
    flatDir.normalize()
    const forward = config.stabilizeHorizon ? flatDir : vehicleDir

    targetPos
      .copy(vehiclePos)
      .addScaledVector(up, config.offset.y)
      .addScaledVector(forward, config.offset.z)
      .addScaledVector(flatDir, config.offset.x)

    lookAtPos
      .copy(vehiclePos)
      .addScaledVector(up, config.lookOffset.y)
      .addScaledVector(forward, config.lookOffset.z)
      .addScaledVector(flatDir, config.lookOffset.x)

    camera.position.copy(targetPos)
    camera.lookAt(lookAtPos)
  })

  return null
}
