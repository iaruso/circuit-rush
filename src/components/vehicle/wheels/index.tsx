'use client'
import { useCompoundBody } from '@react-three/cannon'
import { type RefObject, useRef } from 'react'
import type { Group } from 'three'

export interface WheelInfo {
  radius: number
  directionLocal: [number, number, number]
  axleLocal: [number, number, number]
  suspensionStiffness: number
  suspensionRestLength: number
  frictionSlip: number
  dampingRelaxation: number
  dampingCompression: number
  maxSuspensionForce: number
  rollInfluence: number
  maxSuspensionTravel: number
  customSlidingRotationalSpeed: number
  useCustomSlidingRotationalSpeed: boolean
  chassisConnectionPointLocal: [number, number, number]
  isFrontWheel: boolean
  color?: string
}

export type WheelsReturn = [RefObject<Group | null>[], WheelInfo[]]

export const useWheels = (front: number, radius: number): WheelsReturn => {
  const wheels = [
    useRef<Group | null>(null),
    useRef<Group | null>(null),
    useRef<Group | null>(null),
    useRef<Group | null>(null),
  ]

  const wheelInfo = {
    radius,
    directionLocal: [0, -1, 0] as [number, number, number],
    axleLocal: [-1, 0, 0] as [number, number, number],
    // Slightly stiffer suspension to reduce front-end dive
    suspensionStiffness: 55,
    suspensionRestLength: 0.42,
    // Longitudinal tire grip on raycast (dry asphalt)
    frictionSlip: 9.0,
    // Damping
    dampingRelaxation: 6,
    dampingCompression: 4,
    maxSuspensionForce: 200000,
    // Less body roll
    rollInfluence: 0.05,
    maxSuspensionTravel: 0.25,
    // IMPORTANT: realistic value, helps 'free rolling' and prevents infinite drift
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
  }

  const wheelInfos: WheelInfo[] = [
    // 0 — REAR LEFT
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.7, 0.05, -front + 0.5],
      isFrontWheel: false,
      color: 'red',
    },
    // 1 — REAR RIGHT
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.7, 0.05, -front + 0.5],
      isFrontWheel: false,
      color: 'red',
    },
    // 2 — FRONT LEFT (slight adjustment: a bit less grip than rear)
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.7, 0.05, front - 0.5],
      isFrontWheel: true,
      frictionSlip: 8.5,
    },
    // 3 — FRONT RIGHT
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.7, 0.05, front - 0.5],
      isFrontWheel: true,
      frictionSlip: 8.5,
    },
  ]

  const propsFunc = () => ({
    collisionFilterGroup: 0,
    mass: 20,
    shapes: [
      {
        args: [wheelInfo.radius, wheelInfo.radius, 0.3, 32] as [number, number, number, number],
        rotation: [0, 0, Math.PI / 2] as [number, number, number],
        type: 'Cylinder' as const,
      },
    ],
    type: 'Kinematic' as const,
  })

  const propsFuncFront = () => ({
    collisionFilterGroup: 0,
    mass: 50,
    shapes: [
      {
        args: [wheelInfo.radius, wheelInfo.radius, 0.3, 32] as [number, number, number, number],
        rotation: [0, 0, Math.PI / 2] as [number, number, number],
        type: 'Cylinder' as const,
      },
    ],
    type: 'Kinematic' as const,
  })

  useCompoundBody(propsFunc, wheels[0])
  useCompoundBody(propsFunc, wheels[1])
  useCompoundBody(propsFuncFront, wheels[2])
  useCompoundBody(propsFuncFront, wheels[3])

  return [wheels, wheelInfos]
}
