'use client'
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import { Vector3, type Object3D, type Group } from 'three'
import { useBox, useRaycastVehicle } from '@react-three/cannon'
import { useWheels } from './wheels'
import { Wheel } from './wheels/wheel'
import { useVehicleControls } from './controls'
import { useControls } from '@/context/use-controls'

export default function Vehicle() {
  const { controls } = useControls()
  const [speed, setSpeed] = useState<number>(0)       // km/h
  const [gear, setGear] = useState<number>(0)         // gear index (0 = N, 1 = 1st, etc.)
  const [forcePower, setForce] = useState<number>(0)  // maximum force per driven wheel (rear) available
  const [brakePower, setBrake] = useState<number>(0)  // maximum braking force per wheel (average with bias)
  const [reverseFlag, setReverseFlag] = useState<boolean>(false)
  const [transmission, setTransmission] = useState<string>('N')
  const [gearProgressBar, setGearProgress] = useState<number>(0) // % of redline
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const v = new Vector3()

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
      indexForwardAxis: 2, // Z-axis
      wheelInfos,
      wheels,
    }),
    vehicleRef,
  )

  useEffect(() => {
    const unsubscribe = chassisApi.velocity.subscribe((velocity: [number, number, number]) => {
      const newSpeed = Math.round(v.set(...velocity).length() * 3.6) // m/s -> km/h
      setSpeed(newSpeed)
    })
    return unsubscribe
  }, [chassisApi.velocity, v])

  const gearRatios = [controls.vehicle.gears.gearRatio1, 2.40, 1.90, 1.60, 1.30, 1.05, 0.85]
  const finalDrive = 3.50
  const wheelRadius = 0.33              // 330mm
  const drivelineEff = 0.92             // transmission efficiency
  const redline = 15000                 // rpm
  const idle = 1500                     // rpm
  const drivenWheels = [0, 1]           // rear wheels (0,1 = rear; 2,3 = front)

  // Approximate grip
  const mu = 1.7
  const g = 9.81
  const mass = controls.vehicle.body.mass
  const rearFracStatic = 0.55

  function rpmFromSpeedKmh(speedKmh: number, gearIndex: number) {
    const v = Math.max(speedKmh, 0) / 3.6         // m/s
    const wheelOmega = v / wheelRadius            // rad/s
    const overall = gearRatios[gearIndex] * finalDrive
    const engineOmega = wheelOmega * overall      // rad/s
    const rpm = (engineOmega * 60) / (2 * Math.PI)
    return Math.min(Math.max(rpm, idle), redline)
  }

  // Simplified torque curve (peak ~600Nm near 11k rpm)
  function torqueAtRPM(rpm: number, throttle: number) {
    const peak = 600
    const base = 250
    const mid = 11000
    const spread = 3500
    const shape = Math.exp(-Math.pow((rpm - mid) / spread, 2))
    return throttle * (base + (peak - base) * shape)
  }

  // Grip limit (maximum longitudinal force per wheel)
  const rearLoadPerWheel = (mass * g * rearFracStatic) / 2
  const frontLoadPerWheel = (mass * g * (1 - rearFracStatic)) / 2
  function clampByGrip(force: number, isRear: boolean) {
    const N = isRear ? rearLoadPerWheel : frontLoadPerWheel
    const Fmax = mu * N
    return Math.max(Math.min(force, Fmax), -Fmax)
  }

  // Engine force available per driven wheel (assuming throttle=1 to calculate “maximum”)
  function engineForcePerDrivenWheel(speedKmh: number, gearIndex: number) {
    const rpm = rpmFromSpeedKmh(speedKmh, gearIndex)
    const T = torqueAtRPM(rpm, 1) // throttle=1 (maximum potential). The hook scales this by actual input.
    const overall = gearRatios[gearIndex] * finalDrive
    const F_total = (T * overall * drivelineEff) / wheelRadius
    const perWheel = F_total / drivenWheels.length
    return clampByGrip(perWheel, true) // limit by grip at the rear
  }

  // Braking per wheel (we expose an “average” with 60/40 bias; the hook applies per axle)
  const brakeBiasFront = 0.60
  const brakeBiasRear = 0.40
  function brakeForcePerWheelMax(isRear: boolean) {
    const Ftarget = 15000 * (isRear ? brakeBiasRear : brakeBiasFront)
    return clampByGrip(Ftarget, isRear)
  }

  const [rpmState, setRpmState] = useState<number>(idle)
  useFrame(() => {
    let currentGear = gear
    let estRpm = rpmFromSpeedKmh(speed, currentGear)
    const upshiftRpm = 12500
    const downshiftRpm = 7000

    if (estRpm > upshiftRpm && currentGear < gearRatios.length - 1) currentGear += 1
    if (estRpm < downshiftRpm && currentGear > 0) currentGear -= 1

    estRpm = rpmFromSpeedKmh(speed, currentGear)

    const drivePerWheelMax = engineForcePerDrivenWheel(speed, currentGear)
    const brakeFrontMax = brakeForcePerWheelMax(false)
    const brakeRearMax = brakeForcePerWheelMax(true)
    const brakePerWheelAvg = Math.abs((2 * brakeFrontMax + 2 * brakeRearMax) / 4)

    setGear(currentGear)
    setRpmState(estRpm)
    setForce(drivePerWheelMax)
    setBrake(brakePerWheelAvg)
    setTransmission(reverseFlag ? 'R' : (currentGear + 1).toString())
    setGearProgress(Math.min(100, Math.max(0, (estRpm / redline) * 100)))
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
      <Html
        position={[1, 1.5, 0]}
        style={{ color: 'white', fontSize: '1.2em', textAlign: 'center' }}
      >
        <div>
          <div>Speed: {speed} km/h</div>
          <div>Gear: {transmission} ({gear})</div>
          <div>RPM: {Math.round(rpmState)}</div>
          <div>Force: {Math.round(forcePower)} N</div>
          <div>Brake: {Math.round(brakePower)} N</div>
          <div>Progress: {gearProgressBar.toFixed(1)}%</div>
        </div>
      </Html>
      <group ref={vehicle} name='vehicle'>
        <group ref={chassisBody} matrixWorldNeedsUpdate={true}>
          <mesh>
            <boxGeometry args={chassisBodyArgs} />
            <meshBasicMaterial wireframe color='#98ADDD' />
          </mesh>
        </group>
        <Wheel wheelRef={wheels[0]} color={wheelInfos[0]?.color}  />
        <Wheel wheelRef={wheels[1]} color={wheelInfos[1]?.color} />
        <Wheel wheelRef={wheels[2]} color={wheelInfos[2]?.color} />
        <Wheel wheelRef={wheels[3]} color={wheelInfos[3]?.color} />
      </group>
    </>
  )
}
