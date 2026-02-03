'use client'
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, useGLTF, Decal, useTexture } from '@react-three/drei'
import { Vector3, type Object3D, type Group } from 'three'
import { useBox, useRaycastVehicle } from '@react-three/cannon'
import { useWheels } from './wheels'
import { Wheel } from './wheels/wheel'
import { useVehicleControls } from './controls'
import VehicleCamera from './camera'
import { useControls } from '@/context/use-controls'
import { getSteeringAngles } from '@/lib/vehicle/calc'
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
  const topSpeedKmh = 220
  const { controls } = useControls()
  const [speed, setSpeed] = useState<number>(0)
  const [gear, setGear] = useState<number>(0)
  const [forcePower, setForce] = useState<number>(0)
  const [brakePower, setBrake] = useState<number>(0)
  const [reverseFlag, setReverseFlag] = useState<boolean>(false)
  const [transmission, setTransmission] = useState<string>('N')
  const [throttle, setThrottle] = useState<number>(0)
  const [throttlePct, setThrottlePct] = useState<number>(0)
  const velocityRef = useRef(new Vector3())
  const tempVec = useRef(new Vector3())
  const driveForceRef = useRef(0)
  const carModel = useGLTF('/car.glb')
  const carRevModel = useGLTF('/car-test-compressed.glb')
  // const texture = useTexture('/rev.png')

  const chassisBodyArgs: [number, number, number] = [2.4,1.2,4]

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

  const wheelRadius = 0.33
  const drivenWheels = [0, 1]
  const motorMaxRpm = 20000
  const maxDriveForceTotal = 18000

  const mu = 1.7
  const g = 9.81
  const mass = controls.vehicle.body.mass
  const rearFracStatic = 0.55

  function motorRpmFromSpeedKmh(speedKmh: number) {
    const v = Math.max(speedKmh, 0) / 3.6
    const wheelOmega = v / wheelRadius
    const rpm = (wheelOmega * 60) / (2 * Math.PI)
    const boosted = rpm * 2
    return clamp(boosted, 0, motorMaxRpm)
  }

  const rearLoadPerWheel = (mass * 1.5 * g * rearFracStatic) / 2
  const frontLoadPerWheel = (mass * 1.5 * g * (1 - rearFracStatic)) / 2
  function clampByGrip(force: number, isRear: boolean) {
    const N = isRear ? rearLoadPerWheel : frontLoadPerWheel
    const Fmax = mu * N
    return clamp(force, -Fmax, Fmax)
  }

  function motorForcePerDrivenWheel(throttleInput: number, speedKmh: number) {
    const ratio = clamp(speedKmh / topSpeedKmh, 0, 1)
    const speedFactor = clamp(1 - ratio * ratio, 0.15, 1)
    const F_total = maxDriveForceTotal * throttleInput * speedFactor
    return clampByGrip(F_total / drivenWheels.length, true)
  }

  const brakeBiasFront = 0.60
  const brakeBiasRear = 0.30
  function brakeForcePerWheelMax(isRear: boolean) {
    const Ftarget = 15000 * (isRear ? brakeBiasRear : brakeBiasFront) * (mass / 1)
    return clampByGrip(Ftarget, isRear)
  }

  const [rpmState, setRpmState] = useState<number>(0)
  useFrame((_, delta) => {
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

    const currentGear = 0
    const estRpm = motorRpmFromSpeedKmh(speed)
    const targetDrivePerWheel = motorForcePerDrivenWheel(throttle, speed)
    const ramp = clamp(delta * 2.5, 0, 1)
    driveForceRef.current += (targetDrivePerWheel - driveForceRef.current) * ramp
    const brakeScale = Math.max(0.18, 0.45 - (speed / 400) ** 2)
    const maxBrakePerWheel = 15000
    const steering = getSteeringAngles(steerAngle, speed)
    const steerFactor = Math.max(0.5, 1 - Math.abs(steering.base) / 0.7)
    const brakeFrontMax = Math.min(brakeForcePerWheelMax(false) * brakeScale * steerFactor, maxBrakePerWheel)
    const brakeRearMax = Math.min(brakeForcePerWheelMax(true) * brakeScale * steerFactor, maxBrakePerWheel)
    const brakePerWheelAvg = Math.abs((2 * brakeFrontMax + 2 * brakeRearMax) / 4)

    setGear(currentGear)
    setRpmState(estRpm)
    setForce(driveForceRef.current)
    setBrake(brakePerWheelAvg)
    setTransmission(reverseFlag ? 'R' : throttle > 0 ? '1' : 'N')
    setThrottlePct(clamp(throttle * 100, 0, 100))

    const steeringDeg = (steering.base * 180) / Math.PI
    if (shouldDeactivateDrs(brakePower, steeringDeg)) {
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
    setSteerAngle,
  })

  return (
    <>
      <mesh ref={obstacleRef} position={[0, 1, -10]}>
        <boxGeometry args={[200, 2, 2]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <group ref={vehicle} name="vehicle">
        
        <group ref={chassisBody} matrixWorldNeedsUpdate={true}>
          <Html style={{ color: 'white', fontSize: '1.2em', textAlign: 'center' }}>
            <div>
              <div>Speed: {speed} km/h</div>
              <div>
                Gear: {transmission}
              </div>
              <div>Motor RPM: {Math.round(rpmState)}</div>
              <div>Drive Force: {Math.round(forcePower * drivenWheels.length)} N</div>
              <div>Brake: {Math.round(brakePower)} N</div>
              <div>Throttle: {throttlePct.toFixed(0)}%</div>
              <div>DRS: {drsEnabled ? 'ENABLED' : 'OFF'}</div>
            </div>
          </Html>
          {/* <primitive
            object={carModel.scene}
            scale={[1, 1, 1]}
            position={[0, -0.5, 0]}
          /> */}
          <mesh
            // @ts-expect-error
            geometry={carRevModel.nodes.Renault_R5_Turbo_3E.geometry}
            // @ts-expect-error
            material={carRevModel.nodes.Renault_R5_Turbo_3E.material}
            scale={[0.25, 0.25, 0.25]}
            position={[0, 0, 0]}
            rotation={[-Math.PI/2, Math.PI, 0]}
            material-transparent={true}
            material-opacity={0.5}
            >
            {/* <Decal
              debug // Makes "bounding box" of the decal visible
              position={[0, 0, -4]} // Position of the decal
              rotation={[0, 0, 0]} // Rotation of the decal (can be a vector or a degree in radians)
              scale={1} // Scale of the decal
            >
              <meshBasicMaterial
                map={texture}
                polygonOffset
                polygonOffsetFactor={-1}
              />
            </Decal> */}
          </mesh>
          <mesh>
            <boxGeometry args={chassisBodyArgs} />
            <meshBasicMaterial
              visible={true}
              transparent={true}
              opacity={0.5}
            />
          </mesh>
        </group>
        <Wheel wheelRef={wheels[0]} color={wheelInfos[0]?.color} />
        <Wheel wheelRef={wheels[1]} color={wheelInfos[1]?.color} />
        <Wheel wheelRef={wheels[2]} color={wheelInfos[2]?.color} />
        <Wheel wheelRef={wheels[3]} color={wheelInfos[3]?.color} />
      </group>
      {/* <VehicleCamera target={chassisRef} /> */}
    </>
  )
}
