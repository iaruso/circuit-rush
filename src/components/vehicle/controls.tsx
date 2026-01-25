'use client'
import { useRef } from 'react'
import { useKeyboardControls } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'

type VehicleApi = {
  applyEngineForce: (force: number, wheelIndex: number) => void
  setBrake: (brake: number, wheelIndex: number) => void
  setSteeringValue: (value: number, wheelIndex: number) => void
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

  useFrame(() => {
    if (!vehicleApi || !chassisApi) return

    const keys = getKeys()
    if (!keys) return

    const { forward, backward, leftward, rightward, brake, reset } = keys

    if (setThrottle) setThrottle(forward ? 1 : 0)
    if (setBrakePressed) setBrakePressed(!!brake)
    if (setSteerAngle) {
      let baseAngle = leftward ? 0.48 : rightward ? -0.48 : 0
      const speedClamped = Math.max(100, Math.min(speed, 300))
      const speedMultiplier = 1.0 + ((speedClamped - 100) / 200) * 0.2
      baseAngle *= speedMultiplier
      setSteerAngle(baseAngle)
    }

    if (forward) {
      if (gear === 0) setReverseFlag(false)
      const steercomp = 1.0 - Math.abs(steerRef.current) * 0.3
      const f = -forcePower * steercomp
      vehicleApi.applyEngineForce(f, 0)
      vehicleApi.applyEngineForce(f, 1)
    } else if (backward) {
      const scale = speed > 25 ? 0.15 : speed > 10 ? 0.35 : 0.6
      const f = forcePower * scale
      if (gear === 0) setReverseFlag(true)
      vehicleApi.applyEngineForce(f, 0)
      vehicleApi.applyEngineForce(f, 1)
    } else {
      vehicleApi.applyEngineForce(0, 0)
      vehicleApi.applyEngineForce(0, 1)
      vehicleApi.setBrake(Math.abs(brakePower), 0)
      vehicleApi.setBrake(Math.abs(brakePower), 1)
    }

    const targetBrake = brake ? 1 : 0
    brakeAmtRef.current += (targetBrake - brakeAmtRef.current) * 0.2

    const maxEngineForce = Math.abs(forcePower)
    const speedFactor = Math.min(100.0, 10.0 + speed / 3)
    let maxBrakePerWheel = maxEngineForce * speedFactor
    maxBrakePerWheel = Math.min(maxBrakePerWheel, maxEngineForce * 100.0)
    maxBrakePerWheel = Math.max(maxBrakePerWheel, maxEngineForce * 10.0)
    const brakeForce = Math.min(Math.abs(brakePower), maxBrakePerWheel) * brakeAmtRef.current
    vehicleApi.setBrake(brakeForce, 0)
    vehicleApi.setBrake(brakeForce, 1)

    const maxBaseSteer = 0.40
    const steerInput = leftward ? 1 : rightward ? -1 : 0
    const speedMultiplier = 1 + speed / 1000
    const targetAngle = steerInput * maxBaseSteer * speedMultiplier
    steerRef.current += (targetAngle - steerRef.current) * 0.25

    let leftSteer = 0
    let rightSteer = 0
    if (steerRef.current > 0) {
      leftSteer = steerRef.current * 1.40
      rightSteer = steerRef.current * 0.60
    } else if (steerRef.current < 0) {
      leftSteer = steerRef.current * 0.60
      rightSteer = steerRef.current * 1.40
    }

    vehicleApi.setSteeringValue(leftSteer, 2)
    vehicleApi.setSteeringValue(rightSteer, 3)

    if (reset) {
      chassisApi.position.set(0, 0.7, 0)
      chassisApi.velocity.set(0, 0, 0)
      chassisApi.angularVelocity.set(0, 0, 0)
      chassisApi.rotation.set(0, 0, 0)
      for (let i = 0; i < 4; i++) {
        vehicleApi.setBrake(0, i)
        vehicleApi.applyEngineForce(0, i)
        vehicleApi.setSteeringValue(0, i)
      }
      brakeAmtRef.current = 0
      steerRef.current = 0
    }
  })
  return
}
