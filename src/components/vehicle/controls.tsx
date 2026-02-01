'use client'
import { useEffect, useRef } from 'react'
import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))
const MAX_STEER_DEG = 40
const MAX_STEER_RAD = (MAX_STEER_DEG * Math.PI) / 180
const SLIDE_FORCE_MULTIPLIER = 0.2

type VehicleApi = {
  applyEngineForce: (force: number, wheelIndex: number) => void
  setBrake: (brake: number, wheelIndex: number) => void
  setSteeringValue: (value: number, wheelIndex: number) => void
  sliding: {
    subscribe: (callback: (sliding: boolean) => void) => void | (() => void)
  }
}

type ChassisApi = {
  position: { set: (...args: number[]) => void }
  velocity: { set: (x: number, y: number, z: number) => void }
  angularVelocity: { set: (x: number, y: number, z: number) => void }
  rotation: { set: (...args: number[]) => void }
}

type VehicleControlsProps = {
  vehicleApi: VehicleApi
  chassisApi: ChassisApi
  speed: number
  gear: number
  forcePower: number
  brakePower: number
  setReverseFlag: (flag: boolean) => void
  setThrottle?: (t: number) => void
  setBrakePressed?: (b: boolean) => void
  setSteerAngle?: (a: number) => void
}

export const useVehicleControls = ({
  vehicleApi,
  chassisApi,
  speed,
  gear,
  forcePower,
  brakePower,
  setReverseFlag,
  setThrottle,
  setBrakePressed,
  setSteerAngle,
}: VehicleControlsProps) => {
  const [, getKeys] = useKeyboardControls()
  const brakeAmtRef = useRef(0)
  const steerRef = useRef(0)
  const slidingRef = useRef(false)

  useEffect(() => {
    if (!vehicleApi?.sliding) return
    const unsubscribe = vehicleApi.sliding.subscribe((sliding) => {
      slidingRef.current = sliding
    })
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe()
    }
  }, [vehicleApi])

  useFrame(() => {
    if (!vehicleApi || !chassisApi) return

    const keys = getKeys()
    if (!keys) return

    const { forward, backward, leftward, rightward, brake, reset } = keys

    const steerInput = leftward ? 1 : rightward ? -1 : 0
    const steerSpeedMultiplier = 1 + Math.min(speed, 300) / 1000
    const targetSteer = clamp(
      steerInput * MAX_STEER_RAD * steerSpeedMultiplier,
      -MAX_STEER_RAD,
      MAX_STEER_RAD,
    )

    if (setThrottle) setThrottle(forward ? 1 : 0)
    if (setBrakePressed) setBrakePressed(!!brake)
    if (setSteerAngle) {
      setSteerAngle(targetSteer)
    }

    if (forward) {
      if (gear === 0) setReverseFlag(false)
      const steercomp = 1.0 - Math.abs(steerRef.current) * 0.3
      const f = -forcePower * steercomp * 1.4
      const slideBoost = slidingRef.current ? f * SLIDE_FORCE_MULTIPLIER : 0
      vehicleApi.applyEngineForce(f + slideBoost, 0)
      vehicleApi.applyEngineForce(f + slideBoost, 1)
    } else if (backward) {
      const scale = speed > 25 ? 0.15 : speed > 10 ? 0.35 : 0.6
      const f = forcePower * scale
      const slideBoost = slidingRef.current ? f * SLIDE_FORCE_MULTIPLIER : 0
      if (gear === 0) setReverseFlag(true)
      vehicleApi.applyEngineForce(f + slideBoost, 0)
      vehicleApi.applyEngineForce(f + slideBoost, 1)
    } else {
      vehicleApi.applyEngineForce(0, 0)
      vehicleApi.applyEngineForce(0, 1)
    }

    const targetBrake = brake ? 1 : 0
    brakeAmtRef.current += (targetBrake - brakeAmtRef.current) * 0.2

    const maxEngineForce = Math.abs(forcePower)
    const speedFactor = Math.min(100.0, 10.0 + speed / 3)
    let maxBrakePerWheel = maxEngineForce * speedFactor
    maxBrakePerWheel = Math.min(maxBrakePerWheel, maxEngineForce * 100.0)
    maxBrakePerWheel = Math.max(maxBrakePerWheel, maxEngineForce * 10.0)
    const slideBrakeMultiplier = slidingRef.current ? 0.5 : 1
    const brakeForce =
      Math.min(Math.abs(brakePower), maxBrakePerWheel) * brakeAmtRef.current * slideBrakeMultiplier
    vehicleApi.setBrake(brakeForce, 0)
    vehicleApi.setBrake(brakeForce, 1)

    steerRef.current += (targetSteer - steerRef.current) * 0.25
    vehicleApi.setSteeringValue(steerRef.current, 2)
    vehicleApi.setSteeringValue(steerRef.current, 3)

    if (reset) {
      chassisApi.position.set(0, 0.7, 0)
      chassisApi.velocity.set(0, 0, 0)
      chassisApi.angularVelocity.set(0, 0, 0)
      chassisApi.rotation.set(0, 0, 0)
      for (let i = 0; i < 4; i++) {
        vehicleApi.setBrake(0, i)
        vehicleApi.setSteeringValue(0, i)
      }
      brakeAmtRef.current = 0
      steerRef.current = 0
    }
  })
  return
}
