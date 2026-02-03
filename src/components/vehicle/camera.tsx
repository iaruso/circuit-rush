'use client'
import { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Vector3, Object3D, Quaternion } from 'three'

type CameraMode = 'first-person' | 'third-person' | 'sky-view'

const CAMERA_MODES: CameraMode[] = ['third-person', 'first-person', 'sky-view']

type VehicleCameraProps = {
  target: React.RefObject<Object3D | null>
}

type CameraConfig = {
  offset: Vector3
  lookOffset: Vector3
  stabilizeHorizon: boolean
  velocityInfluence: number
  slideStrength: number
  maxSlide: number
  slideDamp: number
  lookSlide: number
  followDamp: number
  forwardDamp: number
}

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

export default function VehicleCamera({ target }: VehicleCameraProps) {
  const { camera } = useThree()
  const [modeIndex, setModeIndex] = useState(0)
  const wasPressed = useRef(false)

  const work = useRef({
    vehiclePos: new Vector3(),
    prevPos: new Vector3(),
    targetPos: new Vector3(),
    lookAtPos: new Vector3(),
    worldQuat: new Quaternion(),
    vehicleDir: new Vector3(),
    flatDir: new Vector3(),
    vel: new Vector3(),
    velFlat: new Vector3(),
    velDir: new Vector3(),
    desiredForward: new Vector3(),
    forward: new Vector3(),
    right: new Vector3(),
    up: new Vector3(0, 1, 0),
    smoothTarget: new Vector3(),
    smoothLook: new Vector3(),
    slide: 0,
    hasPrev: false,
    hasForward: false,
    hasSmooth: false,
  })
  const offsets = useRef<Record<CameraMode, CameraConfig>>({
    'first-person': {
      offset: new Vector3(0, 0.8, 0.5),
      lookOffset: new Vector3(0, 0.6, 20),
      stabilizeHorizon: false,
      velocityInfluence: 0,
      slideStrength: 0,
      maxSlide: 0,
      slideDamp: 0,
      lookSlide: 0,
      followDamp: 0,
      forwardDamp: 0,
    },
    'third-person': {
      offset: new Vector3(0, 3, -8),
      lookOffset: new Vector3(0, 1, 0),
      stabilizeHorizon: true,
      velocityInfluence: 1,
      slideStrength: 0.18,
      maxSlide: 4,
      slideDamp: 6,
      lookSlide: 0.8,
      followDamp: 12,
      forwardDamp: 10,
    },
    'sky-view': {
      offset: new Vector3(0, 10, -15),
      lookOffset: new Vector3(0, 0, 10),
      stabilizeHorizon: true,
      velocityInfluence: 1,
      slideStrength: 0.4,
      maxSlide: 10,
      slideDamp: 8,
      lookSlide: 1.2,
      followDamp: 14,
      forwardDamp: 10,
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

  useFrame((_, delta) => {
    if (!target.current) return

    const mode = CAMERA_MODES[modeIndex]
    const config = offsets.current[mode]
    const {
      vehiclePos,
      prevPos,
      targetPos,
      lookAtPos,
      worldQuat,
      vehicleDir,
      flatDir,
      vel,
      velFlat,
      velDir,
      desiredForward,
      forward,
      right,
      up,
      smoothTarget,
      smoothLook,
    } = work.current

    target.current.getWorldPosition(vehiclePos)
    target.current.getWorldQuaternion(worldQuat)
    vehicleDir.set(0, 0, 1).applyQuaternion(worldQuat)
    flatDir.copy(vehicleDir)
    flatDir.y = 0
    if (flatDir.lengthSq() < 0.0001) {
      flatDir.set(0, 0, 1)
    }
    flatDir.normalize()

    if (!work.current.hasPrev) {
      prevPos.copy(vehiclePos)
      work.current.hasPrev = true
    }

    if (delta > 0) {
      vel.copy(vehiclePos).sub(prevPos).divideScalar(delta)
    } else {
      vel.set(0, 0, 0)
    }
    prevPos.copy(vehiclePos)

    velFlat.copy(vel)
    velFlat.y = 0
    const velFlatSq = velFlat.lengthSq()
    if (velFlatSq > 0.01) {
      velDir.copy(velFlat).normalize()
    } else {
      velDir.copy(flatDir)
    }

    desiredForward.copy(config.stabilizeHorizon ? flatDir : vehicleDir)
    if (config.velocityInfluence > 0 && velFlatSq > 0.01) {
      desiredForward.lerp(velDir, clamp(config.velocityInfluence, 0, 1)).normalize()
    } else {
      desiredForward.normalize()
    }

    if (!work.current.hasForward) {
      forward.copy(desiredForward)
      work.current.hasForward = true
    } else {
      const forwardLerp = config.forwardDamp > 0 ? 1 - Math.exp(-config.forwardDamp * delta) : 1
      forward.lerp(desiredForward, clamp(forwardLerp, 0, 1)).normalize()
    }

    right.copy(up).cross(forward)
    if (right.lengthSq() < 0.0001) {
      right.set(1, 0, 0)
    } else {
      right.normalize()
    }

    const lateralSpeed = velFlatSq > 0.01 ? velFlat.dot(right) : 0
    const targetSlide = clamp(lateralSpeed * config.slideStrength, -config.maxSlide, config.maxSlide)
    const slideRamp = clamp(delta * config.slideDamp, 0, 1)
    work.current.slide += (targetSlide - work.current.slide) * slideRamp

    targetPos
      .copy(vehiclePos)
      .addScaledVector(up, config.offset.y)
      .addScaledVector(forward, config.offset.z)
      .addScaledVector(right, config.offset.x)
      .addScaledVector(right, work.current.slide)

    lookAtPos
      .copy(vehiclePos)
      .addScaledVector(up, config.lookOffset.y)
      .addScaledVector(forward, config.lookOffset.z)
      .addScaledVector(right, config.lookOffset.x)
      .addScaledVector(right, work.current.slide * config.lookSlide)

    if (!work.current.hasSmooth) {
      smoothTarget.copy(targetPos)
      smoothLook.copy(lookAtPos)
      work.current.hasSmooth = true
    }
    const followLerp = config.followDamp > 0 ? 1 - Math.exp(-config.followDamp * delta) : 1
    smoothTarget.lerp(targetPos, clamp(followLerp, 0, 1))
    smoothLook.lerp(lookAtPos, clamp(followLerp, 0, 1))

    camera.position.copy(smoothTarget)
    camera.lookAt(smoothLook)
  })

  return null
}
