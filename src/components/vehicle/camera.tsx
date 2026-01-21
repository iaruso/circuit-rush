'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useKeyboardControls } from '@react-three/drei'
import { Vector3, Object3D, Quaternion } from 'three'

type CameraMode = 'first-person' | 'third-person' | 'sky-view'

const CAMERA_MODES: CameraMode[] = ['third-person', 'first-person', 'sky-view']

type VehicleCameraProps = {
  target: React.RefObject<Object3D | null>
}

export default function VehicleCamera({ target }: VehicleCameraProps) {
  const { camera } = useThree()
  const [modeIndex, setModeIndex] = useState(0)
  const [, getKeys] = useKeyboardControls()
  const wasPressed = useRef(false)

  // Smooth camera position
  const smoothPos = useRef(new Vector3())
  const smoothLookAt = useRef(new Vector3())

  // Handle camera toggle with debounce
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
    const vehiclePos = new Vector3()
    target.current.getWorldPosition(vehiclePos)

    // Get vehicle forward direction using world quaternion
    const worldQuat = new Quaternion()
    target.current.getWorldQuaternion(worldQuat)
    const vehicleDir = new Vector3(0, 0, 1)
    vehicleDir.applyQuaternion(worldQuat)

    let targetPos = new Vector3()
    let lookAtPos = new Vector3()

    switch (mode) {
      case 'first-person':
        // Inside the car, looking forward
        targetPos.copy(vehiclePos).add(new Vector3(0, 0.8, 0)).add(vehicleDir.clone().multiplyScalar(0.5))
        lookAtPos.copy(vehiclePos).add(vehicleDir.clone().multiplyScalar(20))
        break

      case 'third-person':
        // Behind and above the car
        targetPos.copy(vehiclePos).sub(vehicleDir.clone().multiplyScalar(8)).add(new Vector3(0, 3, 0))
        lookAtPos.copy(vehiclePos).add(new Vector3(0, 1, 0))
        break

      case 'sky-view':
        // High above looking down
        targetPos.copy(vehiclePos).add(new Vector3(0, 25, 0))
        lookAtPos.copy(vehiclePos)
        break
    }

    // Smooth camera movement
    const smoothFactor = mode === 'sky-view' ? 0.05 : 0.1
    smoothPos.current.lerp(targetPos, smoothFactor)
    smoothLookAt.current.lerp(lookAtPos, smoothFactor)

    camera.position.copy(smoothPos.current)
    camera.lookAt(smoothLookAt.current)
  })

  return null
}
