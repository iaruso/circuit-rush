'use client'
import { useCompoundBody } from '@react-three/cannon'
import { type MutableRefObject, useRef } from 'react'
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

export type WheelsReturn = [MutableRefObject<Group | null>[], WheelInfo[]]

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
    suspensionStiffness: 50,
    suspensionRestLength: 0.5,
    frictionSlip: 5,
    dampingRelaxation: 2.5,
    dampingCompression: 10,
    maxSuspensionForce: 200000,
    rollInfluence: 0.01,
    maxSuspensionTravel: 0.25,
    customSlidingRotationalSpeed: -100000,
    useCustomSlidingRotationalSpeed: true,
  }

  const wheelInfos: WheelInfo[] = [
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.7, 0.05, -front + 0.5],
      isFrontWheel: false,
      color: 'red'
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.7, 0.05, -front + 0.5],
      isFrontWheel: false,
      color: 'red'
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [-0.7, 0.05, front - 0.5],
      isFrontWheel: true,
    },
    {
      ...wheelInfo,
      chassisConnectionPointLocal: [0.7, 0.05, front - 0.5],
      isFrontWheel: true,
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
