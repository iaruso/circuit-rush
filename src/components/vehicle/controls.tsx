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
}

export const useVehicleControls = ({
  vehicleApi,
  chassisApi,
  speed,
  gear,
  forcePower,
  brakePower,
  setReverseFlag,
}: VehicleControlsProps) => {
  const [, getKeys] = useKeyboardControls()

  const brakeAmtRef = useRef(0)
  const steerRef = useRef(0)

  const prevSpeedRef = useRef(speed)

  useFrame(() => {
    if (!vehicleApi || !chassisApi) return

    const keys = getKeys()
    if (!keys) return

    const { forward, backward, leftward, rightward, brake, reset } = keys

    if (forward) {
      if (gear === 0) setReverseFlag(false)
      const f = -forcePower
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
    }
    const targetBrake = brake ? 1 : 0

    // ramp with speed: less aggressive at low speed, stronger at high speed
    // 0.35 at ~30 km/h -> 1.00 at 160+ km/h
    const speedK = Math.min(speed / 160, 1)
    const speedScale = 0.35 + 0.65 * speedK

    // smoothing (simple lerp)
    brakeAmtRef.current += (targetBrake - brakeAmtRef.current) * 0.2

    // estimate a deceleration (km/h per frame) to moderate the front if it's "diving"
    const decel = Math.max(prevSpeedRef.current - speed, 0)
    prevSpeedRef.current = speed

    // anti-dive: when the instant deceleration is large, slightly reduce the front
    // (0..1 -> 0 means no cut; 1 means maximum cut defined below)
    const diveFactor = Math.min(decel / 12, 1) // adjust 12 according to your timestep and "feel"
    const frontDiveCut = 0.25 * diveFactor     // up to -25% front force reduction on strong deceleration

    // base bias (front/rear) + anti-dive correction
    const baseFrontBias = 0.58
    const baseRearBias = 0.42
    const frontBias = Math.max(0, baseFrontBias - frontDiveCut)
    const rearBias = Math.max(0, baseRearBias + frontDiveCut)

    // final force per wheel (average per wheel) — Vehicle already limits by grip when calculating brakePower
    const frontPerWheel = Math.abs(brakePower) * speedScale * frontBias
    const rearPerWheel  = Math.abs(brakePower) * speedScale * rearBias

    const frontBrake = frontPerWheel * brakeAmtRef.current
    const rearBrake  = rearPerWheel  * brakeAmtRef.current

    // console.log(forcePower) // This needs rework, use setBrake as friction
    // apply continuously per frame (all wheels)
    // rear (0,1)
    vehicleApi.setBrake(forcePower / 1000 * 5, 0)
    vehicleApi.setBrake(forcePower / 1000 * 5, 1)
    // front (2,3)
    vehicleApi.setBrake(frontBrake * 0.15, 2)
    vehicleApi.setBrake(frontBrake * 0.15, 3)

    const steerTarget = leftward ? 0.40 : rightward ? -0.40 : 0
    steerRef.current += (steerTarget - steerRef.current) * 0.25
    console.log(steerRef.current.toFixed(2))
    vehicleApi.setSteeringValue(steerRef.current < 0 ? steerRef.current * 0.33 : steerRef.current, 2) // left
    vehicleApi.setSteeringValue(steerRef.current > 0 ? steerRef.current * 0.33 : steerRef.current, 3) // right

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
      prevSpeedRef.current = 0
    }
  })
  return
}
