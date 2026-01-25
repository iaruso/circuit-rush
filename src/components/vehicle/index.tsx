'use client'
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Vector3, type Object3D, type Group } from 'three'
import { useBox, useRaycastVehicle } from '@react-three/cannon'
import { useWheels } from './wheels'
import { Wheel } from './wheels/wheel'
import { useVehicleControls } from './controls'
import VehicleCamera from './camera'
import { useControls } from '@/context/use-controls'
import { getTransmissionData, getSteeringAngles } from '@/lib/vehicle/calc'
import { shouldDeactivateDrs } from '@/lib/vehicle/controls'

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max))

export default function Vehicle() {
  const [obstacleRef] = useBox(() => ({
    args: [200, 2, 2],
    friction: 0,
    restitution: 1,
    position: [0, 1, -10],
    type: 'Static',
    userData: { name: 'obstacle' },
  }))

  const [drsEnabled, setDrsEnabled] = useState(false)
  const [steerAngle, setSteerAngle] = useState(0)
  const topSpeedKmh = drsEnabled ? 360 : 340
  const { controls } = useControls()
  const [speed, setSpeed] = useState<number>(0)
  const [gear, setGear] = useState<number>(0)
  const [forcePower, setForce] = useState<number>(0)
  const [brakePower, setBrake] = useState<number>(0)
  const [reverseFlag, setReverseFlag] = useState<boolean>(false)
  const [transmission, setTransmission] = useState<string>('N')
  const [gearProgressBar, setGearProgress] = useState<number>(0)
  const velocityRef = useRef(new Vector3())
  const tempVec = useRef(new Vector3())

  const chassisBodyArgs: [number, number, number] = [
    controls.vehicle.body.vehicleSize[2],
    controls.vehicle.body.vehicleSize[1],
    controls.vehicle.body.vehicleSize[0],
  ]

  const chassisRef = useRef<Object3D>(null)
  const [chassisBody, chassisApi] = useBox(
    () => ({
      allowSleep: false,
      args: chassisBodyArgs,
      mass: controls.vehicle.body.mass,
      position: [0, 1, 0],
      rotation: [0, Math.PI, 0] as [number, number, number],
      userData: { name: 'vehicle' },
    }),
    chassisRef,
  )

  const [wheels, wheelInfos] = useWheels(
    controls.vehicle.body.vehicleSize[0] / 2,
    controls.vehicle.body.wheels.wheelSize[0],
  )

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
      velocityRef.current.set(velocity[0], velocity[1], velocity[2])
      setSpeed(Math.round(velocityRef.current.length() * 3.6))
    })
    return unsubscribe
  }, [chassisApi.velocity])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === 'KeyN') setDrsEnabled(true)
      if (event.code === 'KeyM') setDrsEnabled(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  const gearRatios = [
    controls.vehicle.gears.gearRatio1,
    controls.vehicle.gears.gearRatio2,
    controls.vehicle.gears.gearRatio3,
    controls.vehicle.gears.gearRatio4,
    controls.vehicle.gears.gearRatio5,
    controls.vehicle.gears.gearRatio6,
    controls.vehicle.gears.gearRatio7,
    controls.vehicle.gears.gearRatio8,
  ]
  const finalDrive = controls.vehicle.gears.finalDrive
  const wheelRadius = 0.33
  const drivelineEff = 0.92
  const redline = 15000
  const idle = 1500
  const drivenWheels = [0, 1]
  const gearSpeedLimits = [105, 135, 165, 195, 230, 275, 315, 360]

  const mu = 1.7
  const g = 9.81
  const mass = controls.vehicle.body.mass
  const virtualMass = 200
  const rearFracStatic = 0.55

  function rpmFromSpeedKmh(speedKmh: number, gearIndex: number) {
    const v = Math.max(speedKmh, 0) / 3.6
    const wheelOmega = v / wheelRadius
    const overall = gearRatios[gearIndex] * finalDrive
    const engineOmega = wheelOmega * overall
    const rpm = (engineOmega * 60) / (2 * Math.PI)
    return Math.min(Math.max(rpm, idle), redline)
  }

  function torqueAtRPM(rpm: number, throttle: number) {
    const peak = 950
    const base = 500
    const mid = 12500
    const spread = 5000
    const shape = Math.exp(-Math.pow((rpm - mid) / spread, 2))
    return throttle * (base + (peak - base) * shape)
  }

  const rearLoadPerWheel = (mass * 1.5 * g * rearFracStatic) / 2
  const frontLoadPerWheel = (mass * 1.5 * g * (1 - rearFracStatic)) / 2
  function clampByGrip(force: number, isRear: boolean) {
    const N = isRear ? rearLoadPerWheel : frontLoadPerWheel
    const Fmax = mu * N
    return clamp(force, -Fmax, Fmax)
  }

  function engineForcePerDrivenWheel(speedKmh: number, gearIndex: number) {
    const rpm = rpmFromSpeedKmh(speedKmh, gearIndex)
    const T = torqueAtRPM(rpm, 1)
    const overall = gearRatios[gearIndex] * finalDrive
    const F_total = ((T * overall * drivelineEff) / wheelRadius) * (mass / virtualMass)
    return clampByGrip(F_total / drivenWheels.length, true)
  }

  const brakeBiasFront = 0.60
  const brakeBiasRear = 0.30
  function brakeForcePerWheelMax(isRear: boolean) {
    const Ftarget = 15000 * (isRear ? brakeBiasRear : brakeBiasFront) * (mass / virtualMass)
    return clampByGrip(Ftarget, isRear)
  }

  const [rpmState, setRpmState] = useState<number>(idle)
  useFrame(() => {
    if (!drsEnabled && speed > topSpeedKmh && chassisApi.velocity) {
      const currentSpeed = velocityRef.current.length()
      if (currentSpeed > 0) {
        const decel = Math.max(topSpeedKmh / 3.6, currentSpeed * 0.98)
        tempVec.current.copy(velocityRef.current).setLength(decel)
        chassisApi.velocity.set(tempVec.current.x, tempVec.current.y, tempVec.current.z)
      }
    } else if (drsEnabled && speed > topSpeedKmh && chassisApi.velocity) {
      const currentSpeed = velocityRef.current.length()
      if (currentSpeed > 0) {
        tempVec.current.copy(velocityRef.current).setLength(topSpeedKmh / 3.6)
        chassisApi.velocity.set(tempVec.current.x, tempVec.current.y, tempVec.current.z)
      }
    }

    let currentGear = gear
    const { min: gearMin, max: gearMax } = getTransmissionData(speed, currentGear + 1)
    if (speed > gearMax && currentGear < gearRatios.length - 1) {
      currentGear += 1
    }
    if (currentGear > -1 && speed < gearMin) {
      currentGear -= 1
    }
    currentGear = clamp(currentGear, -1, gearRatios.length - 1)

    let estRpm = idle
    if (currentGear >= 0) {
      estRpm = rpmFromSpeedKmh(speed, currentGear)
    } else if (currentGear === -1) {
      estRpm = rpmFromSpeedKmh(speed, 0)
    }

    const drivePerWheelMax = engineForcePerDrivenWheel(speed, currentGear)
    const brakeScale = Math.max(0.18, 0.45 - (speed / 400) ** 2)
    const maxBrakePerWheel = 15000
    const steering = getSteeringAngles(steerAngle, speed)
    const steerFactor = Math.max(0.5, 1 - Math.abs(steering.base) / 0.7)
    const brakeFrontMax = Math.min(brakeForcePerWheelMax(false) * brakeScale * steerFactor, maxBrakePerWheel)
    const brakeRearMax = Math.min(brakeForcePerWheelMax(true) * brakeScale * steerFactor, maxBrakePerWheel)
    const brakePerWheelAvg = Math.abs((2 * brakeFrontMax + 2 * brakeRearMax) / 4)

    setGear(currentGear)
    setRpmState(estRpm)
    setForce(drivePerWheelMax)
    setBrake(brakePerWheelAvg)
    setTransmission(reverseFlag ? 'R' : (currentGear + 1).toString())

    const upshiftRpm = 13500
    const effectiveGear = Math.max(0, currentGear)
    const gearMinSpeed = effectiveGear === 0 ? 0 : gearSpeedLimits[effectiveGear - 1]
    const minRpm = rpmFromSpeedKmh(gearMinSpeed, effectiveGear)
    const progress = 50 + ((estRpm - minRpm) / (upshiftRpm - minRpm)) * 50
    setGearProgress(clamp(progress, 50, 100))

    if (shouldDeactivateDrs(brakePower, steering.base * 30)) {
      setDrsEnabled(false)
    }
  })

  useVehicleControls({
    vehicleApi,
    chassisApi,
    speed,
    gear,
    forcePower,
    brakePower,
    setReverseFlag,
    setSteerAngle,
  })

  return (
    <>
      <Html position={[1, 1.5, 0]} style={{ color: 'white', fontSize: '1.2em', textAlign: 'center' }}>
        <div>
          <div>Speed: {speed} km/h</div>
          <div>
            Gear: {transmission} ({gear})
          </div>
          <div>RPM: {Math.round(rpmState)}</div>
          <div>Force: {Math.round(forcePower)} N</div>
          <div>Brake: {Math.round(brakePower)} N</div>
          <div>Progress: {gearProgressBar.toFixed(1)}%</div>
          <div>DRS: {drsEnabled ? 'ENABLED' : 'OFF'}</div>
        </div>
      </Html>
      <mesh ref={obstacleRef} position={[0, 1, -10]}>
        <boxGeometry args={[200, 2, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <group ref={vehicle} name="vehicle">
        <group ref={chassisBody} matrixWorldNeedsUpdate={true}>
          <mesh>
            <boxGeometry args={chassisBodyArgs} />
            <meshBasicMaterial wireframe color="#98ADDD" />
          </mesh>
        </group>
        <Wheel wheelRef={wheels[0]} color={wheelInfos[0]?.color} />
        <Wheel wheelRef={wheels[1]} color={wheelInfos[1]?.color} />
        <Wheel wheelRef={wheels[2]} color={wheelInfos[2]?.color} />
        <Wheel wheelRef={wheels[3]} color={wheelInfos[3]?.color} />
      </group>
      <VehicleCamera target={chassisRef} />
    </>
  )
}
