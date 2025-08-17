'use client'
import { useState } from 'react'
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
  const [isBrakePressed, setIsBrakePressed] = useState(false)

  let rearForce = 0

  useFrame(() => {
    if (!vehicleApi || !chassisApi) return

    const keys = getKeys()
    if (!keys) return

    const { forward, backward, leftward, rightward, brake, reset } = keys

    if (forward) {
      if (gear === 0) setReverseFlag(false)
      vehicleApi.applyEngineForce(-forcePower, 0)
      vehicleApi.applyEngineForce(-forcePower, 1)
    } else if (backward) {
      rearForce = speed > 20 ? forcePower / 10 : forcePower / 2
      if (gear === 0) setReverseFlag(true)
      vehicleApi.applyEngineForce(rearForce, 0)
      vehicleApi.applyEngineForce(rearForce, 1)
    } else {
      vehicleApi.applyEngineForce(0, 0)
      vehicleApi.applyEngineForce(0, 1)
    }

    if (brake && !isBrakePressed) {
      setIsBrakePressed(true)
      vehicleApi.setBrake(brakePower, 0)
      vehicleApi.setBrake(brakePower, 1)
    } else if (!brake && isBrakePressed) {
      setIsBrakePressed(false)
      vehicleApi.setBrake(0, 0)
      vehicleApi.setBrake(0, 1)
    }

    if (leftward) {
      vehicleApi.setSteeringValue(0.4, 2)
      vehicleApi.setSteeringValue(0.4, 3)
    } else if (rightward) {
      vehicleApi.setSteeringValue(-0.4, 2)
      vehicleApi.setSteeringValue(-0.4, 3)
    } else {
      for (let i = 0; i < 4; i++) {
        vehicleApi.setSteeringValue(0, i)
      }
    }

    if (reset) {
      chassisApi.position.set(0, 0.7, 0)
      chassisApi.velocity.set(0, 0, 0)
      chassisApi.angularVelocity.set(0, 0, 0)
      chassisApi.rotation.set(0, 0, 0)
    }
  })

  return
}
