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
import { getTransmissionData, getAeroModifiers, getSteeringAngles } from '@/lib/vehicle/calc'
import { shouldDeactivateDrs } from '@/lib/vehicle/controls'

export default function Vehicle() {
  const [obstacleRef] = useBox(() => ({
    args: [200, 2, 2],
    friction: 0, // no friction so it doesn't stick
    restitution: 1, // realistic bounce, prevents sticking
    position: [0, 1, -10],
    type: 'Static',
    userData: { name: 'obstacle' },
  }))

  const [drsEnabled, setDrsEnabled] = useState(false)
  const [throttle, setThrottle] = useState(1)
  const [brakePressed, setBrakePressed] = useState(false)
  const [steerAngle, setSteerAngle] = useState(0)
  // DRS: 340 km/h default, 360 km/h with DRS
  const topSpeedKmh = drsEnabled ? 360 : 340
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

  // Use all 8 gear ratios from controls
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
  const wheelRadius = 0.33              // 330mm
  const drivelineEff = 0.92             // transmission efficiency
  const redline = 15000                 // rpm
  const idle = 1500                     // rpm
  const drivenWheels = [0, 1]           // rear wheels (0,1 = rear; 2,3 = front)
  // 2026 F1 optimized gear speed thresholds (km/h)
  // Quick tip: Set final drive so rev limiter is hit at 358-360 km/h in 8th gear
  const gearSpeedLimits = [
    105,  // 1st: 0–105
    135,  // 2nd: 105–135
    165,  // 3rd: 135–165
    195,  // 4th: 165–195
    230,  // 5th: 195–230
    275,  // 6th: 230–275
    315,  // 7th: 275–315
    360,  // 8th: 315–360+
  ]

  // Approximate grip
  const mu = 1.7
  const g = 9.81
  const mass = controls.vehicle.body.mass
  const virtualMass = 200 // for acceleration/braking only
  const rearFracStatic = 0.55

  function rpmFromSpeedKmh(speedKmh: number, gearIndex: number) {
    const v = Math.max(speedKmh, 0) / 3.6         // m/s
    const wheelOmega = v / wheelRadius            // rad/s
    const overall = gearRatios[gearIndex] * finalDrive
    let rpm: number;

    const engineOmega = wheelOmega * overall;
    rpm = (engineOmega * 60) / (2 * Math.PI);
    rpm = Math.min(Math.max(rpm, idle), redline);

    return rpm;
  }

  // F1-like torque curve (broader, more high-RPM power)
  function torqueAtRPM(rpm: number, throttle: number) {
    const peak = 950
    const base = 500
    const mid = 12500
    const spread = 5000 // broader curve for more high-RPM power
    const shape = Math.exp(-Math.pow((rpm - mid) / spread, 2))
    return throttle * (base + (peak - base) * shape)
  }

  // Grip limit (maximum longitudinal force per wheel)
  const rearLoadPerWheel = (mass * 1.5 * g * rearFracStatic) / 2
  const frontLoadPerWheel = (mass * 1.5 * g * (1 - rearFracStatic)) / 2
  function clampByGrip(force: number, isRear: boolean) {
    const N = isRear ? rearLoadPerWheel : frontLoadPerWheel
    const Fmax = mu * N
    return Math.max(Math.min(force, Fmax), -Fmax)
  }

  // Engine force available per driven wheel (assuming throttle=1 to calculate “maximum”)
  function engineForcePerDrivenWheel(speedKmh: number, gearIndex: number) {
    // Use virtual mass for force calculation (simulate lighter car for acceleration)
    const rpm = rpmFromSpeedKmh(speedKmh, gearIndex)
    const T = torqueAtRPM(rpm, 1)
    const overall = gearRatios[gearIndex] * finalDrive
    // Scale force as if car is lighter
    const F_total = ((T * overall * drivelineEff) / wheelRadius) * (mass / virtualMass)
    const perWheel = F_total / drivenWheels.length
    return clampByGrip(perWheel, true)
  }

  // Braking per wheel (we expose an “average” with 60/40 bias; the hook applies per axle)
  const brakeBiasFront = 0.60
  const brakeBiasRear = 0.30 // More front bias for stability
  function brakeForcePerWheelMax(isRear: boolean) {
    // Use virtual mass for braking (simulate lighter car for braking)
    const Ftarget = 15000 * (isRear ? brakeBiasRear : brakeBiasFront) * (mass / virtualMass)
    return clampByGrip(Ftarget, isRear)
  }

  const [rpmState, setRpmState] = useState<number>(idle)
  useFrame(() => {
    // Keyboard DRS control (N = enable, M = disable, for testing)
    if (typeof window !== 'undefined') {
      window.onkeydown = (e) => {
        if (e.code === 'KeyN') setDrsEnabled(true)
        if (e.code === 'KeyM') setDrsEnabled(false)
      }
    }

    // --- DRS/Active Aero Logic ---
    // Only manual DRS toggle for now (N = enable, M = disable)
    // --- Synchronous hard speed limiter ---
    // Smooth speed limiter for DRS off
    if (!drsEnabled && speed > topSpeedKmh && chassisApi.velocity && typeof chassisApi.velocity.set === 'function') {
      // If above 340, gently decelerate
      if (v.length() > 0) {
        // Calculate new speed with gentle deceleration (e.g., 2% per frame)
        const decel = Math.max(topSpeedKmh / 3.6, v.length() * 0.98)
        const clamped = v.clone().setLength(decel)
        chassisApi.velocity.set(clamped.x, clamped.y, clamped.z)
      }
    } else if (drsEnabled && speed > topSpeedKmh && chassisApi.velocity && typeof chassisApi.velocity.set === 'function') {
      // DRS on: hard clamp to 360
      if (v.length() > 0) {
        const clamped = v.clone().setLength(topSpeedKmh / 3.6)
        chassisApi.velocity.set(clamped.x, clamped.y, clamped.z)
      }
    }
    let currentGear = gear
    // Speed limits:
    // No DRS: ~315 km/h
    // With DRS: ~340 km/h
    // With DRS+Boost: ~360 km/h

    // Upshift if above current gear's max speed
    const { min: gearMin, max: gearMax } = getTransmissionData(speed, currentGear + 1)
    // Upshift if above current gear's max speed
    if (speed > gearMax && currentGear < gearRatios.length - 1) {
      currentGear += 1
    }
    // Downshift if below previous gear's min speed (allow neutral and reverse)
    if (currentGear > -1 && speed < gearMin) {
      currentGear -= 1
    }

    // Clamp gear to valid range: -1 (reverse), 0 (neutral), 1+ (forward)
    currentGear = Math.max(-1, Math.min(currentGear, gearRatios.length - 1))

    // Use correct ratio for reverse/neutral
    let estRpm = idle
    if (currentGear >= 0) {
      estRpm = rpmFromSpeedKmh(speed, currentGear)
    } else if (currentGear === -1) {
      // Reverse gear: use first gear ratio
      estRpm = rpmFromSpeedKmh(speed, 0)
    }
    const drivePerWheelMax = engineForcePerDrivenWheel(speed, currentGear)
    // Flatten brake force curve for more consistent braking
    // Less aggressive at low speeds, still drops at high speed
    const brakeScale = Math.max(0.18, 0.45 - (speed / 400) ** 2)
    // Cap max brake force per wheel to 7000N (F1 is ~12-15kN, but scale for sim)
    const maxBrakePerWheel = 15000
    // Reduce brake force at high steering angles to prevent drifting
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
    // Progress: 50% at min RPM for gear, 100% at upshift RPM
    const upshiftRpm = 13500
    const gearMinSpeed = gear === 0 ? 0 : gearSpeedLimits[gear - 1]
    const minRpm = rpmFromSpeedKmh(gearMinSpeed, gear)
    // Map minRpm to 50%, upshiftRpm to 100%
    let progress = 50 + ((estRpm - minRpm) / (upshiftRpm - minRpm)) * 50
    setGearProgress(Math.min(100, Math.max(50, progress)))

    // DRS auto-deactivation using pure controls logic
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
    setThrottle,
    setBrakePressed,
    setSteerAngle,
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
          <div>DRS: {drsEnabled ? 'ENABLED' : 'OFF'}</div>
        </div>
      </Html>
      <mesh ref={obstacleRef} position={[0, 1, -10]}>
        <boxGeometry args={[200, 2, 2]} />
        <meshStandardMaterial color='orange' />
      </mesh>
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
      <VehicleCamera target={chassisRef} />
    </>
  )
}
