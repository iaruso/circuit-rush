'use client'
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, type Object3D, type Group } from 'three'
import { useBox, useRaycastVehicle } from '@react-three/cannon'
import { useWheels } from './wheels'
import { Wheel } from './wheels/wheel'
import { useVehicleControls } from './controls'

export default function Vehicle() {
  const [speed, setSpeed] = useState<number>(0)
  const [gear, setGear] = useState<number>(0)
  const [forcePower, setForce] = useState<number>(0)
  const [brakePower, setBrake] = useState<number>(0)
  const [reverseFlag, setReverseFlag] = useState<boolean>(false)
  const [transmission, setTransmission] = useState<string>('N')
  const [gearProgressBar, setGearProgress] = useState<number>(0)
  const v = new Vector3()

  const position: [number, number, number] = [0, 1, 0]
  const width = 2
  const height = 0.45
  const front = 1.7
  const radius = 0.25

  const chassisBodyArgs: [number, number, number] = [width, height, front * 2]
  const chassisRef = useRef<Object3D>(null)
  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      args: chassisBodyArgs,
      mass: 1000,
      position,
      rotation: [0, Math.PI, 0] as [number, number, number],
      userData: {
        name: 'vehicle',
      },
    }),
    chassisRef,
  )

  const [wheels, wheelInfos] = useWheels(front, radius)

  const vehicleRef = useRef<Group>(null)
  const [vehicle, vehicleApi] = useRaycastVehicle(
    () => ({
      chassisBody,
      indexForwardAxis: 2,
      wheelInfos,
      wheels,
    }),
    vehicleRef,
  )

  useEffect(() => {
    const unsubscribe = chassisApi.velocity.subscribe((velocity: [number, number, number]) => {
      const newSpeed = Math.round(v.set(...velocity).length() * 3.6)
      setSpeed(newSpeed)
    })
    return unsubscribe
  }, [chassisApi.velocity, v])

  const engineForces = [3000, 3200, 2800, 2400, 1600, 1600, 0]
  const brakeForces = [10, 20, 30, 40, 50, 50, 0]
  const maxSpeeds = [1, 20, 40, 65, 90, 160, 180]
  let currentGear = 0

  useFrame(() => {
    for (let i = 0; i < maxSpeeds.length + 1; i++) {
      if (speed <= maxSpeeds[i]) {
        currentGear = i
        break
      }
    }

    const gearPowerScale = currentGear >= 1 && currentGear <= 2 ? 0.5 : 0.8
    const gearPowerRange = currentGear >= 1 && currentGear <= 2 ? 0.5 : 0.2
    const gearSpeedRange =
      currentGear === 0 ? maxSpeeds[currentGear] : maxSpeeds[currentGear] - maxSpeeds[currentGear - 1]
    const speedWithinGearRange = currentGear === 0 ? speed : speed - maxSpeeds[currentGear - 1]
    const gearProgress =
      speed === 1
        ? 2.5
        : (reverseFlag && speed > 20) || speed >= 160
          ? 100
          : (speedWithinGearRange / gearSpeedRange) * 100
    const gearPower = gearPowerScale + gearPowerRange * gearProgress
    const scaledEngineForce = engineForces[currentGear] * gearPower

    setGear(currentGear)
    setForce(scaledEngineForce * 0.1)
    setBrake(brakeForces[currentGear] * 10)
    setTransmission(reverseFlag ? 'R' : gear === 0 ? '1' : gear === 6 ? '5' : gear.toString())
    setGearProgress(gearProgress)
  })

  useVehicleControls({
    vehicleApi,
    chassisApi,
    speed,
    gear,
    forcePower,
    brakePower,
    setReverseFlag,
  })

  return (
    <>
      <group ref={vehicle} name='vehicle'>
        <group ref={chassisBody} matrixWorldNeedsUpdate={true}>
          <mesh>
            <boxGeometry args={chassisBodyArgs} />
            <meshBasicMaterial wireframe color='#98ADDD' />
          </mesh>
        </group>
    <Wheel wheelRef={wheels[0]} color={wheelInfos[0]?.color} />
    <Wheel wheelRef={wheels[1]} color={wheelInfos[1]?.color} />
    <Wheel wheelRef={wheels[2]} color={wheelInfos[2]?.color} />
    <Wheel wheelRef={wheels[3]} color={wheelInfos[3]?.color} />
      </group>
    </>
  )
}
