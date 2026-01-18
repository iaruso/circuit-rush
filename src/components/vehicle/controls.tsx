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

  const prevSpeedRef = useRef(speed)

  useFrame(() => {
    if (!vehicleApi || !chassisApi) return

    const keys = getKeys()
    if (!keys) return

    const { forward, backward, leftward, rightward, brake, reset } = keys

    // --- Report throttle, brake, and steering for DRS logic ---
    if (setThrottle) setThrottle(forward ? 1 : 0) // digital throttle, 1 if pressed
    if (setBrakePressed) setBrakePressed(!!brake)
    if (setSteerAngle) {
      // Base steering angle in radians
      let baseAngle = leftward ? 0.48 : rightward ? -0.48 : 0 // 20% more than 0.40
      // Speed-sensitive steering multiplier (100–300 km/h: 1.0x to 1.2x)
      const speedClamped = Math.max(100, Math.min(speed, 300))
      const speedMultiplier = 1.0 + ((speedClamped - 100) / 200) * 0.2
      baseAngle *= speedMultiplier
      setSteerAngle(baseAngle)
    }

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
      // Stronger auto-brake when not accelerating or reversing
      vehicleApi.applyEngineForce(0, 0)
      vehicleApi.applyEngineForce(0, 1)
      // Apply extra brake force to both rear wheels
      vehicleApi.setBrake(Math.abs(brakePower), 0)
      vehicleApi.setBrake(Math.abs(brakePower), 1)
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

    // --- Brake force scales from 10× to 100× engine force ---
    const maxEngineForce = Math.abs(forcePower)
    // Braking force scales up with speed: 10× at low speed, 100× at high speed
    const speedFactor = Math.min(100.0, 10.0 + (speed / 3))
    let maxBrakePerWheel = maxEngineForce * speedFactor
    // Cap at 100× engine force
    maxBrakePerWheel = Math.min(maxBrakePerWheel, maxEngineForce * 100.0)
    // Minimum is 10× engine force
    maxBrakePerWheel = Math.max(maxBrakePerWheel, maxEngineForce * 10.0)
    const brakeForce = Math.min(Math.abs(brakePower), maxBrakePerWheel) * brakeAmtRef.current
    vehicleApi.setBrake(brakeForce, 0)
    vehicleApi.setBrake(brakeForce, 1)

    // --- Downforce (F1 style) ---
    // Downforce increases with speed: F = k * v^2
    // k is a tunable constant (try 0.04 for F1 feel, adjust as needed)

    // Ackermann + speed-sensitive steering
    // 1. Inputs and Speed Sensitivity
    const maxBaseSteer = 0.40;
    const steerInput = leftward ? 1 : rightward ? -1 : 0;

    // Speed-sensitive multiplier (1.0x at 100km/h to 1.2x at 300km/h)
    const speedClamped = Math.max(100, Math.min(speed, 300));
    const speedMultiplier = 1.0 + ((speedClamped - 100) / 200) * 0.2;

    // Calculate the base target angle
    const targetAngle = steerInput * maxBaseSteer * speedMultiplier;

    // Smooth the steering transition (lerp)
    steerRef.current += (targetAngle - steerRef.current) * 0.25;

    // 2. Aggressive Ackermann Logic
    // To see the wheel gap like in your drawing, use 1.4 for Inner and 0.6 for Outer
    let leftSteer = 0;
    let rightSteer = 0;

    if (steerRef.current > 0) { 
      // TURNING LEFT: Left wheel is INNER (sharper), Right is OUTER (shallower)
      leftSteer = steerRef.current * 1.40; 
      rightSteer = steerRef.current * 0.60;
    } else if (steerRef.current < 0) { 
      // TURNING RIGHT: Right wheel is INNER (sharper), Left is OUTER (shallower)
      leftSteer = steerRef.current * 0.60;
      rightSteer = steerRef.current * 1.40;
    }

    // 3. Apply to Vehicle
    vehicleApi.setSteeringValue(leftSteer, 2);  // front-left
    vehicleApi.setSteeringValue(rightSteer, 3); // front-right

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
